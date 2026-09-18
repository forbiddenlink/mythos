export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer celestial astrolabe coordinate ring */}
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1" opacity="0.22" />
      <circle
        cx="24"
        cy="24"
        r="19.5"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.28"
        strokeDasharray="1 2.5"
      />

      {/* Cardinal & diagonal navigation points */}
      <path
        d="M24 2 v3.2 M24 42.8 v3.2 M2 24 h3.2 M42.8 24 h3.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M8.44 8.44 l2.2 2.2 M37.36 37.36 l2.2 2.2 M8.44 39.56 l2.2 -2.2 M37.36 10.64 l2.2 -2.2"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Navigational polaris / 8-pointed celestial star atop the temple */}
      <path d="M24 5 L25.6 11 L24 9.5 L22.4 11 Z" fill="currentColor" opacity="0.95" />
      <circle cx="24" cy="7.2" r="0.75" fill="currentColor" />

      {/* Classical Temple Pediment */}
      <path d="M24 10.2 L36 18 H12 Z" fill="currentColor" opacity="0.92" />
      <path
        d="M24 9.4 L36.8 17.8 H11.2 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
        opacity="0.5"
      />

      {/* Sacred Tympanum Medallion */}
      <circle cx="24" cy="15.2" r="1.6" fill="currentColor" />
      <circle cx="24" cy="15.2" r="2.3" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />

      {/* Acroterion & pediment corner ornaments */}
      <path d="M24 7.6 L24.8 9.5 H23.2 Z" fill="currentColor" />
      <circle cx="12" cy="18" r="0.75" fill="currentColor" opacity="0.6" />
      <circle cx="36" cy="18" r="0.75" fill="currentColor" opacity="0.6" />

      {/* Entablature / Frieze */}
      <rect x="11.5" y="18" width="25" height="1.8" rx="0.3" fill="currentColor" opacity="0.95" />
      <rect x="12.5" y="19.8" width="23" height="0.7" fill="currentColor" opacity="0.6" />

      {/* Four Classical Fluted Columns */}
      {/* Col 1 */}
      <rect x="13.2" y="20.5" width="2.8" height="0.8" rx="0.2" fill="currentColor" />
      <rect x="13.6" y="21.3" width="2" height="9.9" fill="currentColor" opacity="0.85" />
      <line x1="14.6" y1="21.7" x2="14.6" y2="30.8" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <rect x="13.2" y="31.2" width="2.8" height="0.8" rx="0.2" fill="currentColor" />

      {/* Col 2 */}
      <rect x="19" y="20.5" width="2.8" height="0.8" rx="0.2" fill="currentColor" />
      <rect x="19.4" y="21.3" width="2" height="9.9" fill="currentColor" opacity="0.85" />
      <line x1="20.4" y1="21.7" x2="20.4" y2="30.8" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <rect x="19" y="31.2" width="2.8" height="0.8" rx="0.2" fill="currentColor" />

      {/* Col 3 */}
      <rect x="26.2" y="20.5" width="2.8" height="0.8" rx="0.2" fill="currentColor" />
      <rect x="26.6" y="21.3" width="2" height="9.9" fill="currentColor" opacity="0.85" />
      <line x1="27.6" y1="21.7" x2="27.6" y2="30.8" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <rect x="26.2" y="31.2" width="2.8" height="0.8" rx="0.2" fill="currentColor" />

      {/* Col 4 */}
      <rect x="32" y="20.5" width="2.8" height="0.8" rx="0.2" fill="currentColor" />
      <rect x="32.4" y="21.3" width="2" height="9.9" fill="currentColor" opacity="0.85" />
      <line x1="33.4" y1="21.7" x2="33.4" y2="30.8" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <rect x="32" y="31.2" width="2.8" height="0.8" rx="0.2" fill="currentColor" />

      {/* Central Sanctuary Portal & Sacred Eternal Flame */}
      <path
        d="M22.2 31.2 V26.2 A1.8 1.8 0 0 1 25.8 26.2 V31.2"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M24 23.4 C24.6 24.3 24.8 25 24.5 25.6 C24.2 26.1 23.8 26.1 23.5 25.6 C23.2 25 23.4 24.3 24 23.4 Z"
        fill="currentColor"
        opacity="0.95"
      />

      {/* Stepped Stylobate (Three Classical Steps) */}
      <rect x="11" y="32" width="26" height="1.4" rx="0.3" fill="currentColor" opacity="0.92" />
      <rect x="9.5" y="33.4" width="29" height="1.3" rx="0.3" fill="currentColor" opacity="0.8" />
      <rect x="8" y="34.7" width="32" height="1.3" rx="0.3" fill="currentColor" opacity="0.65" />

      {/* Classical Laurel Wreath Framing the Base */}
      {/* Left branch */}
      <path
        d="M24 43.5 C16.5 43.5 9 39 6.5 28.5 C5.8 25.5 6 22 7 19"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path d="M6.8 20 C6 21 5.5 23 6.8 23.5 C8 24 8.5 22 8 20.8 Z" fill="currentColor" opacity="0.75" />
      <path d="M6 25 C5 26.2 4.8 28.2 6.2 28.8 C7.5 29.2 8.2 27.5 7.6 26 Z" fill="currentColor" opacity="0.8" />
      <path d="M7.2 30.5 C6.2 32 6.4 34 7.8 34.5 C9.2 34.8 9.8 33 9 31.5 Z" fill="currentColor" opacity="0.8" />
      <path d="M10.2 35.5 C9.2 37.2 9.8 39 11.4 39.5 C12.8 39.8 13.5 38 12.4 36.5 Z" fill="currentColor" opacity="0.85" />
      <path d="M15 39.5 C14.2 41.2 15.2 43 17 43.2 C18.5 43.2 19 41.5 17.8 40 Z" fill="currentColor" opacity="0.85" />

      {/* Right branch */}
      <path
        d="M24 43.5 C31.5 43.5 39 39 41.5 28.5 C42.2 25.5 42 22 41 19"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path d="M41.2 20 C42 21 42.5 23 41.2 23.5 C40 24 39.5 22 40 20.8 Z" fill="currentColor" opacity="0.75" />
      <path d="M42 25 C43 26.2 43.2 28.2 41.8 28.8 C40.5 29.2 39.8 27.5 40.4 26 Z" fill="currentColor" opacity="0.8" />
      <path d="M40.8 30.5 C41.8 32 41.6 34 40.2 34.5 C38.8 34.8 38.2 33 39 31.5 Z" fill="currentColor" opacity="0.8" />
      <path d="M37.8 35.5 C38.8 37.2 38.2 39 36.6 39.5 C35.2 39.8 34.5 38 35.6 36.5 Z" fill="currentColor" opacity="0.85" />
      <path d="M33 39.5 C33.8 41.2 32.8 43 31 43.2 C29.5 43.2 29 41.5 30.2 40 Z" fill="currentColor" opacity="0.85" />

      {/* Bottom Center Medallion & Ribbon Knot */}
      <circle cx="24" cy="43.5" r="1.4" fill="currentColor" />
      <path d="M23 44.5 L20.5 47 M25 44.5 L27.5 47" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
