import { ArrowLeft } from 'lucide-react';
import type { UsageHistory } from '../App';

interface MyPageProps {
  phoneNumber: string;
  usageHistory: UsageHistory[];
  onBack: () => void;
}

export function MyPage({ phoneNumber, usageHistory, onBack }: MyPageProps) {
  const currentUsage = usageHistory.filter((h) => h.status === 'current');
  const pastUsage = usageHistory.filter((h) => h.status === 'completed');

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <header className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-neutral-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-900" />
        </button>
        <div className="text-neutral-900 absolute left-1/2 -translate-x-1/2">마이페이지</div>
        <div className="w-9"></div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* 사용자 정보 */}
        <div className="px-6 py-6 border-b border-neutral-100">
          <p className="text-sm text-neutral-500">로그인 정보</p>
          <p className="mt-1 text-neutral-900">{phoneNumber}</p>
        </div>

        {/* 현재 이용 중 */}
        <div className="px-6 py-6 border-b-8 border-neutral-50">
          <h2 className="text-neutral-900 mb-4">현재 이용 중</h2>
          {currentUsage.length === 0 ? (
            <div className="py-8 text-center text-neutral-400">
              현재 이용 중인 카페가 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {currentUsage.map((usage) => (
                <div
                  key={usage.id}
                  className="p-4 border border-green-600 rounded-xl bg-green-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-neutral-900">{usage.cafeName}</h3>
                      <p className="text-sm text-neutral-500 mt-1">{usage.cafeAddress}</p>
                    </div>
                    <span className="text-xs text-green-600 bg-white px-2 py-1 rounded-full border border-green-600">
                      이용 중
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200 text-sm space-y-1">
                    <div className="flex justify-between text-neutral-600">
                      <span>입장 시간</span>
                      <span>{formatDate(usage.visitDate)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>주문 음료</span>
                      <span>{usage.drinkOrdered}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>이용 시간</span>
                      <span>{usage.duration}분</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 이용 내역 */}
        <div className="px-6 py-6">
          <h2 className="text-neutral-900 mb-4">이용 내역</h2>
          {pastUsage.length === 0 ? (
            <div className="py-8 text-center text-neutral-400">
              이용 내역이 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {pastUsage.map((usage) => (
                <div
                  key={usage.id}
                  className="p-4 border border-neutral-200 rounded-xl bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-neutral-900">{usage.cafeName}</h3>
                      <p className="text-sm text-neutral-500 mt-1">{usage.cafeAddress}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-100 text-sm space-y-1">
                    <div className="flex justify-between text-neutral-600">
                      <span>방문 일시</span>
                      <span>{formatDate(usage.visitDate)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>주문 음료</span>
                      <span>{usage.drinkOrdered}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}