"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LoadingBee from "@/components/LoadingBee";

interface UserBenefitsProps {
  walletAddress: string;
  projectId?: string;
}

export default function UserBenefits({ walletAddress, projectId }: UserBenefitsProps) {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefits = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        const url = projectId 
          ? `/api/user/benefits?wallet=${walletAddress}&projectId=${projectId}`
          : `/api/user/benefits?wallet=${walletAddress}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.holdings) {
          setHoldings(data.holdings);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchBenefits();
  }, [walletAddress, projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingBee />
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-brutal p-8 bg-gray-50 text-center"
      >
        <div className="text-6xl mb-4">🎁</div>
        <h3 className="text-xl font-bold mb-2">No tienes beneficios aún</h3>
        <p className="text-gray-600">
          {projectId 
            ? "Dona a este proyecto para recibir beneficios exclusivos"
            : "Dona a proyectos para recibir beneficios digitales exclusivos"}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {holdings.map((holding: any, index: number) => {
          const benefit = holding.benefit;
          const project = benefit?.projects;

          return (
            <motion.div
              key={holding.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="border-4 border-black bg-white shadow-brutal overflow-hidden"
            >
              {/* Imagen Circular POAP */}
              {benefit?.image_url && (
                <div className="relative flex items-center justify-center p-6 bg-gradient-to-br from-[#FDCB6E] to-[#E67E22]">
                  <div 
                    className="w-40 h-40 rounded-full border-4 border-black overflow-hidden bg-white relative"
                    style={{ boxShadow: '6px 6px 0px #000000' }}
                  >
                    <img
                      src={benefit.image_url}
                      alt={benefit.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Badge de "Obtenido" */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 border-2 border-black font-bold text-xs">
                    ✓ OBTENIDO
                  </div>
                </div>
              )}

              {/* Contenido */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">
                  {benefit?.title || 'Beneficio'}
                </h3>
                
                {benefit?.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {benefit.description}
                  </p>
                )}

                {/* Asset Info */}
                <div className="bg-[#FDCB6E] border-2 border-black p-2 mb-3">
                  <p className="text-xs font-mono text-gray-700">Asset Code</p>
                  <p className="font-bold font-mono">{benefit?.asset_code}</p>
                </div>

                {/* Project Info */}
                {!projectId && project && (
                  <div className="flex items-center gap-2 p-2 border-2 border-black bg-gray-50">
                    {project.cover_image_url && (
                      <img
                        src={project.cover_image_url}
                        alt={project.title}
                        className="w-8 h-8 object-cover border-2 border-black"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-gray-600">Proyecto</p>
                      <p className="font-bold text-sm truncate">{project.title}</p>
                    </div>
                  </div>
                )}

                {/* Fecha de obtención */}
                <div className="mt-3 text-xs font-mono text-gray-500">
                  Obtenido: {new Date(holding.created_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
