import { cn } from '@utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'rounded-full border-2 border-surface-200 dark:border-surface-700',
        'border-t-primary-500 animate-spin',
        sizes[size]
      )} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-surface-500 text-sm font-medium">Loading MedAssist AI...</p>
      </div>
    </div>
  );
}
