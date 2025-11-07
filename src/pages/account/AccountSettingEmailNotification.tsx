import { useState } from 'react';
import AccountHeader from '@/features/account/component/AccountHeader';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AccountSettingEmailNotification() {
  const [message, setMessage] = useState(false);
  const [planJoin, setPlanJoin] = useState(false);
  const [planCancel, setPlanCancel] = useState(false);
  const [postBuy, setPostBuy] = useState(false);
  const [postComment, setPostComment] = useState(false);
  const [follow, setFollow] = useState(false);
  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader title="メール・通知設定" showBackButton={false} />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">メール・通知設定</h2>
          <p className="text-sm text-gray-600">メール・通知設定</p>
        </div>
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              メッセージ受信
            </Label>
            <Switch id="message" checked={message} onCheckedChange={setMessage} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="planJoin" className="text-sm font-medium text-gray-700">
              プラン加入時
            </Label>
            <Switch id="planJoin" checked={planJoin} onCheckedChange={setPlanJoin} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="planCancel" className="text-sm font-medium text-gray-700">
              プラン解約時
            </Label>
            <Switch id="planCancel" checked={planCancel} onCheckedChange={setPlanCancel} />
          </div>
          {/* <div className="flex items-center justify-between">
            <Label htmlFor="postBuy" className="text-sm font-medium text-gray-700">投稿購入時</Label>
            <Switch id="postBuy" checked={postBuy} onCheckedChange={setPostBuy} />
          </div> */}
          {/* <div className="flex items-center justify-between">
            <Label htmlFor="postComment" className="text-sm font-medium text-gray-700">投稿コメント時</Label>
            <Switch id="postComment" checked={postComment} onCheckedChange={setPostComment} />
          </div> */}
          {/* <div className="flex items-center justify-between">
            <Label htmlFor="follow" className="text-sm font-medium text-gray-700">フォローされた時</Label>
            <Switch id="follow" checked={follow} onCheckedChange={setFollow} />
          </div> */}
        </div>
      </div>
    </div>
  );
}
