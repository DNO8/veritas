"use client";

import { motion } from "framer-motion";

interface Donation {
  id: string;
  donor_wallet: string;
  amount: string;
  asset: string;
  tx_hash: string;
  network: string;
  created_at: string;
}

interface RecentDonationsProps {
  donations: Donation[];
}

export default function RecentDonations({ donations }: RecentDonationsProps) {
  if (donations.length === 0) {
    return (
      <div className="card-brutal p-6 bg-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>💸</span> Donaciones Recientes
        </h2>
        <p className="text-gray-500 font-mono text-sm">
          Aún no hay donaciones. ¡Sé el primero en apoyar este proyecto!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-brutal p-6 bg-white"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>💸</span> Donaciones Recientes
      </h2>
      <div className="space-y-3">
        {donations.map((donation, index) => (
          <motion.div
            key={donation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 border-3 border-black bg-gray-50 hover:bg-[#FDCB6E]/20 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-[#E67E22]">
                  {parseFloat(donation.amount).toFixed(2)} {donation.asset}
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  De: {donation.donor_wallet.substring(0, 8)}...
                  {donation.donor_wallet.substring(donation.donor_wallet.length - 8)}
                </p>
              </div>
              <div className="text-right">
                <a
                  href={`https://stellar.expert/explorer/${donation.network.toLowerCase()}/tx/${donation.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-2 py-1 border-2 border-black bg-white text-xs font-bold hover:bg-black hover:text-white transition-colors"
                >
                  Ver TX 🔗
                </a>
                <p className="font-mono text-xs text-gray-400 mt-2">
                  {new Date(donation.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
