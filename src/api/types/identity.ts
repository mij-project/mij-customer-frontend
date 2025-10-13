import { FileSpec } from "./commons";
import { IdentityFileKind } from "@/constants/constants";

export interface IdentityUploadedFile {
  id: string;
  name: string;
  type: IdentityFileKind;
  uploaded: boolean;
}

export interface CreatorRequestCertifierImageProps {
  onNext?: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  steps?: Array<{
    id: number;
    title: string;
    completed: boolean;
    current: boolean;
  }>;
}

/** 🔧 ファイルごとに content_type / ext を持たせる */
export interface PresignedUrlFileSpec {
  kind: IdentityFileKind;
  content_type: FileSpec['content_type'];
  ext: FileSpec['ext'];
}

export interface IdentityPresignedUrlRequest {
  files: PresignedUrlFileSpec[];
}

/** 受け取り型（便利なので定義しておく） */
export interface PresignUploadResponse {
  verification_id: string;
  uploads: {
    [K in IdentityFileKind]: {
      key: string;
      upload_url: string;
      required_headers: Record<string, string>;
      expires_in: number;
    };
  };
	headers: Record<string, string>;
}


/** presign結果の1件分（required_headers をそのまま送る前提） */
export type PresignedUploadItem = {
  upload_url: string;
  required_headers: Record<string, string>;
  expires_in: number;
  key: string;
};


export interface CompleteFile {
  kind: IdentityFileKind;
  ext: FileSpec['ext'];
}