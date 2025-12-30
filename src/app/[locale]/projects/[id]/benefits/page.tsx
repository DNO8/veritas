"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import BenefitForm from "@/components/project/BenefitForm";
import BenefitList from "@/components/project/BenefitList";

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

export default function ProjectBenefitsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const projectId = params.id as string;

  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadBenefits();
  }, [projectId]);

  const loadBenefits = async () => {
    try {
      const response = await fetch(`/api/benefits?projectId=${projectId}`);
      const data = await response.json();
      
      if (data.benefits) {
        setBenefits(data.benefits);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleBenefitCreated = () => {
    setShowForm(false);
    router.refresh();
    loadBenefits();
  };

  if (loading) {
    return (
      <div className="min-h-screen hex-pattern flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🐝
          </motion.div>
          <p className="font-mono text-lg">Cargando beneficios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hex-pattern py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="mb-4 px-4 py-2 border-4 border-black bg-white font-bold hover:bg-[#FDCB6E] transition-colors shadow-brutal"
          >
            ← Volver
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                🎁 Beneficios Digitales
              </h1>
              <p className="text-gray-600 font-mono">
                Crea recompensas NFT para tus donadores
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 border-4 border-black bg-[#FDCB6E] font-bold text-lg shadow-brutal hover:bg-[#E67E22] transition-colors"
            >
              {showForm ? "✕ Cancelar" : "+ Crear Beneficio"}
            </motion.button>
          </div>
        </motion.div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <BenefitForm
              projectId={projectId}
              onSuccess={handleBenefitCreated}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}

        {/* Benefits List */}
        <BenefitList
          benefits={benefits}
          onUpdate={loadBenefits}
        />

        {/* Empty State */}
        {!loading && benefits.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border-4 border-black bg-white shadow-brutal"
          >
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold mb-2">No hay beneficios aún</h3>
            <p className="text-gray-600 mb-6 font-mono">
              Crea tu primer beneficio digital para recompensar a tus donadores
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 border-4 border-black bg-[#FDCB6E] font-bold shadow-brutal hover:bg-[#E67E22] transition-colors"
            >
              Crear Primer Beneficio
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
