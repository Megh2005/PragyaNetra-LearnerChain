"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
    ({ children, className, variant = "primary", size = "md", ...props }, ref) => {

        const variants = {
            primary: "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400/20 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_35px_rgba(79,70,229,0.5)]",
            secondary: "bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400/20 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]",
            outline: "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/30 backdrop-blur-md",
            danger: "bg-gradient-to-br from-red-500 to-pink-600 border-red-400/20 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_35px_rgba(239,68,68,0.5)]",
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg",
            xl: "px-10 py-5 text-xl",
        };

        return (
            <motion.button
                ref={ref}
                className={cn(
                    "relative rounded-xl font-bold tracking-wide transition-all duration-300 border flex items-center justify-center gap-2 overflow-hidden group",
                    variants[variant],
                    sizes[size],
                    className
                )}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                {...props}
            >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">
                    {children}
                </span>
            </motion.button>
        );
    }
);

ShinyButton.displayName = "ShinyButton";
