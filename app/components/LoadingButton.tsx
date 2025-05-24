import { cn } from '@/app/lib/utils';
import { Spinner } from './Spinner';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary-light focus-visible:ring-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
} 