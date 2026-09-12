import React from "react";

/**
 * Nav icon for Clans: a banner over two figures. Takes its colour from `active`
 * the same way the other nav icons ship as a plain/active pair — one component
 * here rather than two files of duplicated path data.
 */
export default function ClansIcon({ active = false }: { active?: boolean }) {
  const fill = active ? "#B9F8EE" : "white";
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill} fillOpacity={active ? 1 : 0.85}>
        {/* banner */}
        <path d="M9.25 1.5h1.5v3.1h-1.5z" />
        <path d="M10.75 1.9h5.4l-1.35 1.85 1.35 1.85h-5.4z" />
        {/* two figures beneath it */}
        <path d="M6.3 9.9a2.05 2.05 0 1 0 0-4.1 2.05 2.05 0 0 0 0 4.1zM13.7 9.9a2.05 2.05 0 1 0 0-4.1 2.05 2.05 0 0 0 0 4.1z" />
        <path d="M6.3 11a4.1 4.1 0 0 0-4.1 4.1v3.4h2.2v-3.4a1.9 1.9 0 0 1 3.8 0v3.4h2.2v-3.4A4.1 4.1 0 0 0 6.3 11zM13.7 11c-.6 0-1.18.13-1.7.36a5.55 5.55 0 0 1 1.5 3.74v3.4h4.3v-3.4a4.1 4.1 0 0 0-4.1-4.1z" />
      </g>
    </svg>
  );
}
