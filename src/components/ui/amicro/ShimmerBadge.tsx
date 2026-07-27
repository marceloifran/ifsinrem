import React from "react";
import { motion } from "framer-motion";

interface ShimmerBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ShimmerBadge: React.FC<ShimmerBadgeProps> = ({
  children,
  icon,
  className = "",
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-950/20 cursor-pointer transition-colors duration-300 hover:border-emerald-400/60 ${className}`}
    >
      {/* Shimmer sweeping beam */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent group-hover:animate-shimmer" />

      {/* Pulse dot indicator if icon not provided */}
      {icon ? (
        <span className="text-emerald-400">{icon}</span>
      ) : (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}

      <span className="relative z-10">{children}</span>
    </motion.div>
  );
};

export default ShimmerBadge;
