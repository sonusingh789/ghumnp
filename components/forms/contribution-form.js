"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { allDistricts } from "@/data/nepal";
import {
  ChevronRightIcon,
  MapPinIcon,
  PlusCircleIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from "@/components/ui/icons";

const spotCategories = [
  "Tourist Attraction",
  "Local Food",
  "Restaurant",
  "Hotel",
  "Local Stay",
];

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

export default function ContributionForm() {
  const router = useRouter();
  const formRef = useRef(null);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExistingPlace, setSelectedExistingPlace] = useState("");
  const [showSpotForm, setShowSpotForm] = useState(false);
  const [showMorePlaceDetails, setShowMorePlaceDetails] = useState(false);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [existingPlaces, setExistingPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
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

    let optimizedFiles;
    try {
      optimizedFiles = await Promise.all(nextFiles.map((file) => optimizeImageFile(file)));
    } catch (fileError) {
      setError(fileError?.message || "One of the selected images could not be processed.");
      event.target.value = "";
      return;
    }

    const previewItems = optimizedFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setPlaceImageItems((current) => [...current, ...previewItems]);
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

    let optimizedFiles;
    try {
      optimizedFiles = await Promise.all(nextFiles.map((file) => optimizeImageFile(file)));
    } catch (fileError) {
      setError(fileError?.message || "One of the selected spot images could not be processed.");
      event.target.value = "";
      return;
    }

    const nextItems = optimizedFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setSpotDraft((current) => ({
      ...current,
      imageFiles: [...current.imageFiles, ...nextItems],
      imagePreviews: [...current.imagePreviews, ...nextItems],
    }));
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

  function handleSpotChange(key, value) {
    setSpotDraft((current) => ({ ...current, [key]: value }));
  }

  function handleAddSpot() {
    if (!spotDraft.name.trim() || !spotDraft.category.trim() || !spotDraft.description.trim()) {
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

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function uploadSingleFile(file, folderHint, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const payload = new FormData();
      payload.append("file", file);
      payload.append("folderHint", folderHint);

      xhr.open("POST", "/api/uploads/imagekit");
      xhr.responseType = "json";

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      };

      xhr.onload = () => {
        const data = xhr.response || {};
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
          return;
        }
        reject(new Error(data.error || "Image upload failed."));
      };

      xhr.onerror = () => {
        reject(new Error("Image upload failed."));
      };

      xhr.send(payload);
    });
  }

  async function uploadAllFiles(fileItems, folderHint, labelPrefix) {
    if (!fileItems.length) return [];

    const uploadedUrls = [];

    for (let index = 0; index < fileItems.length; index += 1) {
      const fileItem = fileItems[index];
      setUploadLabel(`${labelPrefix} ${fileItem.name}`);

      let result;
      try {
        result = await uploadSingleFile(fileItem.file, folderHint, (filePercent) => {
          const overallPercent = Math.round(((index + filePercent / 100) / fileItems.length) * 100);
          setUploadProgress(overallPercent);
        });
      } catch (uploadError) {
        throw new Error(uploadError?.message || `Upload failed for ${fileItem.name}.`);
      }

      uploadedUrls.push(result.url);
      setUploadProgress(Math.round(((index + 1) / fileItems.length) * 100));
    }

    return uploadedUrls;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formName = String(formData.get("name") || "");
    const folderHint =
      placeMode === "existing"
        ? selectedExistingPlace || "existing-place"
        : slugify(formName) || "new-place";
    setError("");
    setSubmitted(null);
    setLoading(true);
    const hasSpotImages = nearbySpots.some((spot) => (spot.imageFiles || []).length > 0);
    setUploadingPhotos(placeImageItems.length > 0 || hasSpotImages);
    setUploadProgress(0);
    setUploadLabel(placeImageItems.length > 0 || hasSpotImages ? "Preparing upload..." : "");

    try {
      const uploadedImageUrls = await uploadAllFiles(placeImageItems, folderHint, "Uploading place image");
      const nearbySpotsWithUploads = [];

      for (const spot of nearbySpots) {
        let imageUrls = [];

        if ((spot.imageFiles || []).length) {
          imageUrls = await uploadAllFiles(
            spot.imageFiles,
            `${folderHint}-spots`,
            `Uploading ${spot.name}`
          );
        }

        nearbySpotsWithUploads.push({
          name: spot.name,
          category: spot.category,
          description: spot.description,
          imageUrl: imageUrls[0] || "",
          imageUrls,
        });
      }

      setUploadLabel(uploadedImageUrls.length || nearbySpotsWithUploads.some((spot) => (spot.imageUrls || []).length) ? "Saving place details..." : "");

      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: placeMode,
          selectedExistingPlace,
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
          uploadedImageUrls,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Unable to submit contribution.");
        return;
      }

      formRef.current?.reset();
      setSelectedExistingPlace("");
      setSearchQuery("");
      nearbySpots.forEach((spot) => {
        (spot.imagePreviews || []).forEach((image) => {
          if (image.previewUrl) {
            URL.revokeObjectURL(image.previewUrl);
          }
        });
      });
      setNearbySpots([]);
      placeImageItems.forEach((preview) => {
        if (preview.previewUrl) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
      setPlaceImageItems([]);
      spotDraft.imagePreviews.forEach((image) => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
      setSpotDraft({
        name: "",
        category: "",
        description: "",
        imageFiles: [],
        imagePreviews: [],
      });
      setUploadProgress(100);
      setUploadLabel("Upload complete");
      startTransition(() => {
        setSubmitted({
          slug: data.slug,
          districtSlug: data.districtSlug,
        });
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
      setUploadingPhotos(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[30px] border border-black/8 bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          
          <div>
            <h2 className="text-[1.15rem] font-semibold tracking-tight text-slate-950">Place</h2>
            <p className="mt-1 text-sm text-slate-500">Main tourist destination or area</p>
          </div>
          <button
            type="button"
            onClick={() => setPlaceMode((current) => (current === "existing" ? "new" : "existing"))}
            className="text-sm font-semibold text-emerald-600"
          >
            {placeMode === "existing" ? "Place not found? Add new" : "Select existing place"}
          </button>
        </div>

        {placeMode === "existing" ? (
          <div className="mt-4 space-y-4">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                  }
                }}
                placeholder="Search by place name, district, or location..."
                className="w-full rounded-[22px] border border-black/6 bg-slate-50 py-3 pl-12 pr-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-200 focus:bg-white"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                
                {selectedExistingPlace ? (
                  <button
                    type="button"
                    onClick={() => setSelectedExistingPlace("")}
                    className="text-sm font-medium text-slate-500"
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>

            <div className="space-y-2">
                {existingPlaces.map((place) => {
                  const isSelected = selectedExistingPlace === place.id;

                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSelectExistingPlace(place.id)}
                      className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${
                        isSelected
                          ? "border-emerald-300 bg-emerald-50 shadow-[0_10px_20px_rgba(8,175,59,0.08)]"
                          : "border-black/6 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[15px] font-semibold text-slate-950">{place.name}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            {[place.district, place.location].filter(Boolean).join(" • ")}
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                            Selected
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {loadingPlaces ? (
                  <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Loading matching places...
                  </div>
                ) : null}

                {!loadingPlaces && !deferredSearchQuery.trim() ? (
                  <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Start typing at least 2 letters to search existing places.
                  </div>
                ) : null}

                {!loadingPlaces && deferredSearchQuery.trim() && deferredSearchQuery.trim().length < 2 ? (
                  <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Type 2 or more letters to search existing places.
                  </div>
                ) : null}

                {!loadingPlaces && deferredSearchQuery.trim().length >= 2 && !existingPlaces.length ? (
                  <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Add new place if destination does not exist.
                  </div>
                ) : null}
              </div>
            </div>

            {selectedExistingPlace ? (
              <div className="rounded-[24px] bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                Next, add nearby  spots, eg HomeStay, Restaurants,Hotels etc.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 rounded-[28px] bg-[#eef4ff] p-3 sm:p-5">
            

            <div className="mt-5 space-y-4">
              <Field label="Upload Images">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT}
                  multiple
                  hidden
                  onChange={handlePlaceFilesChange}
                />
                <div className="flex flex-wrap gap-3">
                  {placeImageItems.map((preview) => (
                    <div
                      key={preview.id}
                      className="relative h-[118px] w-[118px] overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,#d9f0de,#dbe7f7)]"
                    >
                      <Image
                        src={preview.previewUrl}
                        alt={preview.name}
                        fill
                        sizes="118px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(preview.id)}
                        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"
                        aria-label={`Remove ${preview.name}`}
                      >
                        <XIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPreview}
                    className="flex h-[118px] w-[118px] flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-slate-300 bg-white/80 text-sm font-medium text-slate-500"
                  >
                    <UploadIcon className="size-7" />
                    Upload
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-500">Use JPG, PNG, or WEBP images for the best upload results.</p>
              </Field>

              <Field label="Place Name">
                <input name="name" className={inputClass} placeholder="Enter place name" />
              </Field>

              <Field label="District">
                <select name="district" className={inputClass} defaultValue="">
                  <option value="" disabled>
                    Select district
                  </option>
                  {allDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Location">
                <input name="location" className={inputClass} placeholder="E.g., Thamel, Kathmandu" />
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={4}
                  className={`${inputClass} resize-none py-4`}
                  placeholder="Share details about this place..."
                />
              </Field>

              <div className="rounded-[24px] border border-black/6 bg-white/70 p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setShowMorePlaceDetails((current) => !current)}
                  className="flex w-full items-center justify-between gap-5 text-left"
                  aria-expanded={showMorePlaceDetails}
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">Add More Details</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Optional guide content for the place page.
                    </p>
                  </div>
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition ${
                      showMorePlaceDetails ? "rotate-90" : ""
                    }`}
                  >
                    <ChevronRightIcon className="size-5" />
                  </span>
                </button>

                {showMorePlaceDetails ? (
                  <div className="mt-6 space-y-4">
                    <Field label="Place Long Description">
                      <textarea
                        name="placeLongDescription"
                        rows={5}
                        className={`${inputClass} resize-none py-4`}
                        placeholder="Write a detailed description of the place..."
                      />
                    </Field>

                    <Field label="Place Highlights">
                      <textarea
                        name="placeHighlights"
                        rows={4}
                        className={`${inputClass} resize-none py-4`}
                        placeholder={"Add one highlight per line\nBeautiful sunrise views\nPeaceful monastery atmosphere"}
                      />
                    </Field>

                    <Field label="Practical Tips">
                      <textarea
                        name="placePracticalTips"
                        rows={4}
                        className={`${inputClass} resize-none py-4`}
                        placeholder="Helpful tips for visitors..."
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Best Season / Time">
                        <textarea
                          name="placeBestSeason"
                          rows={3}
                          className={`${inputClass} resize-none py-4`}
                          placeholder="Best season or time to visit..."
                        />
                      </Field>

                      <Field label="Entry / Access Info">
                        <textarea
                          name="placeEntryAccessInfo"
                          rows={3}
                          className={`${inputClass} resize-none py-4`}
                          placeholder="Tickets, permits, timings, or access info..."
                        />
                      </Field>
                    </div>

                    <Field label="Nearby Attractions">
                      <textarea
                        name="placeNearbyAttractions"
                        rows={4}
                        className={`${inputClass} resize-none py-4`}
                        placeholder={"Add one nearby attraction per line\nPhewa Lake\nWorld Peace Pagoda"}
                      />
                    </Field>

                    <Field label="Place FAQs">
                      <textarea
                        name="placeFaqs"
                        rows={4}
                        className={`${inputClass} resize-none py-4`}
                        placeholder={"Use one FAQ per line in this format:\nBest time to visit?::October to December.\nIs parking available?::Yes, near the main gate."}
                      />
                    </Field>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[30px] border border-dashed border-slate-300 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
              <MapPinIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-[1.15rem] font-semibold tracking-tight text-slate-950">Nearby Spots</h2>
      
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!canAddSpot) return;
              setShowSpotForm(true);
            }}
            disabled={!canAddSpot}
            className={`inline-flex items-center gap-2 px-2 text-sm font-semibold ${
              canAddSpot ? "text-emerald-600" : "cursor-not-allowed text-slate-400"
            }`}
          >
            <PlusCircleIcon className="size-5" />
            Add Spot
          </button>
        </div>

        {!canAddSpot ? (
          <div className="mt-4 rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
            Select a place first to add nearby spots.
          </div>
        ) : null}

        {showSpotForm ? (
          <div className="mt-5 rounded-[28px] bg-[#effaf2] p-4 sm:p-5">
            <h3 className="text-lg font-semibold text-slate-950">Add New Spot</h3>

            <div className="mt-5 space-y-4">
              <Field label="Spot Images">
                <input
                  ref={spotFileInputRef}
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT}
                  multiple
                  hidden
                  onChange={handleSpotFileChange}
                />
                <div className="flex flex-wrap gap-3">
                  {spotDraft.imagePreviews.map((image) => (
                    <div
                      key={image.id}
                      className="relative h-[118px] w-[118px] overflow-hidden rounded-[24px] bg-white"
                    >
                      <Image
                        src={image.previewUrl}
                        alt={image.name || "Spot preview"}
                        fill
                        sizes="118px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpotDraftImage(image.id)}
                        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"
                        aria-label={`Remove ${image.name || "spot image"}`}
                      >
                        <XIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => spotFileInputRef.current?.click()}
                    className="flex min-h-[118px] w-[118px] flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-emerald-200 bg-white/80 px-4 py-5 text-sm font-medium text-slate-500"
                  >
                    <UploadIcon className="size-7 text-emerald-600" />
                    Upload
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-500">Use JPG, PNG, or WEBP images for nearby spots too.</p>
              </Field>

              <Field label="Spot Name">
                <input
                  value={spotDraft.name}
                  onChange={(event) => handleSpotChange("name", event.target.value)}
                  className={inputClass}
                  placeholder="E.g., Himalayan Java Coffee, Mountain View Hotel"
                />
              </Field>

              <Field label="Category">
                <select
                  value={spotDraft.category}
                  onChange={(event) => handleSpotChange("category", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  {spotCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Description">
                <textarea
                  value={spotDraft.description}
                  onChange={(event) => handleSpotChange("description", event.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none py-4`}
                  placeholder="Describe this spot..."
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddSpot}
                className="flex-1 rounded-[20px] bg-emerald-600 px-4 py-3 text-base font-semibold text-white"
              >
                Add Spot
              </button>
              <button
                type="button"
                onClick={() => setShowSpotForm(false)}
                className="flex-1 rounded-[20px] border border-black/10 bg-white px-4 py-3 text-base font-semibold text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {nearbySpots.length ? (
          <div className="mt-5 space-y-3">
            {nearbySpots.map((spot) => (
              <div
                key={spot.id}
                className="flex items-start justify-between gap-4 rounded-[24px] bg-slate-50 px-4 py-4"
              >
                <div>
                  <h4 className="text-lg font-semibold text-slate-950">{spot.name}</h4>
                  <p className="mt-1 text-sm font-medium text-emerald-600">{spot.category}</p>
                  {spot.imagePreviews?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {spot.imagePreviews.map((image) => (
                        <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded-[18px] bg-white">
                          <Image
                            src={image.previewUrl}
                            alt={spot.name}
                            fill
                            sizes="80px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-slate-600">{spot.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpot(spot.id)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
                  aria-label={`Remove ${spot.name}`}
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {submitted ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-700">
          Contribution saved successfully. Opening the district page now so you can see the update.
          {submitted.districtSlug ? (
            <div className="mt-2">
              <Link href={`/districts/${submitted.districtSlug}`} className="font-semibold underline">
                Open district page
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {uploadingPhotos ? (
        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between gap-3 text-sm font-medium text-emerald-700">
            <span>{uploadLabel || "Uploading photos..."}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#08af3b] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[24px] bg-[#08af3b] px-5 py-3 text-[1.1rem] font-semibold text-white shadow-[0_18px_32px_rgba(8,175,59,0.22)] transition hover:bg-[#079434]"
        >
          {loading ? "Submitting..." : "Submit Contribution"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Saved contributions appear on the district page right after upload.
        </p>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2.5">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-[20px] border border-black/6 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-200";
