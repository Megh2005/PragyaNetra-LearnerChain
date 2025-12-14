"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeoCyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    className?: string;
}

const CYBER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export const NeoCyberButton = ({
    children,
    className,
    variant = "primary",
    ...props
}: NeoCyberButtonProps) => {
    // We only scramble if children is a string.
    const originalText = typeof children === 'string' ? children : "";
    const [displayText, setDisplayText] = useState(originalText);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const colors = {
        primary: "border-cyan-500 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
        secondary: "border-purple-500 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
        danger: "border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
        ghost: "border-transparent text-slate-400 shadow-none hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]",
    };

    const bgColors = {
        primary: "bg-cyan-500/10 hover:bg-cyan-500/20",
        secondary: "bg-purple-500/10 hover:bg-purple-500/20",
        danger: "bg-red-500/10 hover:bg-red-500/20",
        ghost: "bg-transparent hover:bg-white/5",
    };

    const scramble = () => {
        if (!originalText) return;

        let iteration = 0;
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText((prev) =>
                originalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)];
                    })
                    .join("")
            );

            if (iteration >= originalText.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }

            iteration += 1 / 2;
        }, 30);
    };

    const stopScramble = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(originalText);
    };

    useEffect(() => {
        setDisplayText(originalText);
    }, [originalText]);

    return (
        <motion.button
            className={cn(
                "relative group px-8 py-4 font-mono font-bold tracking-wider uppercase transition-all duration-300",
                "border-2 overflow-hidden flex items-center justify-center", // Ensure centralized content
                colors[variant],
                bgColors[variant],
                // Clip path
                "[clip-path:polygon(20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px)]",
                className
            )}
            onMouseEnter={() => {
                setIsHovered(true);
                scramble();
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                stopScramble();
            }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {/* Brackets */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-70" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-70" />

            {/* Scanlines */}
            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-10 bg-[linear-gradient(transparent_2px,currentColor_2px)] bg-[size:100%_4px]" />

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                {/* Only do the ghost text effect if it is actually text */}
                {isHovered && originalText && (
                    <span className="absolute inset-0 flex items-center justify-center text-white opacity-30 animate-pulse select-none pointer-events-none">
                        {displayText}
                    </span>
                )}

                <span className={cn("flex items-center gap-2", isHovered && originalText ? "opacity-80" : "opacity-100")}>
                    {/* If children is not string (e.g. icon + text), we might lose scrambled text in current primitive logic. 
                        Ideally we allow mixed content. For now, if originalText exists, show scrambled version, else render children normally. */}
                    {originalText ? displayText : children}
                </span>
            </span>

            {/* Slide BG */}
            <div
                className={cn(
                    "absolute inset-0 w-full h-full origin-left transform scale-x-0 transition-transform duration-300 ease-out z-0",
                    variant === 'primary' ? 'bg-cyan-500/10' : variant === 'secondary' ? 'bg-purple-500/10' : variant === 'ghost' ? 'bg-white/5' : 'bg-red-500/10'
                )}
                style={{ transform: isHovered ? 'scaleX(1)' : 'scaleX(0)' }}
            />
        </motion.button>
    );
};
