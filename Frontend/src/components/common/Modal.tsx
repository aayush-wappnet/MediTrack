import { type ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 " onClick={onClose}></div>
      
      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-gray-200 rounded-lg shadow-xl w-full max-w-3xl p-6 relative z-50 border-2 border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaTimes />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;