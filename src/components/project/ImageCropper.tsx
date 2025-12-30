"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageUrl, onCropComplete, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const CANVAS_SIZE = 400;
  const CIRCLE_SIZE = 360;
  const RECOMMENDED_SIZE = 500; // POAP standard size

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      const scale = Math.max(CIRCLE_SIZE / img.width, CIRCLE_SIZE / img.height);
      setZoom(scale);
      setPosition({
        x: (CANVAS_SIZE - img.width * scale) / 2,
        y: (CANVAS_SIZE - img.height * scale) / 2,
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_SIZE / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [image, zoom, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!canvasRef.current || !image) return;

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = RECOMMENDED_SIZE;
    outputCanvas.height = RECOMMENDED_SIZE;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    const scale = RECOMMENDED_SIZE / CIRCLE_SIZE;
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    const radius = CIRCLE_SIZE / 2;

    ctx.beginPath();
    ctx.arc(RECOMMENDED_SIZE / 2, RECOMMENDED_SIZE / 2, RECOMMENDED_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.save();
    ctx.translate(
      (RECOMMENDED_SIZE / 2) - (centerX - position.x) * scale,
      (RECOMMENDED_SIZE / 2) - (centerY - position.y) * scale
    );
    ctx.scale(zoom * scale, zoom * scale);
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    const croppedImageUrl = outputCanvas.toDataURL("image/png");
    onCropComplete(croppedImageUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-4 border-black shadow-brutal p-6 max-w-2xl w-full"
      >
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          🎯 Ajustar Imagen Circular (POAP)
        </h2>

        <div className="mb-4 p-4 bg-[#FDCB6E] border-2 border-black">
          <p className="font-mono text-sm">
            <strong>📏 Tamaño recomendado:</strong> {RECOMMENDED_SIZE}x{RECOMMENDED_SIZE}px (circular)
          </p>
          <p className="font-mono text-sm mt-1">
            <strong>💡 Tip:</strong> Arrastra la imagen y ajusta el zoom para centrarla en el círculo
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div
            className="relative border-4 border-black bg-gray-100"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-move"
            />
            <div className="absolute top-2 right-2 bg-white border-2 border-black px-2 py-1 font-mono text-xs">
              {isDragging ? "🖐️ Arrastrando..." : "👆 Arrastra para mover"}
            </div>
          </div>

          <div className="w-full max-w-md">
            <label className="block font-bold mb-2 font-mono">🔍 Zoom: {zoom.toFixed(2)}x</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-4 border-black bg-white font-bold shadow-brutal hover:bg-gray-100 transition-colors"
          >
            ✕ Cancelar
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="flex-1 px-6 py-3 border-4 border-black bg-[#FDCB6E] font-bold shadow-brutal hover:bg-[#E67E22] transition-colors"
          >
            ✓ Aplicar Recorte
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
