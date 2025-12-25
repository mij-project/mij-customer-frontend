// src/hooks/useConversationWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageResponse, WSMessage, WSSendMessage } from '@/api/types/conversation';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

interface UseConversationWebSocketReturn {
  messages: MessageResponse[];
  sendMessage: (text: string) => void;
  markAsRead: (messageId: string) => void;
  isConnected: boolean;
  error: string | null;
}

export const useConversationWebSocket = (conversationId: string): UseConversationWebSocketReturn => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket接続を確立
  const connect = useCallback(() => {
    if (!conversationId) {
      setError('Conversation ID is required');
      return;
    }

    try {
      // WebSocket接続（Cookieは自動的に送信される）
      const ws = new WebSocket(`${WS_BASE_URL}/ws/conversations/${conversationId}`);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data: WSMessage = JSON.parse(event.data);

          if (data.type === 'new_message' && data.message) {
            // 新しいメッセージを受信
            setMessages((prev) => [...prev, data.message as MessageResponse]);
          } else if (data.type === 'connected') {
            console.log('✅ Connection confirmed');
          } else if (data.type === 'read_confirmed') {
            console.log('✅ Message marked as read');
          } else if (data.type === 'error') {
            console.error('❌ WebSocket error message:', data.message);
            setError(data.message as string);
          } else if (data.type === 'pong') {
            // Pong response - keep alive
          }
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err, 'Raw data:', event.data);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ WebSocket error event:', event);
        console.error('WebSocket readyState:', ws.readyState);
        console.error('WebSocket URL:', ws.url);
        setError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);

        // 自動再接続（5秒後）
        if (event.code !== 1000) {
          // 正常終了以外の場合
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to connect');
    }
  }, [conversationId]);

  // メッセージ送信
  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket is not connected');
      return;
    }

    const message: WSSendMessage = {
      type: 'message',
      body_text: text,
    };

    wsRef.current.send(JSON.stringify(message));
  }, []);

  // メッセージを既読にする
  const markAsRead = useCallback((messageId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WSSendMessage = {
      type: 'mark_read',
      message_id: messageId,
    };

    wsRef.current.send(JSON.stringify(message));
  }, []);

  // コンポーネントマウント時に接続
  useEffect(() => {
    connect();

    // クリーンアップ
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect]);

  // Ping/Pong for keep-alive (30秒ごと)
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const ping: WSSendMessage = { type: 'ping' };
        wsRef.current.send(JSON.stringify(ping));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    messages,
    sendMessage,
    markAsRead,
    isConnected,
    error,
  };
};
