'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Benefit {
  id: string;
  title: string;
  description: string;
  asset_code: string;
  image_url?: string;
  redemption_type: 'date_range' | 'on_demand' | 'hybrid' | 'instant';
  valid_from?: string;
  valid_until?: string;
  estimated_delivery?: string;
  shipping_required: boolean;
}

interface BenefitReceivedModalProps {
  benefits: Benefit[];
  txHash: string;
  onClose: () => void;
}

export default function BenefitReceivedModal({
  benefits,
  txHash,
  onClose,
}: BenefitReceivedModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Auto-close after showing all benefits (5 seconds per benefit)
    const timer = setTimeout(() => {
      if (currentIndex < benefits.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, benefits.length]);

  if (benefits.length === 0) return null;

  const currentBenefit = benefits[currentIndex];

  const getRedemptionInstructions = (benefit: Benefit) => {
    switch (benefit.redemption_type) {
      case 'instant':
        return '✅ Este beneficio está disponible inmediatamente. Revisa tu wallet para ver el asset.';
      case 'date_range':
        return `📅 Válido desde ${benefit.valid_from ? new Date(benefit.valid_from).toLocaleDateString() : 'ahora'} hasta ${benefit.valid_until ? new Date(benefit.valid_until).toLocaleDateString() : 'indefinido'}`;
      case 'on_demand':
        return '🎫 Canjeable bajo demanda. Contacta al creador del proyecto para coordinar.';
      case 'hybrid':
        return '🔄 Beneficio flexible. Revisa las instrucciones específicas del proyecto.';
      default:
        return '📋 Revisa los detalles del beneficio para más información.';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="card-brutal bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-[#FDCB6E] border-b-4 border-black p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-3"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              ¡Gracias por Donar!
            </h2>
            <div className="inline-block bg-white border-3 border-black px-4 py-2 shadow-brutal">
              <p className="text-sm font-bold text-gray-800">
                🎁 Recibiste {benefits.length} beneficio{benefits.length > 1 ? 's' : ''} digital{benefits.length > 1 ? 'es' : ''}
              </p>
            </div>
          </div>

          {/* Benefit Details */}
          <div className="p-6 space-y-6">
            {/* Progress Indicator */}
            {benefits.length > 1 && (
              <div className="flex gap-2 justify-center">
                {benefits.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-[#E67E22]'
                        : index < currentIndex
                        ? 'w-2 bg-green-500'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Benefit Image */}
            {currentBenefit.image_url && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-video rounded-lg overflow-hidden border-4 border-black"
              >
                <img
                  src={currentBenefit.image_url}
                  alt={currentBenefit.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Benefit Info */}
            <motion.div
              key={`info-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-2xl font-bold mb-2">{currentBenefit.title}</h3>
                <p className="text-gray-700">{currentBenefit.description}</p>
              </div>

              {/* Asset Info */}
              <div className="card-brutal bg-[#FDCB6E]/20 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <p className="font-bold">Asset Code</p>
                    <p className="text-sm font-mono">{currentBenefit.asset_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔗</span>
                  <div className="flex-1">
                    <p className="font-bold">Transaction Hash</p>
                    <p className="text-xs font-mono break-all text-gray-600">
                      {txHash}
                    </p>
                  </div>
                </div>
              </div>

              {/* Redemption Instructions */}
              <div className="card-brutal bg-blue-50 p-4">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span>📖</span>
                  Cómo usar este beneficio
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  {getRedemptionInstructions(currentBenefit)}
                </p>

                {currentBenefit.shipping_required && (
                  <div className="flex items-start gap-2 text-sm text-orange-700 bg-orange-100 p-3 rounded border-2 border-orange-300">
                    <span>📦</span>
                    <p>
                      <strong>Envío requerido:</strong> El creador del proyecto se
                      pondrá en contacto contigo para coordinar la entrega.
                    </p>
                  </div>
                )}

                {currentBenefit.estimated_delivery && (
                  <div className="flex items-start gap-2 text-sm text-blue-700 mt-2">
                    <span>🚚</span>
                    <p>
                      <strong>Entrega estimada:</strong>{' '}
                      {new Date(currentBenefit.estimated_delivery).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Verification Info */}
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span>✅</span>
                  Verificación On-Chain
                </h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Tu beneficio está registrado en Stellar blockchain</li>
                  <li>• Puedes verificarlo en tu wallet (Freighter/xBull)</li>
                  <li>• El asset es transferible y verificable</li>
                  <li>• Nadie puede quitártelo - es tuyo</li>
                </ul>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {benefits.length > 1 && currentIndex < benefits.length - 1 ? (
                <>
                  <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="btn-brutal btn-brutal-primary flex-1"
                  >
                    Siguiente Beneficio →
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-brutal bg-white flex-1"
                  >
                    Ver Después
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${txHash}`, '_blank')}
                    className="btn-brutal btn-brutal-secondary flex-1"
                  >
                    🔍 Ver en Stellar Explorer
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-brutal btn-brutal-primary flex-1"
                  >
                    ¡Entendido! 🎉
                  </button>
                </>
              )}
            </div>

            {/* Counter */}
            {benefits.length > 1 && (
              <p className="text-center text-sm text-gray-600">
                Beneficio {currentIndex + 1} de {benefits.length}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
