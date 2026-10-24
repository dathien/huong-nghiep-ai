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
  UserCheck
} from 'lucide-react';
import { InterviewExchange, InterviewEvaluation, StudentLevel } from '../types';
import { ChiAnCharacter } from './ChiAnMascot';

interface MockInterviewerProps {
  studentLevel: StudentLevel;
}

export const MockInterviewer: React.FC<MockInterviewerProps> = ({ studentLevel }) => {
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
        setOverallVerdict(data.overallVerdict || 'Buổi phỏng vấn đã hoàn tất với kết quả ấn tượng!');
      } else {
        setCurrentQuestion(data.nextQuestion);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Có lỗi xảy ra'}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {!inSession ? (
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
              <button
                onClick={() => setInSession(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Luyện tập lượt phỏng vấn mới cùng Chị An
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
