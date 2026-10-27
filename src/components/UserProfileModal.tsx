import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Building,
  BookOpen,
  GraduationCap,
  Target,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuth, UserType, USER_TYPE_LABELS } from '../context/AuthContext';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    userAccount,
    userProfile,
    isProfileModalOpen,
    closeProfileModal,
    updateProfileData,
    logout,
  } = useAuth();

  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<UserType>('university');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [phone, setPhone] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [bio, setBio] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (userAccount) {
      setFullName(userAccount.fullName || '');
      setUserType(userAccount.userType || 'university');
      setSchool(userAccount.school || '');
      setMajor(userAccount.major || '');
    }
    if (userProfile) {
      setPhone(userProfile.phone || '');
      setCareerGoal(userProfile.careerGoal || '');
      setBio(userProfile.bio || '');
      setTargetIndustry(userProfile.targetIndustry || 'Công nghệ thông tin');
      setSkillsInput(userProfile.skills ? userProfile.skills.join(', ') : '');
    }
  }, [userAccount, userProfile, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await updateProfileData(
        {
          fullName,
          userType,
          school,
          major,
        },
        {
          phone,
          careerGoal,
          bio,
          targetIndustry,
          skills: skillsArray,
          educationLevel: USER_TYPE_LABELS[userType],
        }
      );
      setMessage({ text: 'Cập nhật hồ sơ thành công!', type: 'success' });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi cập nhật hồ sơ.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    closeProfileModal();
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white font-black text-lg flex items-center justify-center border border-white/30 shadow-inner">
              {fullName ? fullName.slice(0, 2).toUpperCase() : 'ME'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hồ sơ cá nhân</h2>
              <p className="text-xs text-blue-100">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={closeProfileModal}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Đối tượng</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                {(Object.keys(USER_TYPE_LABELS) as UserType[]).map((type) => (
                  <option key={type} value={type}>
                    {USER_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ngành nghề mục tiêu</label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  placeholder="Frontend Developer, Marketing..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Trường / Cơ sở</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="ĐH Bách Khoa, THPT..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Chuyên ngành</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Khoa học máy tính, QTKD..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mục tiêu nghề nghiệp</label>
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="VD: Trở thành Fullstack Developer trong 2 năm tới"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Giới thiệu ngắn (Bio)</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Vài câu giới thiệu về bản thân, thế mạnh và đam mê của em..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Kỹ năng trọng tâm (cách nhau bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Giao tiếp, Tiếng Anh, Giải quyết vấn đề"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer py-2 px-3 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeProfileModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
