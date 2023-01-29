import emojiRegex from "emoji-regex";
import unescape from "./unescape";

export default function parseTitle(text = "") {
  const regex = emojiRegex();

  // find and extract title
  const firstLine = text.trim().split(/\r?\n/)[0];
  const trimmedTitle = firstLine.replace(/^#/, "").trim();

  // remove any escape characters
  const title = unescape(trimmedTitle);

  // find and extract first emoji
  const matches = regex.exec(title);
  const firstEmoji = matches ? matches[0] : null;
  const startsWithEmoji = firstEmoji && title.startsWith(`${firstEmoji} `);
  const emoji = startsWithEmoji ? firstEmoji : undefined;

  // title with first leading emoji stripped
  const strippedTitle = startsWithEmoji
    ? title.replace(firstEmoji, "").trim()
    : title;

  return {
    title,
    emoji,
    strippedTitle,
  };
}
