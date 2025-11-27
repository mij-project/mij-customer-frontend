import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthCallback() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      // codeが無い場合はトップへ戻す
      window.location.replace('/');
      return;
    }
    // サーバー側に“画面遷移”で渡す（302 + Set-Cookie を確実に反映させるため）
    const url = `${API_URL}/auth/callback?code=${encodeURIComponent(code)}`;
    window.location.href = url;
  }, []);

  return <div className="p-6 text-center">Signing you in…</div>;
}
