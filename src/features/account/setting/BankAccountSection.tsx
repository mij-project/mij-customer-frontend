import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BankAccount {
  bankName: string;
  branchName: string;
  accountNumber: string;
}

interface BankAccountSectionProps {
  bankAccount: BankAccount;
}

export default function BankAccountSection({ bankAccount }: BankAccountSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">振込先</h3>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
        <div>
          <div className="font-medium text-gray-900">{bankAccount.bankName}</div>
          <div className="text-sm text-gray-600">{bankAccount.branchName}</div>
          <div className="text-sm text-gray-600">普通 {bankAccount.accountNumber} ライクネット</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
