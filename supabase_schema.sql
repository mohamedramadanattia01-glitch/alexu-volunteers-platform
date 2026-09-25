-- ==============================================================================
-- اتحاد طلاب جامعة الإسكندرية • منصة إدارة العمليات وفريق المتطوعين
-- SUPABASE DATABASE SCHEMA (PRODUCTION VERSION)
-- Run this complete SQL script in your Supabase SQL Editor (1-Click Setup)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SEASONS TABLE
CREATE TABLE IF NOT EXISTS public.seasons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_current BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    total_members INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMITTEES TABLE
CREATE TABLE IF NOT EXISTS public.committees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    head_id TEXT,
    head_name TEXT,
    vice_id TEXT,
    vice_name TEXT,
    member_count INTEGER DEFAULT 0,
    active_tasks_count INTEGER DEFAULT 0,
    completed_tasks_count INTEGER DEFAULT 0,
    attendance_rate NUMERIC DEFAULT 100,
    performance_score NUMERIC DEFAULT 100,
    health_score NUMERIC DEFAULT 100,
    season_id TEXT REFERENCES public.seasons(id) ON DELETE SET NULL,
    color TEXT DEFAULT '#2563eb',
    icon TEXT DEFAULT 'Layers',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    volunteer_id TEXT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    college TEXT,
    academic_year TEXT,
    whatsapp_number TEXT,
    birth_date DATE,
    age INTEGER,
    national_id TEXT,
    current_committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    current_committee_name TEXT,
    preferred_committee_id TEXT,
    preferred_committee_name TEXT,
    position TEXT,
    role TEXT NOT NULL DEFAULT 'member', -- 'advisor', 'super_admin', 'vice_president', 'general_coordinator', 'operations_manager', 'quality_officer', 'head', 'vice_head', 'hr_admin', 'event_manager', 'member'
    join_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Pending', -- 'Active', 'Pending', 'Inactive', 'Archived', 'Rejected'
    avatar_url TEXT,
    password TEXT DEFAULT '123456',
    performance JSONB DEFAULT '{
        "overallScore": 90,
        "attendanceRate": 100,
        "taskCompletionRate": 90,
        "taskQuality": 4.5,
        "commitment": 90,
        "teamwork": 90,
        "leadership": 85,
        "evaluationsCount": 0
    }'::jsonb,
    skills JSONB DEFAULT '{}'::jsonb,
    active_workload INTEGER DEFAULT 0,
    workload_status TEXT DEFAULT 'Optimal',
    engagement_risk TEXT DEFAULT 'Low',
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges JSONB DEFAULT '[]'::jsonb,
    committee_history JSONB DEFAULT '[]'::jsonb,
    availability TEXT DEFAULT 'Available',
    bio TEXT,
    hobbies JSONB DEFAULT '[]'::jsonb,
    learning_aspirations JSONB DEFAULT '[]'::jsonb,
    facebook_url TEXT,
    tiktok_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    committee_name TEXT,
    assigned_to_ids JSONB DEFAULT '[]'::jsonb,
    assigned_to_names JSONB DEFAULT '[]'::jsonb,
    created_by_id TEXT,
    created_by_name TEXT,
    priority TEXT DEFAULT 'Medium', -- 'Critical', 'High', 'Medium', 'Low'
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'Assigned', -- 'Assigned', 'Accepted', 'In Progress', 'Submitted', 'Approved', 'Rejected', 'Overdue'
    attachments JSONB DEFAULT '[]'::jsonb,
    submission JSONB,
    evaluation JSONB,
    required_skills JSONB DEFAULT '[]'::jsonb,
    event_id TEXT,
    event_name TEXT,
    completion_percentage INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 20,
    subtasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date DATE,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    description TEXT,
    event_manager_id TEXT,
    event_manager_name TEXT,
    committee_quotas JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'Planned', -- 'Planned', 'Upcoming', 'Live', 'Completed', 'Cancelled'
    expected_members_count INTEGER DEFAULT 0,
    actual_attendance_count INTEGER DEFAULT 0,
    tasks_count INTEGER DEFAULT 0,
    sos_alerts_count INTEGER DEFAULT 0,
    season_id TEXT REFERENCES public.seasons(id) ON DELETE SET NULL,
    live_dashboard_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATTENDANCE SESSIONS & RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    committee_id TEXT DEFAULT 'all',
    committee_name TEXT DEFAULT 'جميع اللجان',
    created_by_id TEXT,
    created_by_name TEXT,
    created_by_role TEXT,
    require_gps BOOLEAN DEFAULT false,
    qr_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT,
    member_avatar TEXT,
    committee_id TEXT,
    committee_name TEXT,
    event_id TEXT,
    event_name TEXT,
    date DATE DEFAULT CURRENT_DATE,
    check_in_time TEXT,
    check_out_time TEXT,
    duration_minutes INTEGER DEFAULT 0,
    duration_formatted TEXT,
    status TEXT DEFAULT 'Present', -- 'Present', 'Late', 'Excused', 'Absent'
    qr_hash_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EVALUATIONS TABLES
CREATE TABLE IF NOT EXISTS public.member_evaluations (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_volunteer_id TEXT,
    committee_name TEXT,
    evaluator_id TEXT,
    evaluator_name TEXT,
    evaluator_role TEXT,
    scores JSONB DEFAULT '{}'::jsonb,
    total_score NUMERIC DEFAULT 0,
    max_total_score NUMERIC DEFAULT 100,
    percentage NUMERIC DEFAULT 0,
    feedback TEXT,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.head_evaluations (
    id TEXT PRIMARY KEY,
    head_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    head_name TEXT NOT NULL,
    head_volunteer_id TEXT,
    head_position TEXT,
    committee_name TEXT,
    evaluator_id TEXT,
    evaluator_name TEXT,
    evaluator_role TEXT,
    scores JSONB DEFAULT '{}'::jsonb,
    total_score NUMERIC DEFAULT 0,
    max_total_score NUMERIC DEFAULT 100,
    percentage NUMERIC DEFAULT 0,
    leadership_rating NUMERIC DEFAULT 5,
    feedback TEXT,
    action_items TEXT,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMPLAINTS & FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'workload', 'interpersonal', 'safety', 'suggestion', 'confidential', 'general'
    sender_id TEXT,
    sender_name TEXT,
    sender_avatar TEXT,
    sender_committee_id TEXT,
    sender_committee_name TEXT,
    sender_role TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'New', -- 'New', 'In Investigation', 'Resolved', 'Dismissed'
    target_recipients JSONB DEFAULT '["head", "hr", "super_admin"]'::jsonb,
    response_notes TEXT,
    internal_notes TEXT,
    responded_by TEXT,
    responded_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    satisfaction_rating NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DOCUMENTS & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    committee_id TEXT,
    committee_name TEXT,
    category TEXT DEFAULT 'General',
    uploaded_by TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    file_size TEXT,
    file_type TEXT,
    file_name TEXT,
    description TEXT,
    file_url TEXT
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT,
    author_role TEXT,
    target_type TEXT DEFAULT 'all',
    target_committee_id TEXT,
    target_committee_name TEXT,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    target_entity TEXT,
    details TEXT,
    previous_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'announcement', -- 'sos', 'announcement', 'task', 'eval', 'achievement', 'complaint'
    read BOOLEAN DEFAULT false,
    link_tab TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. APP SETTINGS & BRANDING
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- STORAGE BUCKETS CONFIGURATION (Public Read Access)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Insert Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Public Update Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Public Read Documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Public Insert Documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Public Update Documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents');

CREATE POLICY "Public Read Attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Public Insert Attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "Public Update Attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'attachments');

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.head_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow full read/write for all application operations (Anon + Authenticated)
CREATE POLICY "Enable read for all users" ON public.members FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.members FOR DELETE USING (true);

CREATE POLICY "Enable all for committees" ON public.committees FOR ALL USING (true);
CREATE POLICY "Enable all for seasons" ON public.seasons FOR ALL USING (true);
CREATE POLICY "Enable all for tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Enable all for events" ON public.events FOR ALL USING (true);
CREATE POLICY "Enable all for attendance_sessions" ON public.attendance_sessions FOR ALL USING (true);
CREATE POLICY "Enable all for attendance_records" ON public.attendance_records FOR ALL USING (true);
CREATE POLICY "Enable all for member_evaluations" ON public.member_evaluations FOR ALL USING (true);
CREATE POLICY "Enable all for head_evaluations" ON public.head_evaluations FOR ALL USING (true);
CREATE POLICY "Enable all for complaints" ON public.complaints FOR ALL USING (true);
CREATE POLICY "Enable all for documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Enable all for announcements" ON public.announcements FOR ALL USING (true);
CREATE POLICY "Enable all for audit_logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Enable all for system_notifications" ON public.system_notifications FOR ALL USING (true);
CREATE POLICY "Enable all for app_settings" ON public.app_settings FOR ALL USING (true);

-- ==============================================================================
-- SEED DATA: OFFICIAL 2026/2027 INITIAL DATA (CLEAN SLATE)
-- ==============================================================================

-- 1. Season
INSERT INTO public.seasons (id, name, is_current, start_date, end_date, total_members, total_events, total_tasks, archived)
VALUES ('season-2026-2027', 'الموسم 2026/2027 (الحالي)', true, '2026-09-01', '2027-06-30', 1, 0, 0, false)
ON CONFLICT (id) DO UPDATE SET is_current = true;

-- 2. 6 Official Specialized Committees
INSERT INTO public.committees (id, name, code, description, responsibilities, member_count, active_tasks_count, completed_tasks_count, attendance_rate, performance_score, health_score, season_id, color, icon)
VALUES 
('comm-org', 'لجنة التنظيم', 'OC', 'تنظيم الحشود، الدخول والخروج، تجهيز القاعات، استقبال كبار الضيوف، وإدارة الحركة والسلامة الميدانية.', '["تنظيم الحشود وإدارة حركة الزوار والممرات","تجهيز مسارح وقاعات الفعاليات والمؤتمرات","استقبال الشخصيات الهامة والوفود الرسمية","إدارة أمن وسلامة الفعالية والتعامل مع الطوارئ"]'::jsonb, 0, 0, 0, 100, 100, 100, 'season-2026-2027', '#2563eb', 'ShieldCheck'),
('comm-hr', 'لجنة الموارد البشرية', 'HR', 'متابعة شؤون الأعضاء، الحضور والانصراف، تقييمات الأداء، خطط الاستبقاء، والتطوير القيادي والتحفيز.', '["متابعة الحضور والانصراف والالتزام الميداني بدقة","إجراء التقييمات الدورية ومتابعة مؤشرات الأداء KPIs","استقطاب وتأهيل المتطوعين الجدد (Onboarding)","حل النزاعات والشكاوى وتعزيز الروح المعنوية للفريق"]'::jsonb, 0, 0, 0, 100, 100, 100, 'season-2026-2027', '#10b981', 'UserCheck'),
('comm-montage', 'لجنة المونتاج', 'MONTAGE', 'مونتاج مقاطع الفيديو، تحرير الريلز، الموشن جرافيكس، هندسة الصوت، والأفلام التوثيقية والملخصات الختامية.', '["مونتاج الفيديوهات والريلز السريعة للفعاليات","تصميم الموشن جرافيكس والأنيميشن الترويجي","المكساج الصوتي والمؤثرات البصرية للأفلام","إنتاج الفيديوهات الختامية للأفواج والمواسم"]'::jsonb, 0, 0, 0, 100, 100, 100, 'season-2026-2027', '#ec4899', 'Film'),
('comm-media', 'لجنة التصوير الفوتوغرافي والفيديوغرافي', 'MEDIA', 'التغطية الفوتوغرافية الحية، تصوير الفيديو الميداني، التقاط وتوثيق الفعاليات الرسمية للاتحاد بجودة فائقة.', '["التغطية الفوتوغرافية الاحترافية للفعاليات والمؤتمرات","تصوير الفيديو السينمائي والمقابلات الحية","فرز ومعالجة الصور اليومية بدقة وسرعة","أرشفة وتوثيق الألبوم البصري للاتحاد"]'::jsonb, 0, 0, 0, 100, 100, 100, 'season-2026-2027', '#8b5cf6', 'Camera'),
('comm-content', 'لجنة صناعة المحتوى', 'CONTENT', 'صياغة المحتوى الإبداعي لمنشورات السوشيال ميديا، سيناريوهات الفيديوهات، البيانات الرسمية، وتوثيق التقارير.', '["كتابة كابشن وبوستات الفعاليات والأخبار الرسمية","صياغة البيانات الصحفية والخطابات والتكريمات","إعداد السيناريو والسكربت للفيديوهات والريلز","توثيق وأرشفة التقارير الأدبية والختامية للاتحاد"]'::jsonb, 0, 0, 0, 100, 100, 100, 'season-2026-2027', '#f59e0b', 'FileText'),
('comm-design', 'لجنة التصميم', 'DESIGN', 'تصميم البنرات، إعلانات السوشيال ميديا، المطبوعات، الكارنيهات، وتطوير الهوية البصرية للاتحاد.', '["تصميم بنرات ومطبوعات الفعاليات والمؤتمرات","إنتاج بوستات وإعلانات منصات التواصل الاجتماعي","تصميم الكارنيهات والشهادات والبادجات الرسمية","تطبيق دليل الهوية البصرية الصارم لجامعة الإسكندرية"]'::jsonb, 0, 0, 0, 100, 100, 100, 'season-2026-2027', '#06b6d4', 'Palette')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. Master Account: Mohamed Ramadan (Advisor / مستشار الفريق)
INSERT INTO public.members (
    id, volunteer_id, full_name, email, college, academic_year, whatsapp_number, birth_date, age, national_id,
    current_committee_id, current_committee_name, position, role, join_date, status, avatar_url, password,
    performance, skills, active_workload, workload_status, engagement_risk, points, level, badges,
    bio, availability
)
VALUES (
    'user-advisor-mohamed-ramadan',
    'AU-001',
    'محمد رمضان',
    'mohamed.ramadan50060@gmail.com',
    'جامعة الإسكندرية',
    'مستشار الفريق',
    '+201000000000',
    '1995-01-01',
    30,
    '29501010200000',
    'comm-org',
    'القيادة العليا للفريق',
    'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية',
    'advisor',
    CURRENT_DATE,
    'Active',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'admin',
    '{"overallScore": 100, "attendanceRate": 100, "taskCompletionRate": 100, "taskQuality": 5.0, "commitment": 100, "teamwork": 100, "leadership": 100, "evaluationsCount": 0}'::jsonb,
    '{"الاستشارات الاستراتيجية": 5, "إدارة وتوجيه الفرق": 5, "حوكمة العمل التطوعي": 5, "إدارة الأزمات": 5}'::jsonb,
    0,
    'Optimal',
    'Low',
    2000,
    10,
    '["badge-reliable", "badge-future-leader", "badge-event-master"]'::jsonb,
    'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية • التوجيه الاستراتيجي وحوكمة الأداء الطلابي ودعم اتخاذ القرارات والاعتماد الإداري.',
    'Available'
)
ON CONFLICT (email) DO UPDATE SET 
    role = 'advisor', 
    position = 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية',
    status = 'Active';

-- 4. Initial Welcome Notification
INSERT INTO public.system_notifications (id, title, message, type, read, link_tab)
VALUES (
    'notif-welcome',
    '👑 مرحباً بك في المنظومة الرقمية الرسمية',
    'أهلاً بك يا أستاذ محمد رمضان (مستشار الفريق). المنظومة مهيأة وجاهزة لاستقبال وتسجيل المتطوعين الجدد واعتمادهم رسمياً.',
    'announcement',
    false,
    'members'
)
ON CONFLICT (id) DO NOTHING;
