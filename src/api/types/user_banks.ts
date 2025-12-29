export interface BankAccount {
  account_holder_name: string;
  account_holder_name_kana: string | null;
  account_number: string;
  account_type: number;
  bank_code: string;
  bank_name: string;
  bank_name_kana: string;
  branch_code: string;
  branch_name: string;
  branch_name_kana: string;
  created_at: string;
  id: string;
  updated_at: string;
}

export interface ExternalBank {
  businessType: string;
  businessTypeCode: string;
  code: string;
  fullWidthKana: string;
  halfWidthKana: string;
  hiragana: string;
  name: string;
}

export interface ExternalBranch {
  code: string;
  name: string;
  halfWidthKana: string;
  fullWidthKana: string;
  hiragana: string;
}

export interface BankSettingSubmitData {
  bank: ExternalBank;
  branch: ExternalBranch;
  account_type: number;
  account_number: string;
  account_holder: string;
}
