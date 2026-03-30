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

  const fileName = sanitizeFileName(file.name || `upload-${Date.now()}`);

  // Explicitly read binary data to avoid Node.js FormData streaming issues
  // with File objects coming from request.formData()
  const bytes = await file.arrayBuffer();
  const blob = new Blob([bytes], { type: file.type });

  const body = new FormData();
  body.append("file", blob, fileName);
  body.append("fileName", fileName);
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

  if (!response.ok) {
    const text = await response.text();
    let message = "Image upload failed";
    try {
      const parsed = JSON.parse(text);
      message = parsed?.message || parsed?.error || message;
    } catch {
      if (text?.length) message = text.slice(0, 300);
    }
    throw new Error(message);
  }

  const data = await response.json();
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
