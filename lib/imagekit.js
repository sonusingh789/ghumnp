const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || process.env.PRIVATE_KEY || "";

export async function uploadToImageKit(buffer, { fileName, mimeType, folder }) {
  if (!PRIVATE_KEY) throw new Error("IMAGEKIT_PRIVATE_KEY is not set in environment.");

  const safeName = String(fileName || "upload").replace(/[^\w.-]+/g, "-");
  const blob = new Blob([buffer], { type: mimeType });

  const form = new FormData();
  form.append("file", blob, safeName);
  form.append("fileName", safeName);
  form.append("folder", folder || "/ghumnp/places");
  form.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${PRIVATE_KEY}:`).toString("base64")}`,
    },
    body: form,
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = `ImageKit error (${res.status})`;
    try { msg = JSON.parse(text)?.message || msg; } catch { /* not json */ }
    throw new Error(msg);
  }

  const data = JSON.parse(text);
  return { url: data.url, fileId: data.fileId };
}

// Used by /api/places for existing-place image inserts
export async function uploadFileToImageKit(file, { folder } = {}) {
  const buf = Buffer.from(await file.arrayBuffer());
  return uploadToImageKit(buf, {
    fileName: file.name,
    mimeType: file.type || "image/jpeg",
    folder: folder || "/ghumnp/places",
  });
}
