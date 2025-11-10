import { AccountFileKind } from '@/constants/constants';

export interface AccountEditHeaderSectionProps {
  loading: boolean;
  onSave: () => void;
}

export interface AccountUploadedFile {
  id: string;
  name: string;
  type: AccountFileKind;
  uploaded: boolean;
}

export interface FileUploadSectionProps {
  uploadedFiles: AccountUploadedFile[];
  files: Record<AccountFileKind, File | null>;
  progress: Record<AccountFileKind, number>;
  submitting: boolean;
  inputRefs: Record<AccountFileKind, React.RefObject<HTMLInputElement>>;
  onPick: (kind: AccountFileKind) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  openPicker: (kind: AccountFileKind) => void;
}

export interface MessageSectionProps {
  message: string;
}

export interface ProfileData {
  name: string;
  id: string;
  description: string;
  links: Record<string, string>;
}

export interface ProfileFormSectionProps {
  profileData: ProfileData;
  onInputChange: (field: keyof ProfileData, value: string) => void;
}
