"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  animated?: boolean;
}

export default function Logo({ size = "md", showText = true, animated = true }: LogoProps) {
  const sizes = {
    sm: { hex: 28, text: "text-lg", letter: "text-xs" },
    md: { hex: 36, text: "text-xl", letter: "text-sm" },
    lg: { hex: 48, text: "text-2xl", letter: "text-base" },
  };

  const { hex, text, letter } = sizes[size];

  const HexagonIcon = () => (
    <svg
      width={hex}
      height={hex}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Hexagon shape */}
      <path
        d="M20 2L36.6 11V29L20 38L3.4 29V11L20 2Z"
        fill="#FDCB6E"
        stroke="#000000"
        strokeWidth="2"
      />
      {/* Letter C */}
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#000000"
      >
        C
      </text>
    </svg>
  );

  const content = (
    <div className="flex items-center gap-2">
      {animated ? (
        <motion.div
          whileHover={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.4 }}
        >
          <HexagonIcon />
        </motion.div>
      ) : (
        <HexagonIcon />
      )}
      {showText && (
        <span className={`${text} font-bold tracking-tight text-black uppercase italic`}>
          COLMENA
        </span>
      )}
    </div>
  );

  return content;
}

export function LogoLink({ size = "md", showText = true }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <Logo size={size} showText={showText} />
    </Link>
  );
}
