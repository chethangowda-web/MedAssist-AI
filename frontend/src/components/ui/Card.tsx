import { cn } from '@utils/helpers';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  const Component = hover ? motion.div : 'div';
  return (
    <Component
      {...(hover ? { whileHover: { y: -2 }, transition: { type: 'spring', stiffness: 300, damping: 20 } } : {})}
      onClick={onClick}
      className={cn(
        'glass-card p-5',
        hover && 'cursor-pointer hover:shadow-xl',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold text-surface-900 dark:text-white', className)}>{children}</h3>;
}
