import React from 'react';
import { ChevronRight } from 'lucide-react';
import { BankAccount } from '@/api/types/user_banks';

interface BankAccountSectionProps {
  bankAccount: BankAccount | null;
  handleBankAccountChange: () => void;
}

const ACCOUNT_TYPE_MAP: Record<number, string> = {
  1: '普通',
  2: '当座',
};

export default function BankAccountSection({ bankAccount, handleBankAccountChange }: BankAccountSectionProps) {
  if (!bankAccount) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-stretch justify-between">
        <p className="text-lg font-semibold text-gray-900 self-center">振込先</p>
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={handleBankAccountChange}>
          <p className="text-lg font-semibold text-red-500">振込先を設定してください</p>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-stretch justify-between">
      <p className="text-lg font-semibold text-gray-900 self-center">振込先</p>
      <div className="flex items-center justify-end p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 space-x-8" onClick={handleBankAccountChange}>
        <div>
          <div className="font-bold text-gray-900">{bankAccount.bank_name}</div>
          <div className="text-sm text-gray-600 mb-2">{bankAccount.branch_name}</div>
          <div className="text-sm text-gray-600">{ACCOUNT_TYPE_MAP[bankAccount.account_type as keyof typeof ACCOUNT_TYPE_MAP]} {bankAccount.account_number}</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
