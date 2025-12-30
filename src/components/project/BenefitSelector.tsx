"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Benefit {
  id: string;
  title: string;
  description: string;
  image_url: string;
  asset_code: string;
  minimum_donation: number;
  donation_currency: string;
  total_supply: number;
  issued_supply: number;
  is_active: boolean;
}

interface BenefitSelectorProps {
  projectId: string;
  donationAmount: number;
  donationAsset: string;
  onSelect: (selectedBenefits: string[]) => void;
  onCancel: () => void;
}

export default function BenefitSelector({
  projectId,
  donationAmount,
  donationAsset,
  onSelect,
  onCancel,
}: BenefitSelectorProps) {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEligibleBenefits = async () => {
      try {
        const response = await fetch(`/api/benefits?projectId=${projectId}`);
        const data = await response.json();

        if (data.benefits) {
          // Filter eligible benefits
          const eligible = data.benefits.filter((b: Benefit) => {
            return (
              b.is_active &&
              b.donation_currency === donationAsset &&
              b.minimum_donation <= donationAmount &&
              b.issued_supply < b.total_supply
            );
          });

          setBenefits(eligible);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleBenefits();
  }, [projectId, donationAmount, donationAsset]);

  const toggleBenefit = (benefitId: string) => {
    const newSelected = new Set(selectedBenefits);
    if (newSelected.has(benefitId)) {
      newSelected.delete(benefitId);
    } else {
      newSelected.add(benefitId);
    }
    setSelectedBenefits(newSelected);
  };

  const handleConfirm = () => {
    onSelect(Array.from(selectedBenefits));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-4 border-black shadow-brutal max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b-4 border-black bg-[#FDCB6E]">
          <h2 className="text-2xl font-bold mb-2">🎁 Selecciona tus Beneficios</h2>
          <p className="text-sm font-mono">
            Donando: <strong>{donationAmount} {donationAsset}</strong>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🐝</div>
              <p className="font-mono">Cargando beneficios...</p>
            </div>
          ) : benefits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-xl font-bold mb-2">No hay beneficios disponibles</h3>
              <p className="text-gray-600">
                No hay beneficios elegibles para esta donación.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit) => {
                const isSelected = selectedBenefits.has(benefit.id);
                
                return (
                  <motion.div
                    key={benefit.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleBenefit(benefit.id)}
                    className={`border-4 border-black cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#FDCB6E] shadow-brutal"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {/* Imagen Circular */}
                    <div className="relative flex items-center justify-center p-4 bg-gray-50">
                      <div
                        className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-white"
                        style={{ boxShadow: "4px 4px 0px #000000" }}
                      >
                        <img
                          src={benefit.image_url}
                          alt={benefit.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Checkbox */}
                      <div
                        className={`absolute top-2 right-2 w-8 h-8 border-4 border-black flex items-center justify-center font-bold text-lg ${
                          isSelected ? "bg-green-500 text-white" : "bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {benefit.description}
                      </p>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-600">
                          Min: {benefit.minimum_donation} {benefit.donation_currency}
                        </span>
                        <span className="text-[#E67E22] font-bold">
                          {benefit.total_supply - benefit.issued_supply} disponibles
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-black bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-sm">
              <strong>{selectedBenefits.size}</strong> beneficio{selectedBenefits.size !== 1 ? "s" : ""} seleccionado{selectedBenefits.size !== 1 ? "s" : ""}
            </p>
            {selectedBenefits.size > 0 && (
              <button
                onClick={() => setSelectedBenefits(new Set())}
                className="text-sm font-mono text-gray-600 hover:text-black"
              >
                Limpiar selección
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-4 border-black bg-white font-bold shadow-brutal hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={benefits.length > 0 && selectedBenefits.size === 0}
              className="flex-1 px-6 py-3 border-4 border-black bg-[#FDCB6E] font-bold shadow-brutal hover:bg-[#E67E22] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {selectedBenefits.size > 0
                ? `Donar y Recibir ${selectedBenefits.size} Beneficio${selectedBenefits.size > 1 ? "s" : ""}`
                : benefits.length > 0
                ? "Donar sin Beneficios"
                : "Continuar"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
