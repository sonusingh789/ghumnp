"use client";

import { SearchIcon } from "@/components/ui/icons";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search places, districts, foods...",
}) {
  return (
    <label className="relative block">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[26px] border border-black/10 bg-white/90 py-4 pl-12 pr-4 text-[15px] text-slate-900 shadow-[0_10px_30px_rgba(17,24,39,0.05)] outline-none transition placeholder:text-slate-400 focus:border-primary/30 focus:bg-white"
      />
    </label>
  );
}
