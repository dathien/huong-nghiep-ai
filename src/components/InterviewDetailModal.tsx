import React from 'react';
import {
  X,
  Mic,
  Award,
  Building,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Brain,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { SavedInterviewSession } from '../services/interviewService';
import { ChiAnCharacter } from './ChiAnMascot';

interface InterviewDetailModalProps {
  session: SavedInterviewSession | null;
  isOpen: boolean;
  onClose: () => void;
  onRetake: (session: SavedInterviewSession) => void;
}

export const InterviewDetailModal: React.FC<InterviewDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  onRetake,
}) => {
  if (!isOpen || !session) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch {
      return 'Vừa xong';
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 65) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:block">
              <ChiAnCharacter height={95} state="guiding" interactive={false} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                  Chi tiết buổi phỏng vấn
                </span>
                <span className="text-xs text-blue-100 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(session.createdAt)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {session.position}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium flex items-center gap-2 mt-1">
                <Building className="w-3.5 h-3.5" />
                {session.company} • Độ khó: {session.difficulty} • Phong cách: {session.style}
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Summary Score Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center ${getScoreBadge(
                  session.score
                )}`}
              >
                <span className="text-xl font-black">{session.score}</span>
                <span className="text-[10px] font-bold uppercase">/ 100</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Đánh giá chung từ Chị An</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {session.overallVerdict || 'Buổi phỏng vấn đạt kết quả tích cực.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onRetake(session);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Luyện lại vị trí này</span>
            </button>
          </div>

          {/* Exchanges list */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span>Nội dung phỏng vấn & Góp ý STAR ({session.exchanges.length} câu hỏi)</span>
            </h3>

            {session.exchanges.map((ex, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs"
              >
                {/* Question */}
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    Q{ex.questionNumber || idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{ex.question}</p>
                  </div>
                </div>

                {/* Candidate Answer */}
                {ex.answer && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Câu trả lời của bạn:
                    </span>
                    <p className="italic leading-relaxed font-normal">"{ex.answer}"</p>
                  </div>
                )}

                {/* Evaluation Details */}
                {ex.evaluation && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100/80 pb-2">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        Điểm Chị An đánh giá: {ex.evaluation.recruiterScore || 80}/100
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {ex.evaluation.hiringConfidence}
                      </span>
                    </div>

                    {ex.evaluation.whatWasGood && ex.evaluation.whatWasGood.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Điểm làm tốt:
                        </span>
                        <ul className="list-disc list-inside text-slate-600 pl-1 space-y-0.5">
                          {ex.evaluation.whatWasGood.map((good, gIdx) => (
                            <li key={gIdx}>{good}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ex.evaluation.whatFeltWeak && ex.evaluation.whatFeltWeak.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Cần cải thiện:
                        </span>
                        <ul className="list-disc list-inside text-slate-600 pl-1 space-y-0.5">
                          {ex.evaluation.whatFeltWeak.map((weak, wIdx) => (
                            <li key={wIdx}>{weak}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ex.evaluation.betterStarVersion && (
                      <div className="bg-white border border-blue-200 rounded-lg p-2.5 mt-2 space-y-1">
                        <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Gợi ý câu trả lời STAR chuẩn từ Chị An:
                        </span>
                        <p className="text-slate-700 italic text-[11px] leading-relaxed">
                          {ex.evaluation.betterStarVersion}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Học viện Hướng nghiệp CareerMaster AI</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
