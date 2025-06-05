import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CommandLineIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  FolderIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import api from '../services/api';
import { Command } from '../types';

const Commands: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    category: '',
    description: '',
  });
  const queryClient = useQueryClient();

  // Fetch commands
  const { data: commands, isLoading } = useQuery<Command[]>({
    queryKey: ['commands'],
    queryFn: async () => {
      const response = await api.get('/admin/commands');
      return response.data;
    },
  });

  // Create command mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Command>) => {
      const response = await api.post('/admin/commands', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      handleCloseModal();
    },
  });

  // Update command mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Command> }) => {
      const response = await api.put(`/admin/commands/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      handleCloseModal();
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/admin/commands/${id}/toggle-active`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
    },
  });

  // Delete command mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/commands/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
    },
  });

  const handleOpenModal = (command?: Command) => {
    if (command) {
      setEditingCommand(command);
      setFormData({
        text: command.text,
        category: command.category,
        description: command.description || '',
      });
    } else {
      setEditingCommand(null);
      setFormData({
        text: '',
        category: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCommand(null);
    setFormData({
      text: '',
      category: '',
      description: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCommand) {
      updateMutation.mutate({
        id: editingCommand._id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Group commands by category
  const groupedCommands = commands?.reduce((acc, command) => {
    const category = command.category || 'ไม่มีหมวดหมู่';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            จัดการคำสั่งบอท
          </h1>
          <p className="text-dark-500 mt-2">กำหนดคำสั่งและการตอบกลับของบอท</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          เพิ่มคำสั่งใหม่
        </button>
      </div>

      {/* Commands List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedCommands && Object.entries(groupedCommands).map(([category, categoryCommands]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FolderIcon className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-semibold">{category}</h3>
                <span className="text-sm text-dark-500">({categoryCommands.length} คำสั่ง)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryCommands.map((command) => (
                  <motion.div
                    key={command._id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-dark-100 rounded-lg p-4 border ${
                      command.isActive ? 'border-green-500/30' : 'border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-primary-400">{command.text}</h4>
                        {command.description && (
                          <p className="text-sm text-dark-500 mt-1">{command.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleActiveMutation.mutate(command._id)}
                        className={`p-1 rounded-lg transition-colors ${
                          command.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                        title={command.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      >
                        {command.isActive ? (
                          <CheckIcon className="w-5 h-5" />
                        ) : (
                          <XMarkIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center text-xs text-dark-400 mb-3">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {format(new Date(command.updatedAt), 'dd MMM yyyy', { locale: th })}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(command)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors text-sm"
                      >
                        <PencilIcon className="w-4 h-4" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('ต้องการลบคำสั่งนี้ใช่หรือไม่?')) {
                            deleteMutation.mutate(command._id);
                          }
                        }}
                        className="flex items-center justify-center px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Command Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-50 rounded-xl p-6 max-w-md w-full mx-4 glass-effect"
            >
              <h3 className="text-xl font-semibold mb-4">
                {editingCommand ? 'แก้ไขคำสั่ง' : 'เพิ่มคำสั่งใหม่'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">คำสั่ง</label>
                  <div className="relative">
                    <CommandLineIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="text"
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="เช่น /help"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="เช่น ทั่วไป, การใช้งาน"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">คำอธิบาย (ไม่บังคับ)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="อธิบายการทำงานของคำสั่ง..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-dark-100 rounded-lg hover:bg-dark-200 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Commands; 