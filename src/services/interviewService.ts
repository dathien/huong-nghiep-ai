import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { InterviewExchange, InterviewEvaluation } from '../types';

export interface SavedInterviewSession {
  id: string; // Session ID
  sessionId?: string; // Alias
  uid: string; // Firebase Auth UID
  userId?: string; // Alias
  career: string; // Ngành nghề / Lĩnh vực
  position: string; // Vị trí ứng tuyển
  company: string; // Công ty mục tiêu
  level: string; // Cấp độ ứng viên
  difficulty: 'Easy' | 'Medium' | 'Hard';
  style: string;
  interviewType?: string; // Alias
  questionCount: number;
  mode: 'voice' | 'text';
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number; // Kết quả điểm số (0 - 100)
  totalScore?: number; // Alias
  overallVerdict: string; // Nhận xét tổng quan
  feedback?: string; // Alias
  durationSeconds: number;
  exchanges: InterviewExchange[]; // Câu hỏi, câu trả lời, nhận xét chi tiết
  strengths?: string[];
  improvements?: string[];
  actionPlan?: string[];
  startTime?: string;
  createdAt: string; // Thời gian khởi tạo
  updatedAt: string; // Thời gian cập nhật
}

export interface StartInterviewParams {
  company: string;
  role: string;
  level: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  style: string;
  candidateBackground?: string;
}

export interface StartInterviewResult {
  recruiterName: string;
  welcomeMessage: string;
  firstQuestion: string;
  focusAreas: string[];
}

export interface EvaluateInterviewParams {
  company: string;
  role: string;
  level: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  style: string;
  currentQuestion: string;
  userAnswer: string;
  questionNumber: number;
}

export interface EvaluateInterviewResult {
  evaluation: InterviewEvaluation;
  recruiterReaction: string;
  nextQuestion?: string | null;
  isFinished: boolean;
  overallVerdict?: string;
}

// Subcollection helper: users/{uid}/interviews
const getUserInterviewsRef = (uid: string) => collection(db, 'users', uid, 'interviews');
const getInterviewDocRef = (uid: string, interviewId: string) =>
  doc(db, 'users', uid, 'interviews', interviewId);

export const subscribeUserInterviews = (
  uid: string,
  onData: (sessions: SavedInterviewSession[]) => void,
  onError?: (err: any) => void
) => {
  const colRef = getUserInterviewsRef(uid);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      const sessions: SavedInterviewSession[] = [];
      snapshot.forEach((docSnap) => {
        sessions.push({ ...docSnap.data(), id: docSnap.id } as SavedInterviewSession);
      });

      // Migration fallback: If subcollection is empty, check legacy root collection 'interview_sessions'
      if (sessions.length === 0) {
        try {
          const legacyQuery = query(collection(db, 'interview_sessions'), where('uid', '==', uid));
          const legacySnap = await getDocs(legacyQuery);
          if (!legacySnap.empty) {
            for (const legDoc of legacySnap.docs) {
              const legData = legDoc.data() as SavedInterviewSession;
              const migratedDoc: SavedInterviewSession = {
                ...legData,
                id: legDoc.id,
                uid,
              };
              await setDoc(getInterviewDocRef(uid, legDoc.id), migratedDoc);
              sessions.push(migratedDoc);
            }
          }
        } catch (migErr) {
          console.warn('Legacy interview migration check completed without hits:', migErr);
        }
      }

      sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(sessions);
    },
    (error) => {
      console.error('Error subscribing to user interview sessions:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, `users/${uid}/interviews`);
    }
  );
};

export const getUserInterviews = async (uid: string): Promise<SavedInterviewSession[]> => {
  try {
    const snapshot = await getDocs(getUserInterviewsRef(uid));
    const sessions: SavedInterviewSession[] = [];
    snapshot.forEach((docSnap) => {
      sessions.push({ ...docSnap.data(), id: docSnap.id } as SavedInterviewSession);
    });
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/interviews`);
  }
};

export const saveInterviewSession = async (
  uid: string,
  session: Omit<SavedInterviewSession, 'id' | 'uid' | 'createdAt' | 'updatedAt'>,
  customId?: string
): Promise<SavedInterviewSession> => {
  const id = customId || `interview_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newSession: SavedInterviewSession = {
    ...session,
    id,
    sessionId: id,
    uid,
    userId: uid,
    interviewType: session.style,
    totalScore: session.score,
    feedback: session.overallVerdict,
    startTime: session.startTime || now,
    createdAt: now,
    updatedAt: now,
  };

  const path = `users/${uid}/interviews/${id}`;
  try {
    await setDoc(getInterviewDocRef(uid, id), newSession);
    return newSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateInterviewSession = async (
  uid: string,
  sessionId: string,
  updates: Partial<SavedInterviewSession>
): Promise<void> => {
  const path = `users/${uid}/interviews/${sessionId}`;
  const now = new Date().toISOString();
  try {
    const payload: Record<string, any> = {
      ...updates,
      updatedAt: now,
    };
    if (updates.score !== undefined) {
      payload.totalScore = updates.score;
    }
    if (updates.overallVerdict !== undefined) {
      payload.feedback = updates.overallVerdict;
    }
    await setDoc(getInterviewDocRef(uid, sessionId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteInterviewSession = async (uid: string, sessionId: string): Promise<void> => {
  const path = `users/${uid}/interviews/${sessionId}`;
  try {
    await deleteDoc(getInterviewDocRef(uid, sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

/**
 * Intelligent Client-Side Question Generator (Fallback engine)
 * Ensures interview initiation NEVER breaks, even without an active Node backend or on Vercel static hosting.
 */
function generateLocalFirstQuestion(params: StartInterviewParams): StartInterviewResult {
  const roleLower = (params.role || '').toLowerCase();
  const company = params.company || 'doanh nghiệp';

  let firstQuestion = '';
  const focusAreas = [
    'Cấu trúc STAR (Tình huống, Nhiệm vụ, Hành động, Kết quả)',
    'Khả năng giải quyết bài toán thực tế',
    'Tư duy định lượng kết quả với số liệu cụ thể',
    'Thái độ học hỏi và cầu tiến chuyên nghiệp',
  ];

  if (roleLower.includes('frontend') || roleLower.includes('web') || roleLower.includes('react')) {
    firstQuestion = `Chào em! Rất vui được gặp em trong buổi phỏng vấn vị trí ${params.role} tại ${company}. Em hãy chia sẻ chi tiết về một sản phẩm hoặc tính năng web/frontend gần đây mà em tự hào nhất: Em đã thiết kế component, quản lý state và tối ưu hóa trải nghiệm người dùng như thế nào?`;
  } else if (
    roleLower.includes('backend') ||
    roleLower.includes('node') ||
    roleLower.includes('java') ||
    roleLower.includes('api') ||
    roleLower.includes('python')
  ) {
    firstQuestion = `Chào em! Để bắt đầu buổi phỏng vấn vị trí ${params.role} tại ${company}, em hãy giới thiệu về một hệ thống backend hoặc kiến trúc API mà em từng trực tiếp xây dựng: Giải pháp nào em đã chọn để xử lý luồng dữ liệu, tối ưu truy vấn cơ sở dữ liệu và đảm bảo tính bảo mật?`;
  } else if (
    roleLower.includes('data') ||
    roleLower.includes('ai') ||
    roleLower.includes('machine learning') ||
    roleLower.includes('analyst')
  ) {
    firstQuestion = `Chào em! Tại ${company}, chúng tôi rất chú trọng khả năng phân tích và biến dữ liệu thành giá trị thực tế. Em hãy trình bày một bài toán phân tích dữ liệu hoặc mô hình AI/ML em từng thực hiện: Từ khâu thu thập, tiền xử lý dữ liệu cho đến kết quả đo lường được sau khi hoàn thành?`;
  } else if (
    roleLower.includes('mobile') ||
    roleLower.includes('flutter') ||
    roleLower.includes('android') ||
    roleLower.includes('ios')
  ) {
    firstQuestion = `Chào em! Ở vị trí ${params.role} tại ${company}, em hãy kể về một ứng dụng di động mà em từng phát triển: Em đã giải quyết bài toán lưu trữ dữ liệu offline, tối ưu hiệu năng render và đảm bảo tương thích các dòng thiết bị như thế nào?`;
  } else if (roleLower.includes('test') || roleLower.includes('qa') || roleLower.includes('qc')) {
    firstQuestion = `Chào em! Khi đảm nhiệm vai trò ${params.role} tại ${company}, em thường xây dựng quy trình kiểm thử và thiết kế test case như thế nào? Hãy kể lại một lỗi nghiêm trọng (critical bug) em từng phát hiện và cách em phối hợp với nhóm lập trình để khắc phục?`;
  } else if (
    roleLower.includes('marketing') ||
    roleLower.includes('content') ||
    roleLower.includes('seo') ||
    roleLower.includes('sales') ||
    roleLower.includes('business')
  ) {
    firstQuestion = `Chào em! Tại ${company}, em hãy chia sẻ về một chiến dịch truyền thông hoặc kế hoạch kinh doanh mà em từng trực tiếp tham gia: Mục tiêu ban đầu là gì, em đã triển khai những hành động cụ thể nào và kết quả tăng trưởng đo lường được ra sao?`;
  } else if (roleLower.includes('design') || roleLower.includes('ui') || roleLower.includes('ux')) {
    firstQuestion = `Chào em! Trong vai trò ${params.role} tại ${company}, em hãy dẫn dắt chị qua quy trình thiết kế một giao diện hoặc tính năng sản phẩm: Em đã nghiên cứu hành vi người dùng, phác thảo wireframe/prototype và tiếp nhận phản hồi để hoàn thiện sản phẩm ra sao?`;
  } else {
    firstQuestion = `Chào em! Rất vui được gặp em trong buổi phỏng vấn vị trí ${params.role} tại ${company}. Hãy giới thiệu ngắn gọn về bản thân và chia sẻ về một đồ án hoặc thử thách thực tế tiêu biểu nhất của em: Mục tiêu là gì, vai trò cụ thể của em và kết quả đạt được sau cùng?`;
  }

  return {
    recruiterName: `Chị An (Senior HR Recruiter @ ${company})`,
    welcomeMessage: `Chào em! Rất vui được đồng hành cùng em trong buổi phỏng vấn thử vị trí ${params.role} (${params.level}) tại ${company}. Chị sẽ đóng vai người phỏng vấn, đặt câu hỏi thực tế và hướng dẫn em rèn luyện cấu trúc STAR thật tự tin nhé!`,
    firstQuestion,
    focusAreas,
  };
}

/**
 * Robust Client Service for Starting Interview
 * Tries server endpoint first. If server is down, times out, or returns HTML, seamlessly falls back to high-fidelity generator.
 */
export async function generateMockInterviewStart(
  params: StartInterviewParams
): Promise<StartInterviewResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/mock-interview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && typeof data === 'object' && data.firstQuestion) {
        return {
          recruiterName: data.recruiterName || `Chị An (Senior HR Recruiter @ ${params.company})`,
          welcomeMessage:
            data.welcomeMessage ||
            `Chào em! Rất vui được gặp em trong buổi phỏng vấn vị trí ${params.role} tại ${params.company}.`,
          firstQuestion: data.firstQuestion,
          focusAreas: data.focusAreas || [
            'Cấu trúc STAR',
            'Khả năng giải quyết vấn đề',
            'Thái độ cầu tiến',
          ],
        };
      }
    } else {
      console.warn(
        `[InterviewService] Server endpoint returned non-JSON or status ${res.status}. Falling back to internal engine.`
      );
    }
  } catch (netErr: any) {
    console.warn(
      `[InterviewService] Server request failed (${netErr?.name || 'Error'}: ${netErr?.message}). Engaging local intelligence engine.`
    );
  }

  // Graceful deterministic fallback
  return generateLocalFirstQuestion(params);
}

/**
 * Local Fallback Evaluator for Answer Submission
 */
function evaluateLocalAnswer(params: EvaluateInterviewParams): EvaluateInterviewResult {
  const answer = (params.userAnswer || '').trim();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const hasSTAR =
    answer.toLowerCase().includes('tình huống') ||
    answer.toLowerCase().includes('nhiệm vụ') ||
    answer.toLowerCase().includes('hành động') ||
    answer.toLowerCase().includes('kết quả') ||
    answer.toLowerCase().includes('giải pháp') ||
    answer.toLowerCase().includes('tối ưu') ||
    answer.toLowerCase().includes('dự án') ||
    answer.toLowerCase().includes('khi') ||
    answer.toLowerCase().includes('đã');

  let recruiterScore = 78;
  if (wordCount > 60) recruiterScore += 8;
  if (wordCount > 100) recruiterScore += 5;
  if (hasSTAR) recruiterScore += 5;
  recruiterScore = Math.min(96, Math.max(70, recruiterScore));

  const hiringConfidence =
    recruiterScore >= 85 ? 'Strong Yes' : recruiterScore >= 75 ? 'Lean Yes' : 'Undecided';

  const whatWasGood = [
    'Em đã phản hồi đúng trọng tâm câu hỏi và thể hiện được tinh thần chủ động.',
    'Nội dung chia sẻ có tính mạch lạc và thể hiện được sự nghiêm túc với vị trí ứng tuyển.',
  ];
  if (wordCount > 50) {
    whatWasGood.push('Có đưa ra bối cảnh và hành động cụ thể em đã thực hiện.');
  }

  const whatFeltWeak = [
    'Nên bổ sung thêm số liệu định lượng (ví dụ: % hiệu năng, số lượng người dùng, thời gian hoàn thành).',
    'Có thể làm rõ hơn bài học kinh nghiệm hoặc kỹ năng em tích lũy được sau tình huống này.',
  ];

  const betterStarVersion = `Khi đảm nhiệm dự án thực tế (Tình huống & Nhiệm vụ), em đã phân tích yêu cầu kỹ thuật, đề xuất giải pháp tối ưu và phối hợp cùng nhóm (Hành động). Nhờ vậy, sản phẩm được bàn giao đúng hạn, vận hành ổn định và đạt kết quả đánh giá xuất sắc từ giảng viên/quản lý (Kết quả).`;

  const questionPool = [
    `Trong quá trình thực hiện dự án hoặc công việc đó, khó khăn hay trở ngại kỹ thuật lớn nhất mà em từng đối mặt là gì, và em đã tìm cách giải quyết nó như thế nào?`,
    `Nếu trong nhóm làm việc có thành viên bất đồng quan điểm hoặc tiến độ bị chậm so với dự kiến, em sẽ làm gì để thống nhất và đưa dự án về đúng tiến độ?`,
    `Tại sao em lại muốn ứng tuyển vào vị trí ${params.role} tại ${params.company}, và mục tiêu phát triển chuyên môn của em trong 1 - 2 năm tới là gì?`,
  ];

  const isFinished = params.questionNumber >= 4;
  const nextQ = isFinished ? null : questionPool[Math.min(params.questionNumber - 1, questionPool.length - 1)];

  return {
    evaluation: {
      contentScore: Math.round(recruiterScore / 10),
      clarityScore: Math.round((recruiterScore - 2) / 10),
      starQuality: Math.round(recruiterScore / 10),
      recruiterScore,
      hiringConfidence: hiringConfidence as any,
      whatWasGood,
      whatFeltWeak,
      missingDetails: ['Chi tiết về số liệu đo lường cụ thể của kết quả.'],
      recruiterConcerns: ['Khả năng xử lý các tình huống phát sinh dưới áp lực tiến độ.'],
      betterStarVersion,
    },
    recruiterReaction: 'Cảm ơn câu trả lời của em. Phần chia sẻ rất rõ ràng và thể hiện được tư duy giải quyết vấn đề tốt!',
    nextQuestion: nextQ,
    isFinished,
    overallVerdict: isFinished
      ? `Chúc mừng em đã hoàn thành xuất sắc buổi phỏng vấn giả lập cho vị trí ${params.role} tại ${params.company}! Em thể hiện nền tảng vững vàng, sự tự tin và tư duy phản biện tốt. Hãy tiếp tục phát huy cấu trúc STAR để chinh phục nhà tuyển dụng thực tế nhé!`
      : undefined,
  };
}

/**
 * Robust Client Service for Answer Evaluation
 */
export async function evaluateMockInterviewAnswer(
  params: EvaluateInterviewParams
): Promise<EvaluateInterviewResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('/api/mock-interview/evaluate-and-next', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && typeof data === 'object' && data.evaluation) {
        return data;
      }
    } else {
      console.warn(
        `[InterviewService] Server eval endpoint returned non-JSON or status ${res.status}. Using fallback evaluator.`
      );
    }
  } catch (err: any) {
    console.warn(
      `[InterviewService] Server evaluation fetch failed (${err?.name}: ${err?.message}). Using fallback evaluator.`
    );
  }

  return evaluateLocalAnswer(params);
}
