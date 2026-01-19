import { useState } from 'react';
import { ArrowLeft, Settings, Plus, X, CheckCircle2, Minus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import type { RegisteredSeat, AllowedFood, SeatTypeSetting, UsageHistory } from '../App';

interface OperationSettings {
  selectedDays: string[];
  startTime: string;
  endTime: string;
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const DEFAULT_FOOD_OPTIONS = [
  '빵/디저트',
  '간단한 외부 음식',
  '도시락',
  '샌드위치',
  '샐러드',
];

export function OwnerDashboard({
  onBack,
  onLogout,
  onRoleSwitch,
  registeredSeats,
  onRegisteredSeatsChange,
  seatTypeSettings,
  onSeatTypeSettingsChange,
  allowedFoods,
  onAllowedFoodsChange,
  usageHistory,
  onUsageStart,
}: {
  onBack: () => void;
  onLogout: () => void;
  onRoleSwitch: () => void;
  registeredSeats: RegisteredSeat[];
  onRegisteredSeatsChange: (seats: RegisteredSeat[]) => void;
  seatTypeSettings: SeatTypeSetting[];
  onSeatTypeSettingsChange: (settings: SeatTypeSetting[]) => void;
  allowedFoods: AllowedFood[];
  onAllowedFoodsChange: (foods: AllowedFood[]) => void;
  usageHistory?: UsageHistory[];
  onUsageStart?: (usageId: string) => void;
}) {
  const [settings, setSettings] = useState<OperationSettings>({
    selectedDays: ['월', '화', '수', '목', '금'],
    startTime: '14:00',
    endTime: '17:00',
  });
  const [customFoodInput, setCustomFoodInput] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<RegisteredSeat | null>(null);

  const getElapsedTime = (startTime: Date) => {
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 60000);
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
  };

  const toggleDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const toggleFoodOption = (foodName: string) => {
    const existing = allowedFoods.find((f) => f.name === foodName);
    if (existing) {
      onAllowedFoodsChange(allowedFoods.filter((f) => f.name !== foodName));
    } else {
      const newFood: AllowedFood = {
        id: Date.now().toString(),
        name: foodName,
        isCustom: false,
      };
      onAllowedFoodsChange([...allowedFoods, newFood]);
    }
  };

  const addCustomFood = () => {
    if (!customFoodInput.trim()) {
      alert('음식 이름을 입력해주세요.');
      return;
    }

    if (allowedFoods.some((f) => f.name === customFoodInput.trim())) {
      alert('이미 추가된 음식입니다.');
      return;
    }

    const newFood: AllowedFood = {
      id: Date.now().toString(),
      name: customFoodInput.trim(),
      isCustom: true,
    };
    onAllowedFoodsChange([...allowedFoods, newFood]);
    setCustomFoodInput('');
  };

  const removeCustomFood = (id: string) => {
    onAllowedFoodsChange(allowedFoods.filter((f) => f.id !== id));
  };

  // 좌석 유형 추가
  const addSeatTypeSetting = () => {
    const newId = Date.now().toString();
    onSeatTypeSettingsChange([
      ...seatTypeSettings,
      { id: newId, capacity: 2, count: 1 },
    ]);
  };

  // 좌석 유형 삭제
  const removeSeatTypeSetting = (id: string) => {
    onSeatTypeSettingsChange(
      seatTypeSettings.filter((setting) => setting.id !== id)
    );
  };

  // 좌석 인원 수 조정
  const adjustSeatCapacity = (id: string, delta: number) => {
    onSeatTypeSettingsChange(
      seatTypeSettings.map((setting) =>
        setting.id === id
          ? { ...setting, capacity: Math.max(1, setting.capacity + delta) }
          : setting
      )
    );
  };

  // 좌석 개수 조정
  const adjustSeatTypeCount = (id: string, delta: number) => {
    onSeatTypeSettingsChange(
      seatTypeSettings.map((setting) =>
        setting.id === id
          ? { ...setting, count: Math.max(0, setting.count + delta) }
          : setting
      )
    );
  };

  // 좌석 구성을 기반으로 실제 좌석 생성/동기화
  const syncSeatsWithSettings = () => {
    const newSeats: RegisteredSeat[] = [];
    
    seatTypeSettings.forEach((setting) => {
      for (let i = 0; i < setting.count; i++) {
        // 기존에 같은 유형의 좌석이 있으면 상태 유지
        const existingSeat = registeredSeats.find(
          (s) => s.capacity === setting.capacity && !newSeats.find((ns) => ns.id === s.id)
        );
        
        if (existingSeat) {
          newSeats.push(existingSeat);
        } else {
          // 새 좌석 생성
          newSeats.push({
            id: `${setting.capacity}-${Date.now()}-${i}`,
            capacity: setting.capacity,
            isOpen: false,
            inUse: false,
          });
        }
      }
    });
    
    onRegisteredSeatsChange(newSeats);
    alert('좌석 구성이 저장되었습니다');
  };

  // 좌석 열기/닫기 토글
  const toggleSeatOpen = (seatId: string) => {
    const seat = registeredSeats.find(s => s.id === seatId);
    if (seat?.inUse) {
      alert('이용 중인 좌석은 닫을 수 없습니다.');
      return;
    }
    
    onRegisteredSeatsChange(
      registeredSeats.map((seat) =>
        seat.id === seatId ? { ...seat, isOpen: !seat.isOpen } : seat
      )
    );
  };

  // 좌석 이용 종료
  const endSeatUsage = (seatId: string) => {
    if (window.confirm('이용을 종료하시겠습니까?')) {
      onRegisteredSeatsChange(
        registeredSeats.map((seat) =>
          seat.id === seatId
            ? { ...seat, inUse: false, usageInfo: undefined }
            : seat
        )
      );
      setSelectedSeat(null);
    }
  };

  // 좌석 유형별 그룹화 (현재 이용 중 탭용)
  const groupSeatsByCapacity = () => {
    const groups: { [key: number]: RegisteredSeat[] } = {};
    registeredSeats.forEach((seat) => {
      if (!groups[seat.capacity]) {
        groups[seat.capacity] = [];
      }
      groups[seat.capacity].push(seat);
    });
    return groups;
  };

  const seatGroups = groupSeatsByCapacity();
  const sortedCapacities = Object.keys(seatGroups)
    .map(Number)
    .sort((a, b) => a - b);

  // 통계 계산
  const totalSeats = registeredSeats.length;
  const openSeats = registeredSeats.filter((s) => s.isOpen).length;
  const inUseSeats = registeredSeats.filter((s) => s.inUse).length;
  const todayUsageCount = 8;
  const todayDrinkCount = 15;

  // 좌석 박스 색상 결정
  const getSeatBoxColor = (seat: RegisteredSeat) => {
    if (seat.inUse) {
      return 'bg-neutral-400'; // 회색 (이용 중)
    }
    if (seat.isOpen) {
      return 'bg-green-500'; // 초록색 (오픈됨)
    }
    return 'bg-neutral-900'; // 검은색 (닫혀있음)
  };

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between bg-white border-b border-neutral-100">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div className="ml-3">
            <div className="text-neutral-900">좌석 관리</div>
            <div className="text-xs text-neutral-500">카페 운영자 화면</div>
          </div>
        </div>
        <button onClick={onRoleSwitch} className="p-2 -mr-2">
          <Settings className="w-5 h-5 text-neutral-700" />
        </button>
      </header>

      <Tabs defaultValue="settings" className="flex-1 flex flex-col">
        <TabsList className="mx-5 mt-4 w-auto">
          <TabsTrigger value="current" className="flex-1">
            현재 이용 중
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            좌석 운영 설정
          </TabsTrigger>
        </TabsList>

        {/* 탭 1: 현재 이용 중 */}
        <TabsContent value="current" className="flex-1 pb-6 overflow-y-auto">
          {/* 이용 대기 중 섹션 */}
          {usageHistory && usageHistory.filter((h) => h.status === 'waiting').length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-4">
              <div className="text-sm text-amber-900 mb-3 font-medium">이용 대기 중</div>
              <div className="space-y-3">
                {usageHistory
                  .filter((h) => h.status === 'waiting')
                  .map((usage) => (
                    <div
                      key={usage.id}
                      className="bg-white rounded-xl p-4 border border-amber-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-neutral-900 font-medium">
                            {usage.seatType || '좌석'}
                          </div>
                          <div className="text-sm text-neutral-500 mt-0.5">
                            결제 완료: {usage.paymentTime ? `${usage.paymentTime.getHours()}:${usage.paymentTime.getMinutes().toString().padStart(2, '0')}` : '-'}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs">
                          대기 중
                        </span>
                      </div>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between text-neutral-600">
                          <span>주문 음료</span>
                          <span className="text-neutral-900">{usage.drinkOrdered}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (onUsageStart && window.confirm('이용 시작을 확인하시겠습니까?')) {
                            onUsageStart(usage.id);
                          }
                        }}
                        className="w-full bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        이용 시작 확인
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 범례 UI */}
          <div className="bg-white border-b border-neutral-200 px-5 py-4">
            <div className="text-sm text-neutral-600 mb-3">좌석 상태</div>
            <div className="flex items-center justify-around text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-900"></div>
                <span className="text-neutral-600">일반석</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500"></div>
                <span className="text-neutral-600">열린 좌석</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-400"></div>
                <span className="text-neutral-600">이용 중</span>
              </div>
            </div>
          </div>

          {/* 좌석 박스 시각화 UI (단일 박스에 숫자) */}
          <div className="px-5 py-6 space-y-8">
            {totalSeats > 0 ? (
              sortedCapacities.map((capacity) => {
                const seatsOfType = seatGroups[capacity];
                
                return (
                  <div key={capacity} className="space-y-3">
                    {/* 좌석 유형 라벨 */}
                    <div className="text-sm text-neutral-600 font-medium">
                      {capacity}인석 ({seatsOfType.length}개)
                    </div>
                    
                    {/* 좌석 박스 그리드 (단일 박스에 숫자) */}
                    <div className="flex flex-wrap gap-4">
                      {seatsOfType.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => {
                            if (seat.inUse) {
                              setSelectedSeat(seat);
                            } else {
                              toggleSeatOpen(seat.id);
                            }
                          }}
                          className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-semibold text-white transition-all active:scale-95 ${getSeatBoxColor(
                            seat
                          )}`}
                        >
                          {capacity}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl border border-neutral-200 py-12 text-center">
                <div className="text-neutral-400 mb-2">등록된 좌석이 없습니다</div>
                <p className="text-sm text-neutral-400">
                  좌석 운영 설정 탭에서 좌석을 설정하고 저장해주세요
                </p>
              </div>
            )}
          </div>

          {/* 하단 요약 */}
          <div className="px-5 pt-2">
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="text-sm text-neutral-600 mb-3">오늘 요약</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">좌석 이용 건수</span>
                  <span className="text-neutral-900">{todayUsageCount}건</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">음료 주문 건수</span>
                  <span className="text-neutral-900">{todayDrinkCount}건</span>
                </div>
              </div>
            </div>
          </div>

          {/* 알림 안내 */}
          <div className="px-5 pt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  새로운 좌석 이용이 시작되면 알림톡으로 안내됩니다
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 탭 2: 좌석 운영 설정 */}
        <TabsContent value="settings" className="flex-1 pb-6">
          <div className="px-5 py-5 space-y-6">
            {/* 안내 문구 */}
            <div className="text-center py-2">
              <p className="text-sm text-neutral-500">
                카페에 존재하는 전체 좌석 구성을 설정해주세요
              </p>
            </div>

            {/* 1. 요일 설정 */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="text-neutral-900 mb-3">요일 설정</div>
              <div className="flex gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex-1 py-3 rounded-lg text-sm transition-colors ${
                      settings.selectedDays.includes(day)
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 운영 시간 설정 */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="text-neutral-900 mb-3">운영 시간 설정</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-neutral-600 w-16">시작</label>
                  <input
                    type="time"
                    value={settings.startTime}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-neutral-600 w-16">종료</label>
                  <input
                    type="time"
                    value={settings.endTime}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  선택한 시간에만 좌석이 열립니다
                </p>
              </div>
            </div>

            {/* 3. 허용 음식 종류 설정 */}
            <div className="space-y-3">
              <div className="text-neutral-900">허용 음식 종류 설정</div>
              
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                {/* 기본 제공 음식 옵션 */}
                <div className="mb-4">
                  <div className="text-sm text-neutral-600 mb-2">기본 음식 옵션 (복수 선택 가능)</div>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_FOOD_OPTIONS.map((food) => {
                      const isSelected = allowedFoods.some((f) => f.name === food);
                      return (
                        <button
                          key={food}
                          onClick={() => toggleFoodOption(food)}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            isSelected
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
                          }`}
                        >
                          {food}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 직접 입력 음식 */}
                <div className="pt-4 border-t border-neutral-100">
                  <div className="text-sm text-neutral-600 mb-2">직접 입력</div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={customFoodInput}
                      onChange={(e) => setCustomFoodInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCustomFood();
                        }
                      }}
                      placeholder="음식 이름 입력"
                      className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <button
                      onClick={addCustomFood}
                      className="px-4 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>추가</span>
                    </button>
                  </div>

                  {/* 추가된 직접 입력 음식 리스트 */}
                  {allowedFoods.filter((f) => f.isCustom).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {allowedFoods
                        .filter((f) => f.isCustom)
                        .map((food) => (
                          <div
                            key={food.id}
                            className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2"
                          >
                            <span>{food.name}</span>
                            <button
                              onClick={() => removeCustomFood(food.id)}
                              className="hover:bg-green-100 rounded p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. 좌석 유형별 설정 (카운터 UI) */}
            <div className="space-y-3">
              <div className="text-neutral-900">좌석 유형별 설정</div>
              <div className="text-sm text-neutral-500">
                카페에 실제로 존재하는 전체 좌석 수를 입력해주세요
              </div>
              
              {seatTypeSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="bg-white rounded-xl border border-neutral-200 p-5"
                >
                  <div className="space-y-3">
                    {/* 인석 수 설정 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustSeatCapacity(setting.id, -1)}
                        disabled={setting.capacity === 1}
                        className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3.5 h-3.5 text-neutral-700" />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-8 bg-neutral-50 border-2 border-neutral-300 rounded-lg flex items-center justify-center text-base text-neutral-900 font-medium">
                          {setting.capacity}
                        </div>
                        <span className="text-sm text-neutral-900">인석</span>
                      </div>
                      <button
                        onClick={() => adjustSeatCapacity(setting.id, 1)}
                        className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-neutral-700" />
                      </button>
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => removeSeatTypeSetting(setting.id)}
                        className="ml-auto p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        aria-label="삭제"
                      >
                        <X className="w-4 h-4 text-neutral-500" />
                      </button>
                    </div>

                    {/* 좌석 수 설정 */}
                    <div className="pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustSeatTypeCount(setting.id, -1)}
                          disabled={setting.count === 0}
                          className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5 text-neutral-700" />
                        </button>
                        <div className="flex items-center gap-1.5">
                          <div className="w-10 h-8 bg-neutral-50 border-2 border-neutral-300 rounded-lg flex items-center justify-center text-base text-neutral-900 font-medium">
                            {setting.count}
                          </div>
                          <span className="text-sm text-neutral-900">개</span>
                        </div>
                        <button
                          onClick={() => adjustSeatTypeCount(setting.id, 1)}
                          className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-neutral-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 좌석 유형 추가 버튼 */}
              <button
                onClick={addSeatTypeSetting}
                className="w-full bg-neutral-50 border border-neutral-200 border-dashed text-neutral-600 py-4 rounded-xl hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>좌석 유형 추가</span>
              </button>
            </div>

            {/* 좌석 구성 저장 버튼 */}
            <div className="pt-2">
              <button
                onClick={syncSeatsWithSettings}
                className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                좌석 구성 저장하기
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 좌석 상세 정보 하단 시트 */}
      {selectedSeat && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setSelectedSeat(null)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 드래그 핸들 */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-neutral-300 rounded-full" />
            </div>

            <div className="px-5 pb-6">
              {selectedSeat.inUse && selectedSeat.usageInfo ? (
                // 사용 중인 좌석
                <>
                  <div className="mb-6">
                    <div className="text-xl font-medium text-neutral-900 mb-1">
                      {selectedSeat.capacity}인석
                    </div>
                    <div className="text-sm text-neutral-500">
                      이용 중인 좌석
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                      <span className="text-neutral-600">이용자</span>
                      <span className="text-neutral-900 font-medium">
                        {selectedSeat.usageInfo.userName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                      <span className="text-neutral-600">이용 인원</span>
                      <span className="text-neutral-900 font-medium">
                        {selectedSeat.usageInfo.people}명
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                      <span className="text-neutral-600">이용 시작 시간</span>
                      <span className="text-neutral-900 font-medium">
                        {selectedSeat.usageInfo.startTime.getHours()}:
                        {selectedSeat.usageInfo.startTime.getMinutes().toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                      <span className="text-neutral-600">경과 시간</span>
                      <span className="text-neutral-900 font-medium">
                        {getElapsedTime(selectedSeat.usageInfo.startTime)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                      <span className="text-neutral-600">주문 방식</span>
                      <span className="text-neutral-900 font-medium">
                        {selectedSeat.usageInfo.orderType === 'payment' ? '결제 완료' : '주문 확인 대기'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => endSeatUsage(selectedSeat.id)}
                    className="w-full bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    이용 종료
                  </button>
                </>
              ) : (
                // 사용 중이 아닌 좌석 (열린 좌석 또는 일반석)
                <>
                  <div className="mb-6">
                    <div className="text-xl font-medium text-neutral-900 mb-1">
                      {selectedSeat.capacity}인석
                    </div>
                    <div className="text-sm text-neutral-500">
                      {selectedSeat.isOpen ? '열린 좌석' : '일반석'}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                      <span className="text-neutral-600">상태</span>
                      <span className={`font-medium ${selectedSeat.isOpen ? 'text-green-600' : 'text-neutral-600'}`}>
                        {selectedSeat.isOpen ? '오픈됨' : '닫혀있음'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toggleSeatOpen(selectedSeat.id);
                      setSelectedSeat(null);
                    }}
                    className={`w-full py-4 rounded-xl transition-colors ${
                      selectedSeat.isOpen
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedSeat.isOpen ? '좌석 닫기' : '좌석 열기'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}