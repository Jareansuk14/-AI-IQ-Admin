import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  UserIcon,
  CreditCardIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import api from '../services/api';
import { User, PaginatedResponse } from '../types';

const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [creditFilter, setCreditFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditReason, setCreditReason] = useState<string>('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', page, creditFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(creditFilter !== 'all' && { creditFilter }),
      });
      const response = await api.get(`/admin/users?${params}`);
      return {
        data: response.data.users,
        pagination: response.data.pagination,
      };
    },
  });

  const addCreditMutation = useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      const response = await api.post(`/admin/credits/add/${userId}`, {
        amount,
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreditModal(false);
      setCreditAmount(0);
      setCreditReason('');
    },
  });

  const handleCreditSubmit = () => {
    if (selectedUser && creditAmount !== 0) {
      addCreditMutation.mutate({
        userId: selectedUser._id,
        amount: creditAmount,
        reason: creditReason || (creditAmount > 0 ? 'เพิ่มเครดิตโดยแอดมิน' : 'หักเครดิตโดยแอดมิน'),
      });
    }
  };

  const openCreditModal = (user: User) => {
    setSelectedUser(user);
    setShowCreditModal(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            จัดการผู้ใช้
          </h1>
          <p className="text-dark-500 mt-1 md:mt-2 text-sm md:text-base">ข้อมูลผู้ใช้งานระบบทั้งหมด</p>
        </div>
        
        {/* Filter */}
        <div className="flex gap-2">
          <select
            value={creditFilter}
            onChange={(e) => setCreditFilter(e.target.value)}
            className="bg-dark-100 border border-dark-300 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
          >
            <option value="all">ทั้งหมด</option>
            <option value="no-credits">เครดิตหมด</option>
            <option value="low-credits">เครดิตน้อย (≤5)</option>
            <option value="high-credits">เครดิตเยอะ (&gt;50)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-dark-300">
              {data?.data.map((user) => (
                <motion.div
                  key={user._id}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-purple-400 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.displayName}</div>
                        <div className="text-xs text-dark-500 truncate max-w-[120px]">
                          {user.lineUserId}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${user.credits <= 0 ? 'bg-red-500/20 text-red-400' :
                        user.credits <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'}`}>
                      <CreditCardIcon className="w-3 h-3 mr-1" />
                      {user.credits}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-dark-500">
                    <span>การโต้ตอบ: {user.interactionCount}</span>
                    <span>
                      {user.lastInteraction 
                        ? format(new Date(user.lastInteraction), 'dd/MM/yyyy', { locale: th })
                        : 'ไม่มีข้อมูล'
                      }
                    </span>
                  </div>

                  <button
                    onClick={() => openCreditModal(user)}
                    className="w-full bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    จัดการเครดิต
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-100 border-b border-dark-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      ผู้ใช้
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Line ID
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-dark-500 uppercase tracking-wider">
                      เครดิต
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-dark-500 uppercase tracking-wider">
                      การโต้ตอบ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      ใช้งานล่าสุด
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-dark-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-300">
                  {data?.data.map((user) => (
                    <motion.tr
                      key={user._id}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-purple-400 flex items-center justify-center mr-3">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{user.displayName}</div>
                            <div className="text-xs text-dark-500">
                              {user.creditsUsed ? `ใช้ไป: ${user.creditsUsed}` : ''} 
                              {user.creditsReceived ? ` | ได้รับ: ${user.creditsReceived}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                        {user.lineUserId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${user.credits <= 0 ? 'bg-red-500/20 text-red-400' :
                            user.credits <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'}`}>
                          <CreditCardIcon className="w-4 h-4 mr-1" />
                          {user.credits}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {user.interactionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {user.lastInteraction 
                            ? format(new Date(user.lastInteraction), 'dd MMM yyyy HH:mm', { locale: th })
                            : 'ไม่มีข้อมูล'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => openCreditModal(user)}
                          className="bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          จัดการเครดิต
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.pages > 1 && (
              <div className="px-4 md:px-6 py-4 border-t border-dark-300 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
                <div className="text-xs md:text-sm text-dark-500 text-center sm:text-left">
                  แสดง {((page - 1) * 10) + 1} - {Math.min(page * 10, data.pagination.total)} จาก {data.pagination.total} รายการ
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 bg-dark-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-200 transition-colors text-sm"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="px-3 py-1 text-sm">
                    หน้า {page} จาก {data.pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.pages}
                    className="px-3 py-1 bg-dark-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-200 transition-colors text-sm"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Credit Modal */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-50 rounded-xl p-4 md:p-6 max-w-md w-full glass-effect"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4">จัดการเครดิต</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-dark-500">ผู้ใช้: {selectedUser.displayName}</p>
                <p className="text-sm text-dark-500">เครดิตปัจจุบัน: {selectedUser.credits}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">จำนวนเครดิต</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreditAmount(-5)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-dark-100 border border-dark-300 rounded-lg px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                    placeholder="0"
                  />
                  <button
                    onClick={() => setCreditAmount(10)}
                    className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-dark-500 mt-1">
                  ใช้ค่าบวกเพื่อเพิ่ม, ค่าลบเพื่อหัก (สูงสุด ±1000)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">เหตุผล (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full bg-dark-100 border border-dark-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  placeholder="ระบุเหตุผล..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreditModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-100 rounded-lg hover:bg-dark-200 transition-colors text-sm md:text-base"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreditSubmit}
                  disabled={creditAmount === 0 || addCreditMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {addCreditMutation.isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Users; 