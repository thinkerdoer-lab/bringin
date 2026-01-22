import { X } from 'lucide-react';

interface OwnerConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cafeName: string;
}

export function OwnerConfirmModal({ isOpen, onClose, onConfirm, cafeName }: OwnerConfirmModalProps) {
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
            사장님이 아래 확인 버튼을 눌러주세요.
          </div>
          <div className="text-sm text-neutral-600 mb-6">
            확인 버튼을 누르면 이용시간이 시작됩니다.
          </div>

          <button
            onClick={onConfirm}
            className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            사장님이 확인 버튼 클릭
          </button>
        </div>
      </div>
    </div>
  );
}
