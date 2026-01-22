import { X } from 'lucide-react';
import type { AllowedFood, UsageHistory } from '../App';
import { CopyableAddress } from './CopyableAddress';

interface CurrentUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage: UsageHistory | null;
  allowedFoods: AllowedFood[];
}

export function CurrentUsageModal({ isOpen, onClose, usage, allowedFoods }: CurrentUsageModalProps) {
  if (!isOpen || !usage) return null;

  const allowedFoodLabels =
    allowedFoods.length > 0
      ? allowedFoods.map((food) => food.name).join(', ')
      : '등록된 허용 음식이 없습니다';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>

        <div className="text-center pt-2">
          <div className="text-lg text-neutral-900 mb-2 font-medium">
            이용 중인 카페 정보
          </div>
          <div className="text-sm text-neutral-600 mb-6">
            이용 정보를 확인해주세요.
          </div>
        </div>

        <div className="bg-neutral-50 rounded-xl p-4 space-y-3 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>카페</span>
            <span className="text-neutral-900">{usage.cafeName}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>주소</span>
            <CopyableAddress
              address={usage.cafeAddress}
              className="text-neutral-900 text-right"
            />
          </div>
          {usage.seatType && (
            <div className="flex justify-between text-neutral-600">
              <span>좌석</span>
              <span className="text-neutral-900">{usage.seatType}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-600">
            <span>허용 음식</span>
            <span className="text-neutral-900">{allowedFoodLabels}</span>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
          <div className="text-neutral-900 mb-2">이용 규칙</div>
          <div className="space-y-1">
            <div>• 기본 이용 시간 2시간</div>
            <div>• 인원 수만큼 음료 주문 필요</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 bg-neutral-900 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
