import { motion } from 'framer-motion';
import { forwardRef } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-ocean-950 hover:bg-primary-400 font-semibold shadow-lg shadow-primary/20',
  ghost: 'text-secondary hover:text-primary hover:bg-primary/5',
  danger: 'bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30',
  subtle: 'bg-card-light text-secondary hover:bg-ocean-600 border border-card-border',
  outline: 'border border-primary/40 text-primary hover:bg-primary/10',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'subtle', size = 'md', full, className = '', children, ...rest }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`focus-ring press inline-flex items-center justify-center gap-2 rounded-xl transition-colors ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  )
);
Button.displayName = 'Button';