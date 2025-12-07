import React, { useEffect, useState } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';;
import { useNavigate } from 'react-router-dom';
import { BankAccount } from '@/api/types/user_banks';
import { ChevronRight } from 'lucide-react';
import { getUserBankDefaultInformation } from '@/api/endpoints/user_banks';
import ErrorMessage from '@/components/common/ErrorMessage';

const ACCOUNT_TYPE_MAP: Record<number, string> = {
    1: '普通',
    2: '当座',
};

export default function BanksAccount() {

    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchBankAccount = async () => {
            try {
                const response = await getUserBankDefaultInformation();
                if (response.status !== 200) {
                    throw new Error('Failed to fetch bank account');
                }
                setBankAccount(response.data.user_bank || null);
            } catch (error) {
                console.error('Failed to fetch bank account:', error);
                setError('口座情報の取得に失敗しました. もう一度お試しください.');
            }
        };
        fetchBankAccount();
    }, []);

    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/account/sale-withdraw');
    };

    const handleBankAccountChange = () => {
        navigate('/account/settings/bank-account/bank-select');
    };

    if (!bankAccount) {
        return (
            <div className="bg-white min-h-screen">
                <AccountHeader title="振込先設定" showBackButton onBack={handleBack} />
                <div className="p-6 space-y-6 mt-16">
                    {error && <ErrorMessage message={[error]} />}
                    <div className="flex items-center justify-between">
                        <p className="text-md font-bold text-gray-900 px-2">振込先設定</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 space-x-8" onClick={handleBankAccountChange}>
                            <div>
                                <div className="font-bold text-red-500">振込先を設定してください</div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <AccountHeader title="振込先設定" showBackButton onBack={handleBack} />
            <div className="p-6 space-y-6 mt-16">
                <div className="flex items-center justify-between">
                    <p className="text-md font-bold text-gray-900 px-2">振込先設定</p>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 space-x-8" onClick={handleBankAccountChange}>
                        <div>
                            <div className="font-bold text-gray-900">{bankAccount.bank_name}</div>
                            <div className="text-sm text-gray-600 mb-2">{bankAccount.branch_name}</div>
                            <div className="text-sm text-gray-600">{ACCOUNT_TYPE_MAP[bankAccount.account_type as keyof typeof ACCOUNT_TYPE_MAP]} {bankAccount.account_number}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
