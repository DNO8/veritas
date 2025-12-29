"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LoadingBeeProps {
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingBee({ text = "Cargando...", fullScreen = true }: LoadingBeeProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveRandomly = () => {
      const maxX = typeof window !== "undefined" ? window.innerWidth * 0.6 : 300;
      const maxY = typeof window !== "undefined" ? window.innerHeight * 0.4 : 200;
      
      setPosition({
        x: (Math.random() - 0.5) * maxX,
        y: (Math.random() - 0.5) * maxY,
      });
    };

    moveRandomly();
    const interval = setInterval(moveRandomly, 1500);
    return () => clearInterval(interval);
  }, []);

  const containerClass = fullScreen
    ? "min-h-screen bg-gray-50 flex flex-col items-center justify-center"
    : "py-20 flex flex-col items-center justify-center";

  return (
    <div className={containerClass}>
      <div className="relative w-64 h-64">
        {/* Trail effect */}
        <motion.div
          animate={{
            x: position.x * 0.3,
            y: position.y * 0.3,
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
          }}
          className="absolute inset-0 flex items-center justify-center text-4xl opacity-20"
        >
          🐝
        </motion.div>

        {/* Main bee */}
        <motion.div
          animate={{
            x: position.x,
            y: position.y,
            rotate: position.x > 0 ? 15 : -15,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 15,
            duration: 1.5,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.span
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
            }}
            className="text-6xl drop-shadow-lg"
          >
            🐝
          </motion.span>
        </motion.div>

        {/* Buzz lines */}
        <motion.div
          animate={{
            x: position.x - 30,
            y: position.y,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-2xl text-[#FDCB6E]">~</span>
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-center"
      >
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-bold text-lg text-black"
        >
          {text}
        </motion.p>
        <div className="flex justify-center gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                y: [0, -8, 0],
                backgroundColor: ["#FDCB6E", "#E67E22", "#FDCB6E"],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-[#FDCB6E] border-2 border-black"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
