'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warn';

interface ToastOptions {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastOptions[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3800);
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-[9000] flex flex-col-reverse gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} {...t} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ message, type }: ToastOptions) {
    const icons = {
        success: <CheckCircle2 className="text-adm-accent2 w-4 h-4" />,
        error: <XCircle className="text-adm-danger w-4 h-4" />,
        info: <Info className="text-adm-accent w-4 h-4" />,
        warn: <AlertTriangle className="text-adm-warn w-4 h-4" />,
    };

    const borders = {
        success: 'border-l-adm-accent2',
        error: 'border-l-adm-danger',
        info: 'border-l-adm-accent',
        warn: 'border-l-adm-warn'
    };

    return (
        <div className={cn("bg-adm-card border border-adm-border rounded-lg px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl min-w-260px max-w-340px pointer-events-auto animate-in slide-in-from-right-8 border-l-[3px]", borders[type])}>
            {icons[type]}
            <span className="text-xs text-adm-text font-sora tracking-wide">{message}</span>
        </div>
    );
}
