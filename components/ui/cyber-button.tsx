"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
}

export const CyberButton = ({
    children,
    className,
    variant = "primary",
    ...props
}: CyberButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const variants = {
        primary: "from-cyan-500 to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
        secondary: "from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]",
        danger: "from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]",
        ghost: "from-transparent to-transparent border-white/20 hover:border-white/50",
    };

    const textColors = {
        primary: "text-cyan-100",
        secondary: "text-purple-100",
        danger: "text-red-100",
        ghost: "text-white",
    };

    return (
        <motion.button
            className={cn(
                "relative group px-8 py-3 font-bold uppercase tracking-widest overflow-hidden",
                "bg-black/50 backdrop-blur-md border border-white/10",
                // Clip path for the angled corners
                "[clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]",
                className
            )}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {/* Background Gradient Animation */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-20 transition-opacity duration-300",
                    variants[variant],
                    isHovered ? "opacity-40" : "opacity-20"
                )}
            />

            {/* Border Glow Line */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r",
                    variants[variant],
                    "transition-all duration-300 transform",
                    isHovered ? "translate-x-0 scale-x-100" : "-translate-x-full scale-x-0"
                )}
            />
            <div
                className={cn(
                    "absolute top-0 right-0 h-[2px] w-full bg-gradient-to-l",
                    variants[variant],
                    "transition-all duration-300 transform",
                    isHovered ? "translate-x-0 scale-x-100" : "translate-x-full scale-x-0"
                )}
            />

            {/* Glitch Effect Containers */}
            <div className="relative z-10 flex items-center justify-center gap-2">
                {/* Icon Placeholder (if needed in future) */}
                <span
                    className={cn(
                        "transition-colors duration-300",
                        textColors[variant],
                        isHovered ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : ""
                    )}
                >
                    {children}
                </span>
            </div>

            {/* Decorative Corner Lines */}
            <svg
                className="absolute top-0 left-0 w-4 h-4 text-white/40"
                viewBox="0 0 10 10"
                fill="currentColor"
            >
                <path d="M0 0 L10 0 L0 10 Z" />
            </svg>
            <svg
                className="absolute bottom-0 right-0 w-4 h-4 text-white/40"
                viewBox="0 0 10 10"
                fill="currentColor"
            >
                <path d="M10 10 L0 10 L10 0 Z" />
            </svg>
        </motion.button>
    );
};
