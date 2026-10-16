import React, { useState, useEffect } from 'react';
import {
  fetchContactSettings,
  saveContactSettings,
  fetchContactMessages,
  updateMessageStatus,
  deleteContactMessage,
  buildSenderWhatsAppReplyLink,
  ContactItem,
  ContactMessage,
  DEFAULT_CONTACT_ITEMS,
} from '../services/contact';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from './Button';
import { CheckSvgIcon, AlertCircleSvgIcon } from './svg/NavIcons';
import { useLanguage } from '../context/LanguageContext';

export const AdminContactForm: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<ContactItem[]>(DEFAULT_CONTACT_ITEMS);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'messages'>('settings');
  const [msgSearch, setMsgSearch] = useState<string>('');
  const [msgStatusFilter, setMsgStatusFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  // Editing state per item ID
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; value: string; type: ContactItem['type'] }>({
    label: '',
    value: '',
    type: 'custom',
  });

  // Add new modal/form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<ContactItem['type']>('whatsapp');
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteMsgId, setConfirmDeleteMsgId] = useState<string | null>(null);

  // Feedback toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();

    let channel: any = null;
    if (isSupabaseConfigured) {
      try {
        channel = supabase
          .channel('public:admin_inbox_messages')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'messages' },
            () => {
              fetchContactMessages().then(setMessages);
            }
          )
          .subscribe();
      } catch {
        // Ignore
      }
    }

    return () => {
      if (channel && isSupabaseConfigured) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadData = async () => {
    const [fetchedItems, fetchedMsgs] = await Promise.all([
      fetchContactSettings(),
      fetchContactMessages(),
    ]);
    setItems(fetchedItems);
    setMessages(fetchedMsgs);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const startEditing = (item: ContactItem) => {
    setEditingId(item.id);
    setEditForm({ label: item.label, value: item.value, type: item.type });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveItemEdit = async (id: string) => {
    const val = editForm.value.trim();
    if (!val) {
      showToast('error', t('মান খালি রাখা যাবে না।', 'Value cannot be empty.'));
      return;
    }
    if (editForm.type === 'email' && !val.includes('@')) {
      showToast('error', t('সঠিক ইমেইল ফরম্যাট দিন।', 'Please enter a valid email format.'));
      return;
    }

    const updated = items.map((item) =>
      item.id === id
        ? {
            ...item,
            label: editForm.label.trim() || item.label,
            value: val,
          }
        : item
    );

    setIsSaving(true);
    const res = await saveContactSettings(updated);
    setIsSaving(false);

    if (res.success) {
      setItems(updated);
      setEditingId(null);
      showToast('success', t('যোগাযোগের তথ্য সফলভাবে সংরক্ষিত হয়েছে!', 'Contact item updated successfully!'));
    } else {
      showToast('error', res.error || t('সংরক্ষণ করতে ব্যর্থ হয়েছে।', 'Failed to save.'));
    }
  };

  const toggleVisibility = async (id: string) => {
    const updated = items.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item));
    setItems(updated);
    await saveContactSettings(updated);
    showToast('success', t('দৃশ্যমানতা পরিবর্তন করা হয়েছে।', 'Visibility status updated.'));
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;

    const reordered = copy.map((it, idx) => ({ ...it, display_order: idx + 1 }));
    setItems(reordered);
    await saveContactSettings(reordered);
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) {
      showToast('error', t('দয়া করে মান লিখুন।', 'Please provide a value.'));
      return;
    }

    const newItem: ContactItem = {
      id: `contact-${newType}-${Date.now()}`,
      type: newType,
      label: newLabel.trim() || `${newType.toUpperCase()} Support`,
      value: newValue.trim(),
      visible: true,
      display_order: items.length + 1,
    };

    const updated = [...items, newItem];
    setIsSaving(true);
    const res = await saveContactSettings(updated);
    setIsSaving(false);

    if (res.success) {
      setItems(updated);
      setIsAddModalOpen(false);
      setNewLabel('');
      setNewValue('');
      showToast('success', t('নতুন যোগাযোগ মাধ্যম সফলভাবে যুক্ত করা হয়েছে!', 'New contact info added successfully!'));
    } else {
      showToast('error', res.error || t('যোগ করতে ব্যর্থ হয়েছে।', 'Failed to add.'));
    }
  };

  const confirmAndDelete = async (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    setConfirmDeleteId(null);
    await saveContactSettings(updated);
    showToast('success', t('যোগাযোগ মাধ্যম মুছে ফেলা হয়েছে।', 'Contact item deleted.'));
  };

  const handleDeleteMessage = async (msgId: string) => {
    await deleteContactMessage(msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setConfirmDeleteMsgId(null);
    showToast('success', t('বার্তাটি মুছে ফেলা হয়েছে।', 'Message deleted.'));
  };

  const handleToggleMsgStatus = async (msgId: string, currentStatus: ContactMessage['status']) => {
    const nextStatus = currentStatus === 'unread' ? 'read' : currentStatus === 'read' ? 'replied' : 'unread';
    await updateMessageStatus(msgId, nextStatus);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, status: nextStatus } : m)));
  };

  return (
    <div className="space-y-8">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#171412]/15">
        <div>
          <h2 className="font-display text-[26px] font-extrabold text-[#171412]">
            {t('যোগাযোগ ও সাপোর্ট সেটিংস', 'Contact & Support Settings')}
          </h2>
          <p className="text-[14px] text-[#171412]/75">
            {t(
              'পাবলিক ওয়েবসাইটের যোগাযোগ সেকশন এবং ভিজিটর বার্তার রিয়েল-টাইম ব্যবস্থাপনা।',
              'Real-time management for public contact channels and visitor inquiries.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-[50px] text-[13px] font-bold transition-colors cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-[#ff7722] text-[#171412] border border-[#171412]'
                : 'bg-[#f2f0e7] text-[#171412] border border-[#171412]/20'
            }`}
          >
            {t(`যোগাযোগ মাধ্যম (${items.length})`, `Contact Channels (${items.length})`)}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('messages')}
            className={`px-4 py-2 rounded-[50px] text-[13px] font-bold transition-colors cursor-pointer ${
              activeSubTab === 'messages'
                ? 'bg-[#ff7722] text-[#171412] border border-[#171412]'
                : 'bg-[#f2f0e7] text-[#171412] border border-[#171412]/20'
            }`}
          >
            {t(`ভিজিটর বার্তা (${messages.length})`, `Visitor Messages (${messages.length})`)}
          </button>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className={`p-4 rounded-[12px] border-2 text-[14px] font-bold flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-[#e8f5e9] border-[#2e7d32] text-[#1b5e20]'
              : 'bg-[#fff8f8] border-[#ff3c34] text-[#ff3c34]'
          }`}
        >
          {toast.type === 'success' ? <CheckSvgIcon className="w-5 h-5 shrink-0" /> : <AlertCircleSvgIcon className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Editable Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-[18px] font-bold text-[#171412]">
                {t('সকল যোগাযোগের কার্ডসমূহ', 'All Contact Cards')}
              </h3>
              <Button variant="orange" onClick={() => setIsAddModalOpen(true)}>
                {t('+ নতুন তথ্য যোগ করুন', '+ Add New Info')}
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-[16px] bg-[#fbf9ef] border-2 transition-all ${
                      item.visible ? 'border-[#171412]/25 shadow-sm' : 'border-dashed border-[#171412]/30 opacity-60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[12px] font-bold text-[#171412] mb-1">
                            {t('লেবেল নাম', 'Label')}
                          </label>
                          <input
                            type="text"
                            value={editForm.label}
                            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                            className="w-full h-10 px-3 rounded-[8px] bg-[#fff] border border-[#171412]/30 text-[14px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#171412] mb-1">
                            {t('মান / ভ্যালু', 'Value / Link / Number')}
                          </label>
                          <input
                            type="text"
                            value={editForm.value}
                            onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                            className="w-full h-10 px-3 rounded-[8px] bg-[#fff] border border-[#171412]/30 text-[14px]"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button variant="outline" onClick={cancelEditing}>
                            {t('বাতিল', 'Cancel')}
                          </Button>
                          <Button variant="orange" isLoading={isSaving} onClick={() => saveItemEdit(item.id)}>
                            {t('সংরক্ষণ করুন', 'Save')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-[4px] bg-[#ff7722]/15 text-[#813502] text-[11px] font-extrabold uppercase">
                              {item.type}
                            </span>
                            {!item.visible && (
                              <span className="px-2 py-0.5 rounded-[4px] bg-[#171412]/10 text-[#171412] text-[11px] font-bold">
                                {t('লুকানো', 'Hidden')}
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-[16px] font-bold text-[#171412]">{item.label}</h4>
                          <p className="text-[13px] text-[#171412]/85 font-medium truncate mt-0.5">{item.value}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Reorder */}
                          <div className="flex flex-col gap-0.5 mr-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveOrder(index, 'up')}
                              className="w-6 h-6 rounded bg-[#f2f0e7] hover:bg-[#e2e0d7] border border-[#171412]/20 text-[10px] font-bold flex items-center justify-center cursor-pointer disabled:opacity-30"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={index === items.length - 1}
                              onClick={() => moveOrder(index, 'down')}
                              className="w-6 h-6 rounded bg-[#f2f0e7] hover:bg-[#e2e0d7] border border-[#171412]/20 text-[10px] font-bold flex items-center justify-center cursor-pointer disabled:opacity-30"
                              title="Move Down"
                            >
                              ▼
                            </button>
                          </div>

                          {/* Show/Hide */}
                          <button
                            type="button"
                            onClick={() => toggleVisibility(item.id)}
                            className="px-2.5 py-1.5 rounded-[8px] bg-[#f2f0e7] hover:bg-[#e2e0d7] border border-[#171412]/20 text-[12px] font-bold cursor-pointer"
                          >
                            {item.visible ? t('লুকান', 'Hide') : t('দেখান', 'Show')}
                          </button>

                          {/* Edit Pencil */}
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            className="p-2 rounded-[8px] bg-[#ffc765]/40 hover:bg-[#ffc765] border border-[#171412]/25 text-[#171412] font-bold cursor-pointer"
                            title="Edit"
                          >
                            ✎
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-2 rounded-[8px] bg-[#fff8f8] hover:bg-[#ff3c34] hover:text-[#fff] border border-[#ff3c34]/30 text-[#ff3c34] font-bold cursor-pointer transition-colors"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Delete Confirmation Inline */}
                    {confirmDeleteId === item.id && (
                      <div className="mt-3 pt-3 border-t border-[#171412]/15 flex items-center justify-between bg-[#fff8f8] p-3 rounded-[10px]">
                        <span className="text-[13px] font-bold text-[#ff3c34]">
                          {t('আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?', 'Are you sure you want to delete this channel?')}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                            {t('না', 'Cancel')}
                          </Button>
                          <Button
                            variant="primary"
                            className="bg-[#ff3c34] text-white border-[#ff3c34]"
                            onClick={() => confirmAndDelete(item.id)}
                          >
                            {t('হ্যাঁ, মুছুন', 'Delete')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Preview Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-[20px] bg-[#f2f0e7] border-2 border-[#171412] p-6 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-[#171412]/15 mb-4">
                <span className="text-[12px] font-extrabold text-[#813502] uppercase tracking-wider">
                  {t('লাইভ প্রিভিউ প্যানেল', 'Live Preview Panel')}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <h4 className="font-display text-[18px] font-extrabold text-[#171412] mb-1">
                {t('পাবলিক সেকশন যেমন দেখাবে', 'How Visitors Will See It')}
              </h4>
              <p className="text-[12px] text-[#171412]/70 mb-4">
                {t('অ্যাডমিন প্যানেলে পরিবর্তনের সাথে সাথে রিয়েল-টাইমে আপডেট হয়।', 'Updates instantly in real-time as you edit above.')}
              </p>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {items
                  .filter((i) => i.visible && i.value.trim())
                  .map((i) => (
                    <div key={i.id} className="p-3.5 rounded-[12px] bg-[#fbf9ef] border border-[#171412]/20">
                      <div className="text-[11px] font-bold text-[#813502] uppercase">{i.label}</div>
                      <div className="text-[13px] font-semibold text-[#171412] truncate mt-0.5">{i.value}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'messages' && (
        <div className="space-y-4">
          <h3 className="font-display text-[18px] font-bold text-[#171412]">
            {t('ভিজিটর কন্টাক্ট ফর্ম বার্তাগুলো', 'Visitor Contact Form Inquiries')}
          </h3>

          {messages.length === 0 ? (
            <div className="p-8 text-center rounded-[16px] bg-[#fbf9ef] border border-[#171412]/20 text-[14px] text-[#171412]/70">
              {t('এখনো কোনো নতুন বার্তা আসেনি।', 'No visitor messages received yet.')}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="p-5 rounded-[16px] bg-[#fbf9ef] border-2 border-[#171412]/25 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[16px] font-extrabold text-[#171412]">{msg.name}</span>
                      <span className="text-[13px] font-bold text-[#813502] bg-[#ff7722]/15 px-2.5 py-0.5 rounded-full">
                        {msg.contact_info}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleMsgStatus(msg.id, msg.status)}
                        className={`px-3 py-1 rounded-[50px] text-[12px] font-bold border cursor-pointer ${
                          msg.status === 'unread'
                            ? 'bg-[#ffc765]/40 text-[#171412] border-[#ffc765]'
                            : msg.status === 'read'
                            ? 'bg-[#3d2fa9]/15 text-[#3d2fa9] border-[#3d2fa9]/30'
                            : 'bg-[#2e7d32]/15 text-[#2e7d32] border-[#2e7d32]/30'
                        }`}
                      >
                        {msg.status === 'unread' ? 'অপাঠ্য (Unread)' : msg.status === 'read' ? 'পঠিত (Read)' : 'উত্তরিত (Replied)'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteMsgId(msg.id)}
                        className="p-2 rounded-[8px] bg-[#fff8f8] border border-[#ff3c34]/30 text-[#ff3c34] font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <p className="text-[14px] text-[#171412]/85 bg-white p-3.5 rounded-[10px] border border-[#171412]/15">
                    {msg.message}
                  </p>

                  <div className="text-[11px] text-[#171412]/50">
                    {new Date(msg.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {confirmDeleteMsgId === msg.id && (
                    <div className="pt-3 border-t border-[#171412]/15 flex items-center justify-between bg-[#fff8f8] p-3 rounded-[10px]">
                      <span className="text-[13px] font-bold text-[#ff3c34]">
                        {t('এই বার্তাটি মুছে ফেলতে চান?', 'Delete this message?')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setConfirmDeleteMsgId(null)}>
                          {t('না', 'Cancel')}
                        </Button>
                        <Button
                          variant="primary"
                          className="bg-[#ff3c34] text-white border-[#ff3c34]"
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          {t('হ্যাঁ, মুছুন', 'Delete')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add New Info Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171412]/75 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-md bg-[#ffffff] border-2 border-[#171412] rounded-[16px] shadow-[8px_8px_0px_#171412] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#171412]/15 mb-4">
              <h3 className="font-display text-[20px] font-extrabold text-[#171412]">
                {t('নতুন যোগাযোগ মাধ্যম যোগ করুন', 'Add New Contact Channel')}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f0e7] flex items-center justify-center font-bold text-[#171412] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#171412] mb-1.5">
                  {t('ধরন নির্বাচন করুন *', 'Select Type *')}
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] font-bold text-[#171412]"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone / Hotline</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="telegram">Telegram</option>
                  <option value="website">Website</option>
                  <option value="address">Address</option>
                  <option value="hours">Office Hours</option>
                  <option value="custom">Custom Info</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#171412] mb-1.5">
                  {t('লেবেল নাম *', 'Label Title *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('যেমন: ফেসবুক মেসেঞ্জার সাপোর্ট', 'e.g. Messenger Support')}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[10px] bg-[#fff] border border-[#171412]/30 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#171412] mb-1.5">
                  {t('মান / ইউআরএল বা নম্বর *', 'Value / URL / Number *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="rohit007jsr@gmail.com / +8801800000000 / https://..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[10px] bg-[#fff] border border-[#171412]/30 text-[14px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#171412]/15">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  {t('বাতিল', 'Cancel')}
                </Button>
                <Button type="submit" variant="orange" isLoading={isSaving}>
                  {t('যোগ করুন', 'Add Channel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
