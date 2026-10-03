import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'success' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-all duration-150 font-sora tracking-wide focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-adm-accent text-white hover:bg-[#388bfd] hover:-translate-y-px',
        success: 'bg-adm-accent2 text-white',
        danger: 'bg-adm-danger/15 text-adm-danger border border-adm-danger/30 hover:bg-adm-danger hover:text-white',
        ghost: 'bg-transparent hover:bg-white/5 text-adm-muted hover:text-adm-text',
        outline: 'bg-adm-card text-adm-text border border-adm-border hover:border-adm-accent hover:text-adm-accent',
    };

    const sizes = {
        sm: 'px-2.5 py-1 text-11 rounded-sm',
        md: 'px-4 py-2 text-xs rounded-md',
        lg: 'px-6 py-3 text-sm rounded-lg',
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {!isLoading && children}
        </button>
    );
}
