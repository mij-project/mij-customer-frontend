import apiClient from '@/api/axios';
import { BankSettingSubmitData } from '@/api/types/user_banks';

export const getUserBankDefaultInformation = async () => {
    const response = await apiClient.get('/user-banks/default');
    return response;
};

export const getExternalBanks = async (search: string) => {
    const response = await apiClient.get(`/user-banks/banks-external`, {
        params: {
            search: search,
            type: 1
        }
    });
    return response;
};

export const getExternalBranchesByBankCodeWithSearch = async (bank_code: string, search: string) => {
    const response = await apiClient.get(`/user-banks/banks-external`, {
        params: {
            bank_code: bank_code,
            search: search,
            type: 2
        }
    });
    return response;
};

export const getExternalBranchesByBankCodeWithBranchCode = async (bank_code: string, branch_code: string) => {
    const response = await apiClient.get(`/user-banks/banks-external`, {
        params: {
            bank_code: bank_code,
            branch_code: branch_code,
            type: 2
        }
    });
    return response;
};

export const submitBankSettingDefault = async (submitData: BankSettingSubmitData) => {
    const response = await apiClient.post('/user-banks/setting-default', submitData);
    return response;
};