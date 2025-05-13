import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 text-white rounded shadow-lg ${typeStyles[type]}`}
    >
      {message}
    </div>
  );
}

export default Toast;