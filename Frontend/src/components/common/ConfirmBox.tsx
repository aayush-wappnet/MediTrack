import Button from './Button';

interface ConfirmBoxProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmBox({ isOpen, message, onConfirm, onCancel }: ConfirmBoxProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-gray-200 rounded-lg shadow-lg w-full max-w-sm p-6">
        <p className="text-lg text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmBox;