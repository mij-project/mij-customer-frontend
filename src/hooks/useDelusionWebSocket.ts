// src/hooks/useDelusionWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageResponse, WSMessage, WSSendMessage } from '@/api/types/conversation';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

interface UseDelusionWebSocketReturn {
  messages: MessageResponse[];
  sendMessage: (text: string) => void;
  isConnected: boolean;
  error: string | null;
}

export const useDelusionWebSocket = (): UseDelusionWebSocketReturn => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket接続を確立
  const connect = useCallback(() => {
    try {
      // WebSocket接続（Cookieは自動的に送信される）
      const ws = new WebSocket(`${WS_BASE_URL}/ws/conversations/delusion`);

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
            console.log('🔗 Connected to conversation:', data.conversation_id);
          } else if (data.type === 'error') {
            console.error('❌ WebSocket error message:', data.message);
            setError(data.message as string);
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
        console.log(
          '🔌 WebSocket closed - Code:',
          event.code,
          'Reason:',
          event.reason,
          'Clean:',
          event.wasClean
        );
        setIsConnected(false);

        // 自動再接続（5秒後）
        if (event.code !== 1000) {
          // 正常終了以外の場合
          console.log('🔄 Scheduling reconnection in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to connect');
    }
  }, []);

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
    isConnected,
    error,
  };
};
