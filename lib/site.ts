import { headers } from "next/headers";

const LOCAL_APP_URL = "http://localhost:3003";

function normalizeAbsoluteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return LOCAL_APP_URL;
  }

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_URL) {
    return normalizeAbsoluteUrl(`https://${process.env.VERCEL_URL}`);
  }

  return LOCAL_APP_URL;
}

export function getRequestOrigin() {
  try {
    const headerStore = headers();
    const forwardedHost = headerStore.get("x-forwarded-host");
    const host = forwardedHost || headerStore.get("host");

    if (!host) {
      return getSiteUrl();
    }

    const protocol =
      headerStore.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");

    return normalizeAbsoluteUrl(`${protocol}://${host}`);
  } catch {
    return getSiteUrl();
  }
}

export function buildAbsoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function isPreviewDeployment() {
  return process.env.VERCEL_ENV === "preview";
}

export function shouldAllowIndexing() {
  return !isPreviewDeployment();
}
