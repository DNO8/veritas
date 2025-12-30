"use client";

import { motion } from "framer-motion";

interface Benefit {
  id: string;
  title: string;
  description: string;
  benefit_type: string;
  asset_code: string;
  total_supply: number;
  issued_supply: number;
  minimum_donation: number;
  donation_currency: string;
  image_url?: string;
  is_active: boolean;
}

interface BenefitListProps {
  benefits: Benefit[];
  onUpdate: () => void;
}

const benefitTypeLabels: Record<string, string> = {
  digital_product: "🎮 Producto Digital",
  physical_product: "📦 Producto Físico",
  service: "🛠️ Servicio",
  access: "🎫 Acceso",
  experience: "✨ Experiencia",
  recognition: "🏆 Reconocimiento",
  discount: "💰 Descuento",
  other: "🎁 Otro",
};

export default function BenefitList({ benefits, onUpdate }: BenefitListProps) {
  const toggleStatus = async (benefitId: string) => {
    try {
      const response = await fetch(`/api/benefits/${benefitId}/toggle`, {
        method: "PATCH",
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      
    }
  };

  if (benefits.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {benefits.map((benefit, index) => (
        <motion.div
          key={benefit.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`border-4 border-black bg-white shadow-brutal overflow-hidden ${
            !benefit.is_active ? "opacity-60" : ""
          }`}
        >
          {/* Imagen Circular POAP */}
          {benefit.image_url && (
            <div className="relative flex items-center justify-center p-6 bg-gray-50">
              <div 
                className="w-48 h-48 rounded-full border-4 border-black overflow-hidden bg-white relative"
                style={{ boxShadow: '6px 6px 0px #000000' }}
              >
                <img
                  src={benefit.image_url}
                  alt={benefit.title}
                  className="w-full h-full object-cover"
                />
                {!benefit.is_active && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">INACTIVO</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contenido */}
          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 font-mono">
                  {benefitTypeLabels[benefit.benefit_type] || benefit.benefit_type}
                </p>
              </div>
              <button
                onClick={() => toggleStatus(benefit.id)}
                className={`px-3 py-1 border-2 border-black font-bold text-xs ${
                  benefit.is_active
                    ? "bg-green-400 hover:bg-green-500"
                    : "bg-gray-300 hover:bg-gray-400"
                } transition-colors`}
              >
                {benefit.is_active ? "✓ Activo" : "✕ Inactivo"}
              </button>
            </div>

            {/* Descripción */}
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
              {benefit.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#FDCB6E] border-2 border-black p-2">
                <p className="text-xs font-mono text-gray-700">Asset Code</p>
                <p className="font-bold font-mono">{benefit.asset_code}</p>
              </div>
              <div className="bg-[#E67E22] border-2 border-black p-2 text-white">
                <p className="text-xs font-mono">Min. Donación</p>
                <p className="font-bold font-mono">{benefit.minimum_donation} {benefit.donation_currency}</p>
              </div>
            </div>

            {/* Supply Progress */}
            <div className="mb-2">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span>Emitidos</span>
                <span>{benefit.issued_supply} / {benefit.total_supply}</span>
              </div>
              <div className="w-full h-3 border-2 border-black bg-white">
                <div
                  className="h-full bg-[#FDCB6E] transition-all"
                  style={{
                    width: `${(benefit.issued_supply / benefit.total_supply) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="text-xs font-mono text-center">
              {benefit.issued_supply >= benefit.total_supply ? (
                <span className="text-red-600 font-bold">🔴 AGOTADO</span>
              ) : (
                <span className="text-green-600 font-bold">
                  🟢 {benefit.total_supply - benefit.issued_supply} disponibles
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
