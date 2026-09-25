import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Member, Committee, Season, Task, EventEntity, AttendanceRecord, 
  AttendanceSession, MemberEvaluationRecord, HeadEvaluationRecord, 
  Complaint, DocumentItem, Announcement, AuditLogItem, SystemNotification,
  AppBrandingSettings, AppSoundSettings, RolePermissionsMap, EvaluationRubric, HeadEvaluationRubric
} from '../types';

export class SupabaseService {
  /**
   * Upload a file to Supabase Storage and get its public URL
   */
  static async uploadFile(
    bucket: 'avatars' | 'documents' | 'attachments', 
    file: File, 
    customPath?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = customPath || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        // If bucket doesn't exist, fallback to data URL or error
        console.warn(`Storage upload error (${bucket}):`, error.message);
        return { success: false, error: error.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err: any) {
      console.error('File upload exception:', err);
      return { success: false, error: err.message || 'Unknown upload error' };
    }
  }

  /**
   * Fetch all initial state from Supabase Cloud Database
   */
  static async loadAllData(): Promise<{
    members?: Member[];
    committees?: Committee[];
    seasons?: Season[];
    tasks?: Task[];
    events?: EventEntity[];
    attendanceRecords?: AttendanceRecord[];
    attendanceSessions?: AttendanceSession[];
    memberEvaluations?: MemberEvaluationRecord[];
    headEvaluations?: HeadEvaluationRecord[];
    complaints?: Complaint[];
    documents?: DocumentItem[];
    announcements?: Announcement[];
    auditLogs?: AuditLogItem[];
    notifications?: SystemNotification[];
    settings?: {
      branding?: AppBrandingSettings;
      sounds?: AppSoundSettings;
      rolePermissions?: RolePermissionsMap;
      rubric?: EvaluationRubric;
      headRubric?: HeadEvaluationRubric;
    };
  } | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const [
        { data: membersData },
        { data: committeesData },
        { data: seasonsData },
        { data: tasksData },
        { data: eventsData },
        { data: attendanceData },
        { data: sessionsData },
        { data: memberEvalsData },
        { data: headEvalsData },
        { data: complaintsData },
        { data: documentsData },
        { data: announcementsData },
        { data: auditLogsData },
        { data: notificationsData },
        { data: settingsData }
      ] = await Promise.all([
        supabase.from('members').select('*'),
        supabase.from('committees').select('*'),
        supabase.from('seasons').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('events').select('*'),
        supabase.from('attendance_records').select('*'),
        supabase.from('attendance_sessions').select('*'),
        supabase.from('member_evaluations').select('*'),
        supabase.from('head_evaluations').select('*'),
        supabase.from('complaints').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200),
        supabase.from('system_notifications').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('app_settings').select('*')
      ]);

      const result: any = {};

      if (membersData && membersData.length > 0) {
        result.members = membersData.map((row: any) => ({
          id: row.id,
          volunteerId: row.volunteer_id,
          fullName: row.full_name,
          universityEmail: row.email,
          college: row.college,
          academicYear: row.academic_year,
          whatsappNumber: row.whatsapp_number,
          birthDate: row.birth_date,
          age: row.age,
          nationalId: row.national_id,
          currentCommitteeId: row.current_committee_id,
          currentCommitteeName: row.current_committee_name,
          preferredCommitteeId: row.preferred_committee_id,
          preferredCommitteeName: row.preferred_committee_name,
          position: row.position,
          role: row.role,
          joinDate: row.join_date,
          status: row.status,
          avatarUrl: row.avatar_url,
          password: row.password,
          performance: row.performance || {
            overallScore: 90, attendanceRate: 100, taskCompletionRate: 90,
            taskQuality: 4.5, commitment: 90, teamwork: 90, leadership: 85, evaluationsCount: 0
          },
          skills: row.skills || {},
          activeWorkload: row.active_workload || 0,
          workloadStatus: row.workload_status || 'Optimal',
          engagementRisk: row.engagement_risk || 'Low',
          points: row.points || 0,
          level: row.level || 1,
          badges: row.badges || [],
          committeeHistory: row.committee_history || [],
          availability: row.availability || 'Available',
          bio: row.bio || '',
          hobbies: row.hobbies || [],
          learningAspirations: row.learning_aspirations || [],
          facebookUrl: row.facebook_url,
          tiktokUrl: row.tiktok_url,
          instagramUrl: row.instagram_url,
          linkedinUrl: row.linkedin_url
        }));
      }

      if (committeesData && committeesData.length > 0) {
        result.committees = committeesData.map((c: any) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          description: c.description,
          responsibilities: c.responsibilities || [],
          headId: c.head_id,
          headName: c.head_name,
          viceId: c.vice_id,
          viceName: c.vice_name,
          memberCount: c.member_count || 0,
          activeTasksCount: c.active_tasks_count || 0,
          completedTasksCount: c.completed_tasks_count || 0,
          attendanceRate: c.attendance_rate || 100,
          performanceScore: c.performance_score || 100,
          healthScore: c.health_score || 100,
          seasonId: c.season_id,
          color: c.color,
          icon: c.icon
        }));
      }

      if (tasksData && tasksData.length > 0) {
        result.tasks = tasksData.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          committeeId: t.committee_id,
          committeeName: t.committee_name,
          assignedToMemberIds: t.assigned_to_ids || [],
          assignedToMemberNames: t.assigned_to_names || [],
          createdByMemberId: t.created_by_id,
          createdByMemberName: t.created_by_name,
          priority: t.priority,
          deadline: t.deadline,
          status: t.status,
          attachments: t.attachments || [],
          submission: t.submission,
          evaluation: t.evaluation,
          requiredSkills: t.required_skills || [],
          eventId: t.event_id,
          eventName: t.event_name,
          completionPercentage: t.completion_percentage || 0,
          xpReward: t.xp_reward || 20,
          createdAt: t.created_at,
          subtasks: t.subtasks || []
        }));
      }

      if (eventsData && eventsData.length > 0) {
        result.events = eventsData.map((e: any) => ({
          id: e.id,
          name: e.name,
          date: e.date,
          startTime: e.start_time,
          endTime: e.end_time,
          location: e.location,
          description: e.description,
          eventManagerId: e.event_manager_id,
          eventManagerName: e.event_manager_name,
          committeeQuotas: e.committee_quotas || {},
          status: e.status,
          expectedMembersCount: e.expected_members_count || 0,
          actualAttendanceCount: e.actual_attendance_count || 0,
          tasksCount: e.tasks_count || 0,
          sosAlertsCount: e.sos_alerts_count || 0,
          seasonId: e.season_id,
          liveDashboardActive: e.live_dashboard_active || false
        }));
      }

      if (attendanceData && attendanceData.length > 0) {
        result.attendanceRecords = attendanceData.map((a: any) => ({
          id: a.id,
          memberId: a.member_id,
          memberName: a.member_name,
          memberAvatar: a.member_avatar,
          committeeId: a.committee_id,
          committeeName: a.committee_name,
          eventId: a.event_id,
          eventName: a.event_name,
          date: a.date,
          checkInTime: a.check_in_time,
          checkOutTime: a.check_out_time,
          durationMinutes: a.duration_minutes,
          durationFormatted: a.duration_formatted,
          status: a.status,
          qrHashToken: a.qr_hash_token
        }));
      }

      if (sessionsData && sessionsData.length > 0) {
        result.attendanceSessions = sessionsData.map((s: any) => ({
          id: s.id,
          title: s.title,
          committeeId: s.committee_id,
          committeeName: s.committee_name,
          createdByMemberId: s.created_by_id,
          createdByMemberName: s.created_by_name,
          createdByRole: s.created_by_role,
          createdAt: s.created_at,
          requireGPS: s.require_gps,
          qrToken: s.qr_token,
          isActive: s.is_active,
          notes: s.notes
        }));
      }

      if (memberEvalsData && memberEvalsData.length > 0) {
        result.memberEvaluations = memberEvalsData.map((ev: any) => ({
          id: ev.id,
          memberId: ev.member_id,
          memberName: ev.member_name,
          memberVolunteerId: ev.member_volunteer_id,
          committeeName: ev.committee_name,
          evaluatorId: ev.evaluator_id,
          evaluatorName: ev.evaluator_name,
          evaluatorRole: ev.evaluator_role,
          scores: ev.scores || {},
          totalScore: ev.total_score,
          maxTotalScore: ev.max_total_score,
          percentage: ev.percentage,
          feedback: ev.feedback,
          evaluatedAt: ev.evaluated_at
        }));
      }

      if (headEvalsData && headEvalsData.length > 0) {
        result.headEvaluations = headEvalsData.map((he: any) => ({
          id: he.id,
          headId: he.head_id,
          headName: he.head_name,
          headVolunteerId: he.head_volunteer_id,
          headPosition: he.head_position,
          committeeName: he.committee_name,
          evaluatorId: he.evaluator_id,
          evaluatorName: he.evaluator_name,
          evaluatorRole: he.evaluator_role,
          scores: he.scores || {},
          totalScore: he.total_score,
          maxTotalScore: he.max_total_score,
          percentage: he.percentage,
          leadershipRating: he.leadership_rating,
          feedback: he.feedback,
          actionItems: he.action_items,
          evaluatedAt: he.evaluated_at
        }));
      }

      if (complaintsData && complaintsData.length > 0) {
        result.complaints = complaintsData.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          senderId: c.sender_id,
          senderName: c.sender_name,
          senderAvatar: c.sender_avatar,
          senderCommitteeId: c.sender_committee_id,
          senderCommitteeName: c.sender_committee_name,
          senderRole: c.sender_role,
          isAnonymous: c.is_anonymous,
          status: c.status,
          targetRecipients: c.target_recipients || [],
          responseNotes: c.response_notes,
          internalNotes: c.internal_notes,
          respondedBy: c.responded_by,
          respondedAt: c.responded_at,
          createdAt: c.created_at,
          resolvedAt: c.resolved_at,
          satisfactionRating: c.satisfaction_rating
        }));
      }

      if (documentsData && documentsData.length > 0) {
        result.documents = documentsData.map((d: any) => ({
          id: d.id,
          title: d.title,
          committeeId: d.committee_id,
          committeeName: d.committee_name,
          category: d.category,
          uploadedBy: d.uploaded_by,
          uploadedAt: d.uploaded_at,
          fileSize: d.file_size,
          fileType: d.file_type,
          fileName: d.file_name,
          description: d.description,
          fileUrl: d.file_url
        }));
      }

      if (announcementsData && announcementsData.length > 0) {
        result.announcements = announcementsData.map((a: any) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          authorName: a.author_name,
          authorRole: a.author_role,
          targetType: a.target_type,
          targetCommitteeId: a.target_committee_id,
          targetCommitteeName: a.target_committee_name,
          isPinned: a.is_pinned,
          createdAt: a.created_at
        }));
      }

      if (auditLogsData && auditLogsData.length > 0) {
        result.auditLogs = auditLogsData.map((l: any) => ({
          id: l.id,
          userId: l.user_id,
          userName: l.user_name,
          userRole: l.user_role,
          action: l.action,
          targetEntity: l.target_entity,
          details: l.details,
          previousValue: l.previous_value,
          newValue: l.new_value,
          timestamp: l.timestamp
        }));
      }

      if (notificationsData && notificationsData.length > 0) {
        result.notifications = notificationsData.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          createdAt: n.created_at,
          linkTab: n.link_tab
        }));
      }

      return result;
    } catch (err) {
      console.warn('Supabase data load error:', err);
      return null;
    }
  }

  /**
   * Realtime entity upsert helper
   */
  static async upsertMember(member: Member) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('members').upsert({
        id: member.id,
        volunteer_id: member.volunteerId,
        full_name: member.fullName,
        email: member.universityEmail,
        college: member.college,
        academic_year: member.academicYear,
        whatsapp_number: member.whatsappNumber,
        birth_date: member.birthDate,
        age: member.age,
        national_id: member.nationalId,
        current_committee_id: member.currentCommitteeId,
        current_committee_name: member.currentCommitteeName,
        preferred_committee_id: member.preferredCommitteeId,
        preferred_committee_name: member.preferredCommitteeName,
        position: member.position,
        role: member.role,
        join_date: member.joinDate,
        status: member.status,
        avatar_url: member.avatarUrl,
        password: member.password,
        performance: member.performance,
        skills: member.skills,
        active_workload: member.activeWorkload,
        workload_status: member.workloadStatus,
        engagement_risk: member.engagementRisk,
        points: member.points,
        level: member.level,
        badges: member.badges,
        committee_history: member.committeeHistory,
        availability: member.availability,
        bio: member.bio,
        hobbies: member.hobbies,
        learning_aspirations: member.learningAspirations,
        facebook_url: member.facebookUrl,
        tiktok_url: member.tiktokUrl,
        instagram_url: member.instagramUrl,
        linkedin_url: member.linkedinUrl,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('upsertMember failed:', e);
    }
  }

  static async upsertTask(task: Task) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('tasks').upsert({
        id: task.id,
        title: task.title,
        description: task.description,
        committee_id: task.committeeId,
        committee_name: task.committeeName,
        assigned_to_ids: task.assignedToMemberIds,
        assigned_to_names: task.assignedToMemberNames,
        created_by_id: task.createdByMemberId,
        created_by_name: task.createdByMemberName,
        priority: task.priority,
        deadline: task.deadline,
        status: task.status,
        attachments: task.attachments,
        submission: task.submission,
        evaluation: task.evaluation,
        required_skills: task.requiredSkills,
        event_id: task.eventId,
        event_name: task.eventName,
        completion_percentage: task.completionPercentage,
        xp_reward: task.xpReward,
        subtasks: task.subtasks,
        created_at: task.createdAt,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('upsertTask failed:', e);
    }
  }

  static async upsertEvent(event: EventEntity) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('events').upsert({
        id: event.id,
        name: event.name,
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        location: event.location,
        description: event.description,
        event_manager_id: event.eventManagerId,
        event_manager_name: event.eventManagerName,
        committee_quotas: event.committeeQuotas,
        status: event.status,
        expected_members_count: event.expectedMembersCount,
        actual_attendance_count: event.actualAttendanceCount,
        tasks_count: event.tasksCount,
        sos_alerts_count: event.sosAlertsCount,
        season_id: event.seasonId,
        live_dashboard_active: event.liveDashboardActive,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('upsertEvent failed:', e);
    }
  }

  static async insertAttendanceRecord(record: AttendanceRecord) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      await supabase.from('attendance_records').upsert({
        id: record.id,
        member_id: record.memberId,
        member_name: record.memberName,
        member_avatar: record.memberAvatar,
        committee_id: record.committeeId,
        committee_name: record.committeeName,
        event_id: record.eventId,
        event_name: record.eventName,
        date: record.date,
        check_in_time: record.checkInTime,
        check_out_time: record.checkOutTime,
        duration_minutes: record.durationMinutes,
        duration_formatted: record.durationFormatted,
        status: record.status,
        qr_hash_token: record.qrHashToken
      });
    } catch (e) {
      console.error('insertAttendanceRecord failed:', e);
    }
  }
}
