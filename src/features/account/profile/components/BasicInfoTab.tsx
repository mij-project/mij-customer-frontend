import React, { useRef, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ProfileData } from '../types';
import ErrorMessage from '@/components/common/ErrorMessage';
import { NG_WORDS } from '@/constants/ng_word';

interface BasicInfoTabProps {
  profileData: ProfileData;
  onInputChange: (field: keyof ProfileData, value: any) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function BasicInfoTab({
  profileData,
  onInputChange,
  onSubmit,
  submitting,
}: BasicInfoTabProps) {
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_DESCRIPTION_LENGTH = 1500;
  
  // 氏名のNGワードチェック
  const detectedNgWordsInName = useMemo(() => {
    if (!profileData.name) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.name.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.name]);
  
  // ユーザーネームのNGワードチェック
  const detectedNgWordsInId = useMemo(() => {
    if (!profileData.id) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.id.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.id]);
  
  // 自己紹介のNGワードチェック
  const detectedNgWordsInDescription = useMemo(() => {
    if (!profileData.description) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.description.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.description]);
  
  // TwitterのNGワードチェック
  const detectedNgWordsInTwitter = useMemo(() => {
    if (!profileData.links.twitter) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.links.twitter.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.links.twitter]);
  
  // InstagramのNGワードチェック
  const detectedNgWordsInInstagram = useMemo(() => {
    if (!profileData.links.instagram) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.links.instagram.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.links.instagram]);
  
  // TikTokのNGワードチェック
  const detectedNgWordsInTiktok = useMemo(() => {
    if (!profileData.links.tiktok) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.links.tiktok.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.links.tiktok]);
  
  // YouTubeのNGワードチェック
  const detectedNgWordsInYoutube = useMemo(() => {
    if (!profileData.links.youtube) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.links.youtube.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.links.youtube]);
  
  // ウェブサイト1のNGワードチェック
  const detectedNgWordsInWebsite = useMemo(() => {
    if (!profileData.links.website) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.links.website.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.links.website]);
  
  // ウェブサイト2のNGワードチェック
  const detectedNgWordsInWebsite2 = useMemo(() => {
    if (!profileData.links.website2) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (profileData.links.website2.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [profileData.links.website2]);
  
  // 自己紹介のテキストエリアの高さを自動調整
  useEffect(() => {
    if (descriptionTextareaRef.current) {
      descriptionTextareaRef.current.style.height = 'auto';
      descriptionTextareaRef.current.style.height = `${descriptionTextareaRef.current.scrollHeight}px`;
    }
  }, [profileData.description]);
  
  const hasNgWords = 
    detectedNgWordsInName.length > 0 || 
    detectedNgWordsInId.length > 0 || 
    detectedNgWordsInDescription.length > 0 ||
    detectedNgWordsInTwitter.length > 0 ||
    detectedNgWordsInInstagram.length > 0 ||
    detectedNgWordsInTiktok.length > 0 ||
    detectedNgWordsInYoutube.length > 0 ||
    detectedNgWordsInWebsite.length > 0 ||
    detectedNgWordsInWebsite2.length > 0;
  
  const handleLinkChange = (linkKey: string, value: string) => {
    onInputChange('links', {
      ...profileData.links,
      [linkKey]: value,
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 氏名 */}
      <div>
        <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="text-red-500">*</span> 氏名
        </Label>
        <Input
          type="text"
          id="name"
          value={profileData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className="w-full"
          required
        />
        {detectedNgWordsInName.length > 0 && (
          <div className="mt-2">
            <ErrorMessage
              message={[
                `NGワードが検出されました: ${detectedNgWordsInName.join('、')}`,
                `検出されたNGワード数: ${detectedNgWordsInName.length}個`,
              ]}
              variant="error"
            />
          </div>
        )}
      </div>

      {/* ユーザーネーム */}
      <div>
        <Label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="text-red-500">*</span> ユーザーネーム
        </Label>
        <Input
          type="text"
          id="id"
          value={profileData.id}
          onChange={(e) => onInputChange('id', e.target.value)}
          className="w-full"
          required
        />
        {detectedNgWordsInId.length > 0 && (
          <div className="mt-2">
            <ErrorMessage
              message={[
                `NGワードが検出されました: ${detectedNgWordsInId.join('、')}`,
                `検出されたNGワード数: ${detectedNgWordsInId.length}個`,
              ]}
              variant="error"
            />
          </div>
        )}
      </div>

      {/* 自己紹介 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
            自己紹介
          </Label>
          <span className="text-xs text-gray-500">
            {profileData.description.length} / {MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        <Textarea
          ref={descriptionTextareaRef}
          id="description"
          value={profileData.description}
          onChange={(e) => {
            const value = e.target.value;
            // 最大文字数を超えないようにする
            if (value.length <= MAX_DESCRIPTION_LENGTH) {
              onInputChange('description', value);
            }
          }}
          rows={3}
          className="w-full resize-none border border-gray-300 focus:outline-none focus:ring-0 focus:border-primary focus:border-2 shadow-none overflow-hidden min-h-[80px]"
          placeholder="自己紹介文を入力"
        />
        {detectedNgWordsInDescription.length > 0 && (
          <div className="mt-2">
            <ErrorMessage
              message={[
                `NGワードが検出されました: ${detectedNgWordsInDescription.join('、')}`,
                `検出されたNGワード数: ${detectedNgWordsInDescription.length}個`,
              ]}
              variant="error"
            />
          </div>
        )}
      </div>

      {/* SNS・ウェブサイト */}
      <div className="space-y-4">
        <Label className="block text-sm font-medium text-gray-700">SNS・ウェブサイト</Label>

        {/* X (Twitter) */}
        <div>
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm text-gray-600">(旧 Twitter)</span>
          </div>
          <Input
            type="text"
            value={profileData.links.twitter || ''}
            onChange={(e) => handleLinkChange('twitter', e.target.value)}
            className="w-full"
            placeholder="@アカウント名"
          />
          {detectedNgWordsInTwitter.length > 0 && (
            <div className="mt-2">
              <ErrorMessage
                message={[
                  `NGワードが検出されました: ${detectedNgWordsInTwitter.join('、')}`,
                  `検出されたNGワード数: ${detectedNgWordsInTwitter.length}個`,
                ]}
                variant="error"
              />
            </div>
          )}
        </div>

        {/* Instagram */}
        <div>
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="text-sm text-gray-600">Instagram</span>
          </div>
          <Input
            type="text"
            value={profileData.links.instagram || ''}
            onChange={(e) => handleLinkChange('instagram', e.target.value)}
            className="w-full"
            placeholder="@アカウント名"
          />
          {detectedNgWordsInInstagram.length > 0 && (
            <div className="mt-2">
              <ErrorMessage
                message={[
                  `NGワードが検出されました: ${detectedNgWordsInInstagram.join('、')}`,
                  `検出されたNGワード数: ${detectedNgWordsInInstagram.length}個`,
                ]}
                variant="error"
              />
            </div>
          )}
        </div>

        {/* TikTok */}
        <div>
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
            </svg>
            <span className="text-sm text-gray-600">TikTok</span>
          </div>
          <Input
            type="text"
            value={profileData.links.tiktok || ''}
            onChange={(e) => handleLinkChange('tiktok', e.target.value)}
            className="w-full"
            placeholder="@アカウント名"
          />
          {detectedNgWordsInTiktok.length > 0 && (
            <div className="mt-2">
              <ErrorMessage
                message={[
                  `NGワードが検出されました: ${detectedNgWordsInTiktok.join('、')}`,
                  `検出されたNGワード数: ${detectedNgWordsInTiktok.length}個`,
                ]}
                variant="error"
              />
            </div>
          )}
        </div>

        {/* YouTube */}
        <div>
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="text-sm text-gray-600">YouTube</span>
          </div>
          <Input
            type="text"
            value={profileData.links.youtube || ''}
            onChange={(e) => handleLinkChange('youtube', e.target.value)}
            className="w-full"
            placeholder="@アカウント名"
          />
          {detectedNgWordsInYoutube.length > 0 && (
            <div className="mt-2">
              <ErrorMessage
                message={[
                  `NGワードが検出されました: ${detectedNgWordsInYoutube.join('、')}`,
                  `検出されたNGワード数: ${detectedNgWordsInYoutube.length}個`,
                ]}
                variant="error"
              />
            </div>
          )}
        </div>

        {/* ウェブサイト1 */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600">ウェブサイト 1</span>
          </div>
          <Input
            type="url"
            value={profileData.links.website || ''}
            onChange={(e) => handleLinkChange('website', e.target.value)}
            className="w-full"
            placeholder="https://your.blog.com/"
          />
          {detectedNgWordsInWebsite.length > 0 && (
            <div className="mt-2">
              <ErrorMessage
                message={[
                  `NGワードが検出されました: ${detectedNgWordsInWebsite.join('、')}`,
                  `検出されたNGワード数: ${detectedNgWordsInWebsite.length}個`,
                ]}
                variant="error"
              />
            </div>
          )}
        </div>

        {/* ウェブサイト2 */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600">ウェブサイト 2</span>
          </div>
          <Input
            type="url"
            value={profileData.links.website2 || ''}
            onChange={(e) => handleLinkChange('website2', e.target.value)}
            className="w-full"
            placeholder="https://your-homepage.com/"
          />
          {detectedNgWordsInWebsite2.length > 0 && (
            <div className="mt-2">
              <ErrorMessage
                message={[
                  `NGワードが検出されました: ${detectedNgWordsInWebsite2.join('、')}`,
                  `検出されたNGワード数: ${detectedNgWordsInWebsite2.length}個`,
                ]}
                variant="error"
              />
            </div>
          )}
        </div>
      </div>

      {/* 更新ボタン */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        <Button
          onClick={onSubmit}
          disabled={submitting || hasNgWords}
          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full text-base font-medium"
        >
          {submitting ? '更新中...' : '更新'}
        </Button>
      </div>
    </div>
  );
}
