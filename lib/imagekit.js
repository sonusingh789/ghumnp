const IMAGEKIT_PRIVATE_KEY =
  process.env.IMAGEKIT_PRIVATE_KEY || process.env.PRIVATE_KEY || "";
const IMAGEKIT_PUBLIC_KEY =
  process.env.IMAGEKIT_PUBLIC_KEY || process.env.NEXT_PUBLIC_PUBLIC_KEY || "";
const IMAGEKIT_URL_ENDPOINT =
  process.env.IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_URL_ENDPOINT || "";

function ensureImageKitConfig() {
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error(
      "Missing ImageKit configuration. Set IMAGEKIT_PRIVATE_KEY/PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT/NEXT_PUBLIC_URL_ENDPOINT."
    );
  }
}

function sanitizeFileName(name = "upload") {
  return name.replace(/[^\w.-]+/g, "-");
}

export async function uploadFileToImageKit(file, { folder = "/ghumnp" } = {}) {
  ensureImageKitConfig();

  const body = new FormData();
  body.append("file", file, sanitizeFileName(file.name || `upload-${Date.now()}`));
  body.append("fileName", sanitizeFileName(file.name || `upload-${Date.now()}`));
  body.append("folder", folder);
  body.append("useUniqueFileName", "true");

  const auth = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString("base64");
  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Image upload failed");
  }

  return {
    url: data.url,
    fileId: data.fileId,
    thumbnailUrl: data.thumbnailUrl,
  };
}

export function getImageKitConfigStatus() {
  return {
    hasPublicKey: Boolean(IMAGEKIT_PUBLIC_KEY),
    hasPrivateKey: Boolean(IMAGEKIT_PRIVATE_KEY),
    hasUrlEndpoint: Boolean(IMAGEKIT_URL_ENDPOINT),
  };
}
