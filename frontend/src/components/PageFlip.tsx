// components/PageFlip.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface PageFlipHandle {
  turnPage: () => Promise<void>;
}

const PageFlip = forwardRef<PageFlipHandle, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const { theme } = useTheme();
    const [isFlipping, setIsFlipping] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [pageShadow, setPageShadow] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      turnPage: async () => {
        if (isFlipping) return;
        setIsFlipping(true);

        // Smooth page flip animation
        const steps = 20;
        const delay = 15;
        
        for (let i = 0; i <= steps; i++) {
          const progress = i / steps;
          const angle = progress * 180;
          setRotation(angle);
          setPageShadow(Math.sin(progress * Math.PI) * 30);
          await new Promise((res) => setTimeout(res, delay));
        }

        // Reset
        await new Promise((res) => setTimeout(res, 200));
        setRotation(0);
        setPageShadow(0);
        setIsFlipping(false);
      },
    }));

    return (
      <div
        ref={containerRef}
        style={{
          perspective: "1500px",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: theme.colors.surface,
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Book spine shadow */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "40px",
            background: `linear-gradient(to right, ${theme.colors.pageShadow}40, transparent)`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
            transition: "transform 0.05s ease-out",
            backfaceVisibility: "hidden",
            transformOrigin: "left center",
            boxShadow: rotation > 10 ? `${pageShadow}px 0 30px ${theme.colors.pageShadow}` : "none",
            position: "relative",
          }}
        >
          {children}
        </div>

        {/* Page edge shadow effect */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "60px",
            background: `linear-gradient(to right, transparent, ${theme.colors.pageShadow}20)`,
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      </div>
    );
  }
);

PageFlip.displayName = "PageFlip";

export default PageFlip;