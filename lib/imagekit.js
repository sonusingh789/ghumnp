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

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const body = new URLSearchParams({
    file: `data:${file.type || "application/octet-stream"};base64,${base64}`,
    fileName: sanitizeFileName(file.name || `upload-${Date.now()}`),
    folder,
    useUniqueFileName: "true",
  });

  const auth = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString("base64");
  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Image upload failed");
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
