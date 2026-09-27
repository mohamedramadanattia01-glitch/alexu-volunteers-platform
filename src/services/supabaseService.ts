import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Member, Committee, Season, Task, EventEntity, AttendanceRecord, 
  AttendanceSession, MemberEvaluationRecord, HeadEvaluationRecord, 
  Complaint, DocumentItem, Announcement, AuditLogItem, SystemNotification,
  AppBrandingSettings, AppSoundSettings, RolePermissionsMap, EvaluationRubric, HeadEvaluationRubric,
  BannedUserRecord
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
    bannedUsers?: BannedUserRecord[];
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
        { data: membersData, error: memErr },
        { data: committeesData, error: commErr },
        { data: seasonsData, error: seaErr },
        { data: tasksData, error: taskErr },
        { data: eventsData, error: evErr },
        { data: attendanceData, error: attErr },
        { data: sessionsData, error: sessErr },
        { data: memberEvalsData, error: meErr },
        { data: headEvalsData, error: heErr },
        { data: complaintsData, error: compErr },
        { data: documentsData, error: docErr },
        { data: announcementsData, error: annErr },
        { data: auditLogsData, error: audErr },
        { data: notificationsData, error: notifErr },
        { data: bannedUsersData, error: banErr },
        { data: settingsData, error: setErr }
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
        supabase.from('banned_users').select('*').order('banned_at', { ascending: false }),
        supabase.from('app_settings').select('*')
      ]);

      if (memErr) console.warn('Supabase members fetch error:', memErr);
      if (taskErr) console.warn('Supabase tasks fetch error:', taskErr);
      if (evErr) console.warn('Supabase events fetch error:', evErr);

      const result: any = {};

      if (membersData && membersData.length > 0) {
        result.members = membersData.map((row: any) => ({
          id: row.id,
          volunteerId: row.volunteer_id,
          fullName: row.full_name,
          universityEmail: row.email,
          college: row.college,
          academicYear: row.academic_year,
          phone: row.phone || row.whatsapp_number || '',
          whatsappNumber: row.whatsapp_number || row.phone || '',
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
          certifiedSkills: row.certified_skills || [],
          bloodType: row.blood_type || 'O+',
          emergencyContact: row.emergency_contact || '',
          address: row.address || '',
          banReason: row.ban_reason,
          bannedAt: row.banned_at,
          bannedBy: row.banned_by,
          rejectionReason: row.rejection_reason,
          registrationDate: row.registration_date,
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

      if (seasonsData && seasonsData.length > 0) {
        result.seasons = seasonsData.map((s: any) => ({
          id: s.id,
          name: s.name,
          isCurrent: s.is_current,
          startDate: s.start_date,
          endDate: s.end_date,
          totalMembers: s.total_members || 0,
          totalEvents: s.total_events || 0,
          totalTasks: s.total_tasks || 0,
          archived: s.archived || false
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
          maxPoints: t.max_points || t.xp_reward || 30,
          xpReward: t.xp_reward || t.max_points || 30,
          subtasks: t.subtasks || [],
          voiceNoteUrl: t.voice_note_url,
          voiceDuration: t.voice_duration,
          stance: t.stance,
          excuseReason: t.excuse_reason,
          excusedAt: t.excused_at,
          excusedByMemberId: t.excused_by_id,
          excusedByMemberName: t.excused_by_name,
          awardedPoints: t.awarded_points,
          gradedBy: t.graded_by,
          gradedByName: t.graded_by_name,
          gradedAt: t.graded_at,
          feedback: t.feedback,
          createdAt: t.created_at
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
          liveDashboardActive: e.live_dashboard_active || false,
          targetAudience: e.target_audience || 'all',
          selectedCommitteeIds: e.selected_committee_ids || [],
          rsvps: e.rsvps || {}
        }));
      }

      if (attendanceData && attendanceData.length > 0) {
        result.attendanceRecords = attendanceData.map((a: any) => ({
          id: a.id,
          memberId: a.member_id,
          memberName: a.member_name,
          memberAvatar: a.member_avatar,
          memberVolunteerId: a.member_volunteer_id,
          committeeId: a.committee_id,
          committeeName: a.committee_name,
          eventId: a.event_id,
          eventName: a.event_name,
          sessionId: a.session_id,
          sessionTitle: a.session_title,
          date: a.date,
          checkInTime: a.check_in_time,
          checkOutTime: a.check_out_time,
          durationMinutes: a.duration_minutes,
          durationFormatted: a.duration_formatted,
          status: a.status,
          qrHashToken: a.qr_hash_token,
          gpsLocation: a.gps_location,
          dailyEvaluation: a.daily_evaluation
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
          sessionType: s.session_type || 'members',
          eventId: s.event_id,
          eventName: s.event_name,
          eventDate: s.event_date,
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
          poll: a.poll,
          reactions: a.reactions || [],
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
          targetName: n.target_name,
          requiredAction: n.required_action,
          badgeText: n.badge_text,
          targetCommitteeId: n.target_committee_id,
          targetMemberIds: n.target_member_ids || [],
          senderName: n.sender_name,
          read: n.read,
          createdAt: n.created_at,
          linkTab: n.link_tab
        }));
      }

      if (bannedUsersData && bannedUsersData.length > 0) {
        result.bannedUsers = bannedUsersData.map((b: any) => ({
          id: b.id,
          email: b.email,
          fullName: b.full_name || '',
          nationalId: b.national_id,
          reason: b.reason || 'مخالفة اللائحة التنظيمية',
          bannedAt: b.banned_at || new Date().toISOString(),
          bannedBy: b.banned_by || 'القيادة العليا'
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
      const { error } = await supabase.from('members').upsert({
        id: member.id,
        volunteer_id: member.volunteerId,
        full_name: member.fullName,
        email: member.universityEmail,
        college: member.college,
        academic_year: member.academicYear,
        phone: member.phone || member.whatsappNumber,
        whatsapp_number: member.whatsappNumber || member.phone,
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
        certified_skills: member.certifiedSkills || [],
        blood_type: member.bloodType || 'O+',
        emergency_contact: member.emergencyContact || '',
        address: member.address || '',
        ban_reason: member.banReason,
        banned_at: member.bannedAt,
        banned_by: member.bannedBy,
        rejection_reason: member.rejectionReason,
        registration_date: member.registrationDate,
        facebook_url: member.facebookUrl,
        tiktok_url: member.tiktokUrl,
        instagram_url: member.instagramUrl,
        linkedin_url: member.linkedinUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) {
        console.error('upsertMember Supabase error:', error);
      }
    } catch (e) {
      console.error('upsertMember failed:', e);
    }
  }

  static async deleteMember(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) console.error('deleteMember error:', error);
    } catch (e) {
      console.error('deleteMember failed:', e);
    }
  }

  static async upsertCommittee(committee: Committee) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('committees').upsert({
        id: committee.id,
        name: committee.name,
        code: committee.code,
        description: committee.description,
        responsibilities: committee.responsibilities,
        head_id: committee.headId,
        head_name: committee.headName,
        vice_id: committee.viceId,
        vice_name: committee.viceName,
        member_count: committee.memberCount,
        active_tasks_count: committee.activeTasksCount,
        completed_tasks_count: committee.completedTasksCount,
        attendance_rate: committee.attendanceRate,
        performance_score: committee.performanceScore,
        health_score: committee.healthScore,
        season_id: committee.seasonId,
        color: committee.color,
        icon: committee.icon,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) console.error('upsertCommittee error:', error);
    } catch (e) {
      console.error('upsertCommittee failed:', e);
    }
  }

  static async deleteCommittee(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('committees').delete().eq('id', id);
      if (error) console.error('deleteCommittee error:', error);
    } catch (e) {
      console.error('deleteCommittee failed:', e);
    }
  }

  static async upsertSeason(season: Season) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('seasons').upsert({
        id: season.id,
        name: season.name,
        is_current: season.isCurrent,
        start_date: season.startDate,
        end_date: season.endDate,
        total_members: season.totalMembers,
        total_events: season.totalEvents,
        total_tasks: season.totalTasks,
        archived: season.archived
      }, { onConflict: 'id' });
      if (error) console.error('upsertSeason error:', error);
    } catch (e) {
      console.error('upsertSeason failed:', e);
    }
  }

  /**
   * Bulk push all local application state to Supabase Cloud
   */
  static async saveAllDataToCloud(data: {
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
    bannedUsers?: BannedUserRecord[];
  }): Promise<{ success: boolean; message: string; error?: any }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      // 1. Seasons
      if (data.seasons && data.seasons.length > 0) {
        for (const s of data.seasons) {
          await this.upsertSeason(s);
        }
      }

      // 2. Committees
      if (data.committees && data.committees.length > 0) {
        for (const c of data.committees) {
          await this.upsertCommittee(c);
        }
      }

      // 3. Members
      if (data.members && data.members.length > 0) {
        for (const m of data.members) {
          await this.upsertMember(m);
        }
      }

      // 4. Tasks
      if (data.tasks && data.tasks.length > 0) {
        for (const t of data.tasks) {
          await this.upsertTask(t);
        }
      }

      // 5. Events
      if (data.events && data.events.length > 0) {
        for (const ev of data.events) {
          await this.upsertEvent(ev);
        }
      }

      // 6. Attendance Sessions & Records
      if (data.attendanceSessions && data.attendanceSessions.length > 0) {
        for (const s of data.attendanceSessions) {
          await this.upsertAttendanceSession(s);
        }
      }
      if (data.attendanceRecords && data.attendanceRecords.length > 0) {
        for (const r of data.attendanceRecords) {
          await this.insertAttendanceRecord(r);
        }
      }

      // 7. Evaluations
      if (data.memberEvaluations && data.memberEvaluations.length > 0) {
        for (const me of data.memberEvaluations) {
          await this.upsertMemberEvaluation(me);
        }
      }
      if (data.headEvaluations && data.headEvaluations.length > 0) {
        for (const he of data.headEvaluations) {
          await this.upsertHeadEvaluation(he);
        }
      }

      // 8. Complaints
      if (data.complaints && data.complaints.length > 0) {
        for (const comp of data.complaints) {
          await this.upsertComplaint(comp);
        }
      }

      // 9. Documents & Announcements
      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          await this.upsertDocument(doc);
        }
      }
      if (data.announcements && data.announcements.length > 0) {
        for (const ann of data.announcements) {
          await this.upsertAnnouncement(ann);
        }
      }

      // 10. Banned users
      if (data.bannedUsers && data.bannedUsers.length > 0) {
        for (const b of data.bannedUsers) {
          await this.upsertBannedUser(b);
        }
      }

      return { success: true, message: 'تم حفظ ورفع كافة البيانات إلى السحابة بنجاح ☁️' };
    } catch (err: any) {
      console.error('saveAllDataToCloud error:', err);
      return { success: false, message: 'حدث خطأ أثناء الرفع إلى السحابة', error: err };
    }
  }

  static async upsertTask(task: Task) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('tasks').upsert({
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
        max_points: task.maxPoints || task.xpReward || 30,
        xp_reward: task.xpReward || task.maxPoints || 30,
        subtasks: task.subtasks,
        voice_note_url: task.voiceNoteUrl,
        voice_duration: task.voiceDuration,
        stance: task.stance,
        excuse_reason: task.excuseReason,
        excused_at: task.excusedAt,
        excused_by_id: task.excusedByMemberId,
        excused_by_name: task.excusedByMemberName,
        awarded_points: task.awardedPoints,
        graded_by: task.gradedBy,
        graded_by_name: task.gradedByName,
        graded_at: task.gradedAt,
        feedback: task.feedback,
        created_at: task.createdAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) console.error('upsertTask Supabase error:', error);
    } catch (e) {
      console.error('upsertTask failed:', e);
    }
  }

  static async deleteTask(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) console.error('deleteTask error:', error);
    } catch (e) {
      console.error('deleteTask failed:', e);
    }
  }

  static async upsertEvent(event: EventEntity) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('events').upsert({
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
        target_audience: event.targetAudience || 'all',
        selected_committee_ids: event.selectedCommitteeIds || [],
        rsvps: event.rsvps || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) console.error('upsertEvent Supabase error:', error);
    } catch (e) {
      console.error('upsertEvent failed:', e);
    }
  }

  static async deleteEvent(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) console.error('deleteEvent error:', error);
    } catch (e) {
      console.error('deleteEvent failed:', e);
    }
  }

  static async upsertAttendanceSession(session: AttendanceSession) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('attendance_sessions').upsert({
        id: session.id,
        title: session.title,
        committee_id: session.committeeId,
        committee_name: session.committeeName,
        created_by_id: session.createdByMemberId,
        created_by_name: session.createdByMemberName,
        created_by_role: session.createdByRole,
        require_gps: session.requireGPS,
        session_type: session.sessionType || 'members',
        event_id: session.eventId,
        event_name: session.eventName,
        event_date: session.eventDate,
        qr_token: session.qrToken,
        is_active: session.isActive,
        notes: session.notes,
        created_at: session.createdAt
      }, { onConflict: 'id' });
      if (error) console.error('upsertAttendanceSession error:', error);
    } catch (e) {
      console.error('upsertAttendanceSession failed:', e);
    }
  }

  static async deleteAttendanceSession(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('attendance_sessions').delete().eq('id', id);
      if (error) console.error('deleteAttendanceSession error:', error);
    } catch (e) {
      console.error('deleteAttendanceSession failed:', e);
    }
  }

  static async insertAttendanceRecord(record: AttendanceRecord) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('attendance_records').upsert({
        id: record.id,
        member_id: record.memberId,
        member_name: record.memberName,
        member_avatar: record.memberAvatar,
        member_volunteer_id: record.memberVolunteerId,
        committee_id: record.committeeId,
        committee_name: record.committeeName,
        event_id: record.eventId,
        event_name: record.eventName,
        session_id: record.sessionId,
        session_title: record.sessionTitle,
        date: record.date,
        check_in_time: record.checkInTime,
        check_out_time: record.checkOutTime,
        duration_minutes: record.durationMinutes,
        duration_formatted: record.durationFormatted,
        status: record.status,
        qr_hash_token: record.qrHashToken,
        gps_location: record.gpsLocation,
        daily_evaluation: record.dailyEvaluation
      }, { onConflict: 'id' });
      if (error) console.error('insertAttendanceRecord error:', error);
    } catch (e) {
      console.error('insertAttendanceRecord failed:', e);
    }
  }

  static async deleteAttendanceRecord(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('attendance_records').delete().eq('id', id);
      if (error) console.error('deleteAttendanceRecord error:', error);
    } catch (e) {
      console.error('deleteAttendanceRecord failed:', e);
    }
  }

  static async upsertMemberEvaluation(ev: MemberEvaluationRecord) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('member_evaluations').upsert({
        id: ev.id,
        member_id: ev.memberId,
        member_name: ev.memberName,
        member_volunteer_id: ev.memberVolunteerId,
        committee_name: ev.committeeName,
        evaluator_id: ev.evaluatorId,
        evaluator_name: ev.evaluatorName,
        evaluator_role: ev.evaluatorRole,
        scores: ev.scores,
        total_score: ev.totalScore,
        max_total_score: ev.maxTotalScore,
        percentage: ev.percentage,
        feedback: ev.feedback,
        evaluated_at: ev.evaluatedAt
      }, { onConflict: 'id' });
      if (error) console.error('upsertMemberEvaluation error:', error);
    } catch (e) {
      console.error('upsertMemberEvaluation failed:', e);
    }
  }

  static async deleteMemberEvaluation(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('member_evaluations').delete().eq('id', id);
      if (error) console.error('deleteMemberEvaluation error:', error);
    } catch (e) {
      console.error('deleteMemberEvaluation failed:', e);
    }
  }

  static async upsertHeadEvaluation(he: HeadEvaluationRecord) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('head_evaluations').upsert({
        id: he.id,
        head_id: he.headId,
        head_name: he.headName,
        head_volunteer_id: he.headVolunteerId,
        head_position: he.headPosition,
        committee_name: he.committeeName,
        evaluator_id: he.evaluatorId,
        evaluator_name: he.evaluatorName,
        evaluator_role: he.evaluatorRole,
        scores: he.scores,
        total_score: he.totalScore,
        max_total_score: he.maxTotalScore,
        percentage: he.percentage,
        leadership_rating: he.leadershipRating,
        feedback: he.feedback,
        action_items: he.actionItems,
        evaluated_at: he.evaluatedAt
      }, { onConflict: 'id' });
      if (error) console.error('upsertHeadEvaluation error:', error);
    } catch (e) {
      console.error('upsertHeadEvaluation failed:', e);
    }
  }

  static async deleteHeadEvaluation(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('head_evaluations').delete().eq('id', id);
      if (error) console.error('deleteHeadEvaluation error:', error);
    } catch (e) {
      console.error('deleteHeadEvaluation failed:', e);
    }
  }

  static async upsertComplaint(c: Complaint) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('complaints').upsert({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        sender_id: c.senderId,
        sender_name: c.senderName,
        sender_avatar: c.senderAvatar,
        sender_committee_id: c.senderCommitteeId,
        sender_committee_name: c.senderCommitteeName,
        sender_role: c.senderRole,
        is_anonymous: c.isAnonymous,
        status: c.status,
        target_recipients: c.targetRecipients,
        response_notes: c.responseNotes,
        internal_notes: c.internalNotes,
        responded_by: c.respondedBy,
        responded_at: c.respondedAt,
        resolved_at: c.resolvedAt,
        satisfaction_rating: c.satisfactionRating,
        created_at: c.createdAt
      }, { onConflict: 'id' });
      if (error) console.error('upsertComplaint error:', error);
    } catch (e) {
      console.error('upsertComplaint failed:', e);
    }
  }

  static async deleteComplaint(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('complaints').delete().eq('id', id);
      if (error) console.error('deleteComplaint error:', error);
    } catch (e) {
      console.error('deleteComplaint failed:', e);
    }
  }

  static async upsertAnnouncement(a: Announcement) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('announcements').upsert({
        id: a.id,
        title: a.title,
        content: a.content,
        author_name: a.authorName,
        author_role: a.authorRole,
        target_type: a.targetType,
        target_committee_id: a.targetCommitteeId,
        target_committee_name: a.targetCommitteeName,
        is_pinned: a.isPinned,
        poll: a.poll,
        reactions: a.reactions || [],
        created_at: a.createdAt
      }, { onConflict: 'id' });
      if (error) console.error('upsertAnnouncement error:', error);
    } catch (e) {
      console.error('upsertAnnouncement failed:', e);
    }
  }

  static async deleteAnnouncement(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) console.error('deleteAnnouncement error:', error);
    } catch (e) {
      console.error('deleteAnnouncement failed:', e);
    }
  }

  static async insertAuditLog(log: AuditLogItem) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('audit_logs').insert({
        id: log.id,
        user_id: log.userId,
        user_name: log.userName,
        user_role: log.userRole,
        action: log.action,
        target_entity: log.targetEntity,
        details: log.details,
        previous_value: log.previousValue,
        new_value: log.newValue,
        timestamp: log.timestamp || new Date().toISOString()
      });
      if (error) console.error('insertAuditLog error:', error);
    } catch (e) {
      console.error('insertAuditLog failed:', e);
    }
  }

  static async upsertNotification(n: SystemNotification) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('system_notifications').upsert({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        target_name: n.targetName,
        required_action: n.requiredAction,
        badge_text: n.badgeText,
        target_committee_id: n.targetCommitteeId,
        target_member_ids: n.targetMemberIds || [],
        sender_name: n.senderName,
        read: n.read,
        link_tab: n.linkTab,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) console.error('upsertNotification error:', error);
    } catch (e) {
      console.error('upsertNotification failed:', e);
    }
  }

  static async deleteNotification(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('system_notifications').delete().eq('id', id);
      if (error) console.error('deleteNotification error:', error);
    } catch (e) {
      console.error('deleteNotification failed:', e);
    }
  }

  static async clearAllNotifications() {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('system_notifications').delete().neq('id', 'keep_empty');
      if (error) console.error('clearAllNotifications error:', error);
    } catch (e) {
      console.error('clearAllNotifications failed:', e);
    }
  }

  static async saveAppSetting(key: string, value: any) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('app_settings').upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
      if (error) console.error(`saveAppSetting [${key}] error:`, error);
    } catch (e) {
      console.error(`saveAppSetting [${key}] failed:`, e);
    }
  }

  static async loadAppSetting(key: string): Promise<any | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const { data, error } = await supabase.from('app_settings').select('value').eq('key', key).single();
      if (error || !data) return null;
      return data.value;
    } catch (e) {
      return null;
    }
  }

  static async upsertBannedUser(banned: BannedUserRecord) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('banned_users').upsert({
        id: banned.id,
        email: banned.email,
        full_name: banned.fullName,
        national_id: banned.nationalId,
        reason: banned.reason,
        banned_at: banned.bannedAt,
        banned_by: banned.bannedBy
      }, { onConflict: 'id' });
      if (error) console.error('upsertBannedUser error:', error);
    } catch (e) {
      console.error('upsertBannedUser failed:', e);
    }
  }

  static async deleteBannedUser(emailOrId: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('banned_users').delete().or(`id.eq.${emailOrId},email.eq.${emailOrId}`);
      if (error) console.error('deleteBannedUser error:', error);
    } catch (e) {
      console.error('deleteBannedUser failed:', e);
    }
  }

  static async upsertDocument(doc: DocumentItem) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('documents').upsert({
        id: doc.id,
        title: doc.title,
        committee_id: doc.committeeId,
        committee_name: doc.committeeName,
        category: doc.category,
        uploaded_by: doc.uploadedBy,
        uploaded_at: doc.uploadedAt,
        file_size: doc.fileSize,
        file_type: doc.fileType,
        file_name: doc.fileName,
        description: doc.description,
        file_url: doc.fileUrl
      }, { onConflict: 'id' });
      if (error) console.error('upsertDocument error:', error);
    } catch (e) {
      console.error('upsertDocument failed:', e);
    }
  }

  static async deleteDocument(id: string) {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) console.error('deleteDocument error:', error);
    } catch (e) {
      console.error('deleteDocument failed:', e);
    }
  }

  /**
   * Subscribe to all postgres_changes in real time
   */
  static subscribeToAllChanges(onDataChange: (table: string, eventType: string, newRow: any, oldRow: any) => void) {
    if (!isSupabaseConfigured() || !supabase) return null;

    try {
      const channel = supabase.channel('realtime_all_tables')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            onDataChange(payload.table, payload.eventType, payload.new, payload.old);
          }
        )
        .subscribe();

      return channel;
    } catch (err) {
      console.error('Supabase Realtime subscription error:', err);
      return null;
    }
  }
}
