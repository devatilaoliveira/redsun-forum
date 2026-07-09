import { Request } from "@playwright/test";

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function hasMultipartField(request: Request, fieldName: string, expectedValue: string): boolean {
  const postData = request.postData();
  if (!postData) {
    return false;
  }

  const fieldPattern = new RegExp(
    `name="${escapeRegExp(fieldName)}"\\r?\\n\\r?\\n${escapeRegExp(expectedValue)}(?:\\r?\\n|$)`,
  );

  return fieldPattern.test(postData);
}
