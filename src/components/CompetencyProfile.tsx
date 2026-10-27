import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  GraduationCap,
  Layers,
  Award,
  FolderGit2,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Edit3,
  Check,
  X,
  Cloud,
  AlertCircle,
  Calendar,
  Link as LinkIcon,
  Star,
  Eye,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Info,
  Clock,
  BookOpen
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
  beginner: { label: 'Mới bắt đầu', stars: 1, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  intermediate: { label: 'Khá', stars: 2, color: 'text-blue-700 bg-blue-100 border-blue-200' },
  proficient: { label: 'Thành thạo', stars: 3, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
  expert: { label: 'Xuất sắc', stars: 4, color: 'text-purple-700 bg-purple-100 border-purple-200' },
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

  // Real user profile data loaded from Firestore (users/{uid}/profile/main)
  const [profile, setProfile] = useState<CompetencyProfileData>({
    education: [],
    skills: [],
    projects: [],
    certificates: [],
  });

  // UI status
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewSampleMode, setIsPreviewSampleMode] = useState(false);

  // Inline forms management (NO MODALS, NO POPUPS)
  const formRef = useRef<HTMLDivElement | null>(null);
  const [activeFormSection, setActiveFormSection] = useState<'education' | 'skills' | 'projects' | 'certs' | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Delete confirmation in-card state (NO window.confirm)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Sample data inline confirmation (NO alert, NO confirm)
  const [showPopulateSampleCard, setShowPopulateSampleCard] = useState(false);

  // Sync to CV inline confirmation panel (NO modal)
  const [showSyncCvPanel, setShowSyncCvPanel] = useState(false);
  const [isSyncSuccess, setIsSyncSuccess] = useState(false);

  // Form states
  // 1. Education
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
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillFilterCategory, setSkillFilterCategory] = useState<string>('all');
  const [skillForm, setSkillForm] = useState<Omit<CompetencySkill, 'id'>>({
    name: '',
    category: 'technical',
    proficiency: 'proficient',
    evidence: '',
  });

  // 3. Project
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
              // ignore date parsing error
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

  // Persist helper to Cloud Firestore
  const handleSaveToCloud = async (
    updatedProfile: CompetencyProfileData,
    successText = 'Đã lưu thay đổi vào Cloud Firestore!'
  ) => {
    if (!currentUser) {
      openAuthModal('login', 'Đăng nhập để lưu hồ sơ năng lực vào tài khoản Cloud Firestore của bạn.');
      return false;
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
      setSaveSuccessMsg(successText);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
      return true;
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Lỗi khi lưu dữ liệu lên Cloud Firestore: ${err.message || 'Có lỗi xảy ra. Vui lòng thử lại.'}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to scroll smoothly to inline form
  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Active data viewed (sample vs real)
  const currentViewData = isPreviewSampleMode ? SAMPLE_COMPETENCY_PROFILE : profile;

  // ==========================================
  // 1. EDUCATION INLINE HANDLERS
  // ==========================================
  const handleOpenAddEdu = () => {
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
    setFormValidationError(null);
    setActiveFormSection('education');
    scrollToForm();
  };

  const handleOpenEditEdu = (edu: CompetencyEducation) => {
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
    setFormValidationError(null);
    setActiveFormSection('education');
    scrollToForm();
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.school.trim()) {
      setFormValidationError('Vui lòng nhập tên trường / cơ sở đào tạo.');
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

    const success = await handleSaveToCloud(
      updatedProfile,
      editingEduId ? 'Đã cập nhật quá trình học vấn thành công!' : 'Đã thêm quá trình học vấn mới thành công!'
    );

    if (success) {
      setActiveFormSection(null);
      setEditingEduId(null);
      setFormValidationError(null);
    }
  };

  const handleConfirmDeleteEdu = async (id: string) => {
    const updatedProfile: CompetencyProfileData = {
      ...profile,
      education: profile.education.filter((item) => item.id !== id),
    };
    await handleSaveToCloud(updatedProfile, 'Đã xóa mục học vấn thành công!');
    setDeletingItemId(null);
  };

  // ==========================================
  // 2. SKILL INLINE HANDLERS
  // ==========================================
  const handleOpenAddSkill = () => {
    setEditingSkillId(null);
    setSkillForm({
      name: '',
      category: 'technical',
      proficiency: 'proficient',
      evidence: '',
    });
    setFormValidationError(null);
    setActiveFormSection('skills');
    scrollToForm();
  };

  const handleOpenEditSkill = (skill: CompetencySkill) => {
    setEditingSkillId(skill.id);
    setSkillForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      evidence: skill.evidence || '',
    });
    setFormValidationError(null);
    setActiveFormSection('skills');
    scrollToForm();
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.trim()) {
      setFormValidationError('Vui lòng nhập tên kỹ năng.');
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

    const success = await handleSaveToCloud(
      updatedProfile,
      editingSkillId ? 'Đã cập nhật kỹ năng thành công!' : 'Đã thêm kỹ năng mới thành công!'
    );

    if (success) {
      setActiveFormSection(null);
      setEditingSkillId(null);
      setFormValidationError(null);
    }
  };

  const handleConfirmDeleteSkill = async (id: string) => {
    const updatedProfile: CompetencyProfileData = {
      ...profile,
      skills: profile.skills.filter((item) => item.id !== id),
    };
    await handleSaveToCloud(updatedProfile, 'Đã xóa kỹ năng thành công!');
    setDeletingItemId(null);
  };

  // ==========================================
  // 3. PROJECT INLINE HANDLERS
  // ==========================================
  const handleOpenAddProject = () => {
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
    setFormValidationError(null);
    setActiveFormSection('projects');
    scrollToForm();
  };

  const handleOpenEditProject = (proj: CompetencyProject) => {
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
    setFormValidationError(null);
    setActiveFormSection('projects');
    scrollToForm();
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      setFormValidationError('Vui lòng nhập tên đồ án / dự án STEM.');
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

    const success = await handleSaveToCloud(
      updatedProfile,
      editingProjectId ? 'Đã cập nhật đồ án thành công!' : 'Đã thêm đồ án mới thành công!'
    );

    if (success) {
      setActiveFormSection(null);
      setEditingProjectId(null);
      setFormValidationError(null);
    }
  };

  const handleConfirmDeleteProject = async (id: string) => {
    const updatedProfile: CompetencyProfileData = {
      ...profile,
      projects: profile.projects.filter((item) => item.id !== id),
    };
    await handleSaveToCloud(updatedProfile, 'Đã xóa đồ án thành công!');
    setDeletingItemId(null);
  };

  // ==========================================
  // 4. CERTIFICATE INLINE HANDLERS
  // ==========================================
  const handleOpenAddCert = () => {
    setEditingCertId(null);
    setCertForm({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      verificationUrl: '',
    });
    setFormValidationError(null);
    setActiveFormSection('certs');
    scrollToForm();
  };

  const handleOpenEditCert = (cert: CompetencyCertificate) => {
    setEditingCertId(cert.id);
    setCertForm({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      verificationUrl: cert.verificationUrl || '',
    });
    setFormValidationError(null);
    setActiveFormSection('certs');
    scrollToForm();
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.name.trim()) {
      setFormValidationError('Vui lòng nhập tên chứng chỉ.');
      return;
    }
    if (!certForm.issuer.trim()) {
      setFormValidationError('Vui lòng nhập đơn vị cấp chứng chỉ.');
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

    const success = await handleSaveToCloud(
      updatedProfile,
      editingCertId ? 'Đã cập nhật chứng chỉ thành công!' : 'Đã thêm chứng chỉ mới thành công!'
    );

    if (success) {
      setActiveFormSection(null);
      setEditingCertId(null);
      setFormValidationError(null);
    }
  };

  const handleConfirmDeleteCert = async (id: string) => {
    const updatedProfile: CompetencyProfileData = {
      ...profile,
      certificates: profile.certificates.filter((item) => item.id !== id),
    };
    await handleSaveToCloud(updatedProfile, 'Đã xóa chứng chỉ thành công!');
    setDeletingItemId(null);
  };

  // ==========================================
  // 5. SAMPLE DATA POPULATION (INLINE CONFIRMATION)
  // ==========================================
  const handlePopulateSampleConfirm = async () => {
    // If the profile already has items, merge them safely rather than completely discarding user items
    const mergedProfile: CompetencyProfileData = {
      education: profile.education.length > 0 ? profile.education : SAMPLE_COMPETENCY_PROFILE.education,
      skills:
        profile.skills.length > 0
          ? [
              ...profile.skills,
              ...SAMPLE_COMPETENCY_PROFILE.skills.filter(
                (sampleSkill) => !profile.skills.some((s) => s.name.toLowerCase() === sampleSkill.name.toLowerCase())
              ),
            ]
          : SAMPLE_COMPETENCY_PROFILE.skills,
      projects: profile.projects.length > 0 ? profile.projects : SAMPLE_COMPETENCY_PROFILE.projects,
      certificates: profile.certificates.length > 0 ? profile.certificates : SAMPLE_COMPETENCY_PROFILE.certificates,
    };

    const success = await handleSaveToCloud(mergedProfile, 'Đã nạp dữ liệu hồ sơ mẫu thành công vào tài khoản của bạn!');
    if (success) {
      setShowPopulateSampleCard(false);
      setIsPreviewSampleMode(false);
    }
  };

  // ==========================================
  // 6. SYNC TO CV LOGIC (INLINE PANEL)
  // ==========================================
  const handleConfirmSyncToCv = () => {
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
      setShowSyncCvPanel(false);
      onNavigateTab('cv-builder');
    }, 900);
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

            {lastSavedTime && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Đã lưu lúc {lastSavedTime}</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý Hành Trang & Điểm Mạnh Năng Lực
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Chỉnh sửa trực tiếp trên trang, không mở popup. Dữ liệu được lưu trữ an toàn tại{' '}
            <code className="text-blue-700 font-mono text-xs bg-blue-50 px-1 py-0.5 rounded">
              users/{'{uid}'}/profile/main
            </code>{' '}
            và có thể đồng bộ sang CV chuẩn ATS bất kỳ lúc nào.
          </p>
        </div>

        {/* Top Right Action Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Sample Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPreviewSampleMode(!isPreviewSampleMode);
              setShowPopulateSampleCard(false);
              setShowSyncCvPanel(false);
              setActiveFormSection(null);
            }}
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

          {/* Sync to CV Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setShowSyncCvPanel(!showSyncCvPanel);
              setShowPopulateSampleCard(false);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Đồng bộ sang Thiết kế CV</span>
          </button>
        </div>
      </div>

      {/* Integrated In-Page Status Notifications */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fade-in font-medium shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fade-in font-medium shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-700 hover:text-rose-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INLINE CONFIRMATION 1: SAMPLE PROFILE POPULATION (Requirement 6) */}
      {showPopulateSampleCard && (
        <div className="bg-amber-50/95 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-amber-950">Nạp dữ liệu hồ sơ mẫu</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Hệ thống sẽ bổ sung dữ liệu mẫu để bạn tham khảo và chỉnh sửa.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPopulateSampleCard(false)}
              className="text-amber-700 hover:text-amber-900 p-1 cursor-pointer rounded-lg hover:bg-amber-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-amber-200 space-y-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-800">
              Chi tiết dữ liệu mẫu được nạp vào hồ sơ của bạn:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                <div className="font-bold text-amber-900 text-sm">{SAMPLE_COMPETENCY_PROFILE.education.length}</div>
                <div className="text-[11px] text-amber-800">Quá trình học vấn</div>
              </div>
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                <div className="font-bold text-amber-900 text-sm">{SAMPLE_COMPETENCY_PROFILE.skills.length}</div>
                <div className="text-[11px] text-amber-800">Kỹ năng cốt lõi</div>
              </div>
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                <div className="font-bold text-amber-900 text-sm">{SAMPLE_COMPETENCY_PROFILE.projects.length}</div>
                <div className="text-[11px] text-amber-800">Đồ án thực tiễn</div>
              </div>
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                <div className="font-bold text-amber-900 text-sm">{SAMPLE_COMPETENCY_PROFILE.certificates.length}</div>
                <div className="text-[11px] text-amber-800">Chứng chỉ xác thực</div>
              </div>
            </div>
            {profile.education.length > 0 && (
              <p className="text-[11px] text-slate-600 pt-2 border-t border-amber-100">
                💡 <em>Lưu ý:</em> Hồ sơ của bạn đã có {profile.education.length} học vấn và {profile.skills.length} kỹ năng. Hệ thống sẽ tích hợp an toàn mà không làm mất thông tin học vấn bạn đã nhập.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowPopulateSampleCard(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handlePopulateSampleConfirm}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isSaving ? 'Đang nạp...' : 'Nạp dữ liệu mẫu'}
            </button>
          </div>
        </div>
      )}

      {/* INLINE CONFIRMATION 2: SYNC TO CV PANEL (Requirement 1, NO MODAL) */}
      {showSyncCvPanel && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-300 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Đồng Bộ Dữ Liệu Sang Phân Hệ Thiết Kế CV
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tự động chuyển đổi các mục đã lưu trong Hồ sơ năng lực sang cấu trúc chuẩn ATS của CV.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSyncCvPanel(false)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Học vấn</span>
              </div>
              <div className="text-lg font-black text-slate-900">{profile.education.length} mục</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Kỹ năng</span>
              </div>
              <div className="text-lg font-black text-slate-900">{profile.skills.length} mục</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-1">
                <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Đồ án STEM</span>
              </div>
              <div className="text-lg font-black text-slate-900">{profile.projects.length} đồ án</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-1">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Chứng chỉ</span>
              </div>
              <div className="text-lg font-black text-slate-900">{profile.certificates.length} chứng chỉ</div>
            </div>
          </div>

          <div className="p-3 bg-white/90 border border-blue-200/80 rounded-2xl text-[11px] text-slate-700 leading-relaxed font-medium">
            💡 <strong>Bảo toàn dữ liệu cá nhân:</strong> Thông tin liên hệ, mục tiêu nghề nghiệp và các phần nội dung khác bạn đã biên tập riêng trên CV sẽ được giữ nguyên mà không bị mất.
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowSyncCvPanel(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSyncToCv}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              {isSyncSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Đã đồng bộ thành công! Đang chuyển...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Xác nhận & Chuyển sang Thiết kế CV</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Sample Banner if viewing sample */}
      {isPreviewSampleMode && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ xem mẫu:</strong> Bạn đang xem hồ sơ tham khảo tiêu chuẩn của bạn Nguyễn Minh Anh. Dữ liệu này độc lập và không tự ý thay thế dữ liệu đã lưu của bạn.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPopulateSampleCard(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
          >
            Nạp dữ liệu mẫu
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
          onClick={() => {
            setActiveSection('education');
            setActiveFormSection(null);
            setDeletingItemId(null);
          }}
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
          onClick={() => {
            setActiveSection('skills');
            setActiveFormSection(null);
            setDeletingItemId(null);
          }}
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
          onClick={() => {
            setActiveSection('projects');
            setActiveFormSection(null);
            setDeletingItemId(null);
          }}
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
          onClick={() => {
            setActiveSection('certs');
            setActiveFormSection(null);
            setDeletingItemId(null);
          }}
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
      {/* SECTION 1: EDUCATION (INLINE EDITING)                           */}
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

            {!isPreviewSampleMode && activeFormSection !== 'education' && (
              <button
                type="button"
                onClick={handleOpenAddEdu}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm quá trình học</span>
              </button>
            )}
          </div>

          {/* INLINE EDUCATION FORM */}
          {activeFormSection === 'education' && (
            <div
              ref={formRef}
              className="bg-blue-50/40 border-2 border-blue-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {editingEduId ? 'Chỉnh Sửa Quá Trình Học Vấn' : 'Thêm Quá Trình Học Tập Mới'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Nhập thông tin trực tiếp bên dưới và nhấn "Lưu thay đổi" để đồng bộ lên Cloud Firestore.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFormSection(null);
                    setEditingEduId(null);
                    setFormValidationError(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
                  title="Hủy biểu mẫu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formValidationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formValidationError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdu} className="space-y-4 text-xs">
                {/* School Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên trường / Cơ sở đào tạo <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={eduForm.school}
                    onChange={(e) => {
                      setEduForm({ ...eduForm, school: e.target.value });
                      if (formValidationError) setFormValidationError(null);
                    }}
                    placeholder="VD: Trường THPT Chuyên Lê Hồng Phong hoặc Đại học Bách Khoa TP.HCM"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Desktop 2 Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bậc học:</label>
                    <select
                      value={eduForm.degreeLevel}
                      onChange={(e) => setEduForm({ ...eduForm, degreeLevel: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-2xs"
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
                      Ngành / Chuyên ngành (không bắt buộc đối với THPT):
                    </label>
                    <input
                      type="text"
                      value={eduForm.major || ''}
                      onChange={(e) => setEduForm({ ...eduForm, major: e.target.value })}
                      placeholder={eduForm.degreeLevel === 'Học sinh THPT' ? 'Ban Tự nhiên / Lớp Chuyên Toán...' : 'VD: Kỹ thuật Phần mềm, Quản trị Kinh doanh...'}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Thời gian bắt đầu:</label>
                    <input
                      type="text"
                      value={eduForm.startDate}
                      onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                      placeholder="VD: 09/2022"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Thời gian kết thúc:</label>
                    <input
                      type="text"
                      disabled={eduForm.isCurrent}
                      value={eduForm.isCurrent ? 'Đang học' : eduForm.endDate}
                      onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                      placeholder="VD: 06/2026"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Checkbox currently studying */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={eduForm.isCurrent}
                    onChange={(e) => setEduForm({ ...eduForm, isCurrent: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-800 font-semibold">
                    Hiện đang theo học tại cơ sở đào tạo này
                  </span>
                </label>

                {/* GPA Field */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Điểm GPA / Điểm trung bình (không bắt buộc):
                  </label>
                  <input
                    type="text"
                    value={eduForm.gpa || ''}
                    onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })}
                    placeholder="VD: 3.65 / 4.0 hoặc 8.8 / 10"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                {/* Coursework */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Môn học & Chuyên đề nổi bật (phân tách bằng dấu phẩy):
                  </label>
                  <input
                    type="text"
                    value={eduCourseworkInput}
                    onChange={(e) => setEduCourseworkInput(e.target.value)}
                    placeholder="VD: Cấu trúc dữ liệu & Giải thuật, Phát triển Web, Toán rời rạc..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                {/* Achievements & Scholarships */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Thành tích học tập & Học bổng (mỗi dòng một thành tích):
                  </label>
                  <textarea
                    rows={3}
                    value={eduAchievementsInput}
                    onChange={(e) => setEduAchievementsInput(e.target.value)}
                    placeholder="VD: Học bổng Khuyến khích Học tập loại Xuất sắc kỳ 1 & 2&#10;Giải Ba học sinh giỏi cấp Thành phố"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                {/* Inline Form Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-blue-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFormSection(null);
                      setEditingEduId(null);
                      setFormValidationError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
                  >
                    {isSaving ? 'Đang lưu vào Firestore...' : editingEduId ? 'Lưu thay đổi học vấn' : 'Lưu quá trình học'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Education Cards List */}
          {currentViewData.education.length === 0 && activeFormSection !== 'education' ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có thông tin học vấn</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Hãy thêm trường học (THPT, Cao đẳng hoặc Đại học) cùng chuyên ngành và thành tích để bắt đầu hoàn thiện hồ sơ của bạn.
              </p>
              {!isPreviewSampleMode && (
                <button
                  type="button"
                  onClick={handleOpenAddEdu}
                  className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm học vấn đầu tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {currentViewData.education.map((edu) => {
                const isDeletingThis = deletingItemId === edu.id;

                return (
                  <div
                    key={edu.id}
                    className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-3 transition-all hover:bg-slate-50 relative group"
                  >
                    {/* INLINE DELETE CONFIRMATION BOX (Requirement 5) */}
                    {isDeletingThis ? (
                      <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-2.5 text-rose-900 text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Bạn có chắc chắn muốn xóa mục học vấn tại "{edu.school}"?</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setDeletingItemId(null)}
                            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Giữ lại
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteEdu(edu.id)}
                            disabled={isSaving}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {isSaving ? 'Đang xóa...' : 'Xác nhận xóa'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                                onClick={() => handleOpenEditEdu(edu)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                                title="Chỉnh sửa trực tiếp"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingItemId(edu.id)}
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
                              Thành tích học tập & Học bổng:
                            </span>
                            <ul className="list-disc list-outside pl-4 text-xs text-slate-700 space-y-0.5">
                              {edu.achievements.map((ach, aIdx) => (
                                <li key={aIdx}>{ach}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 2: SKILLS (INLINE EDITING)                              */}
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

            {!isPreviewSampleMode && activeFormSection !== 'skills' && (
              <button
                type="button"
                onClick={handleOpenAddSkill}
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

          {/* INLINE SKILL FORM */}
          {activeFormSection === 'skills' && (
            <div
              ref={formRef}
              className="bg-blue-50/40 border-2 border-blue-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {editingSkillId ? 'Chỉnh Sửa Kỹ Năng' : 'Thêm Kỹ Năng Mới'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Chỉnh sửa trực tiếp trên trang, không mở popup.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFormSection(null);
                    setEditingSkillId(null);
                    setFormValidationError(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
                  title="Hủy biểu mẫu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formValidationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formValidationError}</span>
                </div>
              )}

              <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên kỹ năng <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={skillForm.name}
                    onChange={(e) => {
                      setSkillForm({ ...skillForm, name: e.target.value });
                      if (formValidationError) setFormValidationError(null);
                    }}
                    placeholder="VD: TypeScript, Thuyết trình trước đám đông, Tiếng Anh giao tiếp..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nhóm kỹ năng:</label>
                    <select
                      value={skillForm.category}
                      onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-2xs"
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
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-2xs"
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
                    Minh chứng / Cách bạn đã áp dụng kỹ năng này vào học tập hoặc đồ án:
                  </label>
                  <textarea
                    rows={3}
                    value={skillForm.evidence || ''}
                    onChange={(e) => setSkillForm({ ...skillForm, evidence: e.target.value })}
                    placeholder="VD: Đã xây dựng 2 website React hoàn chỉnh; đạt điểm 9.0 môn Lập trình Web; đạt IELTS 6.5..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-blue-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFormSection(null);
                      setEditingSkillId(null);
                      setFormValidationError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
                  >
                    {isSaving ? 'Đang lưu vào Firestore...' : editingSkillId ? 'Lưu thay đổi kỹ năng' : 'Lưu kỹ năng'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Skill Cards Grid */}
          {currentViewData.skills.length === 0 && activeFormSection !== 'skills' ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có kỹ năng nào</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Thêm kỹ năng chuyên môn, kỹ năng mềm hoặc ngoại ngữ kèm minh chứng để hoàn thiện điểm mạnh cạnh tranh của bạn.
              </p>
              {!isPreviewSampleMode && (
                <button
                  type="button"
                  onClick={handleOpenAddSkill}
                  className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm kỹ năng đầu tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentViewData.skills
                .filter((s) => skillFilterCategory === 'all' || s.category === skillFilterCategory)
                .map((skill) => {
                  const catMeta = SKILL_CATEGORY_LABELS[skill.category] || SKILL_CATEGORY_LABELS.technical;
                  const profMeta = PROFICIENCY_LABELS[skill.proficiency] || PROFICIENCY_LABELS.proficient;
                  const isDeletingThis = deletingItemId === skill.id;

                  return (
                    <div
                      key={skill.id}
                      className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 transition-all hover:bg-slate-50 flex flex-col justify-between"
                    >
                      {/* INLINE DELETE CONFIRMATION BOX (Requirement 5) */}
                      {isDeletingThis ? (
                        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                          <div className="flex items-center gap-2 text-rose-900 text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Xóa kỹ năng "{skill.name}"?</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setDeletingItemId(null)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Giữ lại
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteSkill(skill.id)}
                              disabled={isSaving}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                            >
                              {isSaving ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catMeta.color} flex items-center gap-1`}
                              >
                                <span>{catMeta.icon}</span>
                                <span>{catMeta.label}</span>
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${profMeta.color} flex items-center gap-1`}
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
                                onClick={() => handleOpenEditSkill(skill)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                                title="Sửa kỹ năng"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingItemId(skill.id)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                                title="Xóa kỹ năng"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 3: PROJECTS (INLINE EDITING)                           */}
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

            {!isPreviewSampleMode && activeFormSection !== 'projects' && (
              <button
                type="button"
                onClick={handleOpenAddProject}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm đồ án / dự án</span>
              </button>
            )}
          </div>

          {/* INLINE PROJECT FORM */}
          {activeFormSection === 'projects' && (
            <div
              ref={formRef}
              className="bg-blue-50/40 border-2 border-blue-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {editingProjectId ? 'Chỉnh Sửa Đồ Án / Dự Án' : 'Thêm Đồ Án / Dự Án Mới'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Nhập thông tin đồ án hoặc bài tập lớn môn học trực tiếp vào biểu mẫu.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFormSection(null);
                    setEditingProjectId(null);
                    setFormValidationError(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
                  title="Hủy biểu mẫu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formValidationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formValidationError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên đồ án / Dự án STEM / Hoạt động trải nghiệm <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.name}
                    onChange={(e) => {
                      setProjectForm({ ...projectForm, name: e.target.value });
                      if (formValidationError) setFormValidationError(null);
                    }}
                    placeholder="VD: Hệ thống Trao Đổi Giáo Trình Sinh Viên EcoBook hoặc Dự án STEM Nhà Thông Minh"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vai trò thực hiện:</label>
                    <input
                      type="text"
                      value={projectForm.role}
                      onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                      placeholder="VD: Trưởng nhóm / Lập trình viên chính / Nghiên cứu tài liệu"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Thời gian thực hiện:</label>
                    <input
                      type="text"
                      value={projectForm.period}
                      onChange={(e) => setProjectForm({ ...projectForm, period: e.target.value })}
                      placeholder="VD: 09/2025 – 12/2025"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả mục tiêu đồ án:</label>
                  <textarea
                    rows={2}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="VD: Xây dựng giải pháp hỗ trợ sinh viên chia sẻ và mượn giáo trình học kỳ tối ưu giao diện..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-2xs leading-relaxed"
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
                    placeholder="VD: React, TypeScript, Tailwind CSS, Firebase, Figma, Arduino..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
                    placeholder="VD: Đạt điểm 9.2/10 môn Đồ án Chuyên ngành&#10;Triển khai thử nghiệm với hơn 300 bạn học sử dụng&#10;Tối ưu tải trang dưới 1.2 giây"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Liên kết minh chứng (GitHub / Drive / Báo cáo / Demo):
                  </label>
                  <input
                    type="text"
                    value={projectForm.link || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                    placeholder="https://github.com/username/project hoặc https://drive.google.com/..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-blue-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFormSection(null);
                      setEditingProjectId(null);
                      setFormValidationError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
                  >
                    {isSaving ? 'Đang lưu vào Firestore...' : editingProjectId ? 'Lưu thay đổi đồ án' : 'Lưu đồ án'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Projects List */}
          {currentViewData.projects.length === 0 && activeFormSection !== 'projects' ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có đồ án hoặc dự án</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Đồ án môn học, bài tập lớn, dự án STEM hoặc website cá nhân là bằng chứng thuyết phục nhất trước nhà tuyển dụng.
              </p>
              {!isPreviewSampleMode && (
                <button
                  type="button"
                  onClick={handleOpenAddProject}
                  className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm đồ án đầu tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {currentViewData.projects.map((proj) => {
                const isDeletingThis = deletingItemId === proj.id;

                return (
                  <div
                    key={proj.id}
                    className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-3 transition-all hover:bg-slate-50"
                  >
                    {/* INLINE DELETE CONFIRMATION BOX (Requirement 5) */}
                    {isDeletingThis ? (
                      <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-2.5 text-rose-900 text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Bạn có chắc chắn muốn xóa đồ án "{proj.name}"?</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setDeletingItemId(null)}
                            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Giữ lại
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteProject(proj.id)}
                            disabled={isSaving}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {isSaving ? 'Đang xóa...' : 'Xác nhận xóa'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                                onClick={() => handleOpenEditProject(proj)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                                title="Sửa đồ án trực tiếp"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingItemId(proj.id)}
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
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 4: CERTIFICATES (INLINE EDITING)                       */}
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

            {!isPreviewSampleMode && activeFormSection !== 'certs' && (
              <button
                type="button"
                onClick={handleOpenAddCert}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm chứng chỉ mới</span>
              </button>
            )}
          </div>

          {/* INLINE CERTIFICATE FORM */}
          {activeFormSection === 'certs' && (
            <div
              ref={formRef}
              className="bg-blue-50/40 border-2 border-blue-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {editingCertId ? 'Chỉnh Sửa Chứng Chỉ' : 'Thêm Chứng Chỉ Mới'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Nhập thông tin chứng chỉ và liên kết xác minh trực tiếp trên trang.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFormSection(null);
                    setEditingCertId(null);
                    setFormValidationError(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
                  title="Hủy biểu mẫu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formValidationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formValidationError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCert} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Tên chứng chỉ <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={certForm.name}
                      onChange={(e) => {
                        setCertForm({ ...certForm, name: e.target.value });
                        if (formValidationError) setFormValidationError(null);
                      }}
                      placeholder="VD: Google Data Analytics Professional Certificate hoặc IELTS 7.0"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
                      onChange={(e) => {
                        setCertForm({ ...certForm, issuer: e.target.value });
                        if (formValidationError) setFormValidationError(null);
                      }}
                      placeholder="VD: Google, Coursera, IDP, Microsoft, Meta..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ngày cấp (Tháng/Năm):</label>
                    <input
                      type="text"
                      value={certForm.issueDate}
                      onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                      placeholder="VD: 01/2025"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ngày hết hạn (nếu có):</label>
                    <input
                      type="text"
                      value={certForm.expiryDate || ''}
                      onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                      placeholder="VD: 01/2027 hoặc để trống nếu vô thời hạn"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Mã chứng chỉ / Credential ID (nếu có):
                    </label>
                    <input
                      type="text"
                      value={certForm.credentialId || ''}
                      onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                      placeholder="VD: CERT-8899-COURSERA"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono shadow-2xs"
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
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-blue-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFormSection(null);
                      setEditingCertId(null);
                      setFormValidationError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
                  >
                    {isSaving ? 'Đang lưu vào Firestore...' : editingCertId ? 'Lưu thay đổi chứng chỉ' : 'Lưu chứng chỉ'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Certificates Grid */}
          {currentViewData.certificates.length === 0 && activeFormSection !== 'certs' ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có chứng chỉ nào</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Chứng chỉ online (Coursera, Google, Microsoft) hoặc chứng chỉ ngoại ngữ là điểm cộng rất lớn trên hồ sơ năng lực.
              </p>
              {!isPreviewSampleMode && (
                <button
                  type="button"
                  onClick={handleOpenAddCert}
                  className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm chứng chỉ đầu tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentViewData.certificates.map((cert) => {
                const isDeletingThis = deletingItemId === cert.id;

                return (
                  <div
                    key={cert.id}
                    className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-3 transition-all hover:bg-slate-50"
                  >
                    {/* INLINE DELETE CONFIRMATION BOX (Requirement 5) */}
                    {isDeletingThis ? (
                      <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-2 text-rose-900 text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Xóa chứng chỉ "{cert.name}"?</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setDeletingItemId(null)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Giữ lại
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteCert(cert.id)}
                            disabled={isSaving}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {isSaving ? 'Đang xóa...' : 'Xác nhận xóa'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                              onClick={() => handleOpenEditCert(cert)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                              title="Sửa chứng chỉ"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingItemId(cert.id)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                              title="Xóa chứng chỉ"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
