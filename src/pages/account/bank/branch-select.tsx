// src/pages/BankSelectPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/common/BottomNavigation";
import { getExternalBranchesByBankCodeWithSearch } from "@/api/endpoints/user_banks";
import { useDebounce } from "@/hooks/useDebounce";
import { ExternalBranch } from "@/api/types/user_banks";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useSearchParams } from "react-router-dom";

const BranchSelectPage: React.FC = () => {
    const navigate = useNavigate();
    const [branchSearch, setBranchSearch] = useState("");
    const debouncedBranchSearch = useDebounce(branchSearch, 500);
    const [branches, setBranches] = useState<ExternalBranch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        show: false,
        message: ""
    });
    const [searchParams] = useSearchParams();
    const bank_code = searchParams.get("bank_code");
    const getBranchesInformation = async (search: string, bank_code: string) => {
        try {
            setLoading(true);
            setError({ show: false, message: "" });
            const response = await getExternalBranchesByBankCodeWithSearch(bank_code, search);
            setBranches(response.data.branches || []);
        } catch (err) {
            console.error("error:", err);
            setError({ show: true, message: "支店情報の取得に失敗しました. もう一度お試しください." });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!bank_code) {
            setError({ show: true, message: "銀行コードが指定されていません." });
            return;
        }
        getBranchesInformation(debouncedBranchSearch.trim() || "", bank_code);
    }, [debouncedBranchSearch, bank_code]);

    const handleSelectBranch = (branch: ExternalBranch) => {
        navigate(`/account/settings/bank-account/bank-setting?bank_code=${bank_code}&branch_code=${branch.code}`, { replace: true });
    };

    return (
        <div className="min-h-screen bg-white px-6 pt-10">
            {/* Title */}
            <h1 className="text-lg font-semibold mb-4">支店を選択</h1>
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
                    placeholder="支店名を検索"
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                />
            </div>

            {/* Bank list */}
            <div className="divide-y divide-gray-200">
                {branches.map((branch) => (
                    <button
                        key={branch.code}
                        type="button"
                        onClick={() => handleSelectBranch(branch)}
                        className="w-full flex items-center justify-between py-3 text-left"
                    >
                        <span className="text-base">{branch.name} ({branch.code})</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                ))}

                {branches.length === 0 && !loading && (
                    <div className="py-6 text-center text-sm text-gray-400">
                        該当する支店がありません
                    </div>
                )}
            </div>
            <BottomNavigation />
        </div>
    );
};

export default BranchSelectPage;
