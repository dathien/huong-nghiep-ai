import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SelfDiscovery } from './components/SelfDiscovery';
import { CareerExplore } from './components/CareerExplore';
import { CompetencyProfile } from './components/CompetencyProfile';
import { ResumeBuilder } from './components/ResumeBuilder';
import { InternshipJobs } from './components/InternshipJobs';
import { MockInterviewer } from './components/MockInterviewer';
import { CareerRoadmap } from './components/CareerRoadmap';
import { ChiAnGuide } from './components/ChiAnMascot';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppTab, CVData, StudentLevel } from './types';
import { SAMPLE_DEFAULT_CV } from './data/mockData';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('Sinh viên đại học');
  const [cvData, setCvData] = useState<CVData>(SAMPLE_DEFAULT_CV);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectCareerForCv = (title: string, skills: string[]) => {
    setCvData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        title,
      },
      skills: {
        ...prev.skills,
        technical: Array.from(new Set([...prev.skills.technical, ...skills])),
      },
    }));
  };

  const handleApplyOptimizedSummary = (newSummary: string) => {
    setCvData((prev) => ({
      ...prev,
      summary: newSummary,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Modern EdTech Header (72px) */}
      <Header
        studentLevel={studentLevel}
        setStudentLevel={setStudentLevel}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* 2. Main Layout: Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar (260px or 72px when collapsed) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Right Main Content Area */}
        <div
          className={`flex-1 transition-all duration-200 ease-in-out flex flex-col min-h-[calc(100vh-72px)] overflow-x-hidden ${
            isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
          }`}
        >
          <main className="flex-1 pb-12">
            {activeTab === 'dashboard' && (
              <Dashboard
                studentLevel={studentLevel}
                cvData={cvData}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* On functional tabs, embed friendly Chị An Guide at top */}
            {activeTab !== 'dashboard' && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
                <ChiAnGuide
                  activeTab={activeTab}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              </div>
            )}

            {activeTab === 'self-discovery' && (
              <SelfDiscovery onNavigateTab={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'career-explore' && (
              <CareerExplore
                studentLevel={studentLevel}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectCareerForCv={handleSelectCareerForCv}
              />
            )}

            {activeTab === 'competency-profile' && (
              <CompetencyProfile
                cvData={cvData}
                setCvData={setCvData}
                studentLevel={studentLevel}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'cv-builder' && (
              <ResumeBuilder
                cvData={cvData}
                setCvData={setCvData}
                studentLevel={studentLevel}
              />
            )}

            {activeTab === 'internship-jobs' && (
              <InternshipJobs
                cvData={cvData}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onApplyOptimizedSummary={handleApplyOptimizedSummary}
              />
            )}

            {activeTab === 'interview-practice' && (
              <MockInterviewer studentLevel={studentLevel} />
            )}

            {activeTab === 'career-roadmap' && (
              <CareerRoadmap studentLevel={studentLevel} />
            )}
          </main>

          {/* Footer Component with copyright */}
          <Footer />
        </div>
      </div>

      {/* Global Auth & Profile Modals */}
      <AuthModal />
      <UserProfileModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
