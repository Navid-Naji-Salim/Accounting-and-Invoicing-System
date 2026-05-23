import type { ReactElement } from "react";
import type { PageId } from "./types";

type IconProps = {
  className?: string;
};

export const icons: Record<PageId, (props: IconProps) => ReactElement> = {
  home: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  items: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m12 3 8 4.4v9.2L12 21l-8-4.4V7.4L12 3Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  sales: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 19V5h16v14H4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9h8M8 13h5M17 17l3 3M20 17l-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  purchases: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M7 7h14l-2 8H8L6.5 4H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" />
    </svg>
  ),
  reports: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 20V4h14v16H5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 16v-4M12 16V8M15 16v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};
