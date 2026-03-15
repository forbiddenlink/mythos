"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Compass } from "lucide-react";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth cursor movement
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const rotation = useMotionValue(0);

  // Spring animation for smooth following
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);
  const rotate = useSpring(rotation, { damping: 20, stiffness: 300 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration: detect client-side mount and browser capabilities
    setMounted(true);

    // Check for touch device
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!mounted || reducedMotion || isTouchDevice) return;

    let prevX = 0;
    let prevY = 0;

    const moveCursor = (e: MouseEvent) => {
      const newX = e.clientX - 16;
      const newY = e.clientY - 16;

      cursorX.set(newX);
      cursorY.set(newY);

      // Calculate rotation based on movement direction
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;

      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        rotation.set(angle + 90); // Offset so compass points in direction of movement
      }

      prevX = e.clientX;
      prevY = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        !!target.closest("a") ||
        !!target.closest("button") ||
        !!target.closest('[role="button"]') ||
        !!target.closest("[data-interactive]") ||
        target.classList.contains("cursor-pointer");

      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Hide default cursor
    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "auto";
    };
  }, [mounted, reducedMotion, isTouchDevice, cursorX, cursorY, rotation]);

  // Don't render on server, touch devices, or if user prefers reduced motion
  if (!mounted || reducedMotion || isTouchDevice) {
    return null;
  }

  return (
    <>
      {/* Main cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999]"
        style={{ x, y }}
        aria-hidden="true"
      >
        <motion.div
          style={{ rotate }}
          className="w-full h-full"
          animate={{
            scale: isClicking ? 0.8 : isHovering ? 1.3 : 1,
          }}
          transition={{ duration: 0.15 }}
        >
          <Compass
            className={`w-full h-full transition-colors duration-200 ${
              isHovering ? "text-gold" : "text-gold/70"
            }`}
            strokeWidth={1.5}
          />
        </motion.div>
      </motion.div>

      {/* Cursor trail / glow effect */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 pointer-events-none z-[9998] -translate-x-2 -translate-y-2"
        style={{
          x,
          y,
          background:
            "radial-gradient(circle, rgba(178,143,86,0.2) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 0.4,
        }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      />

      {/* Click ripple effect */}
      {isClicking && (
        <motion.div
          className="fixed pointer-events-none z-[9997]"
          style={{
            x: cursorX.get(),
            y: cursorY.get(),
            width: 32,
            height: 32,
          }}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-hidden="true"
        >
          <div className="w-full h-full rounded-full border-2 border-gold" />
        </motion.div>
      )}

      {/* Global style to hide cursor on interactive elements */}
      <style jsx global>{`
        a,
        button,
        [role="button"],
        [data-interactive],
        .cursor-pointer {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}

export default CustomCursor;
