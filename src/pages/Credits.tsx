import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import api from '../services/api';
import { CreditTransaction, PaginatedResponse, User } from '../types';

const Credits: React.FC = () => {
  const [page, setPage] = useState(1);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUserIds, setBulkUserIds] = useState<string>('');
  const [bulkAmount, setBulkAmount] = useState<number>(0);
  const [bulkReason, setBulkReason] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch credit transactions
  const { data: transactions, isLoading } = useQuery<PaginatedResponse<CreditTransaction>>({
    queryKey: ['creditTransactions', page],
    queryFn: async () => {
      const response = await api.get(`/admin/credits/transactions?page=${page}&limit=20`);
      return {
        data: response.data.transactions,
        pagination: response.data.pagination,
      };
    },
  });

  // Fetch credit stats
  const { data: stats } = useQuery({
    queryKey: ['creditStats'],
    queryFn: async () => {
      const response = await api.get('/admin/credits/stats');
      console.log('Credit Stats API Response:', response.data);
      return response.data;
    },
  });

  // Bulk add credits mutation
  const bulkAddMutation = useMutation({
    mutationFn: async (data: { userIds: string[]; amount: number; reason: string }) => {
      const response = await api.post('/admin/credits/bulk-add', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['creditStats'] });
      setShowBulkModal(false);
      setBulkUserIds('');
      setBulkAmount(0);
      setBulkReason('');
    },
  });

  const handleBulkSubmit = () => {
    const userIds = bulkUserIds.split(',').map(id => id.trim()).filter(id => id);
    if (userIds.length > 0 && bulkAmount !== 0) {
      bulkAddMutation.mutate({
        userIds,
        amount: bulkAmount,
        reason: bulkReason || 'เพิ่มเครดิตแบบกลุ่ม',
      });
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowUpIcon className="w-5 h-5 text-green-400" />;
    } else {
      return <ArrowDownIcon className="w-5 h-5 text-red-400" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            จัดการเครดิต
          </h1>
          <p className="text-dark-500 mt-1 md:mt-2 text-sm md:text-base">ติดตามและจัดการธุรกรรมเครดิต</p>
        </div>
        
        <button
          onClick={() => setShowBulkModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm md:text-base"
        >
          <UsersIcon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">เพิ่มเครดิตหลายคน</span>
          <span className="sm:hidden">เพิ่มหลายคน</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-effect rounded-xl p-3 md:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-dark-500 text-xs md:text-sm truncate">เครดิตรวมในระบบ</p>
              <p className="text-xl md:text-2xl font-bold text-primary-400 mt-1 truncate">
                {stats?.totalCredits?.toLocaleString() || '0'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500">Debug: {JSON.stringify(stats?.totalCredits)}</p>
              )}
            </div>
            <CreditCardIcon className="w-5 h-5 md:w-8 md:h-8 text-primary-400 ml-2" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-effect rounded-xl p-3 md:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-dark-500 text-xs md:text-sm truncate">ใช้ไปทั้งหมด</p>
              <p className="text-xl md:text-2xl font-bold text-red-400 mt-1 truncate">
                {stats?.totalUsed?.toLocaleString() || '0'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500">Debug: {JSON.stringify(stats?.totalUsed)}</p>
              )}
            </div>
            <ArrowDownIcon className="w-5 h-5 md:w-8 md:h-8 text-red-400 ml-2" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-effect rounded-xl p-3 md:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-dark-500 text-xs md:text-sm truncate">เพิ่มโดยแอดมิน</p>
              <p className="text-xl md:text-2xl font-bold text-green-400 mt-1 truncate">
                {stats?.addedByAdmin?.toLocaleString() || '0'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500">Debug: {JSON.stringify(stats?.addedByAdmin)}</p>
              )}
            </div>
            <ArrowUpIcon className="w-5 h-5 md:w-8 md:h-8 text-green-400 ml-2" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-effect rounded-xl p-3 md:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-dark-500 text-xs md:text-sm truncate">ใช้วันนี้</p>
              <p className="text-xl md:text-2xl font-bold text-purple-400 mt-1 truncate">
                {stats?.usedToday?.toLocaleString() || '0'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500">Debug: {JSON.stringify(stats?.usedToday)}</p>
              )}
            </div>
            <CalendarIcon className="w-5 h-5 md:w-8 md:h-8 text-purple-400 ml-2" />
          </div>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl overflow-hidden"
      >
        <div className="px-4 md:px-6 py-4 border-b border-dark-300">
          <h3 className="text-base md:text-lg font-semibold">ประวัติธุรกรรมล่าสุด</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-dark-300">
              {transactions?.data.map((transaction) => (
                <motion.div
                  key={transaction._id}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        {typeof transaction.user === 'object' ? transaction.user.displayName : 'ไม่ระบุ'}
                      </div>
                      <div className="text-xs text-dark-500 mt-1">
                        {transaction.createdAt
                          ? format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: th })
                          : 'ไม่มีข้อมูล'
                        }
                      </div>
                    </div>
                    <div className={`flex items-center ${getTransactionColor(transaction.amount)} ml-2`}>
                      {getTransactionIcon(transaction.type, transaction.amount)}
                      <span className="ml-1 font-medium text-sm">
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${transaction.type === 'use' ? 'bg-red-500/20 text-red-400' :
                        transaction.type === 'admin_add' ? 'bg-blue-500/20 text-blue-400' :
                        transaction.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'}`}>
                      {transaction.type === 'use' ? 'ใช้งาน' :
                       transaction.type === 'admin_add' ? 'แอดมิน' :
                       transaction.type === 'payment' ? 'ชำระเงิน' : 'ของขวัญ'}
                    </span>
                  </div>

                  <div className="text-xs text-dark-400">
                    <div className="flex items-center">
                      <DocumentTextIcon className="w-3 h-3 mr-1" />
                      <span className="truncate">{transaction.reason}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-100 border-b border-dark-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      ผู้ใช้
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-dark-500 uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-dark-500 uppercase tracking-wider">
                      จำนวน
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      เหตุผล
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      โดย
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-300">
                  {transactions?.data.map((transaction) => (
                    <motion.tr
                      key={transaction._id}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2 text-dark-400" />
                          {transaction.createdAt
                            ? format(new Date(transaction.createdAt), 'dd MMM yyyy HH:mm', { locale: th })
                            : 'ไม่มีข้อมูล'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {typeof transaction.user === 'object' ? transaction.user.displayName : 'ไม่ระบุ'}
                        </div>
                        <div className="text-xs text-dark-500">
                          {typeof transaction.user === 'object' ? transaction.user.lineUserId : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${transaction.type === 'use' ? 'bg-red-500/20 text-red-400' :
                            transaction.type === 'admin_add' ? 'bg-blue-500/20 text-blue-400' :
                            transaction.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                            'bg-purple-500/20 text-purple-400'}`}>
                          {transaction.type === 'use' ? 'ใช้งาน' :
                           transaction.type === 'admin_add' ? 'แอดมิน' :
                           transaction.type === 'payment' ? 'ชำระเงิน' : 'ของขวัญ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`flex items-center justify-center ${getTransactionColor(transaction.amount)}`}>
                          {getTransactionIcon(transaction.type, transaction.amount)}
                          <span className="ml-1 font-medium">
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-400">
                        <div className="flex items-center">
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          {transaction.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                        {transaction.addedByAdmin && typeof transaction.addedByAdmin === 'object' 
                          ? transaction.addedByAdmin.name 
                          : '-'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {transactions?.pagination && transactions.pagination.pages > 1 && (
              <div className="px-4 md:px-6 py-4 border-t border-dark-300 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
                <div className="text-xs md:text-sm text-dark-500 text-center sm:text-left">
                  แสดง {((page - 1) * 20) + 1} - {Math.min(page * 20, transactions.pagination.total)} จาก {transactions.pagination.total} รายการ
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
                    หน้า {page} จาก {transactions.pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === transactions.pagination.pages}
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

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-50 rounded-xl p-4 md:p-6 max-w-md w-full glass-effect"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4">เพิ่มเครดิตหลายคน</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">User IDs (คั่นด้วยลูกน้ำ)</label>
                <textarea
                  value={bulkUserIds}
                  onChange={(e) => setBulkUserIds(e.target.value)}
                  className="w-full bg-dark-100 border border-dark-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 h-20 md:h-24 text-sm md:text-base"
                  placeholder="userId1, userId2, userId3..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">จำนวนเครดิต</label>
                <input
                  type="number"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-dark-100 border border-dark-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  placeholder="0"
                />
                <p className="text-xs text-dark-500 mt-1">
                  ใช้ค่าบวกเพื่อเพิ่ม, ค่าลบเพื่อหัก
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">เหตุผล</label>
                <input
                  type="text"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  className="w-full bg-dark-100 border border-dark-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  placeholder="ระบุเหตุผล..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-100 rounded-lg hover:bg-dark-200 transition-colors text-sm md:text-base"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleBulkSubmit}
                  disabled={bulkAmount === 0 || !bulkUserIds || bulkAddMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {bulkAddMutation.isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Credits; 