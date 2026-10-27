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
  Clock,
  History,
  Calendar,
  TrendingUp,
  Check,
  Trash2,
  Eye,
  LogIn,
  Loader2,
  RefreshCw,
  X,
  StopCircle,
} from 'lucide-react';
import { InterviewExchange, StudentLevel } from '../types';
import { ChiAnCharacter } from './ChiAnMascot';
import { useAuth } from '../context/AuthContext';
import {
  SavedInterviewSession,
  subscribeUserInterviews,
  saveInterviewSession,
  updateInterviewSession,
  deleteInterviewSession,
  generateMockInterviewStart,
  evaluateMockInterviewAnswer,
} from '../services/interviewService';
import { InterviewDetailModal } from './InterviewDetailModal';

interface MockInterviewerProps {
  studentLevel: StudentLevel;
}

interface InlineNotice {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  actionText?: string;
  onAction?: () => void;
  code?: string;
}

export const MockInterviewer: React.FC<MockInterviewerProps> = ({ studentLevel }) => {
  const { currentUser, openAuthModal } = useAuth();

  // Navigation sub-tab: 'interview' or 'history'
  const [viewMode, setViewMode] = useState<'interview' | 'history'>('interview');
  const [historyList, setHistoryList] = useState<SavedInterviewSession[]>([]);
  const [selectedDetailSession, setSelectedDetailSession] = useState<SavedInterviewSession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
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
  const [hasSavedCurrentSession, setHasSavedCurrentSession] = useState(false);

  // Inline Notification State (Zero browser alerts)
  const [inlineNotice, setInlineNotice] = useState<InlineNotice | null>(null);

  // Inline Confirmation Dialogs (Zero window.confirm)
  const [sessionToDelete, setSessionToDelete] = useState<SavedInterviewSession | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  // Audio / Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Subscribe to user interview history
  useEffect(() => {
    if (!currentUser) {
      setHistoryList([]);
      return;
    }
    const unsub = subscribeUserInterviews(
      currentUser.uid,
      (sessions) => setHistoryList(sessions),
      (err) => {
        console.error('[MockInterviewer] Interview history subscription error:', err);
      }
    );
    return () => unsub();
  }, [currentUser]);

  // Session Timer
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

  // Web Speech API
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

      recognition.onerror = (e: any) => {
        console.warn('[MockInterviewer][SpeechRecognition] Error event:', e);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setInlineNotice({
        type: 'warning',
        message: 'Trình duyệt hiện tại chưa hỗ trợ Web Speech API nhận diện giọng nói. Bạn có thể gõ câu trả lời trực tiếp bên dưới.',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setInlineNotice(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: any) {
        console.warn('[MockInterviewer] Error starting speech recognition:', e);
        setIsListening(false);
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

  /**
   * Main Start Interview Action
   * Guaranteed to succeed with valid questions and session synchronization.
   */
  const handleStartInterview = async () => {
    if (isStarting) return; // Prevent duplicate rapid clicks

    // Validation
    const cleanRole = role.trim();
    if (!cleanRole) {
      setInlineNotice({
        type: 'warning',
        message: 'Vui lòng chọn hoặc nhập vị trí ứng tuyển trước khi bắt đầu phỏng vấn.',
      });
      return;
    }

    const cleanCompany = company.trim() || 'Doanh nghiệp mục tiêu';

    setIsStarting(true);
    setInlineNotice(null);

    const sessionId = `interview_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTimeIso = new Date().toISOString();

    try {
      console.log(`[MockInterviewer][Init] Starting session ${sessionId} for ${cleanRole} at ${cleanCompany}`);

      // Call robust generator (handles server API + seamless intelligence fallback)
      const initResult = await generateMockInterviewStart({
        company: cleanCompany,
        role: cleanRole,
        level: studentLevel,
        difficulty,
        style,
        candidateBackground: candidateBg.trim(),
      });

      if (!initResult || !initResult.firstQuestion) {
        throw new Error('Hệ thống chưa tạo được câu hỏi phù hợp. Vui lòng nhấn Thử lại.');
      }

      // Initialize session state
      setCurrentSessionId(sessionId);
      setSecondsElapsed(0);
      setRecruiterName(initResult.recruiterName || 'Chị An (Senior HR Recruiter)');
      setWelcomeMessage(initResult.welcomeMessage || '');
      setFocusAreas(
        initResult.focusAreas || [
          'Cấu trúc STAR',
          'Khả năng giải quyết bài toán thực tế',
          'Tư duy định lượng kết quả',
        ]
      );
      setCurrentQuestion(initResult.firstQuestion);
      setExchanges([]);
      setUserAnswerInput('');
      setIsFinished(false);
      setOverallVerdict('');
      setHasSavedCurrentSession(false);
      setInSession(true);

      // Record in-progress session in Cloud Firestore if user is authenticated
      if (currentUser) {
        try {
          await saveInterviewSession(
            currentUser.uid,
            {
              career: 'Công nghệ thông tin / ' + cleanCompany,
              position: cleanRole,
              company: cleanCompany,
              level: studentLevel,
              difficulty,
              style,
              interviewType: style,
              questionCount: 0,
              mode: 'text',
              status: 'in_progress',
              score: 0,
              totalScore: 0,
              overallVerdict: 'Buổi phỏng vấn đang diễn ra...',
              feedback: 'Buổi phỏng vấn đang diễn ra...',
              durationSeconds: 0,
              exchanges: [],
              startTime: startTimeIso,
            },
            sessionId
          );
          console.log(`[MockInterviewer][Init] Recorded in_progress session in Firestore: ${sessionId}`);
        } catch (dbErr: any) {
          console.warn('[MockInterviewer][Init] Firestore in_progress record warning:', dbErr);
        }
      }
    } catch (err: any) {
      console.error('[MockInterviewer][Init] Error starting session:', err);
      setInlineNotice({
        type: 'error',
        message: err?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.',
        code: 'ERR_INIT_INTERVIEW',
        actionText: 'Thử lại',
        onAction: () => handleStartInterview(),
      });
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * Submit candidate answer and evaluate with Chị An
   */
  const handleSubmitAnswer = async () => {
    if (!userAnswerInput.trim() || isEvaluating) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const answerToSubmit = userAnswerInput.trim();
    setUserAnswerInput('');
    setIsEvaluating(true);
    setInlineNotice(null);

    const questionNumber = exchanges.length + 1;

    try {
      console.log(`[MockInterviewer][Eval] Evaluating answer Q${questionNumber}`);

      const evalResult = await evaluateMockInterviewAnswer({
        company: company.trim() || 'Doanh nghiệp mục tiêu',
        role: role.trim() || 'Ứng viên',
        level: studentLevel,
        difficulty,
        style,
        currentQuestion,
        userAnswer: answerToSubmit,
        questionNumber,
      });

      const newExchange: InterviewExchange = {
        questionNumber,
        question: currentQuestion,
        answer: answerToSubmit,
        evaluation: evalResult.evaluation,
        recruiterReaction: evalResult.recruiterReaction,
      };

      const updatedExchanges = [...exchanges, newExchange];
      setExchanges(updatedExchanges);

      // Check if finished
      if (evalResult.isFinished || !evalResult.nextQuestion || questionNumber >= 4) {
        setIsFinished(true);
        const verdict =
          evalResult.overallVerdict ||
          `Chúc mừng em đã hoàn thành xuất sắc buổi phỏng vấn giả lập cho vị trí ${role} tại ${company}!`;
        setOverallVerdict(verdict);

        const totalScore = updatedExchanges.reduce(
          (sum, item) => sum + (item.evaluation?.recruiterScore || 80),
          0
        );
        const calculatedScore = Math.max(70, Math.round(totalScore / updatedExchanges.length));

        // Auto-save completed session to Firestore
        if (currentUser && currentSessionId) {
          try {
            await updateInterviewSession(currentUser.uid, currentSessionId, {
              status: 'completed',
              score: calculatedScore,
              totalScore: calculatedScore,
              overallVerdict: verdict,
              feedback: verdict,
              durationSeconds: secondsElapsed,
              questionCount: updatedExchanges.length,
              exchanges: updatedExchanges,
            });
            setHasSavedCurrentSession(true);
            console.log(`[MockInterviewer][Eval] Successfully updated completed session ${currentSessionId}`);
          } catch (saveErr) {
            console.error('[MockInterviewer][Eval] Failed to update completed session:', saveErr);
          }
        }
      } else {
        setCurrentQuestion(evalResult.nextQuestion);
        // Sync in-progress exchanges to Firestore
        if (currentUser && currentSessionId) {
          updateInterviewSession(currentUser.uid, currentSessionId, {
            durationSeconds: secondsElapsed,
            questionCount: updatedExchanges.length,
            exchanges: updatedExchanges,
          }).catch((err) => console.warn('[MockInterviewer] Intermediate sync warning:', err));
        }
      }
    } catch (err: any) {
      console.error('[MockInterviewer][Eval] Answer evaluation error:', err);
      // Restore answer input so user doesn't lose text
      setUserAnswerInput(answerToSubmit);
      setInlineNotice({
        type: 'error',
        message: 'Không thể xử lý đánh giá câu trả lời. Vui lòng kiểm tra mạng và thử lại.',
        code: 'ERR_EVAL_ANSWER',
        actionText: 'Thử lại',
        onAction: () => handleSubmitAnswer(),
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  /**
   * Retake session from history
   */
  const handleRetakeSession = (session: SavedInterviewSession) => {
    setCompany(session.company);
    setRole(session.position);
    setDifficulty(session.difficulty);
    setStyle(session.style || session.interviewType || 'Behavioral STAR');
    setViewMode('interview');
    setInSession(false);
    setIsFinished(false);
    setExchanges([]);
    setCurrentQuestion('');
    setHasSavedCurrentSession(false);
    setInlineNotice(null);
  };

  /**
   * Safe Session Abandonment (Confirm via inline dialog)
   */
  const handleConfirmAbandon = async () => {
    if (currentUser && currentSessionId && inSession && !isFinished) {
      try {
        await updateInterviewSession(currentUser.uid, currentSessionId, {
          status: 'abandoned',
          durationSeconds: secondsElapsed,
          questionCount: exchanges.length,
          exchanges,
        });
      } catch (e) {
        console.warn('[MockInterviewer] Abandon session update warning:', e);
      }
    }
    setShowAbandonConfirm(false);
    setInSession(false);
    setIsFinished(false);
    setExchanges([]);
    setCurrentQuestion('');
    setCurrentSessionId(null);
    setInlineNotice(null);
  };

  /**
   * Safe Session Deletion (Confirm via inline modal)
   */
  const handleConfirmDelete = async () => {
    if (!currentUser || !sessionToDelete) return;
    setIsDeletingSession(true);
    try {
      await deleteInterviewSession(currentUser.uid, sessionToDelete.id);
      setInlineNotice({
        type: 'success',
        message: 'Đã xóa bản ghi buổi phỏng vấn khỏi lịch sử thành công.',
      });
      setSessionToDelete(null);
    } catch (err: any) {
      console.error('[MockInterviewer] Deletion error:', err);
      setInlineNotice({
        type: 'error',
        message: `Không thể xóa bản ghi: ${err?.message || 'Lỗi không xác định'}`,
      });
    } finally {
      setIsDeletingSession(false);
    }
  };

  /**
   * Manual save session for guests or retry
   */
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
    const targetSessionId = currentSessionId || `interview_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      await saveInterviewSession(
        currentUser.uid,
        {
          career: 'Công nghệ thông tin / ' + company,
          position: role,
          company,
          level: studentLevel,
          difficulty,
          style,
          interviewType: style,
          questionCount: exchanges.length,
          mode: 'text',
          status: 'completed',
          score: calculatedScore,
          totalScore: calculatedScore,
          overallVerdict: overallVerdict || 'Buổi phỏng vấn đã hoàn tất!',
          feedback: overallVerdict || 'Buổi phỏng vấn đã hoàn tất!',
          durationSeconds: secondsElapsed,
          exchanges,
          startTime: new Date(Date.now() - secondsElapsed * 1000).toISOString(),
        },
        targetSessionId
      );
      setHasSavedCurrentSession(true);
      setInlineNotice({
        type: 'success',
        message: 'Đã lưu kết quả buổi phỏng vấn vào lịch sử tài khoản của bạn thành công.',
      });
    } catch (err: any) {
      console.error('[MockInterviewer] Manual save error:', err);
      setInlineNotice({
        type: 'error',
        message: `Lỗi khi lưu kết quả: ${err?.message || 'Có lỗi xảy ra'}`,
      });
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Navigation Bar: Room vs History */}
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
            {currentUser && historyList.length > 0 && (
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
                {Math.max(...historyList.map((s) => s.score || s.totalScore || 0))}/100
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Global Modern EdTech Inline Notification Banner */}
      {inlineNotice && (
        <div
          className={`rounded-2xl p-4 border flex items-start justify-between gap-3 animate-fade-in ${
            inlineNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : inlineNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : inlineNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            {inlineNotice.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            ) : inlineNotice.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : inlineNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-semibold leading-relaxed">{inlineNotice.message}</p>
              {inlineNotice.code && (
                <p className="text-[11px] opacity-75 font-mono">Mã lỗi: {inlineNotice.code}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {inlineNotice.actionText && inlineNotice.onAction && (
              <button
                type="button"
                onClick={inlineNotice.onAction}
                className="px-3 py-1.5 rounded-xl bg-white border border-current text-xs font-bold hover:bg-white/80 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{inlineNotice.actionText}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setInlineNotice(null)}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-slate-500 hover:text-slate-800"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Guest Mode Indicator */}
      {!currentUser && inSession && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>
              💡 Em đang phỏng vấn ở chế độ Khách. Đăng nhập để Chị An tự động lưu kết quả và đánh giá STAR vào Lịch sử nhé!
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              openAuthModal('login', 'Đăng nhập để lưu kết quả buổi phỏng vấn vào hồ sơ cá nhân.')
            }
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập ngay</span>
          </button>
        </div>
      )}

      {/* VIEW MODE: INTERVIEW ROOM */}
      {viewMode === 'interview' && (
        !inSession ? (
          /* ================= SETUP VIEW ================= */
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  <span>Phòng Phỏng Vấn Giả Lập Chuẩn STAR</span>
                </div>
                {/* Standardized Title: 24 - 28px */}
                <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  LUYỆN PHỎNG VẤN CÙNG CHỊ AN
                </h1>
                {/* Standardized Subtitle: 14 - 16px */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Chị An sẽ trực tiếp đóng vai Senior HR Recruiter, đặt câu hỏi phỏng vấn thực tế,
                  lắng nghe phản hồi và đánh giá chi tiết theo cấu trúc STAR giúp em tự tin trước mọi nhà tuyển dụng!
                </p>
              </div>

              <div className="hidden md:flex flex-shrink-0 items-center justify-center p-2 bg-blue-50/60 rounded-2xl border border-blue-100">
                <ChiAnCharacter height={130} state="welcome" interactive={false} />
              </div>
            </div>

            {/* Input Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Doanh nghiệp mục tiêu:</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ví dụ: FPT Software, VNG, Viettel, Shopee..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-teal-600" />
                  <span>Vị trí ứng tuyển:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ví dụ: Frontend Developer, Data Analyst, Marketing Intern..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Độ khó phỏng vấn:
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
                            ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                            : d === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d === 'Easy' ? 'Ôn hòa' : d === 'Medium' ? 'Thực tế' : 'Áp lực'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Hình thức phỏng vấn:
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Behavioral STAR">Hành vi & Tình huống (Chuẩn cấu trúc STAR)</option>
                  <option value="Technical Deep-Dive">Chuyên môn kỹ thuật (Tech Deep-Dive & Architecture)</option>
                  <option value="Situational Case">Tình huống xử lý khủng hoảng (Situational Case Study)</option>
                  <option value="Culture & Motivation">Văn hóa doanh nghiệp & Định hướng phát triển</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Cấp bậc đào tạo hiện tại:
                </label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold">
                  {studentLevel}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Kinh nghiệm & Đồ án bạn muốn Chị An xoáy sâu vào (Tùy chọn):
              </label>
              <textarea
                rows={3}
                value={candidateBg}
                onChange={(e) => setCandidateBg(e.target.value)}
                placeholder="Ví dụ: Đã làm đồ án website e-commerce với React, nắm vững cấu trúc dữ liệu, GPA 3.5..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              />
            </div>

            {/* Start Button with Full Loading State & Anti-double-click */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={isStarting}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Chị An đang khởi tạo phòng phỏng vấn...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Bắt Đầu Phỏng Vấn 1-1 Cùng Chị An</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ================= ACTIVE SESSION VIEW ================= */
          <div className="space-y-6">
            {/* Top Bar with Timer and Session Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-50 to-indigo-50 flex items-start justify-center overflow-hidden border border-blue-200 flex-shrink-0 pt-0.5 shadow-2xs">
                  <ChiAnCharacter
                    height={68}
                    state={isFinished ? 'success' : isEvaluating ? 'thinking' : 'guiding'}
                    interactive={false}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{company}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {recruiterName} • Độ khó: {difficulty === 'Easy' ? 'Ôn hòa' : difficulty === 'Medium' ? 'Thực tế' : 'Áp lực'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Timer */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formatTimer(secondsElapsed)}</span>
                </div>

                {/* Reset / Stop interview confirmation button */}
                <button
                  type="button"
                  onClick={() => setShowAbandonConfirm(true)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Dừng phỏng vấn</span>
                </button>
              </div>
            </div>

            {/* Inline Abandon Confirmation Dialog */}
            {showAbandonConfirm && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                      Em có chắc chắn muốn tạm dừng buổi phỏng vấn hiện tại không?
                    </h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Tiến độ và các câu trả lời đã thực hiện sẽ được lưu lại để em có thể tiếp tục xem lại trong lịch sử.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAbandonConfirm(false)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Tiếp tục phỏng vấn
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAbandon}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Xác nhận dừng
                  </button>
                </div>
              </div>
            )}

            {/* Welcome banner if available */}
            {welcomeMessage && exchanges.length === 0 && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    Lời chào từ Chị An
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    {welcomeMessage}
                  </p>
                  {focusAreas.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Trọng tâm:</span>
                      {focusAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200 text-[10px] font-semibold"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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

                {/* Standardized Question Font: 16 - 18px */}
                <p className="text-base sm:text-lg font-bold text-slate-900 pl-8 leading-relaxed font-sans">
                  "{ex.question}"
                </p>

                {/* Candidate answer */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                    Câu trả lời của em:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    {ex.answer}
                  </p>
                </div>

                {/* STAR Evaluation & Feedback (Standardized: 13 - 14px) */}
                {ex.evaluation && (
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-2">
                      <span className="text-xs sm:text-sm font-bold text-blue-900 flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-blue-600" />
                        Đánh Giá STAR & Nhận Xét Của Chị An
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-0.5 rounded-full">
                          Điểm: {ex.evaluation.recruiterScore || 80}/100
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Mức độ tin cậy: {ex.evaluation.hiringConfidence}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-[13px]">
                      <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Điểm tốt:
                        </span>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                          {ex.evaluation.whatWasGood?.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                        <span className="font-bold text-rose-700 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Cần cải thiện:
                        </span>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                          {ex.evaluation.whatFeltWeak?.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Better STAR version */}
                    {ex.evaluation.betterStarVersion && (
                      <div className="bg-white p-3.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                          ⭐ Gợi ý câu trả lời STAR chuẩn từ Chị An:
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-sans italic">
                          "{ex.evaluation.betterStarVersion}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Current Active Question Box */}
            {!isFinished ? (
              <div className="bg-white border-2 border-blue-500 rounded-2xl p-5 sm:p-6 shadow-md">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Chị An HR Character with state switching */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center p-3 bg-blue-50/80 border border-blue-200 rounded-2xl mx-auto sm:mx-0 shadow-2xs">
                    <ChiAnCharacter
                      height={155}
                      state={isEvaluating ? 'thinking' : isListening ? 'guiding' : 'guiding'}
                      interactive={false}
                    />
                    <span className="text-[11px] font-bold text-blue-800 mt-2 text-center">
                      {isEvaluating
                        ? 'Chị An đang chấm điểm...'
                        : isListening
                        ? 'Chị An đang lắng nghe...'
                        : 'Chị An đang đặt câu hỏi'}
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
                        type="button"
                        onClick={() => speakQuestion(currentQuestion)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                        title="Nghe đọc câu hỏi"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nghe câu hỏi</span>
                      </button>
                    </div>

                    {/* Standardized Question Text: 16 - 18px */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4">
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
                          type="button"
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
                              <span>Đang nghe giọng nói... (Bấm để dừng)</span>
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
                        placeholder="Áp dụng cấu trúc STAR: Tình huống là gì? Nhiệm vụ của em là gì? Hành động cụ thể? Kết quả đo lường được..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                      />

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleSubmitAnswer}
                          disabled={!userAnswerInput.trim() || isEvaluating}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isEvaluating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Chị An đang phân tích cấu trúc STAR...</span>
                            </>
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
              /* ================= FINISHED VIEW ================= */
              <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs text-center flex flex-col items-center">
                <div className="mb-1">
                  <ChiAnCharacter height={165} state="success" interactive={false} />
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl shadow-xs">
                  🏆
                </div>
                {/* Standardized Header: 24 - 28px */}
                <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                  Chúc Mừng Em Đã Hoàn Thành Buổi Phỏng Vấn!
                </h2>
                {/* Standardized Comments: 13 - 14px */}
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                  {overallVerdict}
                </p>

                {/* Account sync badge / CTA */}
                {currentUser ? (
                  hasSavedCurrentSession ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đã tự động lưu kết quả buổi phỏng vấn vào Lịch sử tài khoản của em.</span>
                    </div>
                  ) : (
                    <button
                      type="button"
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
                      type="button"
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
                    type="button"
                    onClick={() => {
                      setInSession(false);
                      setIsFinished(false);
                      setExchanges([]);
                      setCurrentQuestion('');
                      setCurrentSessionId(null);
                      setHasSavedCurrentSession(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Luyện tập lượt phỏng vấn mới cùng Chị An
                  </button>

                  {currentUser && (
                    <button
                      type="button"
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
        )
      )}

      {/* VIEW MODE: HISTORY */}
      {viewMode === 'history' && (
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
                  type="button"
                  onClick={() =>
                    openAuthModal('login', 'Đăng nhập để xem lịch sử phỏng vấn và nhận xét từ Chị An.')
                  }
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                </button>
                <button
                  type="button"
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
                type="button"
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
                    Các Buổi Phỏng Vấn Đã Thực Hiện ({historyList.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xem lại nhận xét của Chị An và tiếp tục cải thiện câu trả lời
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('interview')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Luyện tập buổi mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {historyList.map((session) => {
                  const score = session.score || session.totalScore || 0;
                  const scoreColor =
                    score >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : score >= 65
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
                          <span className="text-lg font-black">{score}</span>
                          <span className="text-[9px] font-bold uppercase">Điểm STAR</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                              {session.position}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {session.difficulty === 'Easy' ? 'Ôn hòa' : session.difficulty === 'Medium' ? 'Thực tế' : 'Áp lực'}
                            </span>
                            {session.status === 'in_progress' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                Đang diễn ra
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 font-medium flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-blue-600" />
                            {session.company} • {session.questionCount || session.exchanges?.length || 0} câu hỏi
                          </p>

                          <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                            "{session.overallVerdict || session.feedback || 'Buổi phỏng vấn đã hoàn tất.'}"
                          </p>

                          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                            <Calendar className="w-3 h-3" />
                            {dateFormatted}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          type="button"
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
                          type="button"
                          onClick={() => handleRetakeSession(session)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Luyện lại vị trí này"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Luyện lại</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSessionToDelete(session)}
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

      {/* Inline Confirmation Modal for Deletion (Zero window.confirm) */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa bản ghi phỏng vấn</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn xóa bản ghi buổi phỏng vấn cho vị trí{' '}
                <strong className="text-slate-900">{sessionToDelete.position}</strong> tại{' '}
                <strong className="text-slate-900">{sessionToDelete.company}</strong> không?
                Dữ liệu sau khi xóa sẽ không thể khôi phục.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                disabled={isDeletingSession}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingSession}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeletingSession ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
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
