"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ImageCropper from "./ImageCropper";

interface BenefitFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BenefitForm({ projectId, onSuccess, onCancel }: BenefitFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    benefit_type: "digital_product",
    asset_code: "",
    total_supply: 100,
    minimum_donation: 10,
    donation_currency: "USDC",
    redemption_type: "instant",
    max_per_backer: 1,
    is_limited: true,
    shipping_required: false,
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setTempImageUrl(result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setImageUrl(croppedImageUrl);
    setShowCropper(false);
    setTempImageUrl(null);
  };

  const handleGenerateImage = async () => {
    if (!formData.title || !formData.description) {
      alert("Por favor completa el título y descripción primero");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/benefits/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          benefitType: formData.benefit_type,
          minDonation: formData.minimum_donation,
          totalSupply: formData.total_supply,
        }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setTempImageUrl(data.imageUrl);
        setShowCropper(true);
      }
    } catch (error) {
      
      alert("Error al generar la imagen");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      alert("Por favor genera una imagen para el beneficio");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/benefits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          project_id: projectId,
          image_url: imageUrl,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear beneficio");
      }
    } catch (error) {
      
      alert("Error al crear beneficio");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="border-4 border-black bg-white p-6 shadow-brutal"
    >
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Crear Nuevo Beneficio
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Título */}
        <div className="md:col-span-2">
          <label className="block font-bold mb-2">Título del Beneficio *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#FDCB6E]"
            placeholder="Ej: Acceso VIP al Evento"
            required
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block font-bold mb-2">Descripción *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#FDCB6E] min-h-[100px]"
            placeholder="Describe qué incluye este beneficio..."
            required
          />
        </div>

        {/* Tipo de Beneficio */}
        <div>
          <label className="block font-bold mb-2">Tipo de Beneficio</label>
          <select
            value={formData.benefit_type}
            onChange={(e) => setFormData({ ...formData, benefit_type: e.target.value })}
            className="w-full px-4 py-2 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#FDCB6E]"
          >
            <option value="digital_product">Producto Digital</option>
            <option value="physical_product">Producto Físico</option>
            <option value="service">Servicio</option>
            <option value="access">Acceso</option>
            <option value="experience">Experiencia</option>
            <option value="recognition">Reconocimiento</option>
            <option value="discount">Descuento</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Código del Asset */}
        <div>
          <label className="block font-bold mb-2">Código del Asset (NFT) *</label>
          <input
            type="text"
            value={formData.asset_code}
            onChange={(e) => setFormData({ ...formData, asset_code: e.target.value.toUpperCase().slice(0, 12) })}
            className="w-full px-4 py-2 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#FDCB6E]"
            placeholder="Ej: VIPPASS"
            maxLength={12}
            required
          />
          <p className="text-xs text-gray-500 mt-1 font-mono">Máx. 12 caracteres, solo letras y números</p>
        </div>

        {/* Supply Total */}
        <div>
          <label className="block font-bold mb-2">Cantidad Total</label>
          <input
            type="number"
            value={formData.total_supply}
            onChange={(e) => setFormData({ ...formData, total_supply: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#FDCB6E]"
            min="1"
            required
          />
        </div>

        {/* Donación Mínima */}
        <div>
          <label className="block font-bold mb-2">Donación Mínima</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.minimum_donation}
              onChange={(e) => setFormData({ ...formData, minimum_donation: parseFloat(e.target.value) })}
              className="flex-1 px-4 py-2 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#FDCB6E]"
              min="0.01"
              step="0.01"
              required
            />
            <select
              value={formData.donation_currency}
              onChange={(e) => setFormData({ ...formData, donation_currency: e.target.value })}
              className="px-4 py-2 border-4 border-black font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#FDCB6E] bg-white"
            >
              <option value="USDC">USDC</option>
              <option value="XLM">XLM</option>
            </select>
          </div>
        </div>

        {/* Máximo por Donador */}
        <div>
          <label className="block font-bold mb-2">Máximo por Donador</label>
          <input
            type="number"
            value={formData.max_per_backer}
            onChange={(e) => setFormData({ ...formData, max_per_backer: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#FDCB6E]"
            min="1"
            required
          />
        </div>

        {/* Tipo de Canje */}
        <div>
          <label className="block font-bold mb-2">Tipo de Canje</label>
          <select
            value={formData.redemption_type}
            onChange={(e) => setFormData({ ...formData, redemption_type: e.target.value })}
            className="w-full px-4 py-2 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#FDCB6E]"
          >
            <option value="instant">Instantáneo</option>
            <option value="date_range">Rango de Fechas</option>
            <option value="on_demand">Bajo Demanda</option>
            <option value="hybrid">Híbrido</option>
          </select>
        </div>

        {/* Imagen del Beneficio */}
        <div className="md:col-span-2">
          <label className="block font-bold mb-2">Imagen del Beneficio (POAP Circular)</label>
          
          {imageUrl ? (
            <div className="flex flex-col items-center gap-4">
              {/* Preview Circular tipo POAP */}
              <div className="relative">
                <div 
                  className="w-64 h-64 rounded-full border-4 border-black shadow-brutal overflow-hidden bg-white"
                  style={{ boxShadow: '8px 8px 0px #000000' }}
                >
                  <img
                    src={imageUrl}
                    alt="Benefit preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 text-white font-bold border-4 border-black rounded-full hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="text-center">
                <p className="font-mono text-sm text-gray-600">
                  ✓ Imagen lista (500x500px circular - Estándar POAP)
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  Este es el preview tipo POAP que verán los donadores
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-[#FDCB6E] border-2 border-black">
                <p className="font-mono text-sm">
                  <strong>📏 Formato POAP:</strong> Imagen circular de 500x500px
                </p>
                <p className="font-mono text-xs text-gray-700 mt-1">
                  Puedes generar con IA o subir tu propia imagen (logo, diseño, etc.)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Generar con IA */}
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={generating || !formData.title || !formData.description}
                  className="py-6 border-4 border-black bg-[#FDCB6E] font-bold text-lg shadow-brutal hover:bg-[#E67E22] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <div className="text-3xl mb-2">🎨</div>
                      <div>Generando con IA...</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">🤖</div>
                      <div>Generar con IA</div>
                      <div className="text-xs font-mono mt-1 opacity-75">Ticket/Logo profesional</div>
                    </>
                  )}
                </button>

                {/* Subir desde dispositivo */}
                <label className="py-6 border-4 border-black bg-white font-bold text-lg shadow-brutal hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">📁</div>
                  <div>Subir Imagen</div>
                  <div className="text-xs font-mono mt-1 opacity-75">Desde tu dispositivo</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-xs text-gray-500 text-center font-mono">
                💡 Después de seleccionar, podrás ajustar el recorte circular
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border-4 border-black bg-white font-bold shadow-brutal hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !imageUrl}
          className="flex-1 px-6 py-3 border-4 border-black bg-[#FDCB6E] font-bold shadow-brutal hover:bg-[#E67E22] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {submitting ? "Creando..." : "✓ Crear Beneficio"}
        </button>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setTempImageUrl(null);
          }}
        />
      )}
    </motion.form>
  );
}
