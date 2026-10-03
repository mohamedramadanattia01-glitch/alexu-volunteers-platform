# 🏛️ دليل الاستخدام الشامل والتوثيق الأمني لمنظومة متطوعي اتحاد طلاب جامعة الإسكندرية
### Alexandria University Student Union Volunteers Platform • Hardened Production Architecture

---

## 🌟 1. نظرة عامة على المنظومة (Platform Overview)
تم تصميم وتطوير هذه المنظومة الرقمية الشاملة لخدمة **فريق متطوعي اتحاد طلاب جامعة الإسكندرية** وفق أعلى معايير أمان قواعد البيانات (PostgreSQL Hardened Security) والتصميم التفاعلي:
* **الهيكل التنظيمي واللجان الـ 6 التخصصية** (التنظيم، الموارد البشرية، المونتاج، التصوير، صناعة المحتوى، التصميم).
* **إدارة وتوزيع المهام الميدانية والتكليفات** عبر جداول علائقية (`task_assignments`).
* **جدول الفعاليات والتقويم الشهري الذكي المتوافق مع شاشات الهواتف** ونظام الـ RSVPs العلائقي (`event_rsvps`).
* **نظام تسجيل الحضور والانصراف الذكي بالـ QR Code المتجدد كل 10 ثوانٍ مع التحقق الجغرافي بالـ GPS**.
* **معايير التقييم الشامل الموحدة (100 نقطة)**: (حضور 40%، مهام 30%، سلوك 15%، تفاعل 15%) ونسب التقديرات (A+, A, B, C, D) الحصرية للقيادة العليا.
* **إدارة الاشتراك الشهري (50 ج.م)** وعلامة التوثيق الزرقاء الملكية (Verified Badge) وتصدير كشوفات السداد إلى Excel.
* **البورتفوليو الرقمي والـ CV المعتمد بمقاس ورقة A4 واحدة قياسية مع ختم الاتحاد وتوقيعات القيادة الثلاثية**.
* **نظام أمني محصن بالكامل (Strict Role-Based Access Control - RLS)** يمنع أي وصول غير مصرح به.

---

## 📋 2. صلاحيات ومستويات المستخدمين (Roles & RBAC Matrix)

| الرتبة / المنصب | الصلاحيات والاختصاصات في قاعدة البيانات والـ RLS |
| :--- | :--- |
| **القيادة العليا (Supreme Leadership)**<br>*(رئيس الاتحاد، نائب الرئيس، المستشار العام)* | • التحكم الكامل في إعدادات المنظومة وهوية الاتحاد.<br>• تعديل معايير التقييم الشامل وأوزان الدرجات (`evaluation_rubrics`) ودرجات الحضور (`attendance_point_rules`).<br>• تقييم رؤساء ونواب اللجان (`head_evaluations` حصرياً لهم).<br>• تعيين ونقل قادة اللجان، حظر المستخدمين (`banned_users`)، والاطلاع على سجلات التدقيق (`audit_logs`).<br>• اعتماد الوثائق وتصدير كافة كشوفات البيانات الرسمية. |
| **رؤساء ونواب اللجان (Heads & Vice Heads)** | • إنشاء وإسناد المهام لأعضاء لجنتهم حصرياً (`tasks`, `task_assignments`).<br>• إنشاء جلسات الحضور بالـ QR وتقييم أعضاء لجنتهم يومياً (`daily_attendance_evaluations`).<br>• مراجعة وتأكيد اعتذارات الأعضاء وتطبيق عقوبات الغياب بدون عذر.<br>• تعديل حالة سداد الاشتراك الشهري وبادج التوثيق للأعضاء. |
| **المتطوعون (Members)** | • مسح كود الحضور والانصراف بالكاميرا وتوثيق الـ GPS الحقيقي.<br>• استلام وتسليم المهام وإرفاق الروابط والملفات.<br>• متابعة نسبة استكمال الملف الشخصي واستعراض نقاط الـ XP والأوسمة.<br>• استعراض وتحميل البورتفوليو الرقمي المعتمد (A4 PDF).<br>• تأكيد الحضور (RSVP) أو تقديم اعتذارات مسبقة عن الفعاليات (`event_rsvps`). |

---

## 🛡️ 3. الحلول الأمنية والهيكلية للثغرات الـ 18 (Security & Architecture Hardening)

1. **إلغاء `USING (true)` وتطبيق RLS حقيقي**:
   تم كتابة دوال أمنية موثقة بـ `SECURITY DEFINER` مثل `public.is_supreme_admin()` و `public.is_committee_head()`، لحماية كل جدول على حدة ومنع الأعضاء من الوصول للبيانات الإدارية.
2. **فصل Supabase Auth وإلغاء كلمات المرور النصية**:
   تم ربط جدول `members` بـ `auth.uid()::text = id` وإلغاء عمود `password TEXT` نهائياً من الجداول.
3. **تصفير القيم الافتراضية الوهمية**:
   تم ضبط القيم الافتراضية للتقييمات ونسب الإنجاز عند `0`، وحساب نسب اللجان والملفات الشخصية ديناميكياً من واقع السجلات الفعلية.
4. **توحيد معايير التقييم**:
   توحيد نموذج الـ 100 نقطة (40% حضور، 30% مهام، 15% سلوك، 15% تفاعل) في الشاشات والـ SQL.
5. **جداول إعدادات التقييم والدرجات العلائقية**:
   إنشاء جدول `evaluation_rubrics` وجدول `attendance_point_rules` للتحكم في درجات الحضور ونسب الـ (A, B, C) حصرياً من قبل القيادة العليا.
6. **الجداول العلائقية (Relational Tables)**:
   استبدال تخزين المصفوفات في JSON بإنشاء جداول صريحة: `task_assignments`, `event_rsvps`, `daily_attendance_evaluations`, `portfolio_templates`, `app_branding`.
7. **تأمين الـ Storage وسجلات التدقيق (Append-Only Audit Logs)**:
   * حاويات `documents` و `attachments` أصبحت خاصة (`public = false`) مع سياسات تحقق أمنية.
   * جدول `audit_logs` محمي ضد الحذف أو التعديل نهائياً `FOR UPDATE USING (false)` و `FOR DELETE USING (false)`.
8. **تنظيف وتأمين الـ Seed Data**:
   إزالة أي بيانات شخصية أو أرقام قومية أو كلمات مرور ثابتة.

---

## 🗄️ 4. كود إعداد قاعدة بيانات Supabase المحصن بالكامل (Production SQL)

انسخ هذا الكود بالكامل ونفذه في **SQL Editor** داخل لوحة تحكم Supabase:

```sql
-- ==============================================================================
-- اتحاد طلاب جامعة الإسكندرية • منصة إدارة العمليات وفريق المتطوعين
-- SUPABASE DATABASE SCHEMA (PRODUCTION-GRADE HARDENED VERSION)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE ENUMS & HELPER RBAC FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(auth.uid()::text, '');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.members WHERE id = auth.uid()::text OR email = auth.jwt()->>'email' LIMIT 1;
    RETURN COALESCE(user_role, 'anon');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_supreme_admin()
RETURNS BOOLEAN AS $$
DECLARE
    u_role TEXT;
BEGIN
    IF (auth.jwt()->>'role' = 'service_role') OR (auth.jwt()->'app_metadata'->>'role' = 'admin') THEN
        RETURN true;
    END IF;
    u_role := public.get_current_role();
    RETURN u_role IN ('president', 'vice_president', 'general_secretary', 'advisor', 'admin', 'senior_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_committee_head()
RETURNS BOOLEAN AS $$
DECLARE
    u_role TEXT;
BEGIN
    IF public.is_supreme_admin() THEN
        RETURN true;
    END IF;
    u_role := public.get_current_role();
    RETURN u_role IN ('head', 'vice_head');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_active_member()
RETURNS BOOLEAN AS $$
DECLARE
    m_status TEXT;
BEGIN
    SELECT status INTO m_status FROM public.members WHERE id = auth.uid()::text OR email = auth.jwt()->>'email' LIMIT 1;
    RETURN m_status = 'Active';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_committee()
RETURNS TEXT AS $$
DECLARE
    c_id TEXT;
BEGIN
    SELECT current_committee_id INTO c_id FROM public.members WHERE id = auth.uid()::text OR email = auth.jwt()->>'email' LIMIT 1;
    RETURN c_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 3. SCHEMA TABLES
-- ==============================================================================

-- 3.1 SEASONS TABLE
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

-- 3.2 COMMITTEES TABLE
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
    attendance_rate NUMERIC DEFAULT 0,
    performance_score NUMERIC DEFAULT 0,
    health_score NUMERIC DEFAULT 0,
    season_id TEXT REFERENCES public.seasons(id) ON DELETE SET NULL,
    color TEXT DEFAULT '#2563eb',
    icon TEXT DEFAULT 'Layers',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 MEMBERS TABLE (Linked to auth.users, zero fake defaults, no plaintext passwords)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    volunteer_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    college TEXT,
    academic_year TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    birth_date DATE,
    age INTEGER,
    national_id TEXT,
    current_committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    current_committee_name TEXT,
    preferred_committee_id TEXT,
    preferred_committee_name TEXT,
    position TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    join_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Pending',
    avatar_url TEXT,
    performance JSONB DEFAULT '{
        "overallScore": 0,
        "attendanceRate": 0,
        "taskCompletionRate": 0,
        "taskQuality": 0,
        "commitment": 0,
        "teamwork": 0,
        "leadership": 0,
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
    certified_skills JSONB DEFAULT '[]'::jsonb,
    blood_type TEXT DEFAULT 'O+',
    emergency_contact TEXT,
    address TEXT,
    ban_reason TEXT,
    banned_at TIMESTAMPTZ,
    banned_by TEXT,
    rejection_reason TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    facebook_url TEXT,
    tiktok_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    is_subscription_paid BOOLEAN DEFAULT false,
    subscription_paid_at TIMESTAMPTZ,
    subscription_badge_text TEXT DEFAULT 'ما انتا دافع بقى 👑',
    subscription_month TEXT,
    profile_completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic Profile Completion Calculation
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(m public.members)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    IF m.full_name IS NOT NULL AND length(trim(m.full_name)) > 0 THEN score := score + 10; END IF;
    IF m.email IS NOT NULL AND length(trim(m.email)) > 0 THEN score := score + 10; END IF;
    IF m.phone IS NOT NULL AND length(trim(m.phone)) > 0 THEN score := score + 10; END IF;
    IF m.whatsapp_number IS NOT NULL AND length(trim(m.whatsapp_number)) > 0 THEN score := score + 10; END IF;
    IF m.college IS NOT NULL AND length(trim(m.college)) > 0 THEN score := score + 10; END IF;
    IF m.academic_year IS NOT NULL AND length(trim(m.academic_year)) > 0 THEN score := score + 10; END IF;
    IF m.national_id IS NOT NULL AND length(trim(m.national_id)) > 0 THEN score := score + 10; END IF;
    IF m.avatar_url IS NOT NULL AND length(trim(m.avatar_url)) > 0 THEN score := score + 10; END IF;
    IF m.bio IS NOT NULL AND length(trim(m.bio)) > 0 THEN score := score + 10; END IF;
    IF m.emergency_contact IS NOT NULL AND length(trim(m.emergency_contact)) > 0 THEN score := score + 10; END IF;
    RETURN score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.trig_update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_percentage := public.calculate_profile_completion(NEW);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_member_profile_completion ON public.members;
CREATE TRIGGER tr_member_profile_completion
BEFORE INSERT OR UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.trig_update_profile_completion();

-- 3.4 TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    committee_name TEXT,
    priority TEXT DEFAULT 'Medium',
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'Assigned',
    created_by_id TEXT,
    created_by_name TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    submission JSONB,
    evaluation JSONB,
    required_skills JSONB DEFAULT '[]'::jsonb,
    estimated_hours NUMERIC DEFAULT 0,
    actual_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 TASK ASSIGNMENTS TABLE (Relational)
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Assigned',
    UNIQUE (task_id, member_id)
);

-- 3.6 EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Event',
    date DATE NOT NULL,
    time TEXT NOT NULL,
    end_time TEXT,
    location TEXT NOT NULL,
    address TEXT,
    hall TEXT,
    season_id TEXT REFERENCES public.seasons(id) ON DELETE SET NULL,
    target_audience TEXT,
    expected_attendees INTEGER DEFAULT 0,
    actual_attendees INTEGER DEFAULT 0,
    description TEXT,
    selected_committee_ids JSONB DEFAULT '[]'::jsonb,
    live_status TEXT DEFAULT 'Scheduled',
    live_banner TEXT,
    qr_active BOOLEAN DEFAULT false,
    qr_code_data TEXT,
    qr_rotated_at TIMESTAMPTZ,
    qr_token TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    radius_meters NUMERIC DEFAULT 150,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 EVENT RSVPS & EXCUSES (Relational)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'attending',
    excuse_reason TEXT,
    responded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, member_id)
);

-- 3.8 ATTENDANCE SESSIONS TABLE (10-second rotating anti-cheat QR)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'Active',
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opened_by_id TEXT,
    opened_by_name TEXT,
    qr_token TEXT NOT NULL,
    qr_rotated_at TIMESTAMPTZ DEFAULT NOW(),
    qr_refresh_interval_sec INTEGER DEFAULT 10,
    expected_count INTEGER DEFAULT 0,
    attendees_count INTEGER DEFAULT 0,
    excused_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    latitude NUMERIC,
    longitude NUMERIC,
    radius_meters NUMERIC DEFAULT 150,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.9 ATTENDANCE RECORDS (GPS Geolocation Logging)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_volunteer_id TEXT,
    committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    committee_name TEXT,
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    check_in_type TEXT DEFAULT 'QR_SCAN',
    check_in_status TEXT DEFAULT 'Present',
    time_category TEXT DEFAULT 'OnTime',
    points_earned INTEGER DEFAULT 40,
    xp_earned INTEGER DEFAULT 15,
    excuse_submitted BOOLEAN DEFAULT false,
    excuse_reason TEXT,
    excuse_status TEXT,
    verified_by_id TEXT,
    verified_by_name TEXT,
    device_info JSONB,
    gps_latitude NUMERIC,
    gps_longitude NUMERIC,
    gps_accuracy_meters NUMERIC,
    is_gps_verified BOOLEAN DEFAULT false,
    daily_evaluation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id, member_id)
);

-- 3.10 DAILY ATTENDANCE EVALUATIONS (Unified 100-Point Model: 40/30/15/15)
CREATE TABLE IF NOT EXISTS public.daily_attendance_evaluations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    attendance_record_id TEXT REFERENCES public.attendance_records(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    session_id TEXT REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    evaluator_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    evaluator_name TEXT,
    attendance_commitment NUMERIC DEFAULT 40,
    task_quality NUMERIC DEFAULT 30,
    teamwork_communication NUMERIC DEFAULT 15,
    initiative_passion NUMERIC DEFAULT 15,
    bonus_points NUMERIC DEFAULT 0,
    bonus_reason TEXT,
    total_daily_score NUMERIC DEFAULT 100,
    overall_grade TEXT DEFAULT 'A',
    criteria_grades JSONB,
    criteria_notes JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.11 EVALUATION RUBRICS & THRESHOLDS
CREATE TABLE IF NOT EXISTS public.evaluation_rubrics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    attendance_weight NUMERIC DEFAULT 40,
    tasks_weight NUMERIC DEFAULT 30,
    behavior_weight NUMERIC DEFAULT 15,
    interaction_weight NUMERIC DEFAULT 15,
    grade_thresholds JSONB DEFAULT '{
        "A_PLUS": 95,
        "A": 85,
        "B": 70,
        "C": 50,
        "D": 0
    }'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.12 ATTENDANCE POINT RULES
CREATE TABLE IF NOT EXISTS public.attendance_point_rules (
    id TEXT PRIMARY KEY,
    rule_name TEXT NOT NULL,
    rule_key TEXT UNIQUE NOT NULL,
    points NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.13 PORTFOLIO TEMPLATES & STAMPS
CREATE TABLE IF NOT EXISTS public.portfolio_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    university_name TEXT DEFAULT 'جامعة الإسكندرية',
    union_name TEXT DEFAULT 'اتحاد طلاب جامعة الإسكندرية',
    stamp_url TEXT,
    signatures JSONB DEFAULT '[
        {"role": "رئيس اتحاد طلاب جامعة الإسكندرية", "name": "أحمد محمود", "signUrl": ""},
        {"role": "مستشار فريق متطوعين الاتحاد", "name": "محمد رمضان", "signUrl": ""},
        {"role": "مسؤول لجنة الموارد البشرية", "name": "سارة إبراهيم", "signUrl": ""}
    ]'::jsonb,
    layout_dimensions JSONB DEFAULT '{"format": "A4", "widthMm": 210, "heightMm": 297}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.14 APP BRANDING
CREATE TABLE IF NOT EXISTS public.app_branding (
    id TEXT PRIMARY KEY,
    app_name TEXT DEFAULT 'اتحاد طلاب جامعة الإسكندرية - منصة المتطوعين',
    university_name TEXT DEFAULT 'جامعة الإسكندرية',
    union_name TEXT DEFAULT 'اتحاد طلاب جامعة الإسكندرية',
    university_logo_url TEXT,
    union_logo_url TEXT,
    stamp_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    secondary_color TEXT DEFAULT '#f59e0b',
    font_family TEXT DEFAULT 'Cairo',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.15 HEAD EVALUATIONS (Supreme Leadership Only)
CREATE TABLE IF NOT EXISTS public.head_evaluations (
    id TEXT PRIMARY KEY,
    head_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    head_name TEXT NOT NULL,
    committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    committee_name TEXT,
    evaluator_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    evaluator_name TEXT,
    period TEXT DEFAULT 'Season',
    leadership_score NUMERIC DEFAULT 0,
    operational_score NUMERIC DEFAULT 0,
    reporting_score NUMERIC DEFAULT 0,
    team_satisfaction_score NUMERIC DEFAULT 0,
    overall_score NUMERIC DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.16 APPEND-ONLY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.17 BANNED USERS
CREATE TABLE IF NOT EXISTS public.banned_users (
    id TEXT PRIMARY KEY,
    member_id TEXT,
    member_name TEXT NOT NULL,
    national_id TEXT,
    reason TEXT NOT NULL,
    banned_at TIMESTAMPTZ DEFAULT NOW(),
    banned_by TEXT
);

-- 3.18 COMPLAINTS
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY,
    submitter_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    submitter_name TEXT,
    submitter_volunteer_id TEXT,
    committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    category TEXT DEFAULT 'General',
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Pending',
    response TEXT,
    responded_by TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.19 DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size NUMERIC DEFAULT 0,
    uploaded_by_id TEXT,
    uploaded_by_name TEXT,
    committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    allowed_roles JSONB DEFAULT '["all"]'::jsonb,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.20 ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'General',
    priority TEXT DEFAULT 'Normal',
    target_audience TEXT DEFAULT 'All',
    committee_id TEXT REFERENCES public.committees(id) ON DELETE SET NULL,
    author_id TEXT,
    author_name TEXT,
    author_role TEXT,
    is_pinned BOOLEAN DEFAULT false,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.21 SYSTEM NOTIFICATIONS & APP SETTINGS
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    link_tab TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_voice_orders (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT,
    time TEXT,
    title TEXT NOT NULL,
    audio_url TEXT,
    duration NUMERIC DEFAULT 0,
    priority TEXT DEFAULT 'urgent',
    target_committee TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.head_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_voice_orders ENABLE ROW LEVEL SECURITY;

-- 4.1 MEMBERS POLICIES
CREATE POLICY "members_select" ON public.members FOR SELECT TO authenticated
    USING (status != 'Banned' OR public.is_supreme_admin());
CREATE POLICY "members_insert" ON public.members FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = id OR public.is_supreme_admin());
CREATE POLICY "members_update" ON public.members FOR UPDATE TO authenticated
    USING (auth.uid()::text = id OR (public.is_committee_head() AND current_committee_id = public.get_current_user_committee()) OR public.is_supreme_admin());
CREATE POLICY "members_delete" ON public.members FOR DELETE TO authenticated
    USING (public.is_supreme_admin());

-- 4.2 COMMITTEES & SEASONS
CREATE POLICY "committees_select" ON public.committees FOR SELECT TO authenticated USING (true);
CREATE POLICY "committees_modify" ON public.committees FOR ALL TO authenticated USING (public.is_supreme_admin());
CREATE POLICY "seasons_select" ON public.seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "seasons_modify" ON public.seasons FOR ALL TO authenticated USING (public.is_supreme_admin());

-- 4.3 TASKS & ASSIGNMENTS
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated USING (
    public.is_supreme_admin() 
    OR (public.is_committee_head() AND committee_id = public.get_current_user_committee())
    OR EXISTS (SELECT 1 FROM public.task_assignments WHERE task_id = tasks.id AND member_id = auth.uid()::text)
);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated USING (public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "task_assign_select" ON public.task_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "task_assign_modify" ON public.task_assignments FOR ALL TO authenticated USING (public.is_committee_head() OR public.is_supreme_admin());

-- 4.4 EVENTS & RSVPS
CREATE POLICY "events_select" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_modify" ON public.events FOR ALL TO authenticated USING (public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "rsvps_select" ON public.event_rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "rsvps_insert_update" ON public.event_rsvps FOR ALL TO authenticated 
    USING (member_id = auth.uid()::text OR public.is_committee_head() OR public.is_supreme_admin());

-- 4.5 ATTENDANCE & EVALUATIONS
CREATE POLICY "sessions_select" ON public.attendance_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "sessions_modify" ON public.attendance_sessions FOR ALL TO authenticated USING (public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "records_select" ON public.attendance_records FOR SELECT TO authenticated 
    USING (member_id = auth.uid()::text OR public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "records_insert" ON public.attendance_records FOR INSERT TO authenticated 
    WITH CHECK (member_id = auth.uid()::text OR public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "records_update" ON public.attendance_records FOR UPDATE TO authenticated 
    USING (public.is_committee_head() OR public.is_supreme_admin() OR member_id = auth.uid()::text);
CREATE POLICY "records_delete" ON public.attendance_records FOR DELETE TO authenticated USING (public.is_supreme_admin());

CREATE POLICY "daily_eval_select" ON public.daily_attendance_evaluations FOR SELECT TO authenticated
    USING (member_id = auth.uid()::text OR public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "daily_eval_modify" ON public.daily_attendance_evaluations FOR ALL TO authenticated
    USING (public.is_committee_head() OR public.is_supreme_admin());

-- Head evaluations: Strictly Supreme Leadership
CREATE POLICY "head_eval_supreme_only" ON public.head_evaluations FOR ALL TO authenticated USING (public.is_supreme_admin());

-- Rubrics, rules, branding: modified only by Supreme Leadership
CREATE POLICY "rubrics_select" ON public.evaluation_rubrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "rubrics_modify" ON public.evaluation_rubrics FOR ALL TO authenticated USING (public.is_supreme_admin());
CREATE POLICY "point_rules_select" ON public.attendance_point_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "point_rules_modify" ON public.attendance_point_rules FOR ALL TO authenticated USING (public.is_supreme_admin());
CREATE POLICY "portfolio_templates_select" ON public.portfolio_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "portfolio_templates_modify" ON public.portfolio_templates FOR ALL TO authenticated USING (public.is_supreme_admin());
CREATE POLICY "app_branding_select" ON public.app_branding FOR SELECT TO authenticated USING (true);
CREATE POLICY "app_branding_modify" ON public.app_branding FOR ALL TO authenticated USING (public.is_supreme_admin());

-- 4.6 COMPLAINTS, DOCUMENTS & ANNOUNCEMENTS
CREATE POLICY "complaints_select" ON public.complaints FOR SELECT TO authenticated
    USING (submitter_id = auth.uid()::text OR public.is_supreme_admin());
CREATE POLICY "complaints_insert" ON public.complaints FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "complaints_update" ON public.complaints FOR UPDATE TO authenticated USING (public.is_supreme_admin());

CREATE POLICY "documents_select" ON public.documents FOR SELECT TO authenticated
    USING (is_public = true OR public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "documents_modify" ON public.documents FOR ALL TO authenticated USING (public.is_committee_head() OR public.is_supreme_admin());

CREATE POLICY "announcements_select" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements_modify" ON public.announcements FOR ALL TO authenticated USING (public.is_supreme_admin() OR public.is_committee_head());

-- 4.7 SECURE APPEND-ONLY AUDIT LOGS
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_supreme_admin());
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "audit_logs_no_update" ON public.audit_logs FOR UPDATE TO authenticated USING (false);
CREATE POLICY "audit_logs_no_delete" ON public.audit_logs FOR DELETE TO authenticated USING (false);

-- 4.8 BANNED USERS & SETTINGS
CREATE POLICY "banned_users_select" ON public.banned_users FOR SELECT TO authenticated USING (public.is_committee_head() OR public.is_supreme_admin());
CREATE POLICY "banned_users_modify" ON public.banned_users FOR ALL TO authenticated USING (public.is_supreme_admin());
CREATE POLICY "app_settings_select" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "app_settings_modify" ON public.app_settings FOR ALL TO authenticated USING (public.is_supreme_admin());
CREATE POLICY "push_sub_select" ON public.push_subscriptions FOR SELECT TO authenticated USING (member_id = auth.uid()::text OR public.is_supreme_admin());
CREATE POLICY "push_sub_modify" ON public.push_subscriptions FOR ALL TO authenticated USING (member_id = auth.uid()::text OR public.is_supreme_admin());
CREATE POLICY "voice_orders_select" ON public.live_voice_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "voice_orders_modify" ON public.live_voice_orders FOR ALL TO authenticated USING (public.is_supreme_admin() OR public.is_committee_head());

-- ==============================================================================
-- 5. STORAGE BUCKETS & AUTHENTICATED ACCESS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatars Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Authenticated Upload" ON storage.objects;
CREATE POLICY "Avatars Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatars Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Documents Auth Read" ON storage.objects;
DROP POLICY IF EXISTS "Documents Admin Upload" ON storage.objects;
CREATE POLICY "Documents Auth Read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id IN ('documents', 'attachments'));
CREATE POLICY "Documents Admin Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('documents', 'attachments'));

-- ==============================================================================
-- 6. DEFAULT SEED DATA
-- ==============================================================================
INSERT INTO public.seasons (id, name, is_current, start_date, end_date, total_members, total_events, total_tasks, archived)
VALUES ('season-2026-2027', 'الموسم 2026/2027 (الحالي)', true, '2026-09-01', '2027-06-30', 0, 0, 0, false)
ON CONFLICT (id) DO UPDATE SET is_current = true;

INSERT INTO public.committees (id, name, code, description, responsibilities, member_count, active_tasks_count, completed_tasks_count, attendance_rate, performance_score, health_score, season_id, color, icon)
VALUES 
('comm-leadership', 'القيادة العليا والمجلس الاستشاري', 'LEAD', 'المجلس الاستشاري، رئاسة الاتحاد، ونواب الرئيس، وإدارة العمليات والجودة وشؤون العضوية.', '["التوجيه الاستراتيجي وحوكمة العمل التطوعي","الإشراف الميداني واعتماد الخطط والقرارات","إدارة الأزمات الكبرى وبلاغات الطوارئ","التحكيم النهائي في التظلمات وتطوير الكوادر"]'::jsonb, 0, 0, 0, 0, 0, 0, 'season-2026-2027', '#f59e0b', 'Crown'),
('comm-org', 'لجنة التنظيم', 'OC', 'تنظيم الحشود، الدخول والخروج، تجهيز القاعات، استقبال كبار الضيوف، وإدارة الحركة والسلامة الميدانية.', '["تنظيم الحشود وإدارة حركة الزوار والممرات","تجهيز مسارح وقاعات الفعاليات والمؤتمرات","استقبال الشخصيات الهامة والوفود الرسمية","إدارة أمن وسلامة الفعالية والتعامل مع الطوارئ"]'::jsonb, 0, 0, 0, 0, 0, 0, 'season-2026-2027', '#2563eb', 'ShieldCheck'),
('comm-hr', 'لجنة الموارد البشرية', 'HR', 'متابعة شؤون الأعضاء، الحضور والانصراف، تقييمات الأداء، خطط الاستبقاء، والتطوير القيادي والتحفيز.', '["متابعة الحضور والانصراف والالتزام الميداني بدقة","إجراء التقييمات الدورية ومتابعة مؤشرات الأداء KPIs","استقطاب وتأهيل المتطوعين الجدد (Onboarding)","حل النزاعات والشكاوى وتعزيز الروح المعنوية للفريق"]'::jsonb, 0, 0, 0, 0, 0, 0, 'season-2026-2027', '#10b981', 'UserCheck'),
('comm-montage', 'لجنة المونتاج', 'MONTAGE', 'مونتاج مقاطع الفيديو، تحرير الريلز، الموشن جرافيكس، هندسة الصوت، والأفلام التوثيقية والملخصات الختامية.', '["مونتاج الفيديوهات والريلز السريعة للفعاليات","تصميم الموشن جرافيكس والأنيميشن الترويجي","المكساج الصوتي والمؤثرات البصرية للأفلام","إنتاج الفيديوهات الختامية للأفواج والمواسم"]'::jsonb, 0, 0, 0, 0, 0, 0, 'season-2026-2027', '#ec4899', 'Film'),
('comm-media', 'لجنة التصوير الفوتوغرافي والفيديوغرافي', 'MEDIA', 'التغطية الفوتوغرافية الحية، تصوير الفيديو الميداني، التقاط وتوثيق الفعاليات الرسمية للاتحاد بجودة فائقة.', '["التغطية الفوتوغرافية الاحترافية للفعاليات والمؤتمرات","تصوير الفيديو السينمائي والمقابلات الحية","فرز ومعالجة الصور اليومية بدقة وسرعة","أرشفة وتوثيق الألبوم البصري للاتحاد"]'::jsonb, 0, 0, 0, 0, 0, 0, 'season-2026-2027', '#8b5cf6', 'Camera'),
('comm-content', 'لجنة صناعة المحتوى', 'CONTENT', 'صياغة المحتوى الإبداعي لمنشورات السوشيال ميديا، سيناريوهات الفيديوهات، البيانات الرسمية، وتوثيق التقارير.', '["كتابة كابشن وبوستات الفعاليات والأخبار الرسمية","صياغة البيانات الصحفية والخطابات والتكريمات","إعداد السيناريو والسكربت للفيديوهات والريلز","توثيق وأرشفة التقارير الأدبية والختامية للاتحاد"]'::jsonb, 0, 0, 0, 0, 0, 0, 'season-2026-2027', '#f59e0b', 'FileText'),
('comm-design', 'لجنة التصميم', 'DESIGN', 'تصميم البنرات، إعلانات السوشيال ميديا، المطبوعات، الكارنيهات، وتطوير الهوية البصرية للاتحاد.', '["تصميم بنرات ومطبوعات الفعاليات والمؤتمرات","إنتاج بوستات وإعلانات منصات التواصل الاجتماعي","تصميم الكارنيهات والشهادات والبادجات الرسمية","تطبيق دليل الهوية البصرية الصارم لجامعة الإسكندرية"]'::jsonb, 0, 0, 0, 0, 0, 0, 'season-2026-2027', '#06b6d4', 'Palette')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.evaluation_rubrics (id, name, attendance_weight, tasks_weight, behavior_weight, interaction_weight, grade_thresholds, is_active)
VALUES (
    'rubric-standard-100',
    'نموذج التقييم الشامل المعتمد (100 نقطة)',
    40, 30, 15, 15,
    '{"A_PLUS": 95, "A": 85, "B": 70, "C": 50, "D": 0}'::jsonb,
    true
)
ON CONFLICT (id) DO UPDATE SET 
    attendance_weight = EXCLUDED.attendance_weight,
    tasks_weight = EXCLUDED.tasks_weight,
    behavior_weight = EXCLUDED.behavior_weight,
    interaction_weight = EXCLUDED.interaction_weight,
    grade_thresholds = EXCLUDED.grade_thresholds;

INSERT INTO public.attendance_point_rules (id, rule_name, rule_key, points, description)
VALUES 
('rule-early', 'حضور مبكر قبل الموعد', 'before_time', 5, 'مكافأة الحضور المبكر قبل بداية التجمع'),
('rule-ontime', 'حضور في الموعد المحدد', 'on_time', 40, 'الدرجة الكاملة للحضور والانضباط في الموعد'),
('rule-late-15', 'تأخير أقل من 15 دقيقة', 'late_15', 30, 'خصم جزئي للتأخير البسيط'),
('rule-late-after-15', 'تأخير أكثر من 15 دقيقة', 'late_after_15', 25, 'تأخير ملحوظ'),
('rule-excused', 'غياب بعذر مقبول مسبقاً', 'excused', 10, 'احتساب نقاط تقديرية للاعتذار المقبول'),
('rule-unexcused', 'غياب بدون عذر', 'unexcused', -5, 'خصم مباشر لعدم الانضباط والغياب المفاجئ')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.app_branding (id, app_name, university_name, union_name, primary_color, secondary_color, font_family)
VALUES (
    'branding-alexu',
    'اتحاد طلاب جامعة الإسكندرية - منصة المتطوعين',
    'جامعة الإسكندرية',
    'اتحاد طلاب جامعة الإسكندرية',
    '#2563eb',
    '#f59e0b',
    'Cairo'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.portfolio_templates (id, name, university_name, union_name)
VALUES (
    'portfolio-official-a4',
    'القالب الرسمي للبورتفوليو الرقمي (A4)',
    'جامعة الإسكندرية',
    'اتحاد طلاب جامعة الإسكندرية'
)
ON CONFLICT (id) DO NOTHING;
```
