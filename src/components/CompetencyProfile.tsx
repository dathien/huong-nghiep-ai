import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  GraduationCap,
  Layers,
  Award,
  FolderGit2,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Edit3,
  Save,
  Check,
  X,
  Cloud,
  AlertCircle,
  Calendar,
  Link as LinkIcon,
  Star,
  BookOpen,
  Briefcase,
  Eye,
  RotateCcw,
  Clock
} from 'lucide-react';
import {
  CVData,
  StudentLevel,
  AppTab,
  CompetencyEducation,
  CompetencySkill,
  CompetencyProject,
  CompetencyCertificate,
  CompetencyProfileData,
  CompetencySkillCategory,
  CompetencyProficiency,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  saveCompetencyProfile,
  subscribeCompetencyProfile,
} from '../services/competencyService';
import { SAMPLE_COMPETENCY_PROFILE } from '../data/mockData';

interface CompetencyProfileProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  studentLevel: StudentLevel;
  onNavigateTab: (tab: AppTab) => void;
}

const SKILL_CATEGORY_LABELS: Record<CompetencySkillCategory, { label: string; icon: string; color: string }> = {
  technical: { label: 'Kỹ năng chuyên môn', icon: '💻', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  soft: { label: 'Kỹ năng mềm', icon: '🤝', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  language: { label: 'Ngoại ngữ', icon: '🌐', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  office: { label: 'Tin học / Công cụ', icon: '⚙️', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  vocational: { label: 'Kỹ năng nghề nghiệp', icon: '🛠️', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const PROFICIENCY_LABELS: Record<CompetencyProficiency, { label: string; stars: number; color: string }> = {
  beginner: { label: 'Mới bắt đầu', stars: 1, color: 'text-slate-500 bg-slate-100' },
  intermediate: { label: 'Khá', stars: 2, color: 'text-blue-700 bg-blue-100' },
  proficient: { label: 'Thành thạo', stars: 3, color: 'text-emerald-700 bg-emerald-100' },
  expert: { label: 'Xuất sắc', stars: 4, color: 'text-purple-700 bg-purple-100' },
};

const DEGREE_LEVELS = [
  'Học sinh THPT',
  'Học viên trung cấp',
  'Sinh viên cao đẳng',
  'Sinh viên đại học',
  'Sau đại học (Thạc sĩ / Tiến sĩ)',
  'Khác',
];

export const CompetencyProfile: React.FC<CompetencyProfileProps> = ({
  cvData,
  setCvData,
  studentLevel,
  onNavigateTab,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const [activeSection, setActiveSection] = useState<'education' | 'skills' | 'projects' | 'certs'>('education');

  // Real user profile data loaded from Firestore
  const [profile, setProfile] = useState<CompetencyProfileData>({
    education: [],
    skills: [],
    projects: [],
    certificates: [],
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewSampleMode, setIsPreviewSampleMode] = useState(false);

  // Sync to CV modal state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncSuccess, setIsSyncSuccess] = useState(false);

  // Modal / Form state for each tab
  // 1. Education
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduForm, setEduForm] = useState<Omit<CompetencyEducation, 'id'>>({
    school: '',
    degreeLevel: studentLevel || 'Sinh viên đại học',
    major: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    gpa: '',
    coursework: [],
    achievements: [],
  });
  const [eduCourseworkInput, setEduCourseworkInput] = useState('');
  const [eduAchievementsInput, setEduAchievementsInput] = useState('');

  // 2. Skill
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillFilterCategory, setSkillFilterCategory] = useState<string>('all');
  const [skillForm, setSkillForm] = useState<Omit<CompetencySkill, 'id'>>({
    name: '',
    category: 'technical',
    proficiency: 'proficient',
    evidence: '',
  });

  // 3. Project
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Omit<CompetencyProject, 'id'>>({
    name: '',
    role: '',
    period: '',
    description: '',
    techStack: [],
    results: [],
    link: '',
  });
  const [projectTechInput, setProjectTechInput] = useState('');
  const [projectResultsInput, setProjectResultsInput] = useState('');

  // 4. Certificate
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<Omit<CompetencyCertificate, 'id'>>({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    verificationUrl: '',
  });

  // Load from Firestore
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeCompetencyProfile(
      currentUser.uid,
      (data) => {
        setIsLoading(false);
        if (data) {
          setProfile({
            education: data.education || [],
            skills: data.skills || [],
            projects: data.projects || [],
            certificates: data.certificates || [],
            updatedAt: data.updatedAt,
          });
          if (data.updatedAt) {
            try {
              const d = new Date(data.updatedAt);
              setLastSavedTime(
                `${d.getHours().toString().padStart(2, '0')}:${d
                  .getMinutes()
                  .toString()
                  .padStart(2, '0')}`
              );
            } catch {
              // ignore
            }
          }
        }
      },
      (err) => {
        setIsLoading(false);
        setErrorMessage('Không thể tải hồ sơ năng lực từ máy chủ Cloud Firestore.');
        console.error(err);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Persist helper
  const handleSaveToCloud = async (updatedProfile: CompetencyProfileData) => {
    if (!currentUser) {
      openAuthModal('login', 'Đăng nhập để lưu hồ sơ năng lực vào tài khoản Cloud Firestore của bạn.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      await saveCompetencyProfile(currentUser.uid, updatedProfile);
      setProfile(updatedProfile);
      const now = new Date();
      setLastSavedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      );
      setSaveSuccessMsg('Đã lưu thay đổi vào Cloud Firestore!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Lỗi khi lưu dữ liệu lên Cloud: ${err.message || 'Có lỗi xảy ra'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Active data viewed (sample vs real)
  const currentViewData = isPreviewSampleMode ? SAMPLE_COMPETENCY_PROFILE : profile;

  // ==========================================
  // 1. EDUCATION HANDLERS
  // ==========================================
  const openAddEduModal = () => {
    setEditingEduId(null);
    setEduForm({
      school: '',
      degreeLevel: studentLevel || 'Sinh viên đại học',
      major: '',
      startDate: '',
      endDate: '',
      isCurrent: true,
      gpa: '',
      coursework: [],
      achievements: [],
    });
    setEduCourseworkInput('');
    setEduAchievementsInput('');
    setIsEduModalOpen(true);
  };

  const openEditEduModal = (edu: CompetencyEducation) => {
    setEditingEduId(edu.id);
    setEduForm({
      school: edu.school,
      degreeLevel: edu.degreeLevel,
      major: edu.major || '',
      startDate: edu.startDate,
      endDate: edu.endDate,
      isCurrent: edu.isCurrent ?? (edu.endDate === 'Đang học'),
      gpa: edu.gpa || '',
      coursework: edu.coursework || [],
      achievements: edu.achievements || [],
    });
    setEduCourseworkInput((edu.coursework || []).join(', '));
    setEduAchievementsInput((edu.achievements || []).join('\n'));
    setIsEduModalOpen(true);
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.school.trim()) {
      alert('Vui lòng nhập tên trường đào tạo.');
      return;
    }

    const coursework = eduCourseworkInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const achievements = eduAchievementsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const endDate = eduForm.isCurrent ? 'Đang học' : eduForm.endDate.trim() || 'Hiện tại';

    const newEduItem: CompetencyEducation = {
      id: editingEduId || `edu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      school: eduForm.school.trim(),
      degreeLevel: eduForm.degreeLevel,
      major: eduForm.major?.trim() || undefined,
      startDate: eduForm.startDate.trim() || 'N/A',
      endDate,
      isCurrent: eduForm.isCurrent,
      gpa: eduForm.gpa?.trim() || undefined,
      coursework: coursework.length > 0 ? coursework : undefined,
      achievements: achievements.length > 0 ? achievements : undefined,
    };

    let updatedList: CompetencyEducation[];
    if (editingEduId) {
      updatedList = profile.education.map((item) => (item.id === editingEduId ? newEduItem : item));
    } else {
      updatedList = [newEduItem, ...profile.education];
    }

    const updatedProfile: CompetencyProfileData = {
      ...profile,
      education: updatedList,
    };

    setIsEduModalOpen(false);
    await handleSaveToCloud(updatedProfile);
  };

  const handleDeleteEdu = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục học vấn này?')) return;
    const updatedProfile: CompetencyProfileData = {
      ...profile,
      education: profile.education.filter((item) => item.id !== id),
    };
    await handleSaveToCloud(updatedProfile);
  };

  // ==========================================
  // 2. SKILL HANDLERS
  // ==========================================
  const openAddSkillModal = () => {
    setEditingSkillId(null);
    setSkillForm({
      name: '',
      category: 'technical',
      proficiency: 'proficient',
      evidence: '',
    });
    setIsSkillModalOpen(true);
  };

  const openEditSkillModal = (skill: CompetencySkill) => {
    setEditingSkillId(skill.id);
    setSkillForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      evidence: skill.evidence || '',
    });
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.trim()) {
      alert('Vui lòng nhập tên kỹ năng.');
      return;
    }

    const newSkillItem: CompetencySkill = {
      id: editingSkillId || `sk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: skillForm.name.trim(),
      category: skillForm.category,
      proficiency: skillForm.proficiency,
      evidence: skillForm.evidence?.trim() || undefined,
    };

    let updatedList: CompetencySkill[];
    if (editingSkillId) {
      updatedList = profile.skills.map((item) => (item.id === editingSkillId ? newSkillItem : item));
    } else {
      updatedList = [...profile.skills, newSkillItem];
    }

    const updatedProfile: CompetencyProfileData = {
      ...profile,
      skills: updatedList,
    };

    setIsSkillModalOpen(false);
    await handleSaveToCloud(updatedProfile);
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kỹ năng này?')) return;
    const updatedProfile: CompetencyProfileData = {
      ...profile,
      skills: profile.skills.filter((item) => item.id !== id),
    };
    await handleSaveToCloud(updatedProfile);
  };

  // ==========================================
  // 3. PROJECT HANDLERS
  // ==========================================
  const openAddProjectModal = () => {
    setEditingProjectId(null);
    setProjectForm({
      name: '',
      role: 'Thành viên phát triển',
      period: '',
      description: '',
      techStack: [],
      results: [],
      link: '',
    });
    setProjectTechInput('');
    setProjectResultsInput('');
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: CompetencyProject) => {
    setEditingProjectId(proj.id);
    setProjectForm({
      name: proj.name,
      role: proj.role,
      period: proj.period,
      description: proj.description,
      techStack: proj.techStack,
      results: proj.results,
      link: proj.link || '',
    });
    setProjectTechInput(proj.techStack.join(', '));
    setProjectResultsInput(proj.results.join('\n'));
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      alert('Vui lòng nhập tên đồ án/dự án.');
      return;
    }

    const techStack = projectTechInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const results = projectResultsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newProjectItem: CompetencyProject = {
      id: editingProjectId || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: projectForm.name.trim(),
      role: projectForm.role.trim() || 'Thành viên',
      period: projectForm.period.trim() || '2025',
      description: projectForm.description.trim(),
      techStack,
      results: results.length > 0 ? results : ['Hoàn thành đồ án đạt yêu cầu môn học.'],
      link: projectForm.link?.trim() || undefined,
    };

    let updatedList: CompetencyProject[];
    if (editingProjectId) {
      updatedList = profile.projects.map((item) => (item.id === editingProjectId ? newProjectItem : item));
    } else {
      updatedList = [newProjectItem, ...profile.projects];
    }

    const updatedProfile: CompetencyProfileData = {
      ...profile,
      projects: updatedList,
    };

    setIsProjectModalOpen(false);
    await handleSaveToCloud(updatedProfile);
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đồ án/dự án này?')) return;
    const updatedProfile: CompetencyProfileData = {
      ...profile,
      projects: profile.projects.filter((item) => item.id !== id),
    };
    await handleSaveToCloud(updatedProfile);
  };

  // ==========================================
  // 4. CERTIFICATE HANDLERS
  // ==========================================
  const openAddCertModal = () => {
    setEditingCertId(null);
    setCertForm({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      verificationUrl: '',
    });
    setIsCertModalOpen(true);
  };

  const openEditCertModal = (cert: CompetencyCertificate) => {
    setEditingCertId(cert.id);
    setCertForm({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      verificationUrl: cert.verificationUrl || '',
    });
    setIsCertModalOpen(true);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.name.trim()) {
      alert('Vui lòng nhập tên chứng chỉ.');
      return;
    }
    if (!certForm.issuer.trim()) {
      alert('Vui lòng nhập đơn vị cấp chứng chỉ.');
      return;
    }

    const newCertItem: CompetencyCertificate = {
      id: editingCertId || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: certForm.name.trim(),
      issuer: certForm.issuer.trim(),
      issueDate: certForm.issueDate.trim() || '2025',
      expiryDate: certForm.expiryDate?.trim() || undefined,
      credentialId: certForm.credentialId?.trim() || undefined,
      verificationUrl: certForm.verificationUrl?.trim() || undefined,
    };

    let updatedList: CompetencyCertificate[];
    if (editingCertId) {
      updatedList = profile.certificates.map((item) => (item.id === editingCertId ? newCertItem : item));
    } else {
      updatedList = [newCertItem, ...profile.certificates];
    }

    const updatedProfile: CompetencyProfileData = {
      ...profile,
      certificates: updatedList,
    };

    setIsCertModalOpen(false);
    await handleSaveToCloud(updatedProfile);
  };

  const handleDeleteCert = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chứng chỉ này?')) return;
    const updatedProfile: CompetencyProfileData = {
      ...profile,
      certificates: profile.certificates.filter((item) => item.id !== id),
    };
    await handleSaveToCloud(updatedProfile);
  };

  // ==========================================
  // 5. SYNC TO CV LOGIC
  // ==========================================
  const handleConfirmSyncToCv = () => {
    // Merge without destroying existing custom fields
    setCvData((prev) => {
      // 1. Education conversion
      const newEducations = profile.education.map((edu) => ({
        school: edu.school,
        degree: edu.degreeLevel,
        major: edu.major || (edu.degreeLevel === 'Học sinh THPT' ? 'Chung' : 'Chuyên ngành'),
        year: edu.isCurrent ? `${edu.startDate} - Đang học` : `${edu.startDate} - ${edu.endDate}`,
        gpa: edu.gpa || undefined,
        coursework: edu.coursework || [],
      }));

      // 2. Skills conversion
      const techSkills = profile.skills.filter((s) => s.category === 'technical').map((s) => s.name);
      const coreSkills = profile.skills.filter((s) => s.category === 'vocational').map((s) => s.name);
      const softSkills = profile.skills.filter((s) => s.category === 'soft').map((s) => s.name);
      const toolsSkills = profile.skills.filter((s) => s.category === 'office').map((s) => s.name);
      const langSkills = profile.skills.filter((s) => s.category === 'language').map((s) => s.name);

      // 3. Projects conversion
      const newProjects = profile.projects.map((proj) => ({
        name: proj.name,
        role: proj.role,
        period: proj.period,
        techStack: proj.techStack,
        objective: proj.description,
        bulletPoints: proj.results.length > 0 ? proj.results : ['Hoàn thành đồ án đạt chuẩn.'],
      }));

      // 4. Certificates conversion
      const newCerts = profile.certificates.map((cert) => ({
        name: cert.name,
        issuer: cert.issuer,
        year: cert.issueDate,
      }));

      return {
        ...prev,
        education: newEducations.length > 0 ? newEducations : prev.education,
        skills: {
          technical: Array.from(new Set([...(techSkills.length > 0 ? techSkills : prev.skills.technical)])),
          core: Array.from(new Set([...(coreSkills.length > 0 ? coreSkills : prev.skills.core)])),
          tools: Array.from(new Set([...(toolsSkills.length > 0 ? toolsSkills : prev.skills.tools)])),
          soft: Array.from(new Set([...(softSkills.length > 0 ? softSkills : prev.skills.soft)])),
        },
        languages: Array.from(new Set([...(langSkills.length > 0 ? langSkills : prev.languages)])),
        projects: newProjects.length > 0 ? newProjects : prev.projects,
        certifications: newCerts.length > 0 ? newCerts : prev.certifications,
      };
    });

    setIsSyncSuccess(true);
    setTimeout(() => {
      setIsSyncSuccess(false);
      setIsSyncModalOpen(false);
      onNavigateTab('cv-builder');
    }, 1000);
  };

  // Populate sample data into user's profile on explicit request
  const handlePopulateSampleToMyProfile = async () => {
    if (!window.confirm('Hành động này sẽ nạp bộ dữ liệu mẫu khởi đầu vào hồ sơ của bạn. Bạn vẫn có thể chỉnh sửa hoặc xóa từng mục bất cứ lúc nào. Bạn có muốn tiếp tục?')) {
      return;
    }
    await handleSaveToCloud(SAMPLE_COMPETENCY_PROFILE);
    setIsPreviewSampleMode(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in text-left">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Hồ Sơ Năng Lực Học Sinh / Sinh Viên</span>
            </span>

            {currentUser && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>Cloud Firestore</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý Hành Trang & Điểm Mạnh Năng Lực
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Lưu trữ tập trung quá trình học tập, ma trận kỹ năng, đồ án môn học và chứng chỉ xác thực.
            Toàn bộ dữ liệu được quản lý an toàn tại <code className="text-blue-700 font-mono text-xs bg-blue-50 px-1 py-0.5 rounded">users/{'{uid}'}/profile/main</code> và có thể đồng bộ sang CV chuẩn ATS bất kỳ lúc nào.
          </p>
        </div>

        {/* Top Right Action Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Sample Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewSampleMode(!isPreviewSampleMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPreviewSampleMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {isPreviewSampleMode ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>Quay lại Hồ sơ của tôi</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Xem hồ sơ mẫu gợi ý</span>
              </>
            )}
          </button>

          {/* Sync to CV Button */}
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Đồng bộ sang Thiết kế CV</span>
          </button>
        </div>
      </div>

      {/* Cloud & Status Notifications */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sample Banner if viewing sample */}
      {isPreviewSampleMode && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ xem mẫu:</strong> Bạn đang xem hồ sơ tham khảo tiêu chuẩn của bạn Nguyễn Minh Anh. Dữ liệu này không ghi đè vào tài khoản của bạn.
            </span>
          </div>
          <button
            type="button"
            onClick={handlePopulateSampleToMyProfile}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
          >
            Nạp mẫu vào hồ sơ của tôi
          </button>
        </div>
      )}

      {/* Unauthenticated notice */}
      {!currentUser && !isPreviewSampleMode && (
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div>
            <p className="font-bold">Bạn chưa đăng nhập tài khoản CareerMaster AI.</p>
            <p className="text-blue-700 text-[11px] mt-0.5">
              Đăng nhập để tự động lưu trữ và đồng bộ hóa hồ sơ năng lực của bạn trên Cloud Firestore.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('login', 'Đăng nhập để lưu hồ sơ năng lực cá nhân.')}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Tab Navigation Pills & Counts */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs max-w-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSection('education')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'education'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Học vấn ({currentViewData.education.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('skills')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'skills'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kỹ năng ({currentViewData.skills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('projects')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'projects'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Đồ án / STEM ({currentViewData.projects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('certs')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'certs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Chứng chỉ ({currentViewData.certificates.length})</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* SECTION 1: EDUCATION                                           */}
      {/* ============================================================= */}
      {activeSection === 'education' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Quá Trình Học Tập & Đào Tạo</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý các cấp học từ THPT, Trung cấp, Cao đẳng đến Đại học và Sau đại học.
              </p>
            </div>

            {!isPreviewSampleMode && (
              <button
                type="button"
                onClick={openAddEduModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm trường / quá trình học</span>
              </button>
            )}
          </div>

          {currentViewData.education.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có thông tin học vấn</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Hãy thêm trường học (THPT, Cao đẳng hoặc Đại học) cùng chuyên ngành và thành tích để bắt đầu hoàn thiện hồ sơ của bạn.
              </p>
              <button
                type="button"
                onClick={openAddEduModal}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm học vấn đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {currentViewData.education.map((edu) => (
                <div
                  key={edu.id}
                  className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-3 transition-all hover:bg-slate-50 relative group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                          {edu.degreeLevel}
                        </span>
                        {edu.gpa && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            GPA: {edu.gpa}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{edu.isCurrent ? `${edu.startDate} – Đang học` : `${edu.startDate} – ${edu.endDate}`}</span>
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900">{edu.school}</h4>

                      {edu.major && (
                        <p className="text-xs font-semibold text-blue-700">
                          Chuyên ngành: {edu.major}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {!isPreviewSampleMode && (
                      <div className="flex items-center gap-1.5 self-end sm:self-start">
                        <button
                          type="button"
                          onClick={() => openEditEduModal(edu)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEdu(edu.id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Coursework */}
                  {edu.coursework && edu.coursework.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Môn học & Chuyên đề nổi bật:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {edu.coursework.map((course, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {edu.achievements && edu.achievements.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Thành tích & Học bổng:
                      </span>
                      <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5">
                        {edu.achievements.map((ach, aIdx) => (
                          <li key={aIdx}>{ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 2: SKILLS                                              */}
      {/* ============================================================= */}
      {activeSection === 'skills' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Ma Trận Kỹ Năng & Năng Lực Cốt Lõi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân loại kỹ năng theo chuyên môn, kỹ năng mềm, ngoại ngữ và tin học cùng minh chứng thực tiễn.
              </p>
            </div>

            {!isPreviewSampleMode && (
              <button
                type="button"
                onClick={openAddSkillModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm kỹ năng mới</span>
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 pb-2">
            <button
              type="button"
              onClick={() => setSkillFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                skillFilterCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tất cả ({currentViewData.skills.length})
            </button>
            {(Object.keys(SKILL_CATEGORY_LABELS) as CompetencySkillCategory[]).map((catKey) => {
              const meta = SKILL_CATEGORY_LABELS[catKey];
              const count = currentViewData.skills.filter((s) => s.category === catKey).length;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSkillFilterCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    skillFilterCategory === catKey
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Skill Cards Grid */}
          {currentViewData.skills.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có kỹ năng nào</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Thêm kỹ năng chuyên môn, kỹ năng mềm hoặc ngoại ngữ kèm minh chứng để hoàn thiện điểm mạnh cạnh tranh của bạn.
              </p>
              <button
                type="button"
                onClick={openAddSkillModal}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm kỹ năng đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentViewData.skills
                .filter((s) => skillFilterCategory === 'all' || s.category === skillFilterCategory)
                .map((skill) => {
                  const catMeta = SKILL_CATEGORY_LABELS[skill.category] || SKILL_CATEGORY_LABELS.technical;
                  const profMeta = PROFICIENCY_LABELS[skill.proficiency] || PROFICIENCY_LABELS.proficient;

                  return (
                    <div
                      key={skill.id}
                      className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 transition-all hover:bg-slate-50 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catMeta.color} flex items-center gap-1`}
                          >
                            <span>{catMeta.icon}</span>
                            <span>{catMeta.label}</span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${profMeta.color} flex items-center gap-1`}
                          >
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>{profMeta.label}</span>
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900">{skill.name}</h4>

                        {skill.evidence && (
                          <p className="text-xs text-slate-600 leading-relaxed italic bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                            "{skill.evidence}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {!isPreviewSampleMode && (
                        <div className="flex justify-end items-center gap-1.5 pt-2 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => openEditSkillModal(skill)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                            title="Sửa kỹ năng"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                            title="Xóa kỹ năng"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 3: PROJECTS                                            */}
      {/* ============================================================= */}
      {activeSection === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                <span>Đồ Án Môn Học, Sản Phẩm STEM & Dự Án Thực Tiễn</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Minh chứng năng lực thực tế giá trị nhất đối với học sinh, sinh viên và ứng viên thực tập.
              </p>
            </div>

            {!isPreviewSampleMode && (
              <button
                type="button"
                onClick={openAddProjectModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm đồ án / dự án</span>
              </button>
            )}
          </div>

          {currentViewData.projects.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có đồ án hoặc dự án</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Đồ án môn học, bài tập lớn, dự án STEM hoặc website cá nhân là bằng chứng thuyết phục nhất trước nhà tuyển dụng.
              </p>
              <button
                type="button"
                onClick={openAddProjectModal}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm đồ án đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {currentViewData.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-3 transition-all hover:bg-slate-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{proj.period}</span>
                        </span>
                        <span className="text-xs font-bold text-blue-700">
                          Vai trò: {proj.role}
                        </span>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 hover:underline"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>Minh chứng dự án</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900">{proj.name}</h4>
                    </div>

                    {/* Actions */}
                    {!isPreviewSampleMode && (
                      <div className="flex items-center gap-1.5 self-end sm:self-start">
                        <button
                          type="button"
                          onClick={() => openEditProjectModal(proj)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          title="Sửa đồ án"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa đồ án"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-700 leading-relaxed">{proj.description}</p>
                  )}

                  {/* Tech stack */}
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Results list */}
                  {proj.results && proj.results.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Kết quả & Điểm nhấn đạt được:
                      </span>
                      <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5 leading-relaxed">
                        {proj.results.map((res, rIdx) => (
                          <li key={rIdx}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 4: CERTIFICATES                                       */}
      {/* ============================================================= */}
      {activeSection === 'certs' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>Chứng Chỉ Khóa Học & Năng Lực Xác Thực</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lưu giữ chứng chỉ tin học, ngoại ngữ (IELTS/TOEIC) và các chứng nhận học thuật online.
              </p>
            </div>

            {!isPreviewSampleMode && (
              <button
                type="button"
                onClick={openAddCertModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm chứng chỉ mới</span>
              </button>
            )}
          </div>

          {currentViewData.certificates.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có chứng chỉ nào</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Chứng chỉ online (Coursera, Google, Microsoft) hoặc chứng chỉ ngoại ngữ là điểm cộng rất lớn trên hồ sơ năng lực.
              </p>
              <button
                type="button"
                onClick={openAddCertModal}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm chứng chỉ đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentViewData.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-3 transition-all hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {cert.name}
                      </h4>
                      <p className="text-xs font-semibold text-blue-700">
                        {cert.issuer}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                        <span>Ngày cấp: {cert.issueDate}</span>
                        {cert.expiryDate && <span>Hết hạn: {cert.expiryDate}</span>}
                      </div>

                      {cert.credentialId && (
                        <p className="text-[11px] font-mono text-slate-500">
                          Mã: {cert.credentialId}
                        </p>
                      )}

                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline pt-0.5"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Xác minh chứng chỉ</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isPreviewSampleMode && (
                    <div className="flex justify-end items-center gap-1.5 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => openEditCertModal(cert)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                        title="Sửa chứng chỉ"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCert(cert.id)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                        title="Xóa chứng chỉ"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: EDUCATION FORM                                        */}
      {/* ============================================================= */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>{editingEduId ? 'Chỉnh Sửa Học Vấn' : 'Thêm Quá Trình Học Tập'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEduModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdu} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên trường / Cơ sở đào tạo <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.school}
                  onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })}
                  placeholder="VD: Trường ĐH Bách Khoa TP.HCM hoặc THPT Chuyên Lê Hồng Phong"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bậc học:</label>
                  <select
                    value={eduForm.degreeLevel}
                    onChange={(e) => setEduForm({ ...eduForm, degreeLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {DEGREE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngành / Chuyên ngành:
                  </label>
                  <input
                    type="text"
                    value={eduForm.major || ''}
                    onChange={(e) => setEduForm({ ...eduForm, major: e.target.value })}
                    placeholder={eduForm.degreeLevel === 'Học sinh THPT' ? 'Ban Tự nhiên / Chuyên Toán...' : 'VD: Kỹ thuật Phần mềm'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bắt đầu:</label>
                  <input
                    type="text"
                    value={eduForm.startDate}
                    onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                    placeholder="VD: 09/2022"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kết thúc:</label>
                  <input
                    type="text"
                    disabled={eduForm.isCurrent}
                    value={eduForm.isCurrent ? 'Đang học' : eduForm.endDate}
                    onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                    placeholder="VD: 06/2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={eduForm.isCurrent}
                  onChange={(e) => setEduForm({ ...eduForm, isCurrent: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-semibold">Hiện đang theo học tại trường này</span>
              </label>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Điểm GPA / Điểm trung bình (không bắt buộc):
                </label>
                <input
                  type="text"
                  value={eduForm.gpa || ''}
                  onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })}
                  placeholder="VD: 3.65 / 4.0 hoặc 8.8 / 10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Môn học / Chuyên đề nổi bật (phân tách bằng dấu phẩy):
                </label>
                <input
                  type="text"
                  value={eduCourseworkInput}
                  onChange={(e) => setEduCourseworkInput(e.target.value)}
                  placeholder="VD: Cấu trúc dữ liệu, Lập trình Web, Thuật toán..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Thành tích & Học bổng (mỗi dòng một thành tích):
                </label>
                <textarea
                  rows={2}
                  value={eduAchievementsInput}
                  onChange={(e) => setEduAchievementsInput(e.target.value)}
                  placeholder="VD: Học bổng Khuyến khích Học tập 2 kỳ liên tiếp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEduModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu học vấn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: SKILL FORM                                            */}
      {/* ============================================================= */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-slide-up">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{editingSkillId ? 'Chỉnh Sửa Kỹ Năng' : 'Thêm Kỹ Năng Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên kỹ năng <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="VD: TypeScript, Làm việc nhóm, Tiếng Anh giao tiếp..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nhóm kỹ năng:</label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {(Object.keys(SKILL_CATEGORY_LABELS) as CompetencySkillCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {SKILL_CATEGORY_LABELS[cat].icon} {SKILL_CATEGORY_LABELS[cat].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức độ thành thạo:</label>
                  <select
                    value={skillForm.proficiency}
                    onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {(Object.keys(PROFICIENCY_LABELS) as CompetencyProficiency[]).map((pKey) => (
                      <option key={pKey} value={pKey}>
                        {PROFICIENCY_LABELS[pKey].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Minh chứng / Cách bạn áp dụng kỹ năng này:
                </label>
                <textarea
                  rows={3}
                  value={skillForm.evidence || ''}
                  onChange={(e) => setSkillForm({ ...skillForm, evidence: e.target.value })}
                  placeholder="VD: Đã hoàn thành 2 đồ án web React, đạt điểm 9.0 môn Lập trình Web hoặc đạt điểm IELTS 6.5..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu kỹ năng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: PROJECT FORM                                          */}
      {/* ============================================================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                <span>{editingProjectId ? 'Chỉnh Sửa Đồ Án / Dự Án' : 'Thêm Đồ Án / Dự Án Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên đồ án / Dự án STEM / Hoạt động trải nghiệm <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="VD: EcoMart — Sàn giao dịch giáo trình sinh viên"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vai trò thực hiện:</label>
                  <input
                    type="text"
                    value={projectForm.role}
                    onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                    placeholder="VD: Trưởng nhóm / Lập trình viên chính"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thời gian thực hiện:</label>
                  <input
                    type="text"
                    value={projectForm.period}
                    onChange={(e) => setProjectForm({ ...projectForm, period: e.target.value })}
                    placeholder="VD: 09/2025 - 12/2025"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả mục tiêu đồ án:</label>
                <textarea
                  rows={2}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="VD: Xây dựng nền tảng trao đổi đồ dùng học tập tối ưu tốc độ và bảo mật giao dịch..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Công nghệ / Công cụ sử dụng (phân tách bằng dấu phẩy):
                </label>
                <input
                  type="text"
                  value={projectTechInput}
                  onChange={(e) => setProjectTechInput(e.target.value)}
                  placeholder="VD: React, TypeScript, Tailwind CSS, REST API..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kết quả đạt được (mỗi dòng một gạch đầu dòng):
                </label>
                <textarea
                  rows={3}
                  value={projectResultsInput}
                  onChange={(e) => setProjectResultsInput(e.target.value)}
                  placeholder="VD: Đạt điểm 9.2/10 môn Đồ án Chuyên ngành&#10;Tối ưu bundle giảm 30% dung lượng tải trang&#10;Hơn 800 sinh viên tham gia dùng thử"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Liên kết minh chứng (GitHub / Drive / Demo):
                </label>
                <input
                  type="text"
                  value={projectForm.link || ''}
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  placeholder="https://github.com/username/project"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu đồ án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 4: CERTIFICATE FORM                                     */}
      {/* ============================================================= */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-slide-up">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>{editingCertId ? 'Chỉnh Sửa Chứng Chỉ' : 'Thêm Chứng Chỉ Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên chứng chỉ <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  placeholder="VD: Meta Front-End Developer Professional Certificate"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Đơn vị cấp <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  placeholder="VD: Coursera / Google / Meta / British Council"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày cấp (Tháng/Năm):</label>
                  <input
                    type="text"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    placeholder="VD: 01/2025"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày hết hạn (nếu có):</label>
                  <input
                    type="text"
                    value={certForm.expiryDate || ''}
                    onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                    placeholder="VD: 01/2027 hoặc để trống"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mã chứng chỉ / Credential ID (nếu có):
                </label>
                <input
                  type="text"
                  value={certForm.credentialId || ''}
                  onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                  placeholder="VD: CERT-2025-998877"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Liên kết xác minh (Verification URL):
                </label>
                <input
                  type="text"
                  value={certForm.verificationUrl || ''}
                  onChange={(e) => setCertForm({ ...certForm, verificationUrl: e.target.value })}
                  placeholder="https://coursera.org/verify/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu chứng chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 5: SYNC TO CV CONFIRMATION                               */}
      {/* ============================================================= */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-slide-up">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Đồng Bộ Sang Phân Hệ Thiết Kế CV
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Toàn bộ dữ liệu hồ sơ năng lực đã lưu của bạn sẽ được chuyển sang định dạng CV chuẩn ATS:
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Học vấn & Đào tạo:
                </span>
                <span className="font-bold text-slate-900">{profile.education.length} mục</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Kỹ năng chuyên môn & mềm:
                </span>
                <span className="font-bold text-slate-900">{profile.skills.length} kỹ năng</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                  Đồ án & Dự án thực tế:
                </span>
                <span className="font-bold text-slate-900">{profile.projects.length} đồ án</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  Chứng chỉ & Bằng cấp:
                </span>
                <span className="font-bold text-slate-900">{profile.certificates.length} chứng chỉ</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed font-medium">
              💡 <strong>Bảo vệ dữ liệu:</strong> Thông tin cá nhân, mục tiêu nghề nghiệp và những nội dung bạn đã biên tập riêng trên CV sẽ được giữ nguyên mà không bị mất.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSyncToCv}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSyncSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Đã đồng bộ thành công!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Xác nhận & Chuyển sang CV</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
