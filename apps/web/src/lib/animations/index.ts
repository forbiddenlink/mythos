"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, useGSAP);
}

/** Fade in elements as they scroll into view */
export function scrollFadeIn(
  targets: string | Element | Element[],
  options: gsap.TweenVars = {},
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power2.out",
      scrollTrigger: {
        trigger: targets as gsap.DOMTarget,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
      ...options,
    },
  );
}

/** Parallax effect for hero images/backgrounds */
export function parallaxElement(trigger: string | Element, scrollSpeed = 0.4) {
  return gsap.to(trigger, {
    y: () => ScrollTrigger.maxScroll(window) * scrollSpeed,
    ease: "none",
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "max",
      scrub: true,
    },
  });
}

/** Typewriter effect using TextPlugin */
export function typewriterEffect(
  target: string | Element,
  text: string,
  duration = 2,
) {
  return gsap.to(target, {
    duration,
    text: { value: text, delimiter: "" },
    ease: "none",
  });
}

/** Staggered card reveal */
export function revealCards(containerSelector: string, cardSelector: string) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: containerSelector,
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
  tl.fromTo(
    `${containerSelector} ${cardSelector}`,
    { opacity: 0, scale: 0.9, y: 30 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.6,
      ease: "back.out(1.4)",
    },
  );
  return tl;
}

export { gsap, ScrollTrigger, useGSAP };
