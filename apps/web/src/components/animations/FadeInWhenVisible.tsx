'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface FadeInWhenVisibleProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}

export function FadeInWhenVisible({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = ''
}: FadeInWhenVisibleProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true,
    margin: '-100px',
    amount: 0.3
  })

  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: {}
  }

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0,
        ...directionOffset[direction]
      }}
      animate={isInView ? { 
        opacity: 1,
        x: 0,
        y: 0
      } : { 
        opacity: 0,
        ...directionOffset[direction]
      }}
      transition={{ 
        duration: 0.8,
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
