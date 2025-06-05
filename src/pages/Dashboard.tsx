import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { DashboardStats } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon: Icon, color, subtitle }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="glass-effect rounded-xl p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-dark-500 text-sm">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-dark-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-gradient-to-r ${color} bg-opacity-20`}>
        <Icon className="w-8 h-8" />
      </div>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#a1a1aa',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#a1a1aa',
        },
      },
    },
  };

  const userChartData = {
    labels: stats?.dailyUsers.map(d => new Date(d.date).toLocaleDateString('th-TH', { weekday: 'short' })) || [],
    datasets: [
      {
        label: 'ผู้ใช้งาน',
        data: stats?.dailyUsers.map(d => d.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const creditChartData = {
    labels: stats?.creditStats.dailyCreditUsage.map(d => new Date(d.date).toLocaleDateString('th-TH', { weekday: 'short' })) || [],
    datasets: [
      {
        label: 'เครดิตที่ใช้',
        data: stats?.creditStats.dailyCreditUsage.map(d => d.count) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-dark-500 mt-2">ภาพรวมระบบ Bot Line IQ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="ผู้ใช้ทั้งหมด"
          value={stats?.totalUsers.toLocaleString() || '0'}
          icon={UsersIcon}
          color="from-blue-400 to-blue-600 text-blue-400"
        />
        <StatCard
          title="เครดิตรวม"
          value={stats?.creditStats.totalCredits.toLocaleString() || '0'}
          icon={CreditCardIcon}
          color="from-green-400 to-green-600 text-green-400"
          subtitle={`ใช้วันนี้: ${stats?.creditStats.creditsUsedToday.toLocaleString() || 0}`}
        />
        <StatCard
          title="การโต้ตอบ"
          value={stats?.totalInteractions.toLocaleString() || '0'}
          icon={ChartBarIcon}
          color="from-purple-400 to-purple-600 text-purple-400"
          subtitle={`เวลาเฉลี่ย: ${(stats?.avgProcessingTime || 0).toFixed(2)}ms`}
        />
        <StatCard
          title="เครดิตหมด"
          value={stats?.creditStats.usersWithNoCredits || '0'}
          icon={ExclamationTriangleIcon}
          color="from-red-400 to-red-600 text-red-400"
          subtitle={`เครดิตน้อย: ${stats?.creditStats.usersWithLowCredits || 0}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Users Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">ผู้ใช้งานรายวัน</h3>
          <div className="h-64">
            <Line data={userChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Credit Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">การใช้เครดิตรายวัน</h3>
          <div className="h-64">
            <Bar data={creditChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* New Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">ผู้ใช้ใหม่ล่าสุด</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-center">
          {stats?.newUsers.map((item, index) => (
            <div key={index} className="bg-dark-100 rounded-lg p-3">
              <p className="text-xs text-dark-500">
                {new Date(item.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' })}
              </p>
              <p className="text-2xl font-bold text-primary-400 mt-1">
                {item.count}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 