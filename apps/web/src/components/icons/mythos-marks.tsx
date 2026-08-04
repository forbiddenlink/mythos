import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type MarkProps = SVGProps<SVGSVGElement> & {
  className?: string;
  title?: string;
};

function MarkBase({
  className,
  title,
  children,
  ...props
}: MarkProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-10", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Classical temple — pantheons, atlas, about */
export function MarkTemple(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path d="M16 4 L26 12 H6 Z" fill="currentColor" opacity="0.92" />
      <rect
        x="7"
        y="12"
        width="18"
        height="1.75"
        fill="currentColor"
        opacity="0.85"
      />
      <rect
        x="8.5"
        y="13.75"
        width="3"
        height="11"
        fill="currentColor"
        opacity="0.8"
      />
      <rect
        x="14.5"
        y="13.75"
        width="3"
        height="11"
        fill="currentColor"
        opacity="0.8"
      />
      <rect
        x="20.5"
        y="13.75"
        width="3"
        height="11"
        fill="currentColor"
        opacity="0.8"
      />
      <rect
        x="6.5"
        y="24.75"
        width="19"
        height="1.75"
        rx="0.4"
        fill="currentColor"
      />
      <rect
        x="5.5"
        y="26.5"
        width="21"
        height="1.1"
        rx="0.3"
        fill="currentColor"
        opacity="0.65"
      />
      <circle cx="16" cy="7.25" r="0.85" fill="currentColor" />
    </MarkBase>
  );
}

/** Laurel crown — deities */
export function MarkLaurel(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M16 6c-3.2 1.2-5.8 3.8-6.8 7.2-.4 1.4-.4 2.8 0 4.1C10.2 21.4 13 24.5 16 26c3-1.5 5.8-4.6 6.8-8.7.4-1.3.4-2.7 0-4.1C21.8 9.8 19.2 7.2 16 6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.35"
      />
      <path
        d="M10 9.5c-1.6 2.2-2.4 4.6-2.2 7.1.2 2.2 1.2 4.2 2.7 5.9"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M22 9.5c1.6 2.2 2.4 4.6 2.2 7.1-.2 2.2-1.2 4.2-2.7 5.9"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M10.2 11.2l2.4 1.1M9.6 14l2.6.5M9.8 16.8l2.5-.2M10.6 19.4l2.2-.8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M21.8 11.2l-2.4 1.1M22.4 14l-2.6.5M22.2 16.8l-2.5-.2M21.4 19.4l-2.2-.8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="16" cy="15.5" r="2.2" fill="currentColor" opacity="0.9" />
      <path
        d="M16 13.3v4.4M14 15.5h4"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.35"
      />
    </MarkBase>
  );
}

/** Open scroll — stories, sources, facts */
export function MarkScroll(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M8 7.5c0-1.4 1.1-2.5 2.5-2.5h11c1.4 0 2.5 1.1 2.5 2.5v17c0 1.4-1.1 2.5-2.5 2.5h-11C9.1 27 8 25.9 8 24.5v-17Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M9 8.5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v15c0 1.1-.9 2-2 2H11c-1.1 0-2-.9-2-2v-15Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M9 10.5h14M9 21.5h14"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.7"
      />
      <path
        d="M12 13.5h8M12 16h8M12 18.5h5.5"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.85"
      />
    </MarkBase>
  );
}

/** Serpent coil — creatures */
export function MarkSerpent(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M8 18c0-4.5 3.2-7.5 8-7.5 3.2 0 5.2 1.4 5.2 3.4 0 1.6-1.2 2.6-3.2 2.6-1.5 0-2.5-.7-2.5-1.8 0-.9.7-1.5 1.8-1.5.8 0 1.3.3 1.3.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.5 21.5c1.8 2.8 4.2 4 7 4 3.6 0 6-2.2 6-5.2 0-2.2-1.4-3.6-3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="21.2" cy="13.2" r="1.15" fill="currentColor" />
      <path
        d="M22.4 12.2l2-1.4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M7.5 19.5c1.2.4 2.2.5 3.2.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </MarkBase>
  );
}

/** Thunderbolt / relic — artifacts */
export function MarkRelic(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M17.5 4.5 L11 15.5 H15.2 L13.2 27.5 L22.5 13.2 H17.8 Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M17.5 4.5 L11 15.5 H15.2 L13.2 27.5 L22.5 13.2 H17.8 Z"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.35"
      />
    </MarkBase>
  );
}

/** Mountain peak — locations */
export function MarkPeak(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M4.5 24.5 L12 10 L16.2 17.5 L19.5 12.5 L27.5 24.5 Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M5 24.5 L12 11 L16 18 L19.5 13 L27 24.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M12 11 L14.2 15.2 L11.4 15.2 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M19.5 13 L21.2 16.2 L18.2 16.2 Z"
        fill="currentColor"
        opacity="0.75"
      />
      <rect
        x="5"
        y="24.5"
        width="22"
        height="1.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.55"
      />
    </MarkBase>
  );
}

/** Balance scales — compare */
export function MarkScales(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M16 6v16.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M8 11h16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M9.5 11 L7 18.5 H12 Z" fill="currentColor" opacity="0.85" />
      <path d="M22.5 11 L20 18.5 H25 Z" fill="currentColor" opacity="0.85" />
      <path
        d="M7 18.5h5M20 18.5h5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <rect
        x="12.5"
        y="22.5"
        width="7"
        height="2"
        rx="0.4"
        fill="currentColor"
      />
      <circle cx="16" cy="7.2" r="1.2" fill="currentColor" />
    </MarkBase>
  );
}

/** Lyre — quiz / personality / music of the spheres */
export function MarkLyre(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M10 8.5c0-2.4 2-4 4.2-4h3.6c2.2 0 4.2 1.6 4.2 4V14c0 3.8-2.6 6.8-6 7.4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M22 8.5c0-2.4-2-4-4.2-4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M12.2 10.5v8.2M14.7 9.8v9.2M17.3 9.8v9.2M19.8 10.5v8.2"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M14.5 21.5v4M17.5 21.5v4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <rect
        x="12.5"
        y="25.2"
        width="7"
        height="1.6"
        rx="0.4"
        fill="currentColor"
      />
    </MarkBase>
  );
}

/** Labyrinth — games / memory */
export function MarkLabyrinth(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <rect
        x="5.5"
        y="5.5"
        width="21"
        height="21"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="9"
        y="9"
        width="14"
        height="14"
        stroke="currentColor"
        strokeWidth="1.15"
        opacity="0.85"
      />
      <rect
        x="12.5"
        y="12.5"
        width="7"
        height="7"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.75"
      />
      <path
        d="M16 5.5v3.5M26.5 16h-3.5M16 26.5v-3.5M5.5 16h3.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
    </MarkBase>
  );
}

/** Classical compass — journeys / atlas */
export function MarkCompass(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <circle
        cx="16"
        cy="16"
        r="10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.35"
      />
      <circle
        cx="16"
        cy="16"
        r="7.5"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <path
        d="M16 6.5 L18.2 16 L16 25.5 L13.8 16 Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M6.5 16 L16 13.8 L25.5 16 L16 18.2 Z"
        fill="currentColor"
        opacity="0.55"
      />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </MarkBase>
  );
}

/** World tree — family tree */
export function MarkTree(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M16 27V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 18 L10 12.5M16 18 L22 12.5M16 14 L11.5 8.5M16 14 L20.5 8.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="10" cy="12.5" r="1.5" fill="currentColor" />
      <circle cx="22" cy="12.5" r="1.5" fill="currentColor" />
      <circle cx="11.5" cy="8.5" r="1.35" fill="currentColor" opacity="0.9" />
      <circle cx="20.5" cy="8.5" r="1.35" fill="currentColor" opacity="0.9" />
      <circle cx="16" cy="6.5" r="1.7" fill="currentColor" />
      <rect
        x="12"
        y="26.2"
        width="8"
        height="1.5"
        rx="0.3"
        fill="currentColor"
        opacity="0.7"
      />
    </MarkBase>
  );
}

/** Constellation — knowledge graph / atlas sky */
export function MarkConstellation(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M8 22 L13 14 L19 17 L24 9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M13 14 L11 8.5M19 17 L22 22"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="8" cy="22" r="1.5" fill="currentColor" />
      <circle cx="13" cy="14" r="1.7" fill="currentColor" />
      <circle cx="19" cy="17" r="1.5" fill="currentColor" />
      <circle cx="24" cy="9" r="1.6" fill="currentColor" />
      <circle cx="11" cy="8.5" r="1.2" fill="currentColor" opacity="0.85" />
      <circle cx="22" cy="22" r="1.2" fill="currentColor" opacity="0.85" />
    </MarkBase>
  );
}

/** Torch — learning paths / progress */
export function MarkTorch(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M14.2 14.5h3.6v11.2c0 .8-.7 1.4-1.5 1.4h-.6c-.8 0-1.5-.6-1.5-1.4V14.5Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M16 4.5c2.8 2.2 4.2 4.5 4.2 7.2 0 2.4-1.8 3.8-4.2 3.8S11.8 14.1 11.8 11.7c0-2.7 1.4-5 4.2-7.2Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M16 7.2c1.4 1.2 2.1 2.4 2.1 3.8 0 1.2-.9 1.9-2.1 1.9"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.35"
      />
    </MarkBase>
  );
}

/** Solar disc / chronology — timeline */
export function MarkChronos(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <circle
        cx="16"
        cy="16"
        r="6.2"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
      <path
        d="M16 5.5v2.2M16 24.3v2.2M5.5 16h2.2M24.3 16h2.2M8.2 8.2l1.6 1.6M22.2 22.2l1.6 1.6M8.2 23.8l1.6-1.6M22.2 9.8l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </MarkBase>
  );
}

/** Owl — wisdom / oracle / review */
export function MarkOwl(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M8.5 13.5c0-4 3.2-7.5 7.5-7.5s7.5 3.5 7.5 7.5c0 5.2-3 9.5-7.5 11.5-4.5-2-7.5-6.3-7.5-11.5Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M9 14c0-3.6 3-6.8 7-6.8s7 3.2 7 6.8c0 4.6-2.7 8.4-7 10.2-4.3-1.8-7-5.6-7-10.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle
        cx="12.8"
        cy="14.2"
        r="2.1"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <circle
        cx="19.2"
        cy="14.2"
        r="2.1"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <circle cx="12.8" cy="14.2" r="0.85" fill="currentColor" />
      <circle cx="19.2" cy="14.2" r="0.85" fill="currentColor" />
      <path d="M16 16.2 L14.8 18.2 H17.2 Z" fill="currentColor" />
      <path
        d="M12 7.8 L14.2 10M20 7.8 L17.8 10"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </MarkBase>
  );
}

/** Book / collection */
export function MarkCodex(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M7.5 7.5h8.5v17H9c-.8 0-1.5-.7-1.5-1.5V7.5Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M16 7.5h8.5v15.5c0 .8-.7 1.5-1.5 1.5H16V7.5Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M7.5 7.5 H16 V24.5 H9c-.8 0-1.5-.7-1.5-1.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M16 7.5 H24.5 V23c0 .8-.7 1.5-1.5 1.5H16"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M16 7.5v17" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M10 11h4M10 14h4M19 11h3.5M19 14h3.5"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity="0.8"
      />
    </MarkBase>
  );
}

/** Favor / bookmark — ribbon on a tablet */
export function MarkFavor(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <rect
        x="8"
        y="5.5"
        width="16"
        height="21"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M12 5.5 V14.5 L16 12.2 L20 14.5 V5.5"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M11 18.5h10M11 21.5h7"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.65"
      />
    </MarkBase>
  );
}

/** War — classical blade */
export function MarkBlade(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path d="M16 4.5 L18.2 14 H13.8 Z" fill="currentColor" opacity="0.9" />
      <path d="M14.2 14h3.6v2.2h-3.6Z" fill="currentColor" opacity="0.75" />
      <path d="M15.2 16.2h1.6V26.5h-1.6Z" fill="currentColor" opacity="0.85" />
      <path d="M12.5 26.5h7v1.4h-7Z" fill="currentColor" />
      <path
        d="M16 5.5v8"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.35"
      />
    </MarkBase>
  );
}

/** Love — myrtle blossom */
export function MarkMyrtle(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <circle cx="16" cy="14" r="2.2" fill="currentColor" />
      <path
        d="M16 7.5c1.6 2.2 3.8 3.4 6 3.6-2.2.4-3.8 2-4.6 4.4-.8-2.4-2.4-4-4.6-4.4 2.2-.2 4.4-1.4 6-3.6Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M16 7.5c-1.6 2.2-3.8 3.4-6 3.6 2.2.4 3.8 2 4.6 4.4.8-2.4 2.4-4 4.6-4.4-2.2-.2-4.4-1.4-6-3.6Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M16 20.5c-1.8 1.6-3.2 3.4-3.6 5.5 1.2-.6 2.4-.8 3.6-.8s2.4.2 3.6.8c-.4-2.1-1.8-3.9-3.6-5.5Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M16 16.2v6.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </MarkBase>
  );
}

/** Death — funerary urn */
export function MarkUrn(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path d="M11 8.5h10v2.2H11Z" fill="currentColor" opacity="0.85" />
      <path d="M13.2 6.5h5.6v2H13.2Z" fill="currentColor" />
      <path
        d="M10.5 10.7c0 7.2 1.8 12.8 5.5 15.3 3.7-2.5 5.5-8.1 5.5-15.3H10.5Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M10.5 10.7c0 7.2 1.8 12.8 5.5 15.3 3.7-2.5 5.5-8.1 5.5-15.3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M12.5 14.5h7M13 18h6"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity="0.7"
      />
    </MarkBase>
  );
}

/** Sea — trident */
export function MarkTrident(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M16 28 V14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9 14 V9.5c0-2 1.6-3.5 3.5-3.5.8 0 1.5.2 2.1.7L16 8.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M23 14 V9.5c0-2-1.6-3.5-3.5-3.5-.8 0-1.5.2-2.1.7L16 8.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 8.5 V5.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M12.5 14h7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="16" cy="5.2" r="1" fill="currentColor" />
    </MarkBase>
  );
}

/** Fertility — wheat sheaf */
export function MarkWheat(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M16 28 V12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M16 13c-2.8-1.2-4.6-3.2-5.2-5.6 2.6.4 4.4 2 5.2 4.2.8-2.2 2.6-3.8 5.2-4.2-.6 2.4-2.4 4.4-5.2 5.6Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M16 17c-2.4-.8-4-2.4-4.6-4.4 2.2.3 3.6 1.5 4.6 3.2 1-1.7 2.4-2.9 4.6-3.2-.6 2-2.2 3.6-4.6 4.4Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M16 21c-2-.6-3.2-1.8-3.6-3.4 1.8.2 2.8 1.1 3.6 2.4.8-1.3 1.8-2.2 3.6-2.4-.4 1.6-1.6 2.8-3.6 3.4Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M12 24.5c1.2.8 2.6 1.2 4 1.2s2.8-.4 4-1.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </MarkBase>
  );
}

/** Sky — thunderbolt */
export function MarkBolt(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M18.5 4.5 L11 16.2 H15.2 L13 27.5 L22.5 13.5 H17.8 Z"
        fill="currentColor"
        opacity="0.92"
      />
    </MarkBase>
  );
}

/** Crafts — anvil */
export function MarkAnvil(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path d="M7 12.5h18v3.2H7Z" fill="currentColor" opacity="0.9" />
      <path
        d="M10 15.7h12v5.5c0 .8-.7 1.5-1.5 1.5h-9c-.8 0-1.5-.7-1.5-1.5v-5.5Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path d="M12.5 22.7h7V26h-7Z" fill="currentColor" />
      <path d="M6 10.5h6.5v2H6Z" fill="currentColor" opacity="0.65" />
      <circle cx="22" cy="9" r="1.4" fill="currentColor" opacity="0.5" />
    </MarkBase>
  );
}

/** Magic — star-crowned staff */
export function MarkStaff(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M16 28 V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 5.5 L17.4 9.2 L21.4 9.4 L18.2 11.8 L19.2 15.6 L16 13.6 L12.8 15.6 L13.8 11.8 L10.6 9.4 L14.6 9.2 Z"
        fill="currentColor"
      />
      <circle cx="16" cy="11.2" r="1.1" fill="currentColor" opacity="0.35" />
    </MarkBase>
  );
}

/** Sovereignty — scepter */
export function MarkScepter(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <circle
        cx="16"
        cy="7"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="currentColor"
        opacity="0.15"
      />
      <circle cx="16" cy="7" r="1.3" fill="currentColor" />
      <path
        d="M16 10.2 V25.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12.5 13.5h7M13.2 17h5.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path d="M13.5 25.5h5v1.6h-5Z" fill="currentColor" />
    </MarkBase>
  );
}

/** Chance / Discover — classical knucklebones (astragali) */
export function MarkLot(props: MarkProps) {
  return (
    <MarkBase {...props}>
      <path
        d="M9.5 11.5c0-2.2 1.6-3.8 3.6-3.8 1.4 0 2.5.7 3.1 1.8.6-1.1 1.7-1.8 3.1-1.8 2 0 3.6 1.6 3.6 3.8 0 2.4-1.5 4.2-3.4 5.6L16 20.2l-3.5-3.1C10.9 15.7 9.5 13.9 9.5 11.5Z"
        fill="currentColor"
        opacity="0.18"
      />
      <ellipse
        cx="12.5"
        cy="12.2"
        rx="3.2"
        ry="3.6"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <ellipse
        cx="19.5"
        cy="12.2"
        rx="3.2"
        ry="3.6"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="12.5" cy="11.2" r="0.9" fill="currentColor" />
      <circle cx="11.4" cy="13.4" r="0.7" fill="currentColor" opacity="0.75" />
      <circle cx="13.6" cy="13.4" r="0.7" fill="currentColor" opacity="0.75" />
      <circle cx="19.5" cy="11.2" r="0.9" fill="currentColor" />
      <circle cx="18.4" cy="13.4" r="0.7" fill="currentColor" opacity="0.75" />
      <circle cx="20.6" cy="13.4" r="0.7" fill="currentColor" opacity="0.75" />
      <path
        d="M12 18.5h8M14 21.5h4"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.7"
      />
    </MarkBase>
  );
}

export const mythosMarks = {
  temple: MarkTemple,
  laurel: MarkLaurel,
  scroll: MarkScroll,
  serpent: MarkSerpent,
  relic: MarkRelic,
  peak: MarkPeak,
  scales: MarkScales,
  lyre: MarkLyre,
  labyrinth: MarkLabyrinth,
  compass: MarkCompass,
  tree: MarkTree,
  constellation: MarkConstellation,
  torch: MarkTorch,
  chronos: MarkChronos,
  owl: MarkOwl,
  codex: MarkCodex,
  favor: MarkFavor,
  blade: MarkBlade,
  myrtle: MarkMyrtle,
  urn: MarkUrn,
  trident: MarkTrident,
  wheat: MarkWheat,
  bolt: MarkBolt,
  anvil: MarkAnvil,
  staff: MarkStaff,
  scepter: MarkScepter,
  lot: MarkLot,
} as const;

export type MythosMarkId = keyof typeof mythosMarks;

/** Convenience renderer for menus / inline use */
export function MythosMark({
  id,
  className,
}: {
  id: MythosMarkId;
  className?: string;
}) {
  const Mark = mythosMarks[id];
  return <Mark className={className} />;
}
