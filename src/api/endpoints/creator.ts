import apiClient from '@/api/axios';
import {
  CreatorGenreCreate,
  CreatorUpdate,
  CreatorOut,
  IdentityVerificationCreate,
  IdentityVerificationOut,
  IdentityDocumentCreate,
  IdentityDocumentOut,
} from '@/api/types/creator';

export const registerCreator = async (genders: string[]): Promise<any> => {
  const response = await apiClient.post(`/gender/`, {
    slug: genders,
  });
  return response.data;
};

export const updateCreatorProfile = async (
  creatorData: CreatorUpdate,
  userId: string
): Promise<CreatorOut> => {
  const response = await apiClient.put(`/creators/profile?user_id=${userId}`, creatorData);
  return response.data;
};

export const getCreatorProfile = async (userId: string): Promise<CreatorOut> => {
  const response = await apiClient.get(`/creators/profile?user_id=${userId}`);
  return response.data;
};

export const submitIdentityVerification = async (
  verificationData: IdentityVerificationCreate
): Promise<IdentityVerificationOut> => {
  const response = await apiClient.post('/creators/identity-verification', verificationData);
  return response.data;
};

export const getVerificationStatus = async (userId: string): Promise<IdentityVerificationOut> => {
  const response = await apiClient.get(`/creators/verification-status?user_id=${userId}`);
  return response.data;
};

export const uploadIdentityDocument = async (
  documentData: IdentityDocumentCreate
): Promise<IdentityDocumentOut> => {
  const response = await apiClient.post('/creators/identity-documents', documentData);
  return response.data;
};

export const getCreatorList = async (): Promise<CreatorOut> => {
  const response = await apiClient.get('/creators/list');
  return response.data;
};
