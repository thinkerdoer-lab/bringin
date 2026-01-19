import { useState } from 'react';
import { PhoneLogin } from './PhoneLogin';
import { OwnerQRAuth } from './OwnerQRAuth';

type Step = 'qr' | 'phone';

interface OwnerAuthFlowProps {
  onAuthComplete: (data: {
    userId: string;
    role: 'owner';
    storeId: string;
    phoneNumber: string;
    autoLogin: boolean;
  }) => void;
  onBack: () => void;
}

export function OwnerAuthFlow({ onAuthComplete, onBack }: OwnerAuthFlowProps) {
  const [step, setStep] = useState<Step>('qr');
  const [storeId, setStoreId] = useState<string | null>(null);

  const handleOwnerQRComplete = (verifiedStoreId: string) => {
    setStoreId(verifiedStoreId);
    setStep('phone');
  };

  const handlePhoneAuthComplete = (data: {
    userId: string;
    phoneNumber: string;
    autoLogin: boolean;
    isNewUser: boolean;
    hasOwnerRole: boolean;
    storeId?: string;
  }) => {
    if (!storeId) return;

    onAuthComplete({
      userId: data.userId,
      role: 'owner',
      storeId: storeId,
      phoneNumber: data.phoneNumber,
      autoLogin: data.autoLogin,
    });
  };

  if (step === 'qr') {
    return <OwnerQRAuth onComplete={handleOwnerQRComplete} onBack={onBack} />;
  }

  if (step === 'phone') {
    return (
      <PhoneLogin
        onComplete={handlePhoneAuthComplete}
        isQrEntry={false}
        onQREntry={() => {}}
        onOwnerLogin={undefined}
        ownerAuthCompleted={true}
      />
    );
  }

  return null;
}