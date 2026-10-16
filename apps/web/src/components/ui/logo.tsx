// The brand mark: a mounted plate (gold tab on top, keyline inside) holding
// the Cinzel M of the wordmark. Same shapes as the favicon, drawn in
// currentColor; scripts/render-brand-icons.mjs renders the icon files.
const M_PATH =
  "M780 714 788 605 491 90Q491 90 481.0 72.5Q471 55 461.5 30.0Q452 5 452 -20H442L403 67ZM102 73V0H-9V10Q-8 10 -0.5 10.0Q7 10 7 10Q34 10 55.0 26.5Q76 43 80 73ZM146 57Q146 56 146.0 55.0Q146 54 146 52Q146 36 157.5 22.5Q169 9 185 9H201V0H139V57ZM163 714H172L207 614L140 0H71ZM172 714 499 177 442 -20 146 477ZM789 714 884 0H723L673 460L780 714ZM853 73H874Q879 43 900.0 26.5Q921 10 947 10Q947 10 955.0 10.0Q963 10 963 10V0H853ZM717 57H724V0H663V9H678Q695 9 706.0 22.5Q717 36 717 52Q717 54 717.0 55.0Q717 56 717 57Z";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4.75"
        y="4.75"
        width="38.5"
        height="38.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* The plate's tab keeps the gilt accent whatever the ink colour. */}
      <rect
        x="4"
        y="4"
        width="40"
        height="5"
        rx="1"
        fill="var(--gold, currentColor)"
      />
      <rect
        x="8.5"
        y="12.5"
        width="31"
        height="27"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.5"
      />
      <path
        d={M_PATH}
        transform="translate(10.26 36.5) scale(0.0288 -0.0288)"
        fill="currentColor"
      />
    </svg>
  );
}
