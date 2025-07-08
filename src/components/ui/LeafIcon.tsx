import { motion } from "framer-motion";

interface LeafIconProps {
  className?: string;
  animate?: boolean;
}

export function LeafIcon({ className = "", animate = false }: LeafIconProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={animate ? { scale: 1.1 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Main leaf shape */}
        <motion.path
          d="M16 4C8 4 4 8 4 16C4 20 6 24 10 26C12 27 14 28 16 28C18 28 20 27 22 26C26 24 28 20 28 16C28 8 24 4 16 4Z"
          fill="url(#leafGradient)"
          animate={
            animate
              ? {
                  fill: [
                    "url(#leafGradient)",
                    "url(#leafGradientHover)",
                    "url(#leafGradient)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Leaf vein */}
        <motion.path
          d="M16 6L16 26"
          stroke="#1a5d3a"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={
            animate
              ? {
                  pathLength: [0, 1, 0],
                }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Side veins */}
        <motion.path
          d="M16 10L12 14M16 14L20 18M16 18L12 22"
          stroke="#1a5d3a"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
          animate={
            animate
              ? {
                  pathLength: [0, 1, 0],
                  opacity: [0.3, 0.7, 0.3],
                }
              : {}
          }
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient
            id="leafGradientHover"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2ecc71" />
            <stop offset="50%" stopColor="#27ae60" />
            <stop offset="100%" stopColor="#229954" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Floating leaf particles */}
      {animate && (
        <div className="absolute -inset-4 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60"
              initial={{
                x: Math.random() * 40 - 20,
                y: Math.random() * 40 - 20,
                scale: 0,
              }}
              animate={{
                x: [
                  Math.random() * 40 - 20,
                  Math.random() * 60 - 30,
                  Math.random() * 40 - 20,
                ],
                y: [
                  Math.random() * 40 - 20,
                  Math.random() * 60 - 30,
                  Math.random() * 40 - 20,
                ],
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
