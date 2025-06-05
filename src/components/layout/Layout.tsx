import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  CommandLineIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { path: '/', name: 'Dashboard', icon: HomeIcon },
  { path: '/users', name: 'ผู้ใช้งาน', icon: UsersIcon },
  { path: '/credits', name: 'จัดการเครดิต', icon: CreditCardIcon },
  { path: '/commands', name: 'คำสั่งบอท', icon: CommandLineIcon },
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { admin, logout } = useAuth();

  return (
    <div className="flex h-screen bg-dark-50 text-dark-800 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed md:relative z-20 w-64 h-full glass-effect"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-4 md:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                    Bot Line Admin
                  </h1>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 md:hidden hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-2 md:p-4">
                <ul className="space-y-1 md:space-y-2">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 text-sm md:text-base
                            ${isActive 
                              ? 'bg-primary-500/20 text-primary-400 neon-glow' 
                              : 'hover:bg-white/5 hover:text-primary-400'
                            }
                          `}
                        >
                          <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="hidden sm:inline">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* User Info */}
              <div className="p-2 md:p-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-primary-400 to-purple-400 flex items-center justify-center">
                      <span className="text-white font-bold text-sm md:text-base">
                        {admin?.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs md:text-sm font-medium">{admin?.name}</p>
                      <p className="text-xs text-dark-500">{admin?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="ออกจากระบบ"
                  >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4 md:w-5 md:h-5 text-dark-500" />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="glass-effect border-b border-white/10 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:block text-sm text-dark-500">
                {new Date().toLocaleDateString('th-TH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="md:hidden text-xs text-dark-500">
                {new Date().toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 md:p-6 cyber-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 