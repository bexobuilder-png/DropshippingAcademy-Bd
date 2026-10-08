import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface SectionProps {
  id?: string;
  className?: string;
  containerClassName?: string;
  hairlineTop?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
}

export const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  containerClassName = '',
  hairlineTop = true,
  children,
  ariaLabel,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`py-16 md:py-24 lg:py-[120px] ${hairlineTop ? 'hairline-t' : ''} ${className}`}
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
        className={`specimen-container ${containerClassName}`}
      >
        {children}
      </motion.div>
    </section>
  );
};
