import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TopTickerBar } from './components/layout/TopTickerBar';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { DashboardRouter } from './components/dashboard/DashboardRouter';
import { ProfileView } from './components/profile/ProfileView';
import { LiveCommandCenter } from './components/events/LiveCommandCenter';
import { EventsList } from './components/events/EventsList';
import { SOSModal } from './components/events/SOSModal';
import { EventModal } from './components/events/EventModal';
import { QRAttendanceModal } from './components/attendance/QRAttendanceModal';
import { AttendanceView } from './components/attendance/AttendanceView';
import { TaskManager } from './components/tasks/TaskManager';
import { TaskModal } from './components/tasks/TaskModal';
import { TaskSubmissionModal } from './components/tasks/TaskSubmissionModal';
import { TaskEvaluationModal } from './components/tasks/TaskEvaluationModal';
import { MembersDirectory } from './components/members/MembersDirectory';
import { MemberProfileModal } from './components/members/MemberProfileModal';
import { EditMemberProfileModal } from './components/members/EditMemberProfileModal';
import { DigitalPortfolioModal } from './components/members/DigitalPortfolioModal';
import { TransferCommitteeModal } from './components/members/TransferCommitteeModal';
import { AddMemberModal } from './components/members/AddMemberModal';
import { ImportMembersModal } from './components/members/ImportMembersModal';
import { CommitteesView } from './components/committees/CommitteesView';
import { CommitteeModal } from './components/committees/CommitteeModal';
import { OrgChartView } from './components/hierarchy/OrgChartView';
import { BirthdaysView } from './components/birthdays/BirthdaysView';
import { EvaluationsView } from './components/evaluations/EvaluationsView';
import { LeaderboardView } from './components/gamification/LeaderboardView';
import { AIHubView } from './components/ai/AIHubView';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { ComplaintsView } from './components/complaints/ComplaintsView';
import { ComplaintModal } from './components/complaints/ComplaintModal';
import { DocumentsView } from './components/documents/DocumentsView';
import { AdminAuditRBAC } from './components/admin/AdminAuditRBAC';
import { ReportsView } from './components/reports/ReportsView';
import { AppSettingsModal } from './components/settings/AppSettingsModal';
import { DatabaseMasterModal } from './components/database/DatabaseMasterModal';
import { CelebrationOverlay } from './components/common/CelebrationOverlay';
import { AuthScreen } from './components/auth/AuthScreen';
import { PendingApprovalsModal } from './components/members/PendingApprovalsModal';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { SplashScreen } from './components/common/SplashScreen';
import { Member, Task, EventEntity } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, tasks, branding, currentUser, isAuthenticated } = useApp();

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isNewCommOpen, setIsNewCommOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isImportMembersOpen, setIsImportMembersOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isPendingApprovalsOpen, setIsPendingApprovalsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  const [selectedEventForEdit, setSelectedEventForEdit] = useState<EventEntity | null>(null);
  const [selectedMemberIdForProfile, setSelectedMemberIdForProfile] = useState<string | null>(null);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<Member | null>(null);
  const [selectedMemberForTransfer, setSelectedMemberForTransfer] = useState<Member | null>(null);
  const [selectedMemberForCV, setSelectedMemberForCV] = useState<Member | null>(null);
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState<Task | null>(null);
  const [selectedTaskForEvaluation, setSelectedTaskForEvaluation] = useState<Task | null>(null);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleOpenMemberProfile = (mId: string) => {
    setSelectedMemberIdForProfile(mId);
  };

  const handleOpenTaskSelect = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      if (target.status === 'Submitted') {
        setSelectedTaskForEvaluation(target);
      } else {
        setSelectedTaskForSubmission(target);
      }
    }
  };

  const fontClass = `font-mode-${branding.fontSizeMode || 'compact'}`;

  return (
    <div className={`min-h-screen bg-[#070c18] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16 lg:pb-0 relative overflow-x-hidden ${fontClass}`}>
      
      {/* Background Animated Ambient Glowing Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dynamic Top Announcement Ticker Bar */}
      <TopTickerBar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Top Navbar */}
      <Navbar
        onOpenSOSModal={() => setIsSOSOpen(true)}
        onOpenQRModal={() => setIsQROpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
        onOpenApprovalsModal={() => setIsPendingApprovalsOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="max-w-7xl mx-auto w-full flex flex-1 overflow-x-hidden">
        
        {/* Desktop Sidebar */}
        <Sidebar onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)} />

        {/* Main Content Area with Animated Page Transitions */}
        <main className="flex-1 p-3 sm:p-5 max-w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
            >
              {activeTab === 'dashboard' && (
                <DashboardRouter
                  onOpenNewTask={() => setIsNewTaskOpen(true)}
                  onOpenNewEvent={() => setIsNewEventOpen(true)}
                  onOpenAnnouncement={() => setActiveTab('announcements')}
                  onOpenQRModal={() => setIsQROpen(true)}
                  onOpenDigitalPortfolio={() => setSelectedMemberForCV(currentUser)}
                  onSelectMember={handleOpenMemberProfile}
                  onSelectTask={handleOpenTaskSelect}
                  onOpenEditProfile={() => setSelectedMemberForEdit(currentUser)}
                  onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
                  onOpenApprovals={() => setIsPendingApprovalsOpen(true)}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  onOpenEditProfile={() => setSelectedMemberForEdit(currentUser)}
                  onOpenPortfolio={() => setSelectedMemberForCV(currentUser)}
                  onOpenQRModal={() => setIsQROpen(true)}
                  onOpenComplaint={() => setIsComplaintModalOpen(true)}
                  onSelectTask={handleOpenTaskSelect}
                />
              )}

              {activeTab === 'live-command' && (
                <LiveCommandCenter
                  onOpenSOSModal={() => setIsSOSOpen(true)}
                  onOpenQRModal={() => setIsQROpen(true)}
                />
              )}

              {activeTab === 'members' && (
                <MembersDirectory
                  onSelectMember={handleOpenMemberProfile}
                  onOpenAddMember={() => setIsAddMemberOpen(true)}
                  onOpenTransferModal={(m) => setSelectedMemberForTransfer(m)}
                  onOpenImportModal={() => setIsImportMembersOpen(true)}
                  onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
                />
              )}

              {activeTab === 'org-hierarchy' && (
                <OrgChartView />
              )}

              {activeTab === 'birthdays' && (
                <BirthdaysView />
              )}

              {activeTab === 'committees' && (
                <CommitteesView
                  onOpenNewCommittee={() => setIsNewCommOpen(true)}
                  onSelectCommittee={() => setActiveTab('members')}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskManager
                  onOpenNewTask={() => setIsNewTaskOpen(true)}
                  onOpenSubmissionModal={(t) => setSelectedTaskForSubmission(t)}
                  onOpenEvaluationModal={(t) => setSelectedTaskForEvaluation(t)}
                />
              )}

              {activeTab === 'events' && (
                <EventsList
                  onOpenNewEvent={() => setIsNewEventOpen(true)}
                  onOpenLiveCommand={() => setActiveTab('live-command')}
                  onEditEvent={(ev) => setSelectedEventForEdit(ev)}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceView onOpenQRModal={() => setIsQROpen(true)} />
              )}

              {activeTab === 'evaluations' && (
                <EvaluationsView />
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardView />
              )}

              {activeTab === 'ai-hub' && (
                <AIHubView />
              )}

              {activeTab === 'announcements' && (
                <AnnouncementsView />
              )}

              {activeTab === 'complaints' && (
                <ComplaintsView onOpenNewComplaint={() => setIsComplaintModalOpen(true)} />
              )}

              {activeTab === 'documents' && (
                <DocumentsView />
              )}

              {activeTab === 'admin' && (
                <AdminAuditRBAC />
              )}

              {activeTab === 'reports' && (
                <ReportsView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onOpenQRModal={() => setIsQROpen(true)}
        onOpenSOSModal={() => setIsSOSOpen(true)}
      />

      {/* Mobile Drawer Menu */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
      />

      {/* Global Modals */}
      <PWAInstallPrompt isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      <QRAttendanceModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      <AIAssistantModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <TaskModal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} />
      <EventModal 
        isOpen={isNewEventOpen || !!selectedEventForEdit} 
        eventToEdit={selectedEventForEdit}
        onClose={() => {
          setIsNewEventOpen(false);
          setSelectedEventForEdit(null);
        }} 
      />
      <CommitteeModal isOpen={isNewCommOpen} onClose={() => setIsNewCommOpen(false)} />
      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} />
      <ImportMembersModal isOpen={isImportMembersOpen} onClose={() => setIsImportMembersOpen(false)} />
      <AppSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <DatabaseMasterModal isOpen={isDatabaseModalOpen} onClose={() => setIsDatabaseModalOpen(false)} />
      <ComplaintModal isOpen={isComplaintModalOpen} onClose={() => setIsComplaintModalOpen(false)} />
      <PendingApprovalsModal isOpen={isPendingApprovalsOpen} onClose={() => setIsPendingApprovalsOpen(false)} />

      {selectedMemberForEdit && (
        <EditMemberProfileModal
          member={selectedMemberForEdit}
          isOpen={!!selectedMemberForEdit}
          onClose={() => setSelectedMemberForEdit(null)}
        />
      )}

      <MemberProfileModal
        memberId={selectedMemberIdForProfile}
        isOpen={!!selectedMemberIdForProfile}
        onClose={() => setSelectedMemberIdForProfile(null)}
        onOpenDigitalPortfolio={(m) => { setSelectedMemberIdForProfile(null); setSelectedMemberForCV(m); }}
        onOpenEditProfile={(m) => setSelectedMemberForEdit(m)}
        onOpenTransferModal={(m) => { setSelectedMemberIdForProfile(null); setSelectedMemberForTransfer(m); }}
      />

      <TransferCommitteeModal
        member={selectedMemberForTransfer}
        isOpen={!!selectedMemberForTransfer}
        onClose={() => setSelectedMemberForTransfer(null)}
      />

      <DigitalPortfolioModal
        member={selectedMemberForCV}
        isOpen={!!selectedMemberForCV}
        onClose={() => setSelectedMemberForCV(null)}
      />

      <TaskSubmissionModal
        task={selectedTaskForSubmission}
        isOpen={!!selectedTaskForSubmission}
        onClose={() => setSelectedTaskForSubmission(null)}
      />

      <TaskEvaluationModal
        task={selectedTaskForEvaluation}
        isOpen={!!selectedTaskForEvaluation}
        onClose={() => setSelectedTaskForEvaluation(null)}
      />

      {/* Real-time Gamification Celebration Popups */}
      <CelebrationOverlay />

    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AppProvider>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen 
            onFinish={() => setShowSplash(false)} 
            durationMs={1300} 
          />
        )}
      </AnimatePresence>
      <MainAppContent />
    </AppProvider>
  );
}
