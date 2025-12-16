// src/pages/BankSelectPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/common/BottomNavigation";
import { getExternalBanks } from "@/api/endpoints/user_banks";
import { useDebounce } from "@/hooks/useDebounce";
import { ExternalBank } from "@/api/types/user_banks";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function BankSelectPage() {

    const navigate = useNavigate();
    const [bankSearch, setBankSearch] = useState("");
    const debouncedBankSearch = useDebounce(bankSearch, 500);
    const [externalBanks, setExternalBanks] = useState<ExternalBank[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        show: false,
        message: ""
    });

    const getExternalBanksInformation = async (search: string) => {
        try {
            setLoading(true);
            setError({ show: false, message: "" });
            const response = await getExternalBanks(search);
            setExternalBanks(response.data.banks);
        } catch (err) {
            console.error("error:", err);
            setError({ show: true, message: "銀行情報の取得に失敗しました. もう一度お試しください." });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getExternalBanksInformation(debouncedBankSearch.trim() || "");
    }, [debouncedBankSearch]);

    const handleSelectBank = (bank: ExternalBank) => {
        navigate(`/account/settings/bank-account/branch-select?bank_code=${bank.code}`, { replace: true });
    };

    return (
        <div className="min-h-screen bg-white px-6 pt-10">
            {/* Title */}
            <h1 className="text-lg font-semibold mb-4">銀行を選択</h1>
            {
                error.show && (
                    <div className="mb-4">
                        <ErrorMessage message={[error.message]} variant="error" />
                    </div>
                )
            }
            {/* Search box */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    className="pl-9 rounded-xl bg-white border border-gray-200"
                    placeholder="銀行名を検索"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                />
            </div>

            {/* Bank list */}
            <div className="divide-y divide-gray-200">
                {externalBanks.map((bank) => (
                    <button
                        key={bank.code}
                        type="button"
                        onClick={() => handleSelectBank(bank)}
                        className="w-full flex items-center justify-between py-3 text-left"
                    >
                        <span className="text-base">{bank.name}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                ))}

                {externalBanks.length === 0 && !loading && (
                    <div className="py-6 text-center text-sm text-gray-400">
                        該当する銀行がありません
                    </div>
                )}
            </div>
            <BottomNavigation />
        </div>
    );
};