import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  FileCheck,
  Mic,
  FileText,
  Briefcase
} from 'lucide-react';
import { IndustryType } from '../types';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface ChatAdvisorProps {
  selectedIndustry: IndustryType;
  onNavigateTab: (tab: string) => void;
}

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'assistant',
  content: `Chào bạn 👋

Tôi sẽ giúp bạn:
- tạo CV ATS chuyên nghiệp
- tối ưu hồ sơ theo JD
- viết Cover Letter
- luyện phỏng vấn
- xây dựng LinkedIn & personal branding

Để bắt đầu, hãy gửi:
- CV hiện tại hoặc thông tin cá nhân
- vị trí muốn ứng tuyển
- JD tuyển dụng (nếu có)

Ví dụ:
'Ứng tuyển Frontend Developer Intern, sinh viên năm 4 CNTT, biết ReactJS và có project ecommerce.'

Tôi sẽ phân tích và hỗ trợ bạn từng bước 🚀`,
  timestamp: 'Vừa xong',
};

export const ChatAdvisor: React.FC<ChatAdvisorProps> = ({
  selectedIndustry,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      title: 'Tạo CV Frontend Intern',
      prompt:
        'Ứng tuyển Frontend Developer Intern, sinh viên năm 4 CNTT, biết ReactJS, TypeScript và có project ecommerce.',
    },
    {
      title: 'CV Backend Java Fresher',
      prompt:
        'Mục tiêu: Ứng tuyển Backend Developer Intern. Thông tin: Sinh viên năm 4 CNTT, GPA 3.5, Java, Spring Boot, MySQL, có project ecommerce, internship 2 tháng. Yêu cầu: CV ATS 1 trang, recruiter-friendly, technical tone.',
    },
    {
      title: 'Luyện Mock Interview Google',
      prompt:
        'Bắt đầu mock interview. Company: Google Vietnam, Role: Data Analyst Intern, Difficulty: Hard, Interview Style: Professional.',
    },
    {
      title: 'Xây dựng LinkedIn Branding',
      prompt:
        'Dựa trên thông tin lập trình viên của tôi: 1. Viết LinkedIn headline hấp dẫn, 2. Viết About section thu hút recruiter, 3. Tạo 30s elevator pitch.',
    },
    {
      title: 'Nâng cấp Bullet Point',
      prompt:
        'Hãy áp dụng High-Impact Writing Engine để nâng cấp câu này thành chuẩn định lượng recruiter thích đọc: "Tham gia làm website thương mại điện tử bằng React".',
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userProfile: { industry: selectedIndustry },
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi phản hồi từ hệ thống');
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'CareerMaster đã nhận thông tin và đang xử lý.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Xin lỗi bạn, đã có trục trặc: ${err?.message || 'Không thể kết nối máy chủ'}. Hãy thử lại hoặc chọn một công cụ bên cạnh.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-5xl mx-auto px-4 py-4">
      {/* Top Strategist Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-3.5 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">Career Intelligence Engine</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active • {selectedIndustry}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Senior Recruiter Simulator • Tối ưu tâm lý nhà tuyển dụng & tỷ lệ được gọi phỏng vấn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('ats')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mở ATS Scanner</span>
          </button>
          <button
            onClick={() => onNavigateTab('interview')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mock Interview</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex-shrink-0 flex items-center justify-center mt-1">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md relative group text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-sm'
                    : 'bg-indigo-600 text-white rounded-tr-sm font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                <div
                  className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px] ${
                    isAssistant
                      ? 'border-slate-800/80 text-slate-500'
                      : 'border-indigo-500/40 text-indigo-200'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isAssistant && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 hover:text-slate-300 flex items-center gap-1 transition-opacity"
                      title="Sao chép câu trả lời"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center mt-1">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>CareerMaster đang phân tích & xây dựng chiến lược tuyển dụng...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts suggestions */}
      <div className="py-2 overflow-x-auto scrollbar-none flex gap-2">
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 relative shadow-lg focus-within:border-indigo-500 transition-colors">
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Nhập thông tin cá nhân, vị trí muốn ứng tuyển, hoặc dán JD vào đây... (Nhấn Enter để gửi)"
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none border-none outline-none focus:ring-0 px-2 py-1"
        />

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 px-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>CareerMaster AI Studio™</span>
            <span>•</span>
            <span className="text-slate-400">Shift + Enter để xuống dòng</span>
          </div>

          <button
            disabled={!input.trim() || isLoading}
            onClick={() => handleSend()}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <span>Phân tích</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
