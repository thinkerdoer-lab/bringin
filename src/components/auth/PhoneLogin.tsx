import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

type Step = 'welcome' | 'phone' | 'verify';

interface PhoneLoginProps {
  onComplete: (data: {
    userId: string;
    phoneNumber: string;
    autoLogin: boolean;
    isNewUser: boolean;
    hasOwnerRole: boolean;
    storeId?: string;
  }) => void;
  isQrEntry: boolean;
  onQREntry: () => void;
  onOwnerLogin?: () => void;
  ownerAuthCompleted?: boolean;
}

export function PhoneLogin({ onComplete, isQrEntry, onQREntry, onOwnerLogin, ownerAuthCompleted }: PhoneLoginProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length === 11) {
      // SMS 발송 시뮬레이션
      setStep('verify');
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      // 인증 완료 - 서버에서 받은 데이터라고 가정
      const mockUserData = {
        userId: 'user_' + Date.now(),
        phoneNumber: phoneNumber,
        autoLogin: autoLogin,
        isNewUser: Math.random() > 0.5, // 시뮬레이션
        hasOwnerRole: false, // 기존 owner 역할 없음
      };

      onComplete(mockUserData);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.slice(0, 11);
  };

  if (step === 'welcome') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center space-y-4 mb-16">
            {ownerAuthCompleted ? (
              <>
                <div className="text-neutral-900">매장 관리를 시작하려면</div>
                <p className="text-neutral-600">로그인이 필요합니다</p>
              </>
            ) : (
              <>
                <div className="text-neutral-900">브링인</div>
                <p className="text-neutral-600">
                  원하는 시간, 원하는 자리를 선택해
                  <br />
                  편하게 이용하세요.
                </p>
              </>
            )}
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={() => setStep('phone')}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              휴대폰 번호로 시작하기
            </button>

            {ownerAuthCompleted && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">사장님 인증 완료</span>
              </div>
            )}

            {onOwnerLogin && (
              <button
                onClick={onOwnerLogin}
                className="w-full bg-white text-neutral-900 py-4 rounded-xl border border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                사장님으로 로그인
              </button>
            )}
          </div>

          <div className="mt-12 text-center space-y-2">
            <p className="text-xs text-neutral-400">
              로그인 시 서비스 이용약관 및 개인정보처리방침에 동의합니다
            </p>
					</div>
				</div>
				<div>
					<a
						href="https://tally.so/r/D4pg9q"
						target="_blank"
						rel="noreferrer"
						className="text-xs text-neutral-400 underline"
					>
						저기요...
					</a>
				</div>
      </div>
    );
  }

  if (step === 'phone') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep('welcome')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">휴대폰 번호 입력</span>
        </header>

        <div className="flex-1 px-6 pt-8 pb-6 flex flex-col">
          <form onSubmit={handlePhoneSubmit} className="flex-1 flex flex-col">
            <div className="mb-8">
              <label className="block text-neutral-900 mb-3">
                휴대폰 번호를 입력해주세요
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="01012345678"
                className="w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                autoFocus
              />
              <p className="text-sm text-neutral-500 mt-2">'-' 없이 숫자만 입력해주세요</p>
            </div>

            <div className="mt-auto space-y-3">
              <button
                type="button"
                onClick={() => setAutoLogin(!autoLogin)}
                className="flex items-center gap-2 text-sm text-neutral-600"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    autoLogin
                      ? 'bg-neutral-900 border-neutral-900'
                      : 'border-neutral-300'
                  }`}
                >
                  {autoLogin && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span>자동 로그인</span>
              </button>

              <button
                type="submit"
                disabled={phoneNumber.length !== 11}
                className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                인증번호 받기
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep('phone')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">인증번호 입력</span>
        </header>

        <div className="flex-1 px-6 pt-8 pb-6 flex flex-col">
          <form onSubmit={handleVerifySubmit} className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="text-neutral-900 mb-2">인증번호를 입력해주세요</div>
              <p className="text-sm text-neutral-500 mb-4">
                {phoneNumber}로 발송된 6자리 숫자를 입력하세요
              </p>

              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-center tracking-widest"
                autoFocus
              />

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    // 재발송 로직
                  }}
                  className="text-base text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                >
                  인증번호 다시 받기
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={verificationCode.length !== 6}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors disabled:bg-neutral-200 disabled:text-neutral-400 mt-auto"
            >
              확인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}