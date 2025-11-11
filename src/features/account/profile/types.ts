export interface ProfileData {
  coverImage: string;
  avatar: string;
  name: string;
  id: string;
  description: string;
  links: {
    website?: string;
    website2?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

export interface ProfileFormSectionProps {
  profileData: ProfileData;
  onInputChange: (field: keyof ProfileData | 'links', value: string | ProfileData['links']) => void;
}

export interface AccountEditHeaderSectionProps {
  loading: boolean;
  onSave: () => void;
}

export interface MessageSectionProps {
  message: string | null;
}

export interface ImageUploadTabProps {
  imageType: 'avatar' | 'cover';
  currentImage: string | null;
  file: File | null;
  progress: number;
  submitting: boolean;
  onFileSelect: (file: File | null) => void;
  onSubmit: () => void;
}

export type TabType = 'basic' | 'avatar' | 'cover';

// 旧FileUploadSection用の型定義（互換性維持のため）
export interface FileUploadSectionProps {
  uploadedFiles: any[];
  files: any;
  progress: any;
  submitting: boolean;
  inputRefs: any;
  onPick: any;
  openPicker: any;
}
