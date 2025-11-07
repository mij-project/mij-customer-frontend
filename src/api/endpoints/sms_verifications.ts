import apiClient from '@/api/axios';
import { SmsVerificationCreate, SmsVerificationVerify } from '@/api/types/sms_verifications';

export const createSmsVerification = async (request: SmsVerificationCreate) => {
  const { data } = await apiClient.post('/sms-verifications/send', request);
  return data;
};

export const verifySmsVerification = async (request: SmsVerificationVerify) => {
  const { data } = await apiClient.post('/sms-verifications/verify', request);
  return data;
};
