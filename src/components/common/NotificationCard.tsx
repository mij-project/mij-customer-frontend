import { getImageUrl } from '@/lib/media';
import { Dot, Inbox } from 'lucide-react';

interface NotificationCardProps {
  id: string;
  title: string;
  avatarUrl?: string;
  subtitle?: string;
  date: string; // "01/22"
  time: string; // "15:00"
  is_read?: boolean;
  onClick?: () => void;
  is_empty?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  title,
  avatarUrl,
  date,
  time,
  subtitle,
  is_read = false,
  onClick,
  is_empty = false,
}) => {
  if (is_empty) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 pt-16 pb-16">
        <div className="flex items-center justify-center">
          <Inbox className="w-8 h-8 text-desc text-gray-500" />
        </div>
        <p className="text-sm text-desc text-gray-500">通知がありません</p>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-4 py-[11px]"
      onClick={onClick}
    >
      <span className="relative inline-flex">
        <div className="h-10 w-10 rounded-full overflow-hidden">
          <img
            src={avatarUrl ? getImageUrl(avatarUrl) : "/assets/notification.svg"}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </span>

      <div className="line-clamp-2 flex-1 text-sm font-light text-black">
        {title}
        {
          subtitle && (
            <div className="text-[8px] text-desc">{subtitle}</div>
          )
        }
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-col items-end">
          <div className="text-[10px] text-desc">{date}</div>
          <div className="text-[10px] text-desc">{time}</div>
        </div>
      </div>
      {
        !is_read && (
          <span className="">
            <Dot className="w-8 h-8 text-red-500" />
          </span>
        )
      }
    </div>
  );
};
