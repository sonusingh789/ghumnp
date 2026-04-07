"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { allDistricts } from "@/data/nepal";
import {
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from "@/components/ui/icons";

// Maps the DB value (stored in Places.category) to a human-readable label.
const PLACE_CATEGORIES = [
  { value: "attraction", label: "Tourist Attraction" },
  { value: "food",       label: "Local Food" },
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel",      label: "Hotel" },
  { value: "stay",       label: "Local Stay" },
];

// Nearby spot categories use the same DB values.
const spotCategories = PLACE_CATEGORIES.map((c) => c.label);

const MAX_UPLOAD_DIMENSION = 1400;
const JPEG_QUALITY = 0.76;
const IMAGE_INPUT_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const SUPPORTED_IMAGE_EXTENSIONS = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
]);

function getNormalizedImageType(file) {
  const rawType = String(file?.type || "").trim().toLowerCase();
  if (rawType) {
    return rawType;
  }

  const extension = String(file?.name || "")
    .split(".")
    .pop()
    ?.trim()
    .toLowerCase();

  return SUPPORTED_IMAGE_EXTENSIONS.get(extension) || "";
}

async function optimizeImageFile(file) {
  if (typeof window === "undefined") return file;
  const normalizedType = getNormalizedImageType(file);

  if (!normalizedType.startsWith("image/")) {
    throw new Error(`${file.name} is not a supported image. Please use JPG, PNG, or WEBP.`);
  }

  if (!SUPPORTED_IMAGE_TYPES.has(normalizedType)) {
    throw new Error(`${file.name} uses an unsupported image format. Please use JPG, PNG, or WEBP.`);
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const largestDimension = Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height);
    const shouldResize = largestDimension > MAX_UPLOAD_DIMENSION;

    if (!shouldResize && file.size <= 2 * 1024 * 1024) {
      return file;
    }

    const scale = shouldResize ? MAX_UPLOAD_DIMENSION / largestDimension : 1;
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);
    const targetType = normalizedType === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, targetType, targetType === "image/jpeg" ? JPEG_QUALITY : undefined);
    });

    if (!blob) {
      return file;
    }

    const extension = targetType === "image/png" ? "png" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || `upload-${Date.now()}`;
    return new File([blob], `${baseName}.${extension}`, {
      type: targetType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process this image file."));
    image.src = src;
  });
}

// Uploads a single file immediately and calls onUpdate(patch) as status changes.
// onUpdate receives a partial object to merge into the image item.
async function startImageUpload(itemId, file, folderHint, onUpdate) {
  onUpdate({ progress: 10 });

  let dataUrl;
  try {
    dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Could not read image file."));
      reader.readAsDataURL(file);
    });
  } catch (err) {
    onUpdate({ status: "error", progress: 0, error: err.message || "Could not read image." });
    return;
  }

  onUpdate({ progress: 40 });

  try {
    const res = await fetch("/api/uploads/imagekit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        file: dataUrl,
        fileName: file.name || `upload-${Date.now()}`,
        mimeType: file.type || "image/jpeg",
        folderHint,
      }),
    });

    onUpdate({ progress: 90 });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);

    onUpdate({ status: "done", progress: 100, uploadedUrl: data.url, fileId: data.fileId || null });
  } catch (err) {
    onUpdate({ status: "error", progress: 0, error: err.message || "Upload failed." });
  }
}

export default function ContributionForm() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const spotFileInputRef = useRef(null);
  const previewItemsRef = useRef([]);
  const nearbySpotsRef = useRef([]);
  const spotDraftPreviewRef = useRef(null);
  const [placeImageItems, setPlaceImageItems] = useState([]);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [placeMode, setPlaceMode] = useState("existing");
  const [placeCategory, setPlaceCategory] = useState("attraction");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExistingPlace, setSelectedExistingPlace] = useState("");
  const [showSpotForm, setShowSpotForm] = useState(false);
  const [showMorePlaceDetails, setShowMorePlaceDetails] = useState(false);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [existingPlaces, setExistingPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [spotDraft, setSpotDraft] = useState({
    name: "",
    category: "",
    description: "",
    imageFiles: [],
    imagePreviews: [],
  });
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const canAddSpot =
    placeMode === "new" ? true : Boolean(selectedExistingPlace);

  useEffect(() => {
    previewItemsRef.current = placeImageItems;
  }, [placeImageItems]);

  useEffect(() => {
    nearbySpotsRef.current = nearbySpots;
  }, [nearbySpots]);

  useEffect(() => {
    spotDraftPreviewRef.current = spotDraft.imagePreviews[0]?.previewUrl || null;
  }, [spotDraft.imagePreviews]);

  useEffect(() => {
    if (placeMode !== "existing") return;

    let cancelled = false;

    async function loadPlaces() {
      const search = deferredSearchQuery.trim();
      if (search.length < 2) {
        setExistingPlaces([]);
        setLoadingPlaces(false);
        return;
      }

      setLoadingPlaces(true);
      const params = new URLSearchParams();
      params.set("search", search);

      try {
        const response = await fetch(`/api/places?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({ places: [] }));

        if (!cancelled) {
          setExistingPlaces(data.places || []);
        }
      } finally {
        if (!cancelled) {
          setLoadingPlaces(false);
        }
      }
    }

    loadPlaces();

    return () => {
      cancelled = true;
    };
  }, [deferredSearchQuery, placeMode]);

  useEffect(() => {
    return () => {
      previewItemsRef.current.forEach((preview) => {
        if (preview.previewUrl) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
      nearbySpotsRef.current.forEach((spot) => {
        (spot.imagePreviews || []).forEach((image) => {
          if (image.previewUrl) {
            URL.revokeObjectURL(image.previewUrl);
          }
        });
      });
      if (spotDraftPreviewRef.current) {
        URL.revokeObjectURL(spotDraftPreviewRef.current);
      }
    };
  }, []);

  function addPreview() {
    fileInputRef.current?.click();
  }

  function handleSelectExistingPlace(placeId) {
    setSelectedExistingPlace(placeId);
  }

  async function handlePlaceFilesChange(event) {
    const nextFiles = Array.from(event.target.files || []);
    if (!nextFiles.length) return;

    for (const rawFile of nextFiles) {
      let optimizedFile;
      try {
        optimizedFile = await optimizeImageFile(rawFile);
      } catch (fileError) {
        const errItem = {
          id: `${rawFile.name}-${rawFile.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: rawFile.name,
          previewUrl: URL.createObjectURL(rawFile),
          file: rawFile,
          status: "error",
          progress: 0,
          uploadedUrl: null,
          error: fileError?.message || "Could not process this image.",
        };
        setPlaceImageItems((current) => [...current, errItem]);
        continue;
      }

      const newItem = {
        id: `${optimizedFile.name}-${optimizedFile.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: optimizedFile.name,
        previewUrl: URL.createObjectURL(optimizedFile),
        file: optimizedFile,
        status: "uploading",
        progress: 0,
        uploadedUrl: null,
        error: null,
      };

      setPlaceImageItems((current) => [...current, newItem]);

      const capturedId = newItem.id;
      startImageUpload(capturedId, optimizedFile, "new-place", (patch) => {
        setPlaceImageItems((current) =>
          current.map((item) => (item.id === capturedId ? { ...item, ...patch } : item))
        );
      });
    }

    event.target.value = "";
  }

  function removePreview(previewId) {
    const item = placeImageItems.find((preview) => preview.id === previewId);
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }

    setPlaceImageItems((current) => current.filter((preview) => preview.id !== previewId));
  }

  async function handleSpotFileChange(event) {
    const nextFiles = Array.from(event.target.files || []);
    if (!nextFiles.length) return;

    for (const rawFile of nextFiles) {
      let optimizedFile;
      try {
        optimizedFile = await optimizeImageFile(rawFile);
      } catch (fileError) {
        const errItem = {
          id: `${rawFile.name}-${rawFile.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: rawFile.name,
          previewUrl: URL.createObjectURL(rawFile),
          file: rawFile,
          status: "error",
          progress: 0,
          uploadedUrl: null,
          error: fileError?.message || "Could not process this image.",
        };
        setSpotDraft((current) => ({
          ...current,
          imageFiles: [...current.imageFiles, errItem],
          imagePreviews: [...current.imagePreviews, errItem],
        }));
        continue;
      }

      const newItem = {
        id: `${optimizedFile.name}-${optimizedFile.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: optimizedFile.name,
        previewUrl: URL.createObjectURL(optimizedFile),
        file: optimizedFile,
        status: "uploading",
        progress: 0,
        uploadedUrl: null,
        error: null,
      };

      setSpotDraft((current) => ({
        ...current,
        imageFiles: [...current.imageFiles, newItem],
        imagePreviews: [...current.imagePreviews, newItem],
      }));

      const capturedId = newItem.id;
      startImageUpload(capturedId, optimizedFile, "contribution-spots", (patch) => {
        setSpotDraft((current) => ({
          ...current,
          imageFiles: current.imageFiles.map((img) => (img.id === capturedId ? { ...img, ...patch } : img)),
          imagePreviews: current.imagePreviews.map((img) => (img.id === capturedId ? { ...img, ...patch } : img)),
        }));
      });
    }

    event.target.value = "";
  }

  function removeSpotDraftImage(imageId) {
    const target = spotDraft.imagePreviews.find((image) => image.id === imageId);
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }

    setSpotDraft((current) => ({
      ...current,
      imageFiles: current.imageFiles.filter((image) => image.id !== imageId),
      imagePreviews: current.imagePreviews.filter((image) => image.id !== imageId),
    }));
  }

  function retryPlaceImageUpload(itemId) {
    const item = placeImageItems.find((i) => i.id === itemId);
    if (!item?.file) return;
    setPlaceImageItems((current) =>
      current.map((i) => (i.id === itemId ? { ...i, status: "uploading", progress: 0, error: null } : i))
    );
    startImageUpload(itemId, item.file, "new-place", (patch) => {
      setPlaceImageItems((current) =>
        current.map((i) => (i.id === itemId ? { ...i, ...patch } : i))
      );
    });
  }

  function retrySpotDraftImageUpload(imageId) {
    const img = spotDraft.imageFiles.find((i) => i.id === imageId);
    if (!img?.file) return;
    setSpotDraft((current) => ({
      ...current,
      imageFiles: current.imageFiles.map((i) => (i.id === imageId ? { ...i, status: "uploading", progress: 0, error: null } : i)),
      imagePreviews: current.imagePreviews.map((i) => (i.id === imageId ? { ...i, status: "uploading", progress: 0, error: null } : i)),
    }));
    startImageUpload(imageId, img.file, "contribution-spots", (patch) => {
      setSpotDraft((current) => ({
        ...current,
        imageFiles: current.imageFiles.map((i) => (i.id === imageId ? { ...i, ...patch } : i)),
        imagePreviews: current.imagePreviews.map((i) => (i.id === imageId ? { ...i, ...patch } : i)),
      }));
    });
  }

  function handleSpotChange(key, value) {
    setSpotDraft((current) => ({ ...current, [key]: value }));
  }

  function handleAddSpot() {
    if (!spotDraft.name.trim() || !spotDraft.category.trim() || !spotDraft.description.trim()) {
      return;
    }

    const pendingImages = spotDraft.imagePreviews.filter((img) => img.status === "uploading");
    if (pendingImages.length > 0) {
      setError("Please wait for spot images to finish uploading before adding the spot.");
      return;
    }

    setNearbySpots((current) => [
      ...current,
      {
        id: `spot-${Date.now()}`,
        name: spotDraft.name.trim(),
        category: spotDraft.category.trim(),
        description: spotDraft.description.trim(),
        imageFiles: spotDraft.imageFiles,
        imagePreviews: spotDraft.imagePreviews,
      },
    ]);
    setSpotDraft({
      name: "",
      category: "",
      description: "",
      imageFiles: [],
      imagePreviews: [],
    });
    setShowSpotForm(false);
  }

  function removeSpot(spotId) {
    setNearbySpots((current) => {
      const target = current.find((spot) => spot.id === spotId);
      (target?.imagePreviews || []).forEach((image) => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
      return current.filter((spot) => spot.id !== spotId);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setError("");
    setSubmitted(null);

    // Block submission while any images are still uploading
    const pendingPlaceImages = placeImageItems.filter((item) => item.status === "uploading");
    const pendingSpotImages = nearbySpots.flatMap((spot) =>
      (spot.imageFiles || []).filter((img) => img.status === "uploading")
    );
    const total = pendingPlaceImages.length + pendingSpotImages.length;
    if (total > 0) {
      setError(`Please wait — ${total} image${total > 1 ? "s are" : " is"} still uploading.`);
      return;
    }

    setLoading(true);

    try {
      // Images are already uploaded — collect URLs and fileIds
      const uploadedImages = placeImageItems
        .filter((item) => item.status === "done" && item.uploadedUrl)
        .map((item) => ({ url: item.uploadedUrl, fileId: item.fileId || null }));
      const uploadedImageUrls = uploadedImages.map((img) => img.url);

      const nearbySpotsWithUploads = nearbySpots.map((spot) => {
        const imageUrls = (spot.imageFiles || [])
          .filter((img) => img.status === "done" && img.uploadedUrl)
          .map((img) => img.uploadedUrl);
        return {
          name: spot.name,
          category: spot.category,
          description: spot.description,
          imageUrl: imageUrls[0] || "",
          imageUrls,
        };
      });

      const response = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: placeMode,
          selectedExistingPlace,
          category: placeCategory,
          name: String(formData.get("name") || ""),
          district: String(formData.get("district") || ""),
          location: String(formData.get("location") || ""),
          description: String(formData.get("description") || ""),
          placeLongDescription: String(formData.get("placeLongDescription") || ""),
          placeHighlights: String(formData.get("placeHighlights") || ""),
          placePracticalTips: String(formData.get("placePracticalTips") || ""),
          placeBestSeason: String(formData.get("placeBestSeason") || ""),
          placeEntryAccessInfo: String(formData.get("placeEntryAccessInfo") || ""),
          placeNearbyAttractions: String(formData.get("placeNearbyAttractions") || ""),
          placeFaqs: String(formData.get("placeFaqs") || ""),
          districtIntro: String(formData.get("districtIntro") || ""),
          districtTopThingsToDo: String(formData.get("districtTopThingsToDo") || ""),
          districtBestTimeToVisit: String(formData.get("districtBestTimeToVisit") || ""),
          districtHowToReach: String(formData.get("districtHowToReach") || ""),
          districtLocalFoodsCulture: String(formData.get("districtLocalFoodsCulture") || ""),
          districtFaqs: String(formData.get("districtFaqs") || ""),
          nearbySpots: nearbySpotsWithUploads,
          uploadedImages,
          uploadedImageUrls,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Unable to submit contribution.");
        return;
      }

      setSelectedExistingPlace("");
      setSearchQuery("");
      nearbySpots.forEach((spot) => {
        (spot.imagePreviews || []).forEach((image) => {
          if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
        });
      });
      setNearbySpots([]);
      placeImageItems.forEach((preview) => {
        if (preview.previewUrl) URL.revokeObjectURL(preview.previewUrl);
      });
      setPlaceImageItems([]);
      spotDraft.imagePreviews.forEach((image) => {
        if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
      });
      setSpotDraft({ name: "", category: "", description: "", imageFiles: [], imagePreviews: [] });

      startTransition(() => {
        setSubmitted({ slug: data.slug, districtSlug: data.districtSlug });
      });

      if (data.districtSlug) {
        window.setTimeout(() => {
          router.push(`/districts/${data.districtSlug}`);
          router.refresh();
        }, 900);
      }
    } catch (submitError) {
      setError(submitError?.message || "Unable to submit contribution right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── MODE TOGGLE ────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: 5, display: "flex", gap: 4, boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
        {[
          { mode: "existing", label: "📍 Add to Existing Place" },
          { mode: "new",      label: "✨ Add New Place" },
        ].map(({ mode, label }) => {
          const active = placeMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setPlaceMode(mode)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 13,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 0.15s ease",
                background: active ? "#059669" : "transparent",
                color: active ? "#fff" : "#64748b",
                boxShadow: active ? "0 4px 12px rgba(5,150,105,0.25)" : "none",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── PLACE SECTION ──────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 24, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,42,0.06)" }}>
        {/* Section header */}
        <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            🗺️
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
              {placeMode === "existing" ? "Select a Place" : "New Place Details"}
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              {placeMode === "existing" ? "Search and pick an existing destination" : "Tell us about this new destination"}
            </p>
          </div>
        </div>

        <div style={{ padding: "16px 18px 20px" }}>
          {placeMode === "existing" ? (
            /* ── EXISTING PLACE SEARCH ── */
            <div key="existing" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <SearchIcon className="pointer-events-none" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8" }} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                  placeholder="Search by place name, district or location..."
                  style={{ ...inputStyle, paddingLeft: 40 }}
                />
              </div>

              {selectedExistingPlace ? (
                <button
                  type="button"
                  onClick={() => setSelectedExistingPlace("")}
                  style={{ alignSelf: "flex-end", fontSize: 12, fontWeight: 600, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Clear selection
                </button>
              ) : null}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {existingPlaces.map((place) => {
                  const isSelected = selectedExistingPlace === place.id;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSelectExistingPlace(place.id)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: `1.5px solid ${isSelected ? "#059669" : "#e2e8f0"}`,
                        background: isSelected ? "#ecfdf5" : "#fff",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{place.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {[place.district, place.location].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      {isSelected ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "#059669", borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>
                          Selected
                        </span>
                      ) : null}
                    </button>
                  );
                })}

                {loadingPlaces ? (
                  <div style={{ padding: "12px 14px", borderRadius: 14, background: "#f8fafc", fontSize: 13, color: "#94a3b8" }}>
                    Loading places...
                  </div>
                ) : null}

                {!loadingPlaces && !deferredSearchQuery.trim() ? (
                  <div style={{ padding: "12px 14px", borderRadius: 14, background: "#f8fafc", fontSize: 13, color: "#94a3b8" }}>
                    Start typing at least 2 letters to search existing places.
                  </div>
                ) : null}

                {!loadingPlaces && deferredSearchQuery.trim().length > 0 && deferredSearchQuery.trim().length < 2 ? (
                  <div style={{ padding: "12px 14px", borderRadius: 14, background: "#f8fafc", fontSize: 13, color: "#94a3b8" }}>
                    Type 2 or more letters to search.
                  </div>
                ) : null}

                {!loadingPlaces && deferredSearchQuery.trim().length >= 2 && !existingPlaces.length ? (
                  <div style={{ padding: "12px 14px", borderRadius: 14, background: "#f8fafc", fontSize: 13, color: "#94a3b8" }}>
                    No match found — switch to &quot;Add New Place&quot; above.
                  </div>
                ) : null}
              </div>

              {selectedExistingPlace ? (
                <div style={{ padding: "12px 14px", borderRadius: 14, background: "#ecfdf5", border: "1px solid #a7f3d0", fontSize: 13, color: "#065f46", fontWeight: 600 }}>
                  ✓ Place selected. Now add nearby spots below!
                </div>
              ) : null}
            </div>
          ) : (
            /* ── NEW PLACE FORM ── */
            <div key="new" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Image upload */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Photos</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT}
                  multiple
                  hidden
                  onChange={handlePlaceFilesChange}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {placeImageItems.map((preview) => (
                    <div
                      key={preview.id}
                      style={{ position: "relative", width: 96, height: 96, borderRadius: 14, overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}
                    >
                      <img
                        src={preview.previewUrl}
                        alt={preview.name}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {/* Uploading overlay */}
                      {preview.status === "uploading" && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
                          <div className="animate-spin" style={{ width: 22, height: 22, border: "2.5px solid rgba(255,255,255,0.35)", borderTop: "2.5px solid #fff", borderRadius: "50%" }} />
                          <span style={{ fontSize: 10, color: "#fff", marginTop: 5, fontWeight: 700 }}>{preview.progress}%</span>
                        </div>
                      )}

                      {/* Error overlay */}
                      {preview.status === "error" && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(220,38,38,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 14, padding: 6 }}>
                          <span style={{ fontSize: 9, color: "#fff", textAlign: "center", lineHeight: 1.3, fontWeight: 600 }}>{preview.error || "Upload failed"}</span>
                          <button
                            type="button"
                            onClick={() => retryPlaceImageUpload(preview.id)}
                            style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 6, padding: "2px 7px", cursor: "pointer" }}
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Done badge */}
                      {preview.status === "done" && (
                        <div style={{ position: "absolute", top: 5, left: 5, width: 18, height: 18, borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                          <span style={{ fontSize: 10, color: "#fff", lineHeight: 1 }}>✓</span>
                        </div>
                      )}

                      {/* Remove button — hidden while uploading */}
                      {preview.status !== "uploading" && (
                        <button
                          type="button"
                          onClick={() => removePreview(preview.id)}
                          style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
                          aria-label={`Remove ${preview.name}`}
                        >
                          <XIcon style={{ width: 11, height: 11, color: "#64748b" }} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPreview}
                    style={{ width: 96, height: 96, borderRadius: 14, border: "2px dashed #cbd5e1", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}
                  >
                    <UploadIcon style={{ width: 20, height: 20, color: "#059669" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>Upload</span>
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>JPG, PNG or WEBP · max 1400px recommended</p>
              </div>

              <Field label="Category">
                <select
                  value={placeCategory}
                  onChange={(e) => setPlaceCategory(e.target.value)}
                  style={inputStyle}
                >
                  {PLACE_CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Place Name">
                <input name="name" style={inputStyle} placeholder="E.g., Boudhanath Stupa" />
              </Field>

              <Field label="District">
                <select name="district" style={inputStyle} defaultValue="">
                  <option value="" disabled>Select district</option>
                  {allDistricts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </Field>

              <Field label="Location">
                <input name="location" style={inputStyle} placeholder="E.g., Thamel, Kathmandu" />
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={4}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="What makes this place special?"
                />
              </Field>

              {/* Collapsible details */}
              <div style={{ borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setShowMorePlaceDetails((c) => !c)}
                  style={{ width: "100%", padding: "13px 14px", background: "#f8fafc", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                  aria-expanded={showMorePlaceDetails}
                >
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Add More Details</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Optional: highlights, tips, FAQs</p>
                  </div>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%", background: "#fff", border: "1.5px solid #e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    transition: "transform 0.15s", transform: showMorePlaceDetails ? "rotate(90deg)" : "none",
                  }}>
                    <ChevronRightIcon style={{ width: 13, height: 13, color: "#64748b" }} />
                  </span>
                </button>

                {showMorePlaceDetails ? (
                  <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <Field label="Long Description">
                      <textarea name="placeLongDescription" rows={5} style={{ ...inputStyle, resize: "none" }} placeholder="Write a detailed description of the place..." />
                    </Field>

                    <Field label="Highlights (one per line)">
                      <textarea name="placeHighlights" rows={4} style={{ ...inputStyle, resize: "none" }} placeholder={"Beautiful sunrise views\nPeaceful monastery atmosphere"} />
                    </Field>

                    <Field label="Practical Tips">
                      <textarea name="placePracticalTips" rows={4} style={{ ...inputStyle, resize: "none" }} placeholder="Helpful tips for visitors..." />
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Field label="Best Season">
                        <textarea name="placeBestSeason" rows={3} style={{ ...inputStyle, resize: "none" }} placeholder="Best time to visit..." />
                      </Field>
                      <Field label="Entry / Access">
                        <textarea name="placeEntryAccessInfo" rows={3} style={{ ...inputStyle, resize: "none" }} placeholder="Tickets, permits, timings..." />
                      </Field>
                    </div>

                    <Field label="Nearby Attractions (one per line)">
                      <textarea name="placeNearbyAttractions" rows={4} style={{ ...inputStyle, resize: "none" }} placeholder={"Phewa Lake\nWorld Peace Pagoda"} />
                    </Field>

                    <Field label="Place FAQs">
                      <textarea name="placeFaqs" rows={4} style={{ ...inputStyle, resize: "none" }} placeholder={"Best time to visit?::October to December.\nIs parking available?::Yes, near the main gate."} />
                    </Field>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── NEARBY SPOTS SECTION ───────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 24, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,42,0.06)" }}>
        {/* Section header */}
        <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              📍
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Nearby Spots</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Restaurants, hotels, homestays nearby</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { if (canAddSpot) setShowSpotForm(true); }}
            disabled={!canAddSpot}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 999,
              border: "none", cursor: canAddSpot ? "pointer" : "not-allowed",
              background: canAddSpot ? "#ecfdf5" : "#f1f5f9",
              color: canAddSpot ? "#059669" : "#94a3b8",
              fontSize: 12, fontWeight: 700,
            }}
          >
            <PlusCircleIcon style={{ width: 15, height: 15 }} />
            Add Spot
          </button>
        </div>

        <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {!canAddSpot ? (
            <div style={{ padding: "12px 14px", borderRadius: 14, background: "#f8fafc", fontSize: 13, color: "#94a3b8" }}>
              Select a place above to start adding nearby spots.
            </div>
          ) : null}

          {showSpotForm ? (
            <div style={{ borderRadius: 18, background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#065f46" }}>New Spot</p>

              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Spot Photos</p>
                <input
                  ref={spotFileInputRef}
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT}
                  multiple
                  hidden
                  onChange={handleSpotFileChange}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {spotDraft.imagePreviews.map((image) => (
                    <div
                      key={image.id}
                      style={{ position: "relative", width: 80, height: 80, borderRadius: 12, overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}
                    >
                      <img
                        src={image.previewUrl}
                        alt={image.name || "Spot preview"}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {/* Uploading overlay */}
                      {image.status === "uploading" && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
                          <div className="animate-spin" style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", borderRadius: "50%" }} />
                          <span style={{ fontSize: 9, color: "#fff", marginTop: 4, fontWeight: 700 }}>{image.progress}%</span>
                        </div>
                      )}

                      {/* Error overlay */}
                      {image.status === "error" && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(220,38,38,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 12, padding: 5 }}>
                          <span style={{ fontSize: 8, color: "#fff", textAlign: "center", lineHeight: 1.3, fontWeight: 600 }}>{image.error || "Upload failed"}</span>
                          <button
                            type="button"
                            onClick={() => retrySpotDraftImageUpload(image.id)}
                            style={{ fontSize: 8, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 5, padding: "2px 6px", cursor: "pointer" }}
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Done badge */}
                      {image.status === "done" && (
                        <div style={{ position: "absolute", top: 4, left: 4, width: 16, height: 16, borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 9, color: "#fff", lineHeight: 1 }}>✓</span>
                        </div>
                      )}

                      {/* Remove button — hidden while uploading */}
                      {image.status !== "uploading" && (
                        <button
                          type="button"
                          onClick={() => removeSpotDraftImage(image.id)}
                          style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          aria-label={`Remove ${image.name || "spot image"}`}
                        >
                          <XIcon style={{ width: 10, height: 10, color: "#64748b" }} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => spotFileInputRef.current?.click()}
                    style={{ width: 80, height: 80, borderRadius: 12, border: "2px dashed #86efac", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", flexShrink: 0 }}
                  >
                    <UploadIcon style={{ width: 18, height: 18, color: "#059669" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>Upload</span>
                  </button>
                </div>
              </div>

              <Field label="Spot Name">
                <input
                  value={spotDraft.name}
                  onChange={(e) => handleSpotChange("name", e.target.value)}
                  style={inputStyle}
                  placeholder="E.g., Himalayan Java Coffee"
                />
              </Field>

              <Field label="Category">
                <select
                  value={spotDraft.category}
                  onChange={(e) => handleSpotChange("category", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select category</option>
                  {spotCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </Field>

              <Field label="Description">
                <textarea
                  value={spotDraft.description}
                  onChange={(e) => handleSpotChange("description", e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="Describe this spot..."
                />
              </Field>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={handleAddSpot}
                  style={{ flex: 1, padding: "12px", borderRadius: 14, background: "#059669", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  Add Spot
                </button>
                <button
                  type="button"
                  onClick={() => setShowSpotForm(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 14, background: "#fff", border: "1.5px solid #e2e8f0", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {nearbySpots.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nearbySpots.map((spot) => (
                <div
                  key={spot.id}
                  style={{ padding: "14px", borderRadius: 16, background: "#f8fafc", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{spot.name}</p>
                    <span style={{ display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "3px 10px" }}>
                      {spot.category}
                    </span>
                    {spot.imagePreviews?.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                        {spot.imagePreviews.map((img) => (
                          <div key={img.id} style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#e2e8f0", position: "relative" }}>
                            <Image src={img.previewUrl} alt={spot.name} fill sizes="52px" unoptimized className="object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 6, lineHeight: 1.5 }}>{spot.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpot(spot.id)}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: "#fee2e2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    aria-label={`Remove ${spot.name}`}
                  >
                    <XIcon style={{ width: 13, height: 13, color: "#ef4444" }} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── SUCCESS ────────────────────────────────────────── */}
      {submitted ? (
        <div style={{ padding: "14px 16px", borderRadius: 16, background: "#ecfdf5", border: "1.5px solid #a7f3d0", fontSize: 13, fontWeight: 600, color: "#065f46" }}>
          ✓ Contribution saved! Opening district page...
          {submitted.districtSlug ? (
            <div style={{ marginTop: 8 }}>
              <Link href={`/districts/${submitted.districtSlug}`} style={{ fontWeight: 700, color: "#059669", textDecoration: "underline" }}>
                Open district page →
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── ERROR ──────────────────────────────────────────── */}
      {error ? (
        <div style={{ padding: "14px 16px", borderRadius: 16, background: "#fef2f2", border: "1.5px solid #fecaca", fontSize: 13, color: "#b91c1c" }}>
          {error}
        </div>
      ) : null}

      {/* ── SUBMIT ─────────────────────────────────────────── */}
      <div style={{ paddingTop: 4 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 18,
            border: "none",
            background: loading ? "#94a3b8" : "linear-gradient(135deg, #059669 0%, #047857 100%)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 8px 24px rgba(5,150,105,0.28)",
            letterSpacing: "-0.01em",
            transition: "all 0.15s ease",
          }}
        >
          {loading ? "Submitting..." : "Submit Contribution →"}
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
          Your contribution will be reviewed and published to the district page.
        </p>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 8 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  background: "#fff",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
