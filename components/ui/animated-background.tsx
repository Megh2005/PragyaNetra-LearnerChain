"use client";

import React, { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export const AnimatedBackground = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
            mouseX.set(clientX);
            mouseY.set(clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 -z-30 overflow-hidden bg-[#050505]">
            {/* 
              CYBER GRID PATTERN 
              - Uses SVG pattern for sharpness
              - Two layers: small grid and large grid for depth
            */}

            {/* Base Small Grid */}
            <div
                className="absolute inset-0 z-0 opacity-[0.15]"
                style={{
                    backgroundImage: `linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}
            />

            {/* Major Grid Lines (Every 5th line equivalent) */}
            <div
                className="absolute inset-0 z-0 opacity-[0.2]"
                style={{
                    backgroundImage: `linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)`,
                    backgroundSize: '150px 150px'
                }}
            />

            {/* Vignette / Horizon Fade */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_90%)] pointer-events-none z-10" />

            {/* Mouse Spotlight Grid Reveal */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-100 z-0 mix-blend-screen"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            600px circle at ${mouseX}px ${mouseY}px,
                            rgba(34, 211, 238, 0.15),
                            transparent 80%
                        )
                    `,
                }}
            />
        </div>
    );
};
