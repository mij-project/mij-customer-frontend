import React from 'react';
import { Button } from '@/components/ui/button';

interface WithdrawalSubmitSectionProps {
  withdrawalAmount: number;
}

export default function WithdrawalSubmitSection({
  withdrawalAmount,
}: WithdrawalSubmitSectionProps) {
  return (
    <div className="flex justify-center">
      <Button className="bg-primary hover:bg-primary/90 px-8" disabled={withdrawalAmount <= 0}>
        申請
      </Button>
    </div>
  );
}
