import React, { useState } from 'react';
import {
  Route,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  ArrowRight,
  Target,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import { DEFAULT_ROADMAP_MILESTONES } from '../data/mockData';
import { RoadmapMilestone, StudentLevel } from '../types';

interface CareerRoadmapProps {
  studentLevel: StudentLevel;
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ studentLevel }) => {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(DEFAULT_ROADMAP_MILESTONES);
  const [activePhase, setActivePhase] = useState<string>('phase-1');
  const [newTaskText, setNewTaskText] = useState('');

  // Toggle task completion
  const handleToggleTask = (milestoneId: string, taskId: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
  };

  // Add new task
  const handleAddTask = (milestoneId: string) => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
    };

    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: [...m.tasks, newTask],
        };
      })
    );
    setNewTaskText('');
  };

  // Calculate overall completion
  const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0);
  const completedTasks = milestones.reduce(
    (sum, m) => sum + m.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currentMilestone = milestones.find((m) => m.id === activePhase) || milestones[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
            <Route className="w-3.5 h-3.5" />
            <span>Kế Hoạch Sự Nghiệp 4 Năm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lộ Trình Phát Triển Toàn Diện
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Từng bước xây dựng hành trang nghề nghiệp vững chắc theo từng giai đoạn học tập.
            Đánh dấu các mốc hoàn thành để theo dõi sự tiến bộ của bản thân mỗi học kỳ.
          </p>
        </div>

        {/* Overall Progress Gauge */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 min-w-[220px]">
          <div className="w-14 h-14 rounded-full border-4 border-amber-200 border-t-amber-500 flex items-center justify-center font-black text-sm text-amber-600 bg-white shadow-xs">
            {overallProgress}%
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tổng tiến độ lộ trình
            </span>
            <span className="text-xs font-extrabold text-slate-800">
              {completedTasks} / {totalTasks} Nhiệm vụ
            </span>
          </div>
        </div>
      </div>

      {/* Phase Timeline Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {milestones.map((m, idx) => {
          const mTotal = m.tasks.length;
          const mDone = m.tasks.filter((t) => t.completed).length;
          const mPercent = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
          const isActive = activePhase === m.id;

          return (
            <button
              key={m.id}
              onClick={() => setActivePhase(m.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                isActive
                  ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {m.phase}
                </span>
                <span className="text-xs font-bold text-blue-600">{mPercent}%</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{m.timeframe}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.title}</p>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${mPercent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Phase Details & Interactive Task Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              {currentMilestone.phase} • {currentMilestone.timeframe}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {currentMilestone.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {currentMilestone.description}
            </p>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Danh sách mục tiêu cần hoàn thành:
          </span>

          <div className="space-y-2.5">
            {currentMilestone.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(currentMilestone.id, task.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-900 font-medium'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <span
                    className={`text-xs leading-relaxed ${
                      task.completed ? 'line-through text-slate-500' : ''
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.completed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {task.completed ? 'Đã hoàn thành' : 'Đang thực hiện'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Task Input */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask(currentMilestone.id)}
            placeholder="Thêm mục tiêu hoặc dự định cá nhân của bạn vào giai đoạn này..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
          />
          <button
            onClick={() => handleAddTask(currentMilestone.id)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mục tiêu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
