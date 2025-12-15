// src/pages/BankSettingPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/common/BottomNavigation";
import ErrorMessage from "@/components/common/ErrorMessage";
import { BankAccount, BankSettingSubmitData, ExternalBank, ExternalBranch } from "@/api/types/user_banks";
import { getExternalBanks, getExternalBranchesByBankCodeWithBranchCode, getUserBankDefaultInformation, submitBankSettingDefault } from "@/api/endpoints/user_banks";
import { Loader2 } from "lucide-react";

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export default function BankSettingPage() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bank_code = searchParams.get("bank_code");
    const branch_code = searchParams.get("branch_code");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        show: false,
        messages: [],
    });

    const [bank, setBank] = useState<ExternalBank | null>(null);
    const [branch, setBranch] = useState<ExternalBranch | null>(null);

    const [accountType, setAccountType] = useState<"1" | "2">("1");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");

    const [userBank, setUserBank] = useState<BankAccount | null>(null);


    const getBankInformation = async (bank_code: string, branch_code: string) => {
        try {
            setLoading(true);
            setError({ show: false, messages: [] });

            const userBankResponse = await getUserBankDefaultInformation();

            const bankResponse = await getExternalBanks(bank_code);

            await sleep(1000);
            const branchResponse = await getExternalBranchesByBankCodeWithBranchCode(
                bank_code,
                branch_code
            );

            if (
                userBankResponse.status !== 200 ||
                bankResponse.status !== 200 ||
                branchResponse.status !== 200
            ) {
                throw new Error("銀行・支店情報の取得に失敗しました.");
            }

            setBank(bankResponse.data.banks[0]);
            setBranch(branchResponse.data.branches[0]);
            setUserBank(userBankResponse.data.user_bank || null);
        } catch (err) {
            console.error("error:", err);
            setError({
                show: true,
                messages: ["銀行・支店情報の取得に失敗しました. もう一度お試しください."]
            });
        } finally {
            setLoading(false);
        }
    };
    // const getBankInformation = async (bank_code: string, branch_code: string) => {
    //     try {
    //         setLoading(true);
    //         setError({ show: false, messages: [] });
    //         const [bankResponse, branchResponse, userBankResponse] = await Promise.all([
    //             getExternalBanks(bank_code),
    //             getExternalBranchesByBankCodeWithBranchCode(bank_code, branch_code),
    //             getUserBankDefaultInformation(),
    //         ]);
    //         if (userBankResponse.status !== 200 || bankResponse.status !== 200 || branchResponse.status !== 200) {
    //             throw new Error("銀行・支店情報の取得に失敗しました.");
    //         }
    //         setBank(bankResponse.data.banks[0]);
    //         setBranch(branchResponse.data.branches[0]);
    //         setUserBank(userBankResponse.data.user_bank || null);
    //     } catch (err) {
    //         console.error("error:", err);
    //         setError({ show: true, messages: ["銀行・支店情報の取得に失敗しました. もう一度お試しください."] });
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        if (!bank_code || !branch_code) {
            setError({ show: true, messages: ["銀行コードまたは支店コードが指定されていません."] });
            return;
        }
        getBankInformation(bank_code, branch_code);
    }, [bank_code, branch_code]);

    const submitBankSetting = async (submitData: BankSettingSubmitData) => {
        try {
            setLoading(true);
            setError({ show: false, messages: [] });
            const response = await submitBankSettingDefault(submitData);
            if (response.status !== 200) {
                throw new Error("口座情報の登録に失敗しました.");
            }
            navigate("/account/settings/bank-account");
        } catch (err) {
            console.error("error:", err);
            setError({ show: true, messages: ["口座情報の登録に失敗しました. もう一度お試しください."] });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        };
    };

    const handleBankSettingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError({ show: false, messages: [] });
        setLoading(true);
        // Validate input data
        const errorMessages: string[] = [];
        if (accountNumber.length !== 7 || !/^\d{7}$/.test(accountNumber)) {
            errorMessages.push("口座番号は7桁の数字で入力してください.");
        }
        if (accountHolder.length === 0) {
            errorMessages.push("口座名義を入力してください.");
        }
        if (!/^\S+\s+\S+/.test(accountHolder.trim())) {
            errorMessages.push("口座名義はスペースで区切って入力してください.");
        }
        if (
            userBank &&
            userBank.account_number === accountNumber &&
            userBank.account_holder_name === accountHolder &&
            userBank.account_type === parseInt(accountType) &&
            userBank.bank_code === bank_code &&
            userBank.branch_code === branch_code
        ) {
            errorMessages.push("すでに登録されている口座情報です.");
        }

        if (errorMessages.length > 0) {
            setError({ show: true, messages: errorMessages });
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const submitData: BankSettingSubmitData = {
            bank: bank,
            branch: branch,
            account_type: parseInt(accountType),
            account_number: accountNumber,
            account_holder: accountHolder,
        };

        submitBankSetting(submitData);

    };
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 px-6 pt-10 pb-24">
                {/* Title */}
                <h1 className="text-lg font-semibold mb-4">口座情報</h1>

                {error.show && (
                    <div className="mb-4">
                        <ErrorMessage message={error.messages} variant="error" />
                    </div>
                )}

                <form onSubmit={handleBankSettingSubmit} className="space-y-6">
                    {/* 銀行名 */}
                    <div className="border-b border-gray-200 pb-6">
                        <label className="block text-sm font-medium mb-2">銀行名</label>
                        <Input
                            type="text"
                            placeholder="銀行名"
                            className="rounded-lg bg-gray-100 border-none text-base md:text-sm"
                            value={loading ? "銀行名を取得中..." : bank?.name}
                            disabled
                        />
                    </div>

                    {/* 支店名 */}
                    <div className="border-b border-gray-200 pb-6">
                        <label className="block text-sm font-medium mb-2">支店名</label>
                        <Input
                            type="text"
                            placeholder="支店名"
                            className="rounded-lg bg-gray-100 border-none text-base md:text-sm"
                            value={loading ? "支店名を取得中..." : branch?.name}
                            disabled
                        />
                    </div>

                    {/* 口座種別 */}
                    <div className="border-b border-gray-200 pb-6 flex items-center justify-between gap-4">
                        <label className="block text-sm font-medium">口座種別</label>
                        <select
                            className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value as "1" | "2")}
                        >
                            <option value="1">普通</option>
                            <option value="2">当座</option>
                        </select>
                    </div>

                    {/* 口座番号 */}
                    <div className="border-b border-gray-200 pb-6">
                        <label className="block text-sm font-medium mb-2">口座番号</label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={7}
                            placeholder="0000000"
                            className="rounded-lg bg-gray-100 border-none text-base md:text-sm"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                        />
                    </div>

                    {/* 口座名義 */}
                    <div className="border-b border-gray-200 pb-6">
                        <label className="block text-sm font-medium mb-2">口座名義</label>
                        <Input
                            type="text"
                            placeholder="ヤマダ　タロウ"
                            className="rounded-lg bg-gray-100 border-none text-base md:text-sm"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                        />
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="default"
                            className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-base font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !bank || !branch || !accountNumber || !accountHolder}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                </div>
                            ) : (
                                "口座を登録"
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* bottom nav */}
            <BottomNavigation />
        </div>
    );
};
