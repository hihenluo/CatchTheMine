import { useEffect } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, show, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-xl z-50 transition-transform animate-fade-in-down">
      <p>{message}</p>
    </div>
  );
}