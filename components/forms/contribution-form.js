"use client";

import { startTransition, useState } from "react";
import { allDistricts } from "@/data/nepal";
import { UploadIcon, XIcon } from "@/components/ui/icons";

const categories = [
  "Tourist Attraction",
  "Local Food",
  "Restaurant",
  "Hotel",
  "Local Stay",
];

export default function ContributionForm() {
  const [previews, setPreviews] = useState(["Temple square", "Lake sunrise"]);
  const [submitted, setSubmitted] = useState(false);

  function removePreview(label) {
    setPreviews((current) => current.filter((item) => item !== label));
  }

  function handleSubmit(event) {
    event.preventDefault();
    startTransition(() => {
      setSubmitted(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-900">Photos</p>
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
          {previews.map((preview) => (
            <div
              key={preview}
              className="relative flex h-24 w-24 shrink-0 items-end rounded-[24px] bg-[linear-gradient(145deg,#d9f0de,#b7d7f8)] p-3 text-xs font-semibold text-slate-700"
            >
              <button
                type="button"
                onClick={() => removePreview(preview)}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/[0.85] text-slate-500"
                aria-label={`Remove ${preview}`}
              >
                <XIcon className="size-4" />
              </button>
              {preview}
            </div>
          ))}
          <button
            type="button"
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500"
          >
            <UploadIcon className="size-6" />
            Upload
          </button>
        </div>
      </div>

      <Field label="Place Name">
        <input className={inputClass} placeholder="Enter place name" />
      </Field>

      <Field label="District">
        <select className={inputClass} defaultValue="">
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

      <Field label="Category">
        <select className={inputClass} defaultValue="">
          <option value="" disabled>
            Select category
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Location">
        <input className={inputClass} placeholder="E.g., Thamel, Kathmandu" />
      </Field>

      <Field label="Description">
        <textarea
          rows={5}
          className={`${inputClass} resize-none py-3.5`}
          placeholder="Tell travelers what makes this place special, useful tips, best time to visit, or what to try."
        />
      </Field>

      <button
        type="submit"
        className="w-full rounded-[24px] bg-primary px-5 py-4 text-base font-semibold text-white shadow-[0_18px_32px_rgba(22,163,74,0.25)] transition hover:bg-primary-strong"
      >
        Submit Contribution
      </button>

      <p className="text-center text-sm text-slate-500">
        Your contribution will be reviewed before it is published.
      </p>

      {submitted ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Contribution received. You can hook this form to your backend later without changing the UI.
        </div>
      ) : null}
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-[22px] border border-black/10 bg-slate-50 px-4 py-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary/30 focus:bg-white";
