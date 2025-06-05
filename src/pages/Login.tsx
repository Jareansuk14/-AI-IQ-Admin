import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 cyber-grid p-3 md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm md:max-w-md relative"
      >
        <div className="glass-effect rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6 md:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 mb-3 md:mb-4"
            >
              <LockClosedIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Bot Line Admin
            </h2>
            <p className="text-dark-500 mt-2 text-sm md:text-base">เข้าสู่ระบบเพื่อจัดการระบบ</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 md:h-5 md:w-5 text-dark-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-3 py-2.5 md:py-3 bg-dark-100 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm md:text-base"
                  placeholder="กรอกชื่อผู้ใช้"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 md:h-5 md:w-5 text-dark-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-3 py-2.5 md:py-3 bg-dark-100 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm md:text-base"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-2.5 md:py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm md:text-base
                ${isLoading
                  ? 'bg-dark-300 text-dark-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-0.5 active:scale-95'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-5 -left-5 w-16 h-16 md:w-20 md:h-20 bg-primary-500/20 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute -bottom-5 -right-5 w-20 h-20 md:w-32 md:h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow"></div>
      </motion.div>
    </div>
  );
};

export default Login; 