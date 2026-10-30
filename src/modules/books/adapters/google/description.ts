import { Parser } from "htmlparser2";

export const descriptionToText = (html: string | undefined): string | null => {
  if (!html) return null;
  let text = "";
  let hidden = 0;
  const blocks = new Set([
    "p",
    "div",
    "br",
    "li",
    "ul",
    "ol",
    "h1",
    "h2",
    "h3",
  ]);
  const parser = new Parser(
    {
      onopentag(name) {
        if (name === "script" || name === "style") hidden++;
        if (!hidden && blocks.has(name)) text += "\n";
      },
      ontext(value) {
        if (!hidden) text += value;
      },
      onclosetag(name) {
        if (name === "script" || name === "style")
          hidden = Math.max(0, hidden - 1);
        if (!hidden && name !== "br" && blocks.has(name)) text += "\n";
      },
    },
    { decodeEntities: true },
  );
  parser.write(html);
  parser.end();
  return (
    text
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() || null
  );
};

export const safeBookUrl = (value?: string | null): string | null => {
  try {
    const url = new URL(value ?? "");
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.protocol = "https:";
    return url.toString();
  } catch {
    return null;
  }
};
