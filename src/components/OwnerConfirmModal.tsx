import { X } from 'lucide-react';

interface OwnerConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafeName: string;
}

export function OwnerConfirmModal({ isOpen, onClose, cafeName }: OwnerConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>

        <div className="text-center pt-4">
          <div className="text-lg text-neutral-900 mb-2 font-medium">
            사장님 확인이 필요합니다
          </div>
          <div className="text-sm text-neutral-600 mb-6">
            {cafeName}에 도착하셨다면<br />
            사장님께 확인을 요청해주세요
          </div>

          <button
            onClick={onClose}
            className="w-full bg-neutral-900 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
