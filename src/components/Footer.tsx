import React from 'react';
import { GraduationCap, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/90 py-6 text-slate-500 text-xs no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Branding & mission */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800">CareerMaster AI</span>
          <span className="text-slate-300">•</span>
          <span className="text-[12px] text-slate-500 font-medium">
            Hành trang nghề nghiệp dành cho học sinh, sinh viên
          </span>
        </div>

        {/* Right: Exact required copyright */}
        <div className="text-center sm:text-right font-medium text-slate-600 text-xs">
          Copyright © 2026 – Developed by <strong className="text-blue-600 font-bold">GV. Hồ Nguyễn Đa Thiện</strong>.
        </div>
      </div>
    </footer>
  );
};
