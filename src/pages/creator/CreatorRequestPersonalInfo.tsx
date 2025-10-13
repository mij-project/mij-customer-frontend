import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, Calendar, MapPin } from 'lucide-react';
import VerificationLayout from '@/features/auth/VerificationLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { getGenders } from '@/api/endpoints/gender';
import { GenderOut } from '@/api/types/gender';
import { registerCreator } from '@/api/endpoints/creator';

interface PersonalInfo {
  name: string;
  first_name_kana: string;
  last_name_kana: string;
  birth_date: string;
  address: string;
  phone_number: string;
  gender_slug: string[];
}

interface CreatorRequestPersonalInfoProps {
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    title: string;
    completed: boolean;
    current: boolean;
  }>;
}

export default function CreatorRequestPersonalInfo({ onNext, onBack, currentStep, totalSteps, steps }: CreatorRequestPersonalInfoProps) {

  const [gender_slug, setContent] = useState<string[]>([]);
  const [genders, setGenders] = useState<GenderOut[]>([]);
  const [formData, setFormData] = useState<PersonalInfo>({
    name: '',
    first_name_kana: '',
    last_name_kana: '',
    birth_date: '',
    address: '',
    phone_number: '',
    gender_slug: []
  });

  useEffect(() => {
    const fetchGenders = async () => {
      const genders = await getGenders();
      setGenders(genders);
    };
    fetchGenders();

  }, []);

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (value: string, checked: boolean) => {
    setFormData(prev => {
      const currentContent = prev.gender_slug || [];
      if (checked) {
        // チェックされた場合、配列に追加（重複を避ける）
        if (!currentContent.includes(value)) {
          return {
            ...prev,
            gender_slug: [...currentContent, value]
          };
        }
      } else { 
        // チェックが外された場合、配列から削除
        return {
          ...prev,
          gender_slug: currentContent.filter(item => item !== value)
        };
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    if (!formData.name || !formData.first_name_kana || !formData.last_name_kana || !formData.birth_date || !formData.phone_number || !formData.gender_slug || formData.gender_slug.length === 0) {
      alert('必須項目をすべて入力してください');
      return;
    }

    await registerCreator(formData).then(() => {
      console.log("registerCreator success");
      onNext();
    }).catch((error) => {
      alert('登録に失敗しました');
      console.error(error);
    });
  };

  return (
    <VerificationLayout currentStep={currentStep} totalSteps={totalSteps} steps={steps}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary rounded-full">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            個人情報入力
          </h2>
          <p className="text-sm text-gray-600">
            クリエイター登録に必要な個人情報を入力してください
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              氏名 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="山田太郎"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name_kana" className="block text-sm font-medium text-gray-700 mb-2">
                姓（カナ） <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="first_name_kana"
                value={formData.first_name_kana}
                onChange={(e) => handleInputChange('first_name_kana', e.target.value)}
                placeholder="ヤマダ"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <Label htmlFor="last_name_kana" className="block text-sm font-medium text-gray-700 mb-2">
                名（カナ） <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="last_name_kana"
                value={formData.last_name_kana}
                onChange={(e) => handleInputChange('last_name_kana', e.target.value)}
                placeholder="タロウ"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
              生年月日 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="date"
                id="birth_date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
              電話番号 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="tel"
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="090-1234-5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              住所
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="東京都渋谷区..."
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender_slug" className="block text-sm font-medium text-gray-700 mb-2">
              投稿内容について
            </Label>
            <div className="flex flex-col space-y-4">
              {genders.map((gender) => (
                <div key={gender.slug} className="flex items-center space-x-2 border border-gray-300 rounded-md p-4">
                  <Checkbox
                    id={gender.slug}
                    checked={formData.gender_slug.includes(gender.slug)}
                    onCheckedChange={(checked) => handleContentChange(gender.slug, checked as boolean)}
                  />
                  <Label htmlFor={gender.slug} className="text-md text-gray-700">{gender.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>




        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">個人情報の取り扱いについて</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 入力された情報は本人確認のためにのみ使用されます</li>
            <li>• 個人情報は適切に保護され、第三者に提供されることはありません</li>
            <li>• 必須項目は正確に入力してください</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">個人情報の取り扱いについて</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 入力された情報は本人確認のためにのみ使用されます</li>
            <li>• 個人情報は適切に保護され、第三者に提供されることはありません</li>
            <li>• 必須項目は正確に入力してください</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            戻る
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
          >
            次へ
          </Button>
        </div>
      </div>
    </VerificationLayout>
  );
}

