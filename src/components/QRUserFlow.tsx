import { useState } from 'react';
import { ArrowLeft, Camera, Clock, Check, MapPin } from 'lucide-react';

type Step = 'location' | 'has-drink' | 'drink-verify' | 'seat-select' | 'drink-order' | 'using';

interface QRUserFlowProps {
  onComplete: () => void;
}

const MOCK_CAFE = {
  name: '브라운 카페',
  availableSeats: 3,
};

const MOCK_DRINKS = [
  { id: 1, name: '아메리카노', price: 4500 },
  { id: 2, name: '카페라떼', price: 5000 },
  { id: 3, name: '바닐라라떼', price: 5500 },
];

export function QRUserFlow({ onComplete }: QRUserFlowProps) {
  const [step, setStep] = useState<Step>('location');
  const [hasDrink, setHasDrink] = useState(false);
  const [drinkVerified, setDrinkVerified] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [drinkQuantities, setDrinkQuantities] = useState<{ [key: number]: number }>({});

  const updateDrinkQuantity = (drinkId: number, delta: number) => {
    setDrinkQuantities((prev) => {
      const current = prev[drinkId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [drinkId]: newValue };
    });
  };

  const getTotalDrinkCount = () => {
    return Object.values(drinkQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(drinkQuantities).reduce((sum, [drinkId, qty]) => {
      const drink = MOCK_DRINKS.find((d) => d.id === Number(drinkId));
      return sum + (drink ? drink.price * qty : 0);
    }, 0);
  };

  if (step === 'location') {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>

          <div className="text-center space-y-2 mb-12">
            <div className="text-neutral-900">위치 확인 완료</div>
            <p className="text-neutral-600">{MOCK_CAFE.name}</p>
            <p className="text-sm text-neutral-500">현재 카페 기준으로 이용을 안내합니다</p>
          </div>

          <div className="w-full max-w-sm">
            <button
              onClick={() => setStep('has-drink')}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'has-drink') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep('location')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">음료 주문 확인</span>
        </header>

        <div className="flex-1 flex flex-col px-6 pt-12 pb-6">
          <div className="text-center mb-12">
            <div className="text-neutral-900 mb-3">
              이미 이 카페에서
              <br />
              음료를 주문하셨나요?
            </div>
            <p className="text-sm text-neutral-500">좌석 이용을 위해 음료 주문이 필요해요</p>
          </div>

          <div className="space-y-3 mb-auto">
            <button
              onClick={() => {
                setHasDrink(true);
                setStep('drink-verify');
              }}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              네, 이미 주문했어요
            </button>

            <button
              onClick={() => {
                setHasDrink(false);
                setStep('seat-select');
              }}
              className="w-full bg-white text-neutral-900 py-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              아니요, 아직이에요
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'drink-verify') {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep('has-drink')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">음료 인증</span>
        </header>

        <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
          <div className="text-center mb-8">
            <div className="text-neutral-900 mb-2">
              이미 주문한 음료 사진을
              <br />
              한 장만 남겨주세요
            </div>
            <p className="text-sm text-neutral-500">인증 후 좌석을 선택할 수 있어요</p>
          </div>

          <div className="mb-auto">
            <div className="aspect-[4/3] bg-neutral-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-neutral-300">
              <div className="text-center">
                <Camera className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <div className="text-neutral-600">사진 촬영</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setDrinkVerified(true);
              setStep('seat-select');
            }}
            className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            인증 완료
          </button>
        </div>
      </div>
    );
  }

  if (step === 'seat-select') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep(hasDrink ? 'drink-verify' : 'has-drink')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">좌석 선택</span>
        </header>

        <div className="flex-1 px-6 pt-6 pb-6 flex flex-col">
          <div className="bg-neutral-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-neutral-600 mb-1">현재 카페</div>
            <div className="text-neutral-900">{MOCK_CAFE.name}</div>
          </div>

          <div className="space-y-3 mb-auto">
            <button
              onClick={() => {
                setSelectedSeat({ type: '1인석' });
                if (hasDrink) {
                  setStartTime(new Date());
                  setStep('using');
                } else {
                  setStep('drink-order');
                }
              }}
              className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl py-5 px-6 text-left transition-colors"
            >
              <div className="text-neutral-900 mb-1">1인석</div>
              <div className="text-sm text-neutral-500">1석 남음</div>
            </button>

            <button
              onClick={() => {
                setSelectedSeat({ type: '2인석' });
                if (hasDrink) {
                  setStartTime(new Date());
                  setStep('using');
                } else {
                  setStep('drink-order');
                }
              }}
              className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl py-5 px-6 text-left transition-colors"
            >
              <div className="text-neutral-900 mb-1">2인석</div>
              <div className="text-sm text-neutral-500">2석 남음</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'drink-order') {
    const totalDrinkCount = getTotalDrinkCount();
    const totalPrice = getTotalPrice();
    const isValidOrder = totalDrinkCount >= 1; // QR 진입 시 최소 1잔 이상 주문

    return (
      <div className="h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep('seat-select')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">음료 주문</span>
        </header>

        <div className="flex-1 px-6 pt-6 pb-6 flex flex-col">
          <div className="space-y-4 mb-6">
            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="text-sm text-neutral-600 mb-1">선택한 좌석</div>
              <div className="text-neutral-900">{selectedSeat?.type}</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-neutral-900">음료 선택</div>
                <div className="text-sm text-neutral-600">
                  {totalDrinkCount}잔 선택
                </div>
              </div>
              {MOCK_DRINKS.map((drink) => {
                const quantity = drinkQuantities[drink.id] || 0;
                return (
                  <div
                    key={drink.id}
                    className="flex items-center justify-between py-3 border-b border-neutral-100"
                  >
                    <div className="flex-1">
                      <div className="text-neutral-900">{drink.name}</div>
                      <div className="text-sm text-neutral-500">{drink.price.toLocaleString()}원</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateDrinkQuantity(drink.id, -1)}
                        disabled={quantity === 0}
                        className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-neutral-900">{quantity}</span>
                      <button
                        onClick={() => updateDrinkQuantity(drink.id, 1)}
                        className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`${isValidOrder ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-amber-50 border-amber-100 text-amber-900'} border rounded-xl p-4 text-sm`}>
              {isValidOrder
                ? '좌석 이용 시간은 기본 2시간입니다'
                : '최소 1잔 이상의 음료를 선택해주세요'}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between py-3">
              <span className="text-neutral-900">결제 금액</span>
              <span className="text-neutral-900">{totalPrice.toLocaleString()}원</span>
            </div>

            <button
              onClick={() => {
                if (!isValidOrder) {
                  alert('최소 1잔 이상의 음료를 선택해주세요.');
                  return;
                }
                setStartTime(new Date());
                setStep('using');
              }}
              disabled={!isValidOrder}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              음료 주문하고 자리 사용하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'using' && startTime) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={onComplete} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">좌석 이용</span>
        </header>

        <div className="flex-1 px-6 pt-8 flex flex-col items-center">
          <div className="w-full max-w-sm space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="text-green-900 mb-2">이용 중</div>
              <div className="text-sm text-green-700">좌석 이용이 시작되었습니다</div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 space-y-4">
              <div>
                <div className="text-sm text-neutral-500 mb-1">카페</div>
                <div className="text-neutral-900">{MOCK_CAFE.name}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">좌석</div>
                <div className="text-neutral-900">{selectedSeat?.type}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">이용 방식</div>
                <div className="text-neutral-900">{hasDrink ? '음료 인증' : '음료 주문'}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">이용 시간</div>
                <div className="flex items-center gap-2 text-neutral-900">
                  <Clock className="w-4 h-4" />
                  <span>2시간</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">시작 시간</div>
                <div className="text-neutral-900">
                  {startTime.getHours()}:{startTime.getMinutes().toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
              이용 종료 시 좌석은 자동으로 해제됩니다
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}