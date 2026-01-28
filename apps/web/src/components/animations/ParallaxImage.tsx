'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  parallaxOffset?: number
}

export function ParallaxImage({ 
  src, 
  alt, 
  className = '',
  priority = false,
  parallaxOffset = 50
}: ParallaxImageProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [-parallaxOffset, parallaxOffset])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3])

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={className}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="100vw"
        quality={85}
      />
    </motion.div>
  )
}
