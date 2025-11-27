import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string | string[];
  onClose?: () => void;
  className?: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
}

export default function ErrorMessage({
  message,
  onClose,
  className = '',
  variant = 'error',
}: ErrorMessageProps) {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    success: 'text-green-500',
  };

  const messages = Array.isArray(message) ? message : [message];

  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <AlertCircle className={`w-5 h-5 mt-0.5 ${iconColors[variant]}`} />
          <ul className="text-sm list-disc space-y-1 list-none">
            {messages.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>
        {onClose && (
          <button onClick={onClose} className={`ml-2 ${iconColors[variant]} hover:opacity-75`}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
