import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltMaxAngle?: number;
  spotlightColor?: string;
  borderColor?: string;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  tiltMaxAngle = 12,
  spotlightColor = "rgba(16, 185, 129, 0.15)", // emerald spotlight
  borderColor = "rgba(16, 185, 129, 0.3)",
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth spring physics for fluid 3D movement
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [0, 1], [tiltMaxAngle, -tiltMaxAngle]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-tiltMaxAngle, tiltMaxAngle]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;
    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      className="perspective-1000"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#070b14]/90 transition-colors duration-300 ${className}`}
      >
        {/* Dynamic Spotlight radial gradient */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(600px circle at ${x.get() * 100}% ${y.get() * 100}%, ${spotlightColor}, transparent 40%)`,
          }}
        />

        {/* Hover Border Highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border transition-opacity duration-300"
          style={{
            borderColor: borderColor,
            opacity: isHovered ? 1 : 0,
          }}
        />

        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
};

export default TiltCard;
