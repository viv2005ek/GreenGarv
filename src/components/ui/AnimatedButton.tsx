import { motion } from "framer-motion"

// Simple utility function if you don't want to create a separate utils file
const cn = (...classes: (string | boolean | undefined)[]) => 
  classes.filter(Boolean).join(' ')

export function AnimatedButton({ 
  variant = 'primary',
  className,
  children,
  ...props 
}: {
  variant?: 'primary' | 'outline'
  className?: string
  children: React.ReactNode
  [key: string]: any
}) {
  return (
    <motion.button
      className={cn(
        "px-6 py-3 rounded-lg font-medium border-2 relative overflow-hidden text-lg",
        "transition-all duration-300",
        variant === 'primary' 
          ? "border-green-400 text-white hover:text-white"
          : "border-gray-500 text-gray-300 hover:border-green-400",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500 before:to-emerald-600",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        className
      )}
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 0 15px rgba(46, 204, 113, 0.4)'
      }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  )
}