'use client';

import { ReactNode } from 'react';
import { CloseIcon } from './icons';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className={cn('bg-white rounded-lg shadow-xl w-full mx-4', maxWidthClasses[maxWidth])} role="dialog">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
