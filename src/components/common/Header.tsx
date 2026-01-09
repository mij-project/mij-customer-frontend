import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Bell, Dot, MessageCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import AuthDialog from "@/components/auth/AuthDialog";
import { getNotificationUnreadCount } from "@/api/endpoints/notifications";
import { getConversationUnreadCount } from "@/api/endpoints/conversation";
import LanguageSelect from "@/components/common/LanguageSelect";

export default function Header() {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [notification, setNotification] = useState(false);
  const [unreadMessage, setUnreadMessage] = useState(false);

  const navigate = useNavigate();

  const fetchNotificationUnreadCount = async () => {
    try {
      const response = await getNotificationUnreadCount();
      setNotification(
        response.data.admin > 0 || response.data.users > 0 || response.data.payments > 0
      );
    } catch (error) {
      console.error("Failed to fetch notification unread count:", error);
    }
  };

  const fetchConversationUnreadCount = async () => {
    try {
      const response = await getConversationUnreadCount();
      setUnreadMessage(response.data.unread_count > 0);
    } catch (error) {
      console.error("Failed to fetch conversation unread count:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotificationUnreadCount();
    fetchConversationUnreadCount();

    const intervalId = window.setInterval(() => {
      fetchNotificationUnreadCount();
      fetchConversationUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleBellClick = () => {
    if (user) navigate("/notifications");
    else setShowAuthDialog(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      {/* mobile full width; desktop mới max width + center */}
      <div className="w-full px-4 sm:px-6 lg:px-8 lg:max-w-7xl lg:mx-auto">
        <div className="flex items-center h-16">
          <div
            className="text-2xl font-bold text-primary cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            mijfans
          </div>

          <div className="ml-auto flex items-center gap-1 flex-nowrap min-w-0">
            <LanguageSelect />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/search")}
              className="shrink-0"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/message/conversation-list")}
              className="relative shrink-0"
            >
              <MessageCircle className="h-5 w-5" />
              {unreadMessage && <Dot className="absolute top-0 right-0 text-red-500" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBellClick}
              className="relative shrink-0"
            >
              <Bell className="h-5 w-5" />
              {notification && <Dot className="absolute top-0 right-0 text-red-500" />}
            </Button>
          </div>
        </div>
      </div>

      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </header>
  );
}
