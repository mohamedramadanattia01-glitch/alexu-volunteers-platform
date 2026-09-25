import React from 'react';
import { useApp } from '../../context/AppContext';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { HeadDashboard } from './HeadDashboard';
import { MemberDashboard } from './MemberDashboard';

interface DashboardRouterProps {
  onOpenNewTask: () => void;
  onOpenNewEvent: () => void;
  onOpenAnnouncement: () => void;
  onOpenQRModal: () => void;
  onOpenDigitalPortfolio: () => void;
  onSelectMember: (memberId: string) => void;
  onSelectTask: (taskId: string) => void;
  onOpenEditProfile?: () => void;
  onOpenComplaintModal?: () => void;
  onOpenApprovals?: () => void;
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({
  onOpenNewTask,
  onOpenNewEvent,
  onOpenAnnouncement,
  onOpenQRModal,
  onOpenDigitalPortfolio,
  onSelectMember,
  onSelectTask,
  onOpenEditProfile,
  onOpenComplaintModal,
  onOpenApprovals
}) => {
  const { currentUser, isHighLeadership } = useApp();

  if (isHighLeadership) {
    return (
      <SuperAdminDashboard
        onOpenNewTask={onOpenNewTask}
        onOpenNewEvent={onOpenNewEvent}
        onOpenAnnouncement={onOpenAnnouncement}
        onSelectMember={onSelectMember}
        onOpenApprovals={onOpenApprovals}
      />
    );
  }

  if (currentUser.role === 'head' || currentUser.role === 'vice_head') {
    return (
      <HeadDashboard
        onOpenNewTask={onOpenNewTask}
        onSelectMember={onSelectMember}
      />
    );
  }

  // Default to member dashboard (or HR / Event manager customized view)
  return (
    <MemberDashboard
      onOpenQRModal={onOpenQRModal}
      onOpenDigitalPortfolio={onOpenDigitalPortfolio}
      onSelectTask={onSelectTask}
      onOpenEditProfile={onOpenEditProfile}
      onOpenComplaintModal={onOpenComplaintModal}
    />
  );
};
