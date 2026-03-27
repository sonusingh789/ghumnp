import { cn } from "@/lib/utils";

function Icon({ children, className, viewBox = "0 0 24 24", strokeWidth = 1.8 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
    >
      {children}
    </svg>
  );
}

export function SearchIcon({ className }) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function HomeIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.8V20h13V9.8" />
      <path d="M9.5 20v-5h5v5" />
    </Icon>
  );
}

export function CompassIcon({ className }) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.4 7-7 2.4 2.4-7 7-2.4Z" />
    </Icon>
  );
}

export function PlusCircleIcon({ className }) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </Icon>
  );
}

export function HeartIcon({ className, filled = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-5", className)}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-7.5-4.6-9.2-9.1C1.5 7.9 3.6 4.5 7.4 4.5c2.1 0 3.4 1.1 4.6 2.6 1.2-1.5 2.5-2.6 4.6-2.6 3.8 0 5.9 3.4 4.6 6.9-1.7 4.5-9.2 9.1-9.2 9.1Z" />
    </svg>
  );
}

export function UserIcon({ className }) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.4-3.1 4.1-4.7 7-4.7s5.6 1.6 7 4.7" />
    </Icon>
  );
}

export function ChevronRightIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}

export function ChevronLeftIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="m15 6-6 6 6 6" />
    </Icon>
  );
}

export function ArrowLeftIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Icon>
  );
}

export function StarIcon({ className, filled = true }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-4", className)}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3.8 2.5 5.2 5.8.8-4.2 4 1 5.8-5.1-2.7-5.1 2.7 1-5.8-4.2-4 5.8-.8L12 3.8Z" />
    </svg>
  );
}

export function MapPinIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M12 21s6-5.8 6-11a6 6 0 1 0-12 0c0 5.2 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </Icon>
  );
}

export function SlidersIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M4 6h16" />
      <path d="M8 6v12" />
      <path d="M4 18h16" />
      <path d="M16 6v12" />
    </Icon>
  );
}

export function GridIcon({ className }) {
  return (
    <Icon className={className}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </Icon>
  );
}

export function UploadIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M12 16V6" />
      <path d="m7.5 10.5 4.5-4.5 4.5 4.5" />
      <path d="M5 19h14" />
    </Icon>
  );
}

export function CameraIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M5 8h3l1.4-2h5.2L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Icon>
  );
}

export function SettingsIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 1 0 12 8.5z" />
      <path d="m19 12 1.7 1-1.6 2.8-2-.5a7.9 7.9 0 0 1-1.4 1.4l.5 2-2.8 1.6-1-1.7a7.8 7.8 0 0 1-2 0l-1 1.7-2.8-1.6.5-2a7.9 7.9 0 0 1-1.4-1.4l-2 .5L3.3 13 5 12a7.8 7.8 0 0 1 0-2l-1.7-1 1.6-2.8 2 .5a7.9 7.9 0 0 1 1.4-1.4l-.5-2L10.6 1.7l1 1.7a7.8 7.8 0 0 1 2 0l1-1.7 2.8 1.6-.5 2a7.9 7.9 0 0 1 1.4 1.4l2-.5L20.7 9 19 10a7.8 7.8 0 0 1 0 2Z" />
    </Icon>
  );
}

export function XIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </Icon>
  );
}

export function SparklesIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z" />
      <path d="m18.5 14.5.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
      <path d="m5.5 13 .9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4Z" />
    </Icon>
  );
}

export function PencilIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-1L4 19v1Z" />
      <path d="m13.5 5.5 5 5" />
    </Icon>
  );
}

export function TrashIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V7" />
      <path d="M6.2 7 7 20a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20l.8-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Icon>
  );
}

export function LogOutIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10" />
      <path d="M14 16l5-4-5-4" />
      <path d="M8 12h11" />
    </Icon>
  );
}

export function MailIcon({ className }) {
  return (
    <Icon className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </Icon>
  );
}

export function BookmarkIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v14l-6.5-3-6.5 3V6A1.5 1.5 0 0 1 7 4.5Z" />
    </Icon>
  );
}

export function FileTextIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M8 3.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 19V5A1.5 1.5 0 0 1 8.5 3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M10 12h4" />
      <path d="M10 15h4" />
    </Icon>
  );
}

export function ShareIcon({ className }) {
  return (
    <Icon className={className}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.3 10.8 7.4-4.3" />
      <path d="m8.3 13.2 7.4 4.3" />
    </Icon>
  );
}
