export type LegalPageKey =
  | "privacy"
  | "terms"
  | "about"
  | "contact"
  | "refunds"
  | "cookies"
  | "pricing"
  | "faq";

export function isLegalPath(pathname: string): boolean {
  return /^\/legal\/(privacy|terms|about|contact|refunds|cookies|pricing|faq)\/?$/.test(pathname);
}
