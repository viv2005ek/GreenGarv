import { motion } from "framer-motion";

interface AnimatedLogoProps {
  className?: string;
}

export function AnimatedLogo({ className = "" }: AnimatedLogoProps) {
  return (
    <div className={`relative w-10 h-10 ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* Outer ring - rotates clockwise */}
       {/* Outer ring - rotates clockwise */}
<motion.g
  animate={{ rotate: 360 }}
  transition={{
    duration: 12,
    repeat: Infinity,
    ease: "linear",
  }}
  style={{
    transformOrigin: "20px 20px",  // 🔑 Change this
  }}
>
  <circle
    cx="20"
    cy="20"
    r="18"
    stroke="url(#outerRing)"
    strokeWidth="2"
    fill="none"
    strokeDasharray="20 5"
  />
</motion.g>

{/* Inner ring - rotates counter-clockwise */}
<motion.g
  animate={{ rotate: -360 }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "linear",
  }}
  style={{
    transformOrigin: "20px 20px",  // 🔑 Change this
  }}
>
  <circle
    cx="20"
    cy="20"
    r="14"
    stroke="url(#innerRing)"
    strokeWidth="1.5"
    fill="none"
    strokeDasharray="10 3"
  />
</motion.g>
        {/* Central leaf with enhanced animation */}
        <motion.g
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.path
            d="M20 8 C14 8 10 12 10 18 C10 22 12 26 16 28 C18 29 19 30 20 30 C21 30 22 29 24 28 C28 26 30 22 30 18 C30 12 26 8 20 8 Z"
            fill="url(#leafGradient)"
            animate={{
              fill: [
                "url(#leafGradient)",
                "url(#leafGradientBright)",
                "url(#leafGradient)",
              ],
              d: [
                "M20 8 C14 8 10 12 10 18 C10 22 12 26 16 28 C18 29 19 30 20 30 C21 30 22 29 24 28 C28 26 30 22 30 18 C30 12 26 8 20 8 Z",
                "M20 7 C13 7 9 12 9 18 C9 23 12 27 16 29 C18 30 19 31 20 31 C21 31 22 30 24 29 C28 27 31 23 31 18 C31 12 27 7 20 7 Z",
                "M20 8 C14 8 10 12 10 18 C10 22 12 26 16 28 C18 29 19 30 20 30 C21 30 22 29 24 28 C28 26 30 22 30 18 C30 12 26 8 20 8 Z",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Veins with enhanced animation */}
          <motion.path
            d="M20 10 L20 28"
            stroke="#1a5d3a"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{
              pathLength: [0.8, 1, 0.8],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.path
            d="M20 14 L16 18 M20 18 L24 22 M20 22 L16 26"
            stroke="#1a5d3a"
            strokeWidth="1"
            strokeLinecap="round"
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              staggerChildren: 0.2,
            }}
          />
        </motion.g>

        {/* Floating energy particles with more dynamic movement */}
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={i}
            cx="20"
            cy="20"
            r={0.8 + Math.random() * 0.4}
            fill="#2ecc71"
            initial={{
              x: Math.cos(i * 72 * (Math.PI / 180)) * 10,
              y: Math.sin(i * 72 * (Math.PI / 180)) * 10,
              opacity: 0,
            }}
            animate={{
              x: [
                Math.cos(i * 72 * (Math.PI / 180)) * 10,
                Math.cos((i * 72 + 180) * (Math.PI / 180)) * 15,
                Math.cos(i * 72 * (Math.PI / 180)) * 10,
              ],
              y: [
                Math.sin(i * 72 * (Math.PI / 180)) * 10,
                Math.sin((i * 72 + 180) * (Math.PI / 180)) * 15,
                Math.sin(i * 72 * (Math.PI / 180)) * 10,
              ],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        <defs>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id="leafGradientBright" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ecc71" />
            <stop offset="50%" stopColor="#27ae60" />
            <stop offset="100%" stopColor="#229954" />
          </linearGradient>

          <linearGradient id="outerRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#16a34a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2ecc71" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="innerRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}