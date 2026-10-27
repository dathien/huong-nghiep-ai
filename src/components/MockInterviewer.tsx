import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  Brain,
  RotateCcw,
  Volume2,
  Building,
  Target,
  ShieldAlert,
  ArrowRight,
  Clock,
  UserCheck,
  History,
  Calendar,
  TrendingUp,
  Check,
  Trash2,
  Eye,
  LogIn
} from 'lucide-react';
import { InterviewExchange, InterviewEvaluation, StudentLevel } from '../types';
import { ChiAnCharacter } from './ChiAnMascot';
import { useAuth } from '../context/AuthContext';
import {
  SavedInterviewSession,
  subscribeUserInterviews,
  saveInterviewSession,
  deleteInterviewSession,
} from '../services/interviewService';
import { InterviewDetailModal } from './InterviewDetailModal';

interface MockInterviewerProps {
  studentLevel: StudentLevel;
}

export const MockInterviewer: React.FC<MockInterviewerProps> = ({ studentLevel }) => {
  const { currentUser, openAuthModal } = useAuth();

  // Navigation sub-tab: 'interview' or 'history'
  const [viewMode, setViewMode] = useState<'interview' | 'history'>('interview');
  const [historyList, setHistoryList] = useState<SavedInterviewSession[]>([]);
  const [selectedDetailSession, setSelectedDetailSession] = useState<SavedInterviewSession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [hasSavedCurrentSession, setHasSavedCurrentSession] = useState(false);

  // Setup state
  const [inSession, setInSession] = useState(false);
  const [company, setCompany] = useState('FPT Software / VNG / Viettel');
  const [role, setRole] = useState('Thực tập sinh Frontend / Web Developer');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [style, setStyle] = useState('Behavioral STAR');
  const [candidateBg, setCandidateBg] = useState(
    'Sinh viên năm 3-4 chuyên ngành CNTT, có 2 đồ án web với React & TypeScript, điểm học tập GPA 3.65, thành thạo Git.'
  );

  // Active Session state
  const [isStarting, setIsStarting] = useState(false);
  const [recruiterName, setRecruiterName] = useState('Chị An (Senior HR Recruiter)');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswerInput, setUserAnswerInput] = useState('');
  const [exchanges, setExchanges] = useState<InterviewExchange[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [overallVerdict, setOverallVerdict] = useState('');

  // Subscribe to user interview history
  useEffect(() => {
    if (!currentUser) {
      setHistoryList([]);
      return;
    }
    const unsub = subscribeUserInterviews(
      currentUser.uid,
      (sessions) => setHistoryList(sessions),
      (err) => console.error('Interview history subscription error', err)
    );
    return () => unsub();
  }, [currentUser]);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  // Audio / Mic recording
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (inSession && !isFinished) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [inSession, isFinished]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setUserAnswerInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt chưa hỗ trợ Web Speech API nhận diện giọng nói. Bạn có thể gõ câu trả lời trực tiếp.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartInterview = async () => {
    setIsStarting(true);
    setSecondsElapsed(0);
    try {
      const res = await fetch('/api/mock-interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          level: studentLevel,
          difficulty,
          style,
          candidateBackground: candidateBg,
        }),
      });

      if (!res.ok) throw new Error('Không thể khởi tạo');
      const data = await res.json();

      setRecruiterName(data.recruiterName ? `Chị An (${data.recruiterName})` : 'Chị An (Senior HR Recruiter)');
      setWelcomeMessage(data.welcomeMessage || '');
      setFocusAreas(data.focusAreas || ['Cấu trúc STAR', 'Khả năng giải quyết vấn đề', 'Thái độ cầu tiến']);
      setCurrentQuestion(data.firstQuestion || 'Hãy giới thiệu ngắn gọn về một đồ án mà bạn tự hào nhất.');
      setExchanges([]);
      setIsFinished(false);
      setInSession(true);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Có lỗi xảy ra'}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswerInput.trim() || isEvaluating) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const answerToSubmit = userAnswerInput;
    setUserAnswerInput('');
    setIsEvaluating(true);

    try {
      const questionNumber = exchanges.length + 1;
      const res = await fetch('/api/mock-interview/evaluate-and-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          level: studentLevel,
          difficulty,
          style,
          currentQuestion,
          userAnswer: answerToSubmit,
          questionNumber,
        }),
      });

      if (!res.ok) throw new Error('Lỗi chấm điểm');
      const data = await res.json();

      const newExchange: InterviewExchange = {
        questionNumber,
        question: currentQuestion,
        answer: answerToSubmit,
        evaluation: data.evaluation,
        recruiterReaction: data.recruiterReaction,
      };

      setExchanges((prev) => [...prev, newExchange]);

      if (data.isFinished || !data.nextQuestion) {
        setIsFinished(true);
        const verdict = data.overallVerdict || 'Buổi phỏng vấn đã hoàn tất với kết quả ấn tượng!';
        setOverallVerdict(verdict);

        const allExchanges = [...exchanges, newExchange];
        const totalScore = allExchanges.reduce(
          (sum, item) => sum + (item.evaluation?.recruiterScore || 80),
          0
        );
        const calculatedScore = Math.round(totalScore / allExchanges.length);

        if (currentUser) {
          try {
            await saveInterviewSession(currentUser.uid, {
              career: 'IT / Engineering',
              position: role,
              company,
              level: studentLevel,
              difficulty,
              style,
              questionCount: allExchanges.length,
              mode: 'text',
              status: 'completed',
              score: calculatedScore,
              overallVerdict: verdict,
              durationSeconds: secondsElapsed,
              exchanges: allExchanges,
            });
            setHasSavedCurrentSession(true);
          } catch (e) {
            console.error('Failed to auto-save interview session', e);
          }
        }
      } else {
        setCurrentQuestion(data.nextQuestion);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Có lỗi xảy ra'}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetakeSession = (session: SavedInterviewSession) => {
    setCompany(session.company);
    setRole(session.position);
    setDifficulty(session.difficulty);
    setStyle(session.style);
    setViewMode('interview');
    setInSession(false);
    setIsFinished(false);
    setExchanges([]);
    setCurrentQuestion('');
    setHasSavedCurrentSession(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!currentUser) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi buổi phỏng vấn này không?')) return;
    try {
      await deleteInterviewSession(currentUser.uid, sessionId);
    } catch (e: any) {
      alert(`Lỗi khi xóa: ${e.message}`);
    }
  };

  const handleManualSaveSession = async () => {
    if (!currentUser) {
      openAuthModal('login', 'Đăng nhập để lưu kết quả buổi phỏng vấn vào hồ sơ cá nhân.');
      return;
    }
    const totalScore = exchanges.reduce(
      (sum, item) => sum + (item.evaluation?.recruiterScore || 80),
      0
    );
    const calculatedScore = Math.max(70, Math.round(totalScore / (exchanges.length || 1)));

    try {
      await saveInterviewSession(currentUser.uid, {
        career: 'IT / Engineering',
        position: role,
        company,
        level: studentLevel,
        difficulty,
        style,
        questionCount: exchanges.length,
        mode: 'text',
        status: 'completed',
        score: calculatedScore,
        overallVerdict: overallVerdict || 'Buổi phỏng vấn đã hoàn tất!',
        durationSeconds: secondsElapsed,
        exchanges,
      });
      setHasSavedCurrentSession(true);
    } catch (err: any) {
      alert(`Lỗi khi lưu kết quả: ${err.message}`);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Sub-Nav: Interview Room vs Interview History */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs no-print">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setViewMode('interview')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'interview'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Phòng Phỏng Vấn Giả Lập</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('history')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'history'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử Phỏng Vấn Của Tôi</span>
            {currentUser && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                {historyList.length}
              </span>
            )}
          </button>
        </div>

        {currentUser && historyList.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pr-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>
              Điểm cao nhất:{' '}
              <strong className="text-slate-800">
                {Math.max(...historyList.map((s) => s.score))}/100
              </strong>
            </span>
          </div>
        )}
      </div>

      {viewMode === 'interview' && (
        !inSession ? (
        /* SETUP INTERVIEW VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
              <Mic className="w-3.5 h-3.5" />
              <span>Phòng Phỏng Vấn Giả Lập Cùng Chị An</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Luyện Phỏng Vấn Cùng Chị An – Senior HR Recruiter
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
              Chị An sẽ trực tiếp đóng vai nhà tuyển dụng, hỏi từng câu một, đánh giá trực tiếp cấu trúc STAR
              và góp ý chi tiết giúp em tự tin chinh phục vòng phỏng vấn thực tế!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Công ty mục tiêu:
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-600" />
                Vị trí ứng tuyển:
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Độ khó (Tâm lý phỏng vấn):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      difficulty === d
                        ? d === 'Hard'
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : d === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {d === 'Easy' ? 'Ôn hòa' : d === 'Medium' ? 'Thực tế' : 'Áp lực'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Hồ sơ & Đồ án bạn muốn người phỏng vấn xoáy sâu vào:
            </label>
            <textarea
              rows={3}
              value={candidateBg}
              onChange={(e) => setCandidateBg(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleStartInterview}
              disabled={isStarting}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40"
            >
              <Mic className="w-4 h-4" />
              <span>{isStarting ? 'Đang kết nối...' : 'Bắt Đầu Phỏng Vấn 1-1'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE SESSION VIEW */
        <div className="space-y-6">
          {/* Top Bar with Timer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-blue-50 to-indigo-50 flex items-start justify-center overflow-hidden border border-blue-200 flex-shrink-0 pt-0.5 shadow-2xs">
                <ChiAnCharacter
                  height={64}
                  state={isFinished ? 'success' : isEvaluating ? 'thinking' : 'guiding'}
                  interactive={false}
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{company}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {recruiterName} • Độ khó: {difficulty}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{formatTimer(secondsElapsed)}</span>
              </div>

              <button
                onClick={() => setInSession(false)}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thiết lập lại</span>
              </button>
            </div>
          </div>

          {/* Past Exchanges List */}
          {exchanges.map((ex) => (
            <div
              key={ex.questionNumber}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  Q{ex.questionNumber}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Câu hỏi từ Chị An
                </span>
              </div>

              <p className="text-sm font-bold text-slate-900 pl-8 leading-relaxed">
                "{ex.question}"
              </p>

              {/* User answer */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Câu trả lời của bạn:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">{ex.answer}</p>
              </div>

              {/* STAR Evaluation */}
              {ex.evaluation && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-2">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-blue-600" />
                      Đánh Giá STAR & Nhận Xét Của Chị An
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Mức độ tin cậy: {ex.evaluation.hiringConfidence}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Điểm tốt:
                      </span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {ex.evaluation.whatWasGood.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                      <span className="font-bold text-rose-700 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Cần cải thiện:
                      </span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {ex.evaluation.whatFeltWeak.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Better STAR version */}
                  <div className="bg-white p-3.5 rounded-lg border border-blue-100 space-y-1">
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                      ⭐ Câu trả lời mẫu xuất sắc gợi ý từ Chị An:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans italic">
                      "{ex.evaluation.betterStarVersion}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Current Question Box: Chị An is GUIDING when asking, THINKING when evaluating */}
          {!isFinished ? (
            <div className="bg-white border-2 border-blue-500 rounded-2xl p-5 sm:p-6 shadow-md">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Chị An HR Character with state switching */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center p-3 bg-blue-50/80 border border-blue-200 rounded-2xl mx-auto sm:mx-0 shadow-2xs">
                  <ChiAnCharacter
                    height={155}
                    state={isEvaluating ? 'thinking' : 'guiding'}
                    interactive={false}
                  />
                  <span className="text-[11px] font-bold text-blue-800 mt-2 text-center">
                    {isEvaluating ? 'Chị An đang chấm điểm...' : 'Chị An đang đặt câu hỏi'}
                  </span>
                </div>

                {/* Question & Input Area */}
                <div className="flex-1 min-w-0 space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        Q{exchanges.length + 1}
                      </span>
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                        Câu hỏi từ Chị An
                      </span>
                    </div>

                    <button
                      onClick={() => speakQuestion(currentQuestion)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                      title="Nghe đọc câu hỏi"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Nghe câu hỏi</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5">
                    <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed font-sans">
                      "{currentQuestion}"
                    </p>
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700">
                        Câu trả lời của em:
                      </label>

                      <button
                        onClick={toggleListening}
                        className={`text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                          isListening
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Đang nghe giọng nói...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5 text-blue-600" />
                            <span>Bật Mic nói</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      value={userAnswerInput}
                      onChange={(e) => setUserAnswerInput(e.target.value)}
                      placeholder="Áp dụng cấu trúc STAR: Tình huống là gì? Nhiệm vụ của em là gì? Hành động cụ thể? Kết quả đạt được..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                    />

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!userAnswerInput.trim() || isEvaluating}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40"
                      >
                        {isEvaluating ? (
                          <span>Chị An đang phân tích...</span>
                        ) : (
                          <>
                            <span>Gửi câu trả lời cho Chị An</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Finished Card: Chị An is in SUCCESS state celebrating */
            <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs text-center flex flex-col items-center">
              <div className="mb-1">
                <ChiAnCharacter height={165} state="success" interactive={false} />
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl shadow-xs">
                🏆
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Chúc Mừng Em Đã Hoàn Thành Buổi Phỏng Vấn!
              </h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                {overallVerdict}
              </p>

              {/* Account sync badge / CTA */}
              {currentUser ? (
                hasSavedCurrentSession ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã tự động lưu kết quả buổi phỏng vấn vào Lịch sử tài khoản của bạn.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleManualSaveSession}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Lưu kết quả này vào hồ sơ
                  </button>
                )
              ) : (
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 max-w-md mx-auto space-y-2 text-center">
                  <p className="text-xs text-blue-900 font-bold">
                    💡 Bạn muốn lưu lại kết quả và đánh giá STAR này vào hồ sơ cá nhân?
                  </p>
                  <button
                    onClick={() =>
                      openAuthModal('login', 'Đăng nhập để lưu kết quả buổi phỏng vấn vào hồ sơ cá nhân.')
                    }
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Đăng nhập hoặc Đăng ký để lưu
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setInSession(false);
                    setIsFinished(false);
                    setExchanges([]);
                    setCurrentQuestion('');
                    setHasSavedCurrentSession(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Luyện tập lượt phỏng vấn mới cùng Chị An
                </button>

                {currentUser && (
                  <button
                    onClick={() => setViewMode('history')}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Xem lịch sử các buổi luyện tập
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {viewMode === 'history' && (
        /* ================= HISTORY VIEW ================= */
        <div className="space-y-6">
          {!currentUser ? (
            /* Guest Prompt in History */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xs flex flex-col items-center">
              <ChiAnCharacter height={160} state="welcome" interactive={false} />
              <div className="max-w-md space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Theo Dõi Lịch Sử Phỏng Vấn Cùng Chị An
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Đăng nhập tài khoản để Chị An lưu lại từng buổi luyện tập, điểm số cấu trúc STAR,
                  nhận xét chi tiết và theo dõi sự tiến bộ rõ rệt của em!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() =>
                    openAuthModal('login', 'Đăng nhập để xem lịch sử phỏng vấn và nhận xét từ Chị An.')
                  }
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                </button>
                <button
                  onClick={() =>
                    openAuthModal('register', 'Đăng ký tài khoản miễn phí để lưu lịch sử phỏng vấn.')
                  }
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                >
                  Tạo tài khoản miễn phí
                </button>
              </div>
            </div>
          ) : historyList.length === 0 ? (
            /* Empty History State */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xs flex flex-col items-center">
              <ChiAnCharacter height={150} state="idle" interactive={false} />
              <h3 className="text-lg font-bold text-slate-900">Em chưa có buổi phỏng vấn nào được lưu</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
                Hãy bắt đầu buổi phỏng vấn giả lập đầu tiên với Chị An để được hỏi câu hỏi thực tế và
                nhận đánh giá theo chuẩn STAR của nhà tuyển dụng nhé!
              </p>
              <button
                onClick={() => setViewMode('interview')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Bắt đầu phỏng vấn ngay</span>
              </button>
            </div>
          ) : (
            /* Saved Interview Sessions List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Các Buổi Phỏng Vấn Đã Hoàn Thành ({historyList.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xem lại nhận xét của Chị An và tiếp tục cải thiện câu trả lời
                  </p>
                </div>
                <button
                  onClick={() => setViewMode('interview')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Luyện tập buổi mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {historyList.map((session) => {
                  const scoreColor =
                    session.score >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : session.score >= 65
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200';

                  const dateFormatted = new Date(session.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={session.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center flex-shrink-0 ${scoreColor}`}
                        >
                          <span className="text-lg font-black">{session.score}</span>
                          <span className="text-[9px] font-bold uppercase">Điểm STAR</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                              {session.position}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {session.difficulty}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-medium flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-blue-600" />
                            {session.company} • {session.questionCount || session.exchanges.length} câu hỏi
                          </p>

                          <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                            "{session.overallVerdict}"
                          </p>

                          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                            <Calendar className="w-3 h-3" />
                            {dateFormatted}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => {
                            setSelectedDetailSession(session);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem chi tiết</span>
                        </button>

                        <button
                          onClick={() => handleRetakeSession(session)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Luyện lại vị trí này"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Luyện lại</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa bản ghi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal for Past Interview */}
      <InterviewDetailModal
        session={selectedDetailSession}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRetake={handleRetakeSession}
      />
    </div>
  );
};
