import React, { useState } from 'react';
import {
  Bell,
  User,
  GraduationCap,
  Sparkles,
  Menu,
  ChevronDown,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  LogIn,
  LogOut,
  FileText,
  Mic,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { StudentLevel } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  studentLevel: StudentLevel;
  setStudentLevel: (level: StudentLevel) => void;
  onToggleSidebar?: () => void;
  onNavigateTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  studentLevel,
  setStudentLevel,
  onToggleSidebar,
  onNavigateTab,
}) => {
  const { currentUser, userAccount, userProfile, openAuthModal, logout, openProfileModal } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Hoàn thiện hồ sơ năng lực',
      desc: 'Hồ sơ của bạn đã đạt 78%, bổ sung 1 đồ án để đạt 90%!',
      time: '10 phút trước',
      icon: Award,
      unread: true,
      tab: 'competency-profile',
    },
    {
      id: 2,
      title: 'Luyện phỏng vấn cùng Chị An',
      desc: 'Chị An sẽ hướng dẫn em cấu trúc STAR để ghi điểm với nhà tuyển dụng.',
      time: '2 giờ trước',
      icon: Sparkles,
      unread: true,
      tab: 'interview-practice',
    },
    {
      id: 3,
      title: 'Gợi ý nghề nghiệp mới',
      desc: 'Có 3 vị trí Thực tập sinh Frontend đang mở đơn tuyển dụng.',
      time: 'Hôm qua',
      icon: BookOpen,
      unread: false,
      tab: 'career-explore',
    },
  ];

  const levels: StudentLevel[] = [
    'Học sinh THPT',
    'Học viên trung cấp',
    'Sinh viên cao đẳng',
    'Sinh viên đại học',
  ];

  const displayName = userAccount?.fullName || currentUser?.displayName || 'Học viên';
  const displayEmail = currentUser?.email || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'CV';

  return (
    <header className="h-[72px] bg-white border-b border-slate-200/90 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs no-print">
      {/* Left: Mobile hamburger & Logo with tagline */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onNavigateTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                CareerMaster <span className="text-blue-600">AI</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 hidden sm:inline-block">
                EdTech Platform
              </span>
            </div>
            <p className="text-[12px] text-slate-500 font-medium hidden sm:block">
              Hành trang nghề nghiệp dành cho học sinh, sinh viên
            </p>
          </div>
        </div>
      </div>

      {/* Right: Student Level Switcher, Notifications & Auth/Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Education Level Selector */}
        <div className="relative hidden sm:block">
          <select
            value={studentLevel}
            onChange={(e) => setStudentLevel(e.target.value as StudentLevel)}
            className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                🎓 {lvl}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="font-bold text-sm text-slate-800">Thông báo hướng nghiệp</span>
                <span className="text-[11px] font-medium text-blue-600 cursor-pointer">
                  Đánh dấu đã đọc
                </span>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        onNavigateTab(n.tab);
                        setShowNotifications(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-[12px] text-slate-500 leading-snug mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {n.time}
                        </span>
                      </div>
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AUTH BUTTONS OR USER MENU */}
        {!currentUser ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('login', 'Đăng nhập để đồng bộ hồ sơ, lưu CV và xem lịch sử phỏng vấn.')}
              className="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
            <button
              onClick={() => openAuthModal('register', 'Tạo tài khoản miễn phí để nhận trọn bộ công cụ hướng nghiệp cùng Chị An!')}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng ký</span>
              <span className="sm:hidden">Mới</span>
            </button>
          </div>
        ) : (
          /* User Profile Dropdown */
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {studentLevel}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-slide-up">
                <div className="px-2 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                    {currentUser.emailVerified && (
                      <span title="Tài khoản đã xác thực">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {userAccount?.school || 'Thành viên CareerMaster'}
                  </span>
                </div>

                <div className="space-y-1 text-xs font-medium text-slate-700">
                  <button
                    onClick={() => {
                      openProfileModal();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Hồ sơ cá nhân</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('cv-builder');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>CV của tôi (Đa bản lưu)</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('interview-practice');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-slate-400" />
                    <span>Lịch sử phỏng vấn Chị An</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('career-roadmap');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-slate-400" />
                    <span>Tiến độ lộ trình học tập</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất an toàn</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
