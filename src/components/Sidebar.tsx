import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  UserCheck,
  FileText,
  Building2,
  Mic,
  Route,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as AppTab,
      label: 'Tổng quan',
      icon: LayoutDashboard,
    },
    {
      id: 'self-discovery' as AppTab,
      label: 'Khám phá bản thân',
      icon: Compass,
    },
    {
      id: 'career-explore' as AppTab,
      label: 'Khám phá nghề nghiệp',
      icon: Briefcase,
    },
    {
      id: 'competency-profile' as AppTab,
      label: 'Hồ sơ năng lực',
      icon: UserCheck,
    },
    {
      id: 'cv-builder' as AppTab,
      label: 'Thiết kế CV',
      icon: FileText,
    },
    {
      id: 'internship-jobs' as AppTab,
      label: 'Thực tập & việc làm',
      icon: Building2,
    },
    {
      id: 'interview-practice' as AppTab,
      label: 'Luyện phỏng vấn',
      icon: Mic,
    },
    {
      id: 'career-roadmap' as AppTab,
      label: 'Lộ trình phát triển',
      icon: Route,
    },
  ];

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Main Sidebar Element (260px expanded / 72px collapsed) */}
      <aside
        className={`fixed top-[72px] bottom-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex flex-col no-print overflow-hidden select-none ${
          mobileOpen ? 'translate-x-0 w-[260px] shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}`}
      >
        {/* 1. Sidebar Header (flex-shrink-0) */}
        <div className="flex-shrink-0 h-10 px-4 flex items-center border-b border-slate-100 bg-slate-50/50">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Hệ thống hướng nghiệp
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-600" title="Hệ thống hướng nghiệp" />
            </div>
          )}
        </div>

        {/* 2. Sidebar Navigation: 8 items, 44px height, 4px gap, no grey scrollbar */}
        <nav
          className="sidebar-nav-scroll flex-1 min-h-0 flex flex-col gap-1 p-2.5 overflow-y-auto overflow-x-hidden"
          aria-label="Thanh điều hướng chính"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all group relative cursor-pointer min-h-[44px] flex-shrink-0 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Icon (never shrinks) */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-500 group-hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>

                {/* Text Label: Full text, no truncation ellipsis, natural wrap without breaking */}
                {!isCollapsed && (
                  <span className="flex-1 min-w-0 text-[14px] leading-snug whitespace-normal break-words">
                    {item.label}
                  </span>
                )}

                {/* Hover Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fade-in items-center">
                    <span>{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Sidebar Footer (flex-shrink-0): Only collapse/expand button, no mascot/card */}
        <div className="flex-shrink-0 p-2.5 border-t border-slate-200/80 bg-slate-50/70">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="text-slate-600 font-medium">Thu gọn menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
