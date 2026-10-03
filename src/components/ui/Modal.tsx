import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={cn("bg-adm-surface border border-adm-border rounded-xl w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200", className)}>
                {title && (
                    <div className="px-5 py-18px border-b border-adm-border flex justify-between items-center shrink-0">
                        <h3 className="text-15 font-bold text-adm-text">{title}</h3>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-adm-card border border-adm-border text-adm-muted hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                <div className="p-5 flex-1 overflow-y-auto scrollbar-hide">
                    {children}
                </div>
                {footer && (
                    <div className="px-5 py-3.5 border-t border-adm-border flex justify-end gap-2 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
