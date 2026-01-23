import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Users, ChevronRight, ChevronDown, CheckCircle, X } from 'lucide-react';
import type { SeatTypeSetting, AllowedFood, UsageHistory } from '../App';
import { CopyableAddress } from './CopyableAddress';

type Step =
  | 'intro'
  | 'people-count'
  | 'cafe-list'
  | 'cafe-detail'
  | 'seat-select'
  | 'drink-order'
  | 'waiting'
  | 'using';

interface FlowState {
  peopleCount: number;
  selectedCafe: any;
  selectedSeat: any;
  selectedDrinks: any[];
}

const MOCK_CAFES = [
  {
    id: 1,
    name: '브라운 카페',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    distance: 120,
    availableSeats: 3,
		allowsBread: true,
		allowsCake: true,
		allowsSandwich: true,
    allowsFood: false,
    seatTypes: [
      { id: 'brown-2', capacity: 2, count: 1 },
      { id: 'brown-3', capacity: 3, count: 1 },
      { id: 'brown-4', capacity: 4, count: 1 },
      { id: 'brown-5', capacity: 5, count: 1 },
    ],
  },
  {
    id: 2,
    name: '모닝 커피',
    address: '서울시 강남구 역삼로 210',
    phone: '02-2345-6789',
    distance: 250,
    availableSeats: 2,
    allowsBread: false,
		allowsSandwich: false,
    allowsFood: true,
    seatTypes: [
      { id: 'morning-2', capacity: 2, count: 2 },
    ],
  },
  {
    id: 3,
    name: '카페 온',
    address: '서울시 강남구 논현로 455',
    phone: '02-3456-7890',
    distance: 380,
    availableSeats: 1,
    allowsBread: true,
		allowsSandwich: false,
    allowsFood: true,
    seatTypes: [
      { id: 'on-1', capacity: 1, count: 1 },
    ],
  },
  {
    id: 4,
    name: '스위트 커피',
    address: '서울시 강남구 봉은사로 77',
    phone: '02-4567-8901',
    distance: 650,
    availableSeats: 2,
    allowsBread: true,
		allowsSandwich: true,
    allowsFood: true,
    seatTypes: [
      { id: 'sweet-2', capacity: 2, count: 1 },
      { id: 'sweet-4', capacity: 4, count: 1 },
    ],
  },
  {
    id: 5,
    name: '베이커리 카페',
    address: '서울시 강남구 선릉로 315',
    phone: '02-5678-9012',
    distance: 850,
    availableSeats: 1,
    allowsBread: true,
		allowsSandwich: true,
    allowsFood: false,
    seatTypes: [
      { id: 'bakery-4', capacity: 4, count: 1 },
    ],
  },
];

const MOCK_DRINKS = [
  { id: 1, name: '아메리카노', price: 4500 },
  { id: 2, name: '카페라떼', price: 5000 },
  { id: 3, name: '바닐라라떼', price: 5500 },
  { id: 4, name: '아이스티', price: 4500 },
];

export function UserFlowA({ onBack, onLogout, onRoleSwitch, seatTypeSettings, allowedFoods, onPaymentComplete, usageHistory }: { 
  onBack: () => void;
  onLogout: () => void;
  onRoleSwitch: () => void;
  seatTypeSettings: SeatTypeSetting[];
  allowedFoods: AllowedFood[];
  onPaymentComplete?: (usageData: {
    cafeName: string;
    cafeAddress: string;
    drinkOrdered: string;
    visitDate: Date;
    seatType: string;
  }) => void;
  usageHistory: UsageHistory[];
}) {
  const [step, setStep] = useState<Step>('people-count');
  const [state, setState] = useState<FlowState>({
    peopleCount: 1,
    selectedCafe: null,
    selectedSeat: null,
    selectedDrinks: [],
  });
  const [cafeCategory, setCafeCategory] = useState<'all' | 'bread' | 'sandwich' | 'etc'>('all');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [drinkQuantities, setDrinkQuantities] = useState<{ [key: number]: number }>({});
  const [distanceFilter, setDistanceFilter] = useState<number>(500);
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showLargePartyModal, setShowLargePartyModal] = useState(false);
  const [selectedLargePartyCafe, setSelectedLargePartyCafe] = useState<(typeof MOCK_CAFES)[number] | null>(null);

  const updateState = (updates: Partial<FlowState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateDrinkQuantity = (drinkId: number, delta: number) => {
    setDrinkQuantities((prev) => {
      const current = prev[drinkId] || 0;
      const totalCount = Object.values(prev).reduce((sum, qty) => sum + qty, 0);
      if (delta > 0 && totalCount >= state.peopleCount) {
        return prev;
      }
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

  // 도보 시간 계산 (분당 80m 기준)
  const calculateWalkingTime = (distanceInMeters: number): number => {
    return Math.ceil(distanceInMeters / 80);
  };

  // 거리 표시 포맷
  const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters >= 1000) {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
    return `${distanceInMeters}m`;
  };

  const getAllowedFoodLabels = (cafe: (typeof MOCK_CAFES)[number]) => {
    const labels: string[] = [];
    if (cafe.allowsBread) {
      labels.push('빵/디저트');
		}
		if (cafe.allowsCake) {
      labels.push('케이크');
		}
		if (cafe.allowsSandwich) {
      labels.push('샌드위치');
    }
    if (cafe.allowsFood) {
      labels.push('기타');
    }
    return labels;
  };

  const getAvailableSeatCount = (cafe: (typeof MOCK_CAFES)[number]) => {
    if (cafe.seatTypes?.length) {
      return cafe.seatTypes.reduce((sum, seat) => sum + seat.count, 0);
    }
    return cafe.availableSeats;
  };

  if (step === 'intro') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center justify-between border-b border-neutral-100">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="text-center space-y-3 mb-16">
            <div className="text-neutral-900">원하는 시간, 음료 주문으로 열리는 자리</div>
            <p className="text-neutral-500">
              외부 음식을 먹을 수 있는
              <br />
              카페 좌석을 찾아보세요
            </p>
          </div>

					<div className="w-full max-w-sm">
            <button
              onClick={() => setStep('people-count')}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              지금 이용 가능한 카페 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'people-count') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">인원 선택</span>
        </header>

        <div className="flex-1 px-6 pt-8 pb-6 flex flex-col">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 flex flex-col items-center gap-6 mb-auto">
            <div className="flex items-center gap-2 text-neutral-600">
              <Users className="w-5 h-5" />
              <span className="text-sm">이용 인원</span>
            </div>
            <div className="flex items-center gap-6 mt-2">
              <button
                onClick={() =>
                  updateState({ peopleCount: Math.max(1, state.peopleCount - 1) })
                }
                disabled={state.peopleCount <= 1}
                className="w-12 h-12 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xl disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="인원 감소"
              >
                -
              </button>
              <div className="text-3xl text-neutral-900 font-semibold px-2">
                {state.peopleCount}명
              </div>
              <button
                onClick={() =>
                  updateState({ peopleCount: state.peopleCount + 1 })
                }
                className="w-12 h-12 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xl"
                aria-label="인원 증가"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep('seat-select')}
            className="mt-6 w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors mt-4"
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  if (step === 'cafe-list') {
    // 선택된 거리 필터 이내의 카페만 필터링
    const selectedSeatCapacity = state.selectedSeat?.capacity;
    const normalizedSelectedSeatCapacity =
      selectedSeatCapacity !== undefined && selectedSeatCapacity !== null
        ? Number(selectedSeatCapacity)
        : null;
    const filteredCafes = MOCK_CAFES.filter((cafe) => {
      const hasOpenSeatType = cafe.seatTypes?.some((seat) => seat.count > 0);
      const matchesSelectedSeat = normalizedSelectedSeatCapacity !== null
        ? cafe.seatTypes?.some((seat) => {
            const upperBound =
              normalizedSelectedSeatCapacity === 2
                ? 4
                : normalizedSelectedSeatCapacity + 1;
            return (
              seat.count > 0 &&
              seat.capacity >= normalizedSelectedSeatCapacity &&
              seat.capacity <= upperBound
            );
          })
        : true;
      const matchesCategory =
        cafeCategory === 'all' ||
        (cafeCategory === 'etc' && cafe.allowsFood) ||
        (cafeCategory === 'cake' && cafe.allowsCake) ||
        (cafeCategory === 'bread' && cafe.allowsBread) ||
        (cafeCategory === 'sandwich' && cafe.allowsSandwich);
      const isWithinDistance = cafe.distance <= distanceFilter;
      return (
        hasOpenSeatType &&
        matchesSelectedSeat &&
        isWithinDistance &&
        matchesCategory
      );
    });

    return (
      <div className="h-screen bg-neutral-50 flex flex-col">
        <header className="px-5 py-4 flex items-center bg-white border-b border-neutral-100">
          <button onClick={() => setStep('seat-select')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">이용 가능한 카페</span>
        </header>

        <div className="px-5 py-4 bg-white border-b border-neutral-100 space-y-3">
          <div className="flex items-center gap-2 text-neutral-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">현재 위치 기준</span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: '전체' },
              { id: 'bread', label: '빵/디저트' },
              { id: 'cake', label: '케이크' },
              { id: 'sandwich', label: '샌드위치' },
              { id: 'etc', label: '기타' },
            ].map((category) => {
              const isActive = cafeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setCafeCategory(category.id as 'all' | 'bread' | 'sandwich' | 'etc')}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* 거리 필터 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setShowDistanceDropdown(!showDistanceDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <span>반경 {distanceFilter === 500 ? '500m' : '1km'}</span>
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </button>

            {showDistanceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-10">
                <button
                  onClick={() => {
                    setDistanceFilter(500);
                    setShowDistanceDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    distanceFilter === 500
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  반경 500m
                </button>
                <button
                  onClick={() => {
                    setDistanceFilter(1000);
                    setShowDistanceDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    distanceFilter === 1000
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  반경 1km
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
          {filteredCafes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-neutral-400">선택한 거리 내에 이용 가능한 카페가 없습니다</p>
            </div>
          ) : (
            filteredCafes.map((cafe) => {
              const walkingTime = calculateWalkingTime(cafe.distance);
              const allowedFoodLabels = getAllowedFoodLabels(cafe);
              return (
                <button
                  key={cafe.id}
                  onClick={() => {
                    if (state.peopleCount >= 5) {
                      setSelectedLargePartyCafe(cafe);
                      setShowLargePartyModal(true);
                      return;
                    }
                    updateState({ selectedCafe: cafe });
                    setStep('cafe-detail');
                  }}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-neutral-900">{cafe.name}</div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
										<span>{formatDistance(cafe.distance)} · 도보 {walkingTime}분</span>
										<span>|</span>
                    <span>{allowedFoodLabels.join(', ')}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
        {showLargePartyModal && selectedLargePartyCafe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
              <button
                onClick={() => {
                  setShowLargePartyModal(false);
                  setSelectedLargePartyCafe(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
              <div className="text-center pt-2">
                <div className="text-lg text-neutral-900 mb-2 font-medium">
                  5인 이상 이용 안내
                </div>
                <div className="text-sm text-neutral-600 mb-5">
									5인 이상은 사장님에게<br />
									자리가 있는지 전화로 확인해주세요.
                </div>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>카페</span>
                  <span className="text-neutral-900">{selectedLargePartyCafe.name}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>전화번호</span>
                  <CopyableAddress address={selectedLargePartyCafe.phone} className="text-neutral-900 text-right" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <a
                  href={`tel:${selectedLargePartyCafe.phone}`}
                  className="w-full block text-center bg-neutral-900 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  전화하기
                </a>
                <button
                  onClick={() => {
                    setShowLargePartyModal(false);
                    if (selectedLargePartyCafe) {
                      updateState({ selectedCafe: selectedLargePartyCafe });
                      setStep('cafe-detail');
                    }
                    setSelectedLargePartyCafe(null);
                  }}
                  className="w-full bg-white text-neutral-900 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  확인했어요.
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'cafe-detail') {
    const cafe = state.selectedCafe;
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep('cafe-list')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">{cafe.name}</span>
        </header>

        <div className="flex-1 px-6 pt-6 pb-6 flex flex-col">
          <div className="space-y-6 mb-auto">
            <div className="space-y-2">
              <div className="text-neutral-900">카페 주소</div>
              <CopyableAddress address={cafe.address} className="text-sm text-neutral-600" />
            </div>
            <div className="space-y-2">
              <div className="text-neutral-900">카페 전화번호</div>
              <CopyableAddress address={cafe.phone} className="text-sm text-neutral-600" />
            </div>
            <div className="space-y-3">
              <div className="text-neutral-900">허용 음식 종류</div>
              <div className="flex flex-wrap gap-2">
                {getAllowedFoodLabels(cafe).map((food) => (
                  <div
                    key={food}
                    className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm"
                  >
                    {food}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-neutral-900">이용 규칙</div>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                  <span>기본 이용 시간 2시간</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                  <span>인원 수만큼 음료 주문 필요</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('drink-order')}
            className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            음료 선택하기
          </button>
        </div>
      </div>
    );
  }

  if (step === 'seat-select') {
    // 사장님이 설정한 좌석 유형만 표시
    const minCapacity = state.peopleCount;
    const maxCapacity = state.peopleCount === 2 ? 4 : state.peopleCount + 1;
    const seatTypeMap = new Map<number, { id: string; capacity: number; count: number }>();
    seatTypeSettings.forEach((setting) => {
      seatTypeMap.set(setting.capacity, {
        id: setting.id,
        capacity: setting.capacity,
        count: setting.count,
      });
    });
    MOCK_CAFES.flatMap((cafe) => cafe.seatTypes ?? []).forEach((seat) => {
      if (seat.count <= 0) return;
      if (!seatTypeMap.has(seat.capacity)) {
        seatTypeMap.set(seat.capacity, {
          id: `cafe-${seat.capacity}`,
          capacity: seat.capacity,
          count: seat.count,
        });
      }
    });
    const seatTypeSource = Array.from(seatTypeMap.values());
    const availableSeats = seatTypeSource.filter(
      (s) => s.count > 0 && s.capacity >= minCapacity && s.capacity <= maxCapacity
    );

    return (
      <div className="min-h-[100dvh] bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep('people-count')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">좌석 선택</span>
        </header>

        <div className="flex-1 px-6 pt-6 pb-6 flex flex-col">
          <div className="space-y-3 mb-auto">
            {availableSeats.length > 0 ? (
              availableSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => {
                    updateState({ selectedSeat: { type: `${seat.capacity}인석`, capacity: seat.capacity, count: seat.count } });
                    setStep('cafe-list');
                  }}
                  className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl py-5 px-6 flex items-center justify-between transition-colors"
                >
                  <div className="text-left">
                    <div className="text-neutral-900">{seat.capacity}인석</div>
                    {/* <div className="text-sm text-neutral-500">{seat.count}석 남음</div> */}
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </button>
              ))
            ) : (
              <div className="bg-neutral-50 rounded-xl p-8 text-center">
                <p className="text-neutral-400">현재 이용 가능한 좌석이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'drink-order') {
    const totalDrinkCount = getTotalDrinkCount();
    const totalPrice = getTotalPrice();
    const isValidOrder = totalDrinkCount === state.peopleCount;

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
            {/* <div className="bg-neutral-50 rounded-xl p-4">
              <div className="text-sm text-neutral-600 mb-1">선택한 좌석</div>
              <div className="text-neutral-900">{state.selectedSeat.type}</div>
            </div> */}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-neutral-900">음료 선택</div>
                <div className="text-sm text-neutral-600">
                  {totalDrinkCount} / {state.peopleCount}잔
                </div>
              </div>
              {MOCK_DRINKS.map((drink) => {
                const quantity = drinkQuantities[drink.id] || 0;
                const totalDrinkCount = getTotalDrinkCount();
                const isAddDisabled = totalDrinkCount >= state.peopleCount;
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
                        disabled={isAddDisabled}
                        className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed"
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
								? <>
										인원 {state.peopleCount}명 기준 음료 {totalDrinkCount}잔이 선택되었습니다.
										<br />
										추가 주문은 매장에서 진행해주세요.
									</>
                : `인원 ${state.peopleCount}명 기준으로 음료를 ${state.peopleCount}잔 선택해주세요`}
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
                  alert(`인원 ${state.peopleCount}명 기준으로 음료를 ${state.peopleCount}잔 선택해주세요.`);
                  return;
                }
                const now = new Date();
                setStartTime(now);
                setStep('waiting');
                
                // 주문한 음료 정보 생성
                const orderedDrinks = Object.entries(drinkQuantities)
                  .filter(([_, qty]) => qty > 0)
                  .map(([drinkId, qty]) => {
                    const drink = MOCK_DRINKS.find((d) => d.id === Number(drinkId));
                    return drink ? `${drink.name} ${qty}잔` : '';
                  })
                  .filter(Boolean)
                  .join(', ');
                
                if (onPaymentComplete) {
                  onPaymentComplete({
                    cafeName: state.selectedCafe.name,
                    cafeAddress: '서울시 강남구 테헤란로 123',
                    drinkOrdered: orderedDrinks,
                    visitDate: now,
                    seatType: state.selectedSeat.type,
                  });
                }
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

  if (step === 'waiting' && startTime) {
    // 주문한 음료 정보 생성
    const orderedDrinks = Object.entries(drinkQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([drinkId, qty]) => {
        const drink = MOCK_DRINKS.find((d) => d.id === Number(drinkId));
        return drink ? `${drink.name} ${qty}잔` : '';
      })
      .filter(Boolean)
      .join(', ');

    return (
      <div className="min-h-[100dvh] bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">결제 완료</span>
        </header>

        <div className="flex-1 px-6 pt-8 flex flex-col items-center">
          <div className="w-full max-w-sm space-y-6">
            {/* 완료 상태 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-blue-900 mb-2">결제가 완료되었어요</div>
              <div className="text-sm text-blue-700">
                카페에 도착 후 사장님 확인이 완료되면
                <br />
                이용이 시작돼요
							</div>
						</div>
						<div className="text-center">
							<div className="text-sm text-amber-700">
								30분 이상 노쇼일 경우
								<br />
								좌석은 자동으로 해제되며, 환불 불가합니다.
							</div>
						</div>

            {/* 상태 배지 */}
            <div className="flex justify-center">
              <span className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm">
                이용 대기 중
              </span>
            </div>

            {/* 예약 정보 */}
            <div className="bg-neutral-50 rounded-xl p-6 space-y-4">
              <div>
                <div className="text-sm text-neutral-500 mb-1">카페</div>
                <div className="text-neutral-900">{state.selectedCafe.name}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">이용 인원 / 선택 좌석</div>
                <div className="text-neutral-900">
                  {state.peopleCount}명 / {state.selectedSeat.type}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">주문 음료</div>
                <div className="text-neutral-900">{orderedDrinks}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">결제 시각</div>
                <div className="text-neutral-900">
                  {startTime.getHours()}:{startTime.getMinutes().toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* 안내 문구 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm text-neutral-600 text-center">
              아직 이용 시간은 시작되지 않았어요
            </div>

            {/* 홈으로 가기 버튼 */}
            <button
              onClick={onBack}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              홈으로 가기
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
          <button onClick={onBack} className="p-2 -ml-2">
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
                <div className="text-neutral-900">{state.selectedCafe.name}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">좌석</div>
                <div className="text-neutral-900">{state.selectedSeat.type}</div>
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