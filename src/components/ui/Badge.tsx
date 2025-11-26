import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'trust' | 'verified' | 'bestseller' | 'clinical' | 'limited' | 'breaking';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  trust: 'bg-trust-green/10 text-trust-green border-trust-green/20',
  verified: 'bg-blue-50 text-blue-700 border-blue-200',
  bestseller: 'bg-accent-50 text-accent-700 border-accent-200',
  clinical: 'bg-primary-50 text-primary-700 border-primary-200',
  limited: 'bg-red-50 text-red-700 border-red-200 animate-pulse-slow',
  breaking: 'bg-red-500 text-white border-red-600',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className 
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border transition-colors',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}