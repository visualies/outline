export type Role = "admin" | "viewer" | "member";

export type DateFilter = "day" | "week" | "month" | "year";

export enum Client {
  Web = "web",
  Desktop = "desktop",
}

export enum ExportContentType {
  Markdown = "text/markdown",
  Html = "text/html",
  Pdf = "application/pdf",
}

export enum FileOperationFormat {
  JSON = "json",
  MarkdownZip = "outline-markdown",
  HTMLZip = "html",
  PDF = "pdf",
  Notion = "notion",
}

export enum FileOperationType {
  Import = "import",
  Export = "export",
}

export enum FileOperationState {
  Creating = "creating",
  Uploading = "uploading",
  Complete = "complete",
  Error = "error",
  Expired = "expired",
}

export type PublicEnv = {
  URL: string;
  CDN_URL: string;
  COLLABORATION_URL: string;
  AWS_S3_UPLOAD_BUCKET_URL: string;
  AWS_S3_ACCELERATE_URL: string;
  DEPLOYMENT: string | undefined;
  ENVIRONMENT: string;
  SENTRY_DSN: string | undefined;
  SENTRY_TUNNEL: string | undefined;
  SLACK_CLIENT_ID: string | undefined;
  SLACK_APP_ID: string | undefined;
  MAXIMUM_IMPORT_SIZE: number;
  SUBDOMAINS_ENABLED: boolean;
  EMAIL_ENABLED: boolean;
  PDF_EXPORT_ENABLED: boolean;
  DEFAULT_LANGUAGE: string;
  GOOGLE_ANALYTICS_ID: string | undefined;
  RELEASE: string | undefined;
  APP_NAME: string;
  analytics: {
    service?: IntegrationService;
    settings?: IntegrationSettings<IntegrationType.Analytics>;
  };
};

export enum AttachmentPreset {
  DocumentAttachment = "documentAttachment",
  Import = "import",
  Avatar = "avatar",
}

export enum IntegrationType {
  Post = "post",
  Command = "command",
  Embed = "embed",
  Analytics = "analytics",
}

export enum IntegrationService {
  Diagrams = "diagrams",
  Slack = "slack",
  GoogleAnalytics = "google-analytics",
}

export enum CollectionPermission {
  Read = "read",
  ReadWrite = "read_write",
}

export type IntegrationSettings<T> = T extends IntegrationType.Embed
  ? { url: string }
  : T extends IntegrationType.Analytics
  ? { measurementId: string }
  : T extends IntegrationType.Post
  ? { url: string; channel: string; channelId: string }
  : T extends IntegrationType.Post
  ? { serviceTeamId: string }
  :
      | { url: string }
      | { url: string; channel: string; channelId: string }
      | { serviceTeamId: string }
      | { measurementId: string };

export enum UserPreference {
  /** Whether reopening the app should redirect to the last viewed document. */
  RememberLastPath = "rememberLastPath",
  /** If web-style hand pointer should be used on interactive elements. */
  UseCursorPointer = "useCursorPointer",
  CodeBlockLineNumers = "codeBlockLineNumbers",
}

export type UserPreferences = { [key in UserPreference]?: boolean };

export enum TeamPreference {
  /** Whether documents have a separate edit mode instead of seamless editing. */
  SeamlessEdit = "seamlessEdit",
  /** Whether to use team logo across the app for branding. */
  PublicBranding = "publicBranding",
  /** Whether viewers should see download options */
  ViewersCanExport = "viewersCanExport",
}

export type TeamPreferences = { [key in TeamPreference]?: boolean };

export enum NavigationNodeType {
  Collection = "collection",
  Document = "document",
}

export type NavigationNode = {
  id: string;
  title: string;
  url: string;
  children: NavigationNode[];
  isDraft?: boolean;
  collectionId?: string;
  type?: NavigationNodeType;
  parent?: NavigationNode | null;
  depth?: number;
};

export type CollectionSort = {
  field: string;
  direction: "asc" | "desc";
};
