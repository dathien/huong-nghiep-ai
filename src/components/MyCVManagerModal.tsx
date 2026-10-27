import React, { useState } from 'react';
import {
  X,
  FileText,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  Star,
  Clock,
  Sparkles,
  ExternalLink,
  Save,
  AlertCircle
} from 'lucide-react';
import { CVDoc, duplicateCV, renameCV, setDefaultCV, deleteCV, createCV } from '../services/cvService';
import { CVData } from '../types';
import { SAMPLE_DEFAULT_CV } from '../data/mockData';

interface MyCVManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvList: CVDoc[];
  activeCvId: string | null;
  onSelectCV: (cv: CVDoc) => void;
  uid: string;
  currentCvData: CVData;
}

export const MyCVManagerModal: React.FC<MyCVManagerModalProps> = ({
  isOpen,
  onClose,
  cvList,
  activeCvId,
  onSelectCV,
  uid,
  currentCvData,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCvName, setNewCvName] = useState('');
  const [newCvTemplate, setNewCvTemplate] = useState<'ats' | 'modern' | 'professional' | 'creative'>('ats');
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStartRename = (cv: CVDoc) => {
    setEditingId(cv.id);
    setEditNameValue(cv.cvName);
  };

  const handleSaveRename = async (cvId: string) => {
    if (!editNameValue.trim()) return;
    try {
      setLoadingAction(true);
      await renameCV(uid, cvId, editNameValue.trim());
      setEditingId(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đổi tên CV');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDuplicate = async (cv: CVDoc) => {
    try {
      setLoadingAction(true);
      const cloned = await duplicateCV(uid, cv);
      if (cloned) {
        onSelectCV(cloned);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi nhân bản CV');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSetDefault = async (cvId: string) => {
    try {
      setLoadingAction(true);
      await setDefaultCV(uid, cvId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đặt làm mặc định');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (cvId: string, cvName: string) => {
    if (cvList.length <= 1) {
      setErrorMsg('Bạn cần giữ ít nhất 1 bản CV trong tài khoản.');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản CV "${cvName}" không?`)) {
      return;
    }

    try {
      setLoadingAction(true);
      await deleteCV(uid, cvId);
      if (activeCvId === cvId) {
        const remaining = cvList.filter((c) => c.id !== cvId);
        if (remaining.length > 0) {
          onSelectCV(remaining[0]);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi xóa CV');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCvName.trim()) return;

    try {
      setLoadingAction(true);
      const blankData: CVData = {
        ...SAMPLE_DEFAULT_CV,
        contact: {
          ...SAMPLE_DEFAULT_CV.contact,
          title: newCvName.trim(),
        },
      };
      const created = await createCV(uid, newCvName.trim(), newCvTemplate, blankData, false);
      if (created) {
        onSelectCV(created);
        setIsCreatingNew(false);
        setNewCvName('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tạo CV mới');
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Quản lý CV của tôi</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
                  {cvList.length} bản lưu
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Lưu nhiều phiên bản CV ứng tuyển cho từng vị trí và doanh nghiệp khác nhau
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* New CV Form or Button */}
          {!isCreatingNew ? (
            <div className="flex items-center justify-between bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Tạo bản CV mới</p>
                <p className="text-[11px] text-slate-500">
                  Chuẩn bị riêng cho một vị trí ứng tuyển mục tiêu khác
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo CV mới</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleCreateNew}
              className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Khởi tạo bản CV mới
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Hủy
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tên bản CV (Vị trí ứng tuyển)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCvName}
                    onChange={(e) => setNewCvName(e.target.value)}
                    placeholder="VD: CV Thực tập sinh Mobile / Frontend"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Định dạng mẫu
                  </label>
                  <select
                    value={newCvTemplate}
                    onChange={(e) => setNewCvTemplate(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                  >
                    <option value="ats">Chuẩn ATS (Tối ưu quét tự động)</option>
                    <option value="modern">Hiện đại (Ảnh tròn, dải xanh)</option>
                    <option value="professional">Chuyên nghiệp (Ảnh bo góc)</option>
                    <option value="creative">Sáng tạo (Phong cách nổi bật)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  Xác nhận tạo
                </button>
              </div>
            </form>
          )}

          {/* List of Saved CVs */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Danh sách bản CV đã lưu ({cvList.length})
            </span>

            {cvList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có bản CV nào được lưu. Hãy bấm "Tạo CV mới" ở trên để bắt đầu!
              </div>
            ) : (
              cvList.map((cv) => {
                const isActive = activeCvId === cv.id;
                const isEditing = editingId === cv.id;

                return (
                  <div
                    key={cv.id}
                    className={`border rounded-2xl p-4 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              className="bg-white border border-blue-500 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveRename(cv.id)}
                              className="p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                              title="Lưu tên"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{cv.cvName}</span>
                            {cv.isDefault && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                Mặc định
                              </span>
                            )}
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                Đang mở
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">
                            Mẫu:{' '}
                            {cv.templateId === 'ats'
                              ? 'Chuẩn ATS'
                              : cv.templateId === 'modern'
                              ? 'Hiện đại'
                              : cv.templateId === 'professional'
                              ? 'Chuyên nghiệp'
                              : 'Sáng tạo'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Cập nhật: {formatDate(cv.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCV(cv);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Mở CV này
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-blue-600 px-2 py-1 bg-blue-100/70 rounded-lg">
                            Đang soạn thảo
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDuplicate(cv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Tạo bản sao"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartRename(cv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Đổi tên"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {!cv.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(cv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Đặt làm CV mặc định"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(cv.id, cv.cvName)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa bản CV"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Dữ liệu đồng bộ trực tiếp với tài khoản Cloud của bạn</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
