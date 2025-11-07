export interface SmsVerificationCreate {
  phone_e164: string;
  purpose: number;
}

export interface SmsVerificationVerify {
  phone_e164: string;
  code: string;
  purpose: number;
}
