export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" opacity="0.2"/>

      {/* Inner decorative ring */}
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>

      {/* Temple pediment (triangle top) */}
      <path
        d="M16 5 L22 11 L10 11 Z"
        fill="currentColor"
        opacity="0.9"
      />

      {/* Entablature (horizontal bar under pediment) */}
      <rect x="9" y="11" width="14" height="1.5" fill="currentColor" opacity="0.8"/>

      {/* Left column */}
      <rect x="10.5" y="12.5" width="2.5" height="10" fill="currentColor" opacity="0.85"/>
      <rect x="10" y="12.5" width="3.5" height="1" rx="0.25" fill="currentColor"/>

      {/* Center column */}
      <rect x="14.75" y="12.5" width="2.5" height="10" fill="currentColor" opacity="0.85"/>
      <rect x="14.25" y="12.5" width="3.5" height="1" rx="0.25" fill="currentColor"/>

      {/* Right column */}
      <rect x="19" y="12.5" width="2.5" height="10" fill="currentColor" opacity="0.85"/>
      <rect x="18.5" y="12.5" width="3.5" height="1" rx="0.25" fill="currentColor"/>

      {/* Base/Stylobate */}
      <rect x="8" y="22.5" width="16" height="1.5" rx="0.5" fill="currentColor"/>
      <rect x="7" y="24" width="18" height="1" rx="0.25" fill="currentColor" opacity="0.7"/>

      {/* Small decorative star at top */}
      <circle cx="16" cy="7" r="0.8" fill="currentColor"/>

      {/* Corner decorations */}
      <circle cx="8" cy="8" r="0.6" fill="currentColor" opacity="0.3"/>
      <circle cx="24" cy="8" r="0.6" fill="currentColor" opacity="0.3"/>
      <circle cx="8" cy="24" r="0.6" fill="currentColor" opacity="0.3"/>
      <circle cx="24" cy="24" r="0.6" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}
