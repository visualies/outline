import passport from "@outlinewiki/koa-passport";
import type { Context } from "koa";
import Router from "koa-router";
import { get } from "lodash";
import { Strategy } from "passport-oauth2";
import { slugifyDomain } from "@shared/utils/domains";
import accountProvisioner from "@server/commands/accountProvisioner";
import env from "@server/env";
import {
  OIDCMalformedUserInfoError,
  AuthenticationError,
} from "@server/errors";
import passportMiddleware from "@server/middlewares/passport";
import { User } from "@server/models";
import { AuthenticationResult } from "@server/types";
import {
  StateStore,
  request,
  getTeamFromContext,
  getClientFromContext,
} from "@server/utils/passport";

const router = new Router();
const providerName = "oidc";
const OIDC_AUTH_URI = env.OIDC_AUTH_URI || "";
const OIDC_TOKEN_URI = env.OIDC_TOKEN_URI || "";
const OIDC_USERINFO_URI = env.OIDC_USERINFO_URI || "";

export const config = {
  name: env.OIDC_DISPLAY_NAME,
  enabled: !!env.OIDC_CLIENT_ID,
};
const scopes = env.OIDC_SCOPES.split(" ");

Strategy.prototype.userProfile = async function (accessToken, done) {
  try {
    const response = await request(OIDC_USERINFO_URI, accessToken);
    return done(null, response);
  } catch (err) {
    return done(err);
  }
};

if (env.OIDC_CLIENT_ID && env.OIDC_CLIENT_SECRET) {
  passport.use(
    providerName,
    new Strategy(
      {
        authorizationURL: OIDC_AUTH_URI,
        tokenURL: OIDC_TOKEN_URI,
        clientID: env.OIDC_CLIENT_ID,
        clientSecret: env.OIDC_CLIENT_SECRET,
        callbackURL: `${env.URL}/auth/${providerName}.callback`,
        passReqToCallback: true,
        scope: env.OIDC_SCOPES,
        // @ts-expect-error custom state store
        store: new StateStore(),
        state: true,
        pkce: false,
      },
      // OpenID Connect standard profile claims can be found in the official
      // specification.
      // https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
      // Non-standard claims may be configured by individual identity providers.
      // Any claim supplied in response to the userinfo request will be
      // available on the `profile` parameter
      async function (
        ctx: Context,
        accessToken: string,
        refreshToken: string,
        params: { expires_in: number },
        profile: Record<string, string>,
        done: (
          err: Error | null,
          user: User | null,
          result?: AuthenticationResult
        ) => void
      ) {
        try {
          if (!profile.email) {
            throw AuthenticationError(
              `An email field was not returned in the profile parameter, but is required.`
            );
          }
          if (!profile.name) {
            throw AuthenticationError(
              `A name field was not returned in the profile parameter, but is required.`
            );
          }
          const team = await getTeamFromContext(ctx);
          const client = getClientFromContext(ctx);

          const parts = profile.email.toLowerCase().split("@");
          const domain = parts.length && parts[1];

          if (!domain) {
            throw OIDCMalformedUserInfoError();
          }

          // remove the TLD and form a subdomain from the remaining
          const subdomain = slugifyDomain(domain);

          // Claim name can be overriden using an env variable.
          // Default is 'preferred_username' as per OIDC spec.
          const username = get(profile, env.OIDC_USERNAME_CLAIM);

          const result = await accountProvisioner({
            ip: ctx.ip,
            team: {
              teamId: team?.id,
              // https://github.com/outline/outline/pull/2388#discussion_r681120223
              name: "Wiki",
              domain,
              subdomain,
            },
            user: {
              name: profile.name || username || profile.username,
              email: profile.email,
              avatarUrl: profile.picture,
              username,
            },
            authenticationProvider: {
              name: providerName,
              providerId: domain,
            },
            authentication: {
              providerId: profile.sub,
              accessToken,
              refreshToken,
              expiresIn: params.expires_in,
              scopes,
            },
          });
          return done(null, result.user, { ...result, client });
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  router.get(providerName, passport.authenticate(providerName));

  router.get(`${providerName}.callback`, passportMiddleware(providerName));
}

export default router;
