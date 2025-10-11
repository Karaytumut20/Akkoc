'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import FloatingLabelInput from '@/components/ui/FloatingLabelInput';

export default function AuthPage() {
  const { signIn, signUp } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password, 'customer');
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </h2>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <FloatingLabelInput
            id="email"
            name="email"
            type="email"
            label="E-posta Adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <FloatingLabelInput
            id="password"
            name="password"
            type="password"
            label="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
          >
            {loading ? 'İşlem yapılıyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          {isLogin ? 'Hesabınız yok mu?' : 'Zaten bir hesabınız var mı?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 font-medium text-orange-600 hover:text-orange-500"
          >
            {isLogin ? 'Kayıt Olun' : 'Giriş Yapın'}
          </button>
        </p>
      </div>
    </div>
  );
}