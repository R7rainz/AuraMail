export function externalHref(value: string | null | undefined): string | null {
  const link = value?.trim();
  if (!link || (/^[a-z][a-z\d+.-]*:/i.test(link) && !/^https?:\/\//i.test(link))) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(link)
    ? link
    : `https://${link.replace(/^\/\//, "")}`;

  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) && url.hostname
      ? url.href
      : null;
  } catch {
    return null;
  }
}
