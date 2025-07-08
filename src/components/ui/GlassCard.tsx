import { motion } from "framer-motion"

const cn = (...classes: (string | boolean | undefined)[]) => 
  classes.filter(Boolean).join(' ')

export function GlassCard({ 
  className, 
  children,
  hover = false
}: {
  className?: string
  children: React.ReactNode
  hover?: boolean
}) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-md",
        "transition-all duration-300",
        hover && "hover:bg-gray-800/40 hover:border-gray-600/70 hover:shadow-lg hover:shadow-green-400/10",
        className
      )}
      whileHover={hover ? { y: -4 } : {}}
    >
      {children}
    </motion.div>
  )
}