import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useLocation, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft } from 'lucide-react';

interface Notification {
  id: string;
  type: number;
  is_read?: boolean;
  payload: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function NotificationDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const notification = state?.notification;
  return (
    <div className="bg-white min-h-screen">
      {/* <Header /> */}

      <div className="max-w-md mx-auto pb-20">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center flex-inline sapce-x-4">
            <div className="flex items-center cursor-pointer" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 text-gray-500 cursor-pointer" />
            </div>
            <h1 className="pl-4 text-xl font-semibold text-gray-900">お知らせ</h1>
          </div>
        </div>
        {/* Content */}
        <div
          className="bg-white space-y-4 px-4 py-4
          [&_ul]:list-disc [&_ul]:ml-6
          [&_ol]:list-decimal [&_ol]:ml-6
          [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800"
        >
          <Markdown rehypePlugins={[rehypeRaw]}>{notification.payload.message}</Markdown>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
