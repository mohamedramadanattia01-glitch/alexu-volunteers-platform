import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, Sparkles, Send, AlertTriangle, Crown, 
  TrendingUp, Users, ShieldAlert, CheckCircle2, ChevronLeft,
  Mic, MicOff, Volume2, VolumeX, BookOpen, Lightbulb,
  HeartHandshake, BrainCircuit, Play, Copy, Check, Star,
  Download, Printer, FileText, CheckSquare, Compass,
  Flame, Target, Award, ListChecks, Radio, Zap
} from 'lucide-react';

interface InDepthModule {
  time: string;
  title: string;
  coreConcepts: string[];
  trainerTalkingPoints: string;
  alexandriaCaseExample: string;
  commonMistakes: string[];
}

interface ComprehensiveSessionPlan {
  topic: string;
  category: 'soft-skills' | 'committee-specialized';
  targetAudience: string;
  duration: string;
  level: 'تأسيسي' | 'متوسط' | 'متقدم واحترافي';
  equipmentRequired: string[];
  smartObjectives: string[];
  modules: InDepthModule[];
  simulationWorkshop: {
    name: string;
    crisisScenario: string;
    teamRoles: string[];
    executionSteps: string[];
    successCriteria: string;
  };
  trainerCrisisFaq: { question: string; idealAnswer: string }[];
  evaluationRubric: { criterion: string; weight: string; description: string }[];
  postSessionAssignment: {
    title: string;
    deadline: string;
    instructions: string;
    expectedDeliverable: string;
  };
  keyTakeaways: string[];
}

interface GeneratedAITaskPackage {
  eventGoal: string;
  tasks: {
    committeeId: string;
    committeeName: string;
    taskTitle: string;
    description: string;
    xpReward: number;
    subtasks: string[];
    evaluationCriteria: string;
  }[];
}

interface CrisisScenarioOption {
  id: string;
  text: string;
  score: number;
  critique: string;
}

interface CrisisScenario {
  id: string;
  title: string;
  location: string;
  urgency: 'حرجة جداً' | 'عالية' | 'متوسطة' | 'متوسطة إلى عالية' | string;
  context: string;
  options: CrisisScenarioOption[];
}

export const AIHubView: React.FC = () => {
  const { 
    members, committees, tasks, events, 
    getHighRiskMembers, getSuccessionCandidates, teamHealthScore,
    currentUser, canManageAll, isHead, createTask, showNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<'chat' | 'sessions' | 'task-architect' | 'crisis-sim' | 'motivation' | 'risks'>('chat');

  // Personalized honorific
  const getUserHonorific = () => {
    if (currentUser.role === 'super_admin') return `يا معالي رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية ${currentUser.fullName}`;
    if (currentUser.role === 'vice_president') return `يا نائب رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية ${currentUser.fullName}`;
    if (currentUser.role === 'advisor') return `يا مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية ${currentUser.fullName}`;
    if (currentUser.role === 'general_coordinator') return `يا منسق عام فريق المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'operations_manager') return `يا مسؤول عمليات وميدان فريق المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'quality_officer') return `يا مسؤول الجودة والتقييم المؤسسي ${currentUser.fullName}`;
    if (currentUser.role === 'hr_admin') return `يا مسؤول الموارد البشرية وشؤون المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'head') return `يا قائد وهيد ${currentUser.currentCommitteeName || 'اللجنة'} ${currentUser.fullName}`;
    if (currentUser.role === 'vice_head') return `يا نائب قائد ${currentUser.currentCommitteeName || 'اللجنة'} ${currentUser.fullName}`;
    return `يا زميلنا وبطلنا المتطوع ${currentUser.fullName}`;
  };

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string; time: string }[]>([
    {
      role: 'ai',
      text: `أهلاً ومرحباً بك ${getUserHonorific()}! 🌟\nأنا «شربيني» المساعد والمرشد الذكي والتنفيذي الشامل لفريق متطوعين اتحاد طلاب جامعة الإسكندرية.\nيمكنك التحدث معي بالصوت أو الكتابة حول:\n• صانع السشنات والورش التدريبية الموسعة للجان والميدان\n• التوليد الآلي لحزم المهام والتكليفات الذكية للفعاليات\n• محاكي الأزمات الميدانية الـ 20 واختبار القرارات التكتيكية\n• عيادة الدعم النفسي والتحفيز وخطة التعاقب القيادي 2027/2028`,
      time: 'الآن'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);

  // Comprehensive Session Generator State
  const [selectedSessionCategory, setSelectedSessionCategory] = useState<'soft-skills' | 'committee-specialized'>('soft-skills');
  const [selectedSessionTopic, setSelectedSessionTopic] = useState('القيادة التكتيكية وإدارة الأزمات الميدانية');
  const [selectedSessionAudience, setSelectedSessionAudience] = useState('جميع لجان المتطوعين الـ 6');
  const [generatedSession, setGeneratedSession] = useState<ComprehensiveSessionPlan | null>(null);
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);
  const [copiedSession, setCopiedSession] = useState(false);

  // AI Task Architect State
  const [taskArchitectGoal, setTaskArchitectGoal] = useState('تنظيم حفل استقبال الطلاب الجدد وتدشين الأنشطة الطلابية لجامعة الإسكندرية');
  const [generatedTaskPackage, setGeneratedTaskPackage] = useState<GeneratedAITaskPackage | null>(null);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  // Leadership Crisis Simulator State
  const [selectedCrisisId, setSelectedCrisisId] = useState('crisis-1');
  const [userSelectedOptionId, setUserSelectedOptionId] = useState<string | null>(null);

  // Speech recognition ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesisAvailable(true);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-EG';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('التعرف على الصوت غير مدعوم في هذا المتصفح. يرجى استخدام Google Chrome أو Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingIndex === index) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/•/g, '').replace(/#/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setCurrentlySpeakingIndex(null);
    utterance.onerror = () => setCurrentlySpeakingIndex(null);

    setCurrentlySpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const highRiskMembers = getHighRiskMembers();
  const successionCandidates = getSuccessionCandidates();

  const quickPrompts = [
    'ولد لي سشن تدريبي مكثف عن بروتوكولات إدارة الحشود وتأمين البوابات',
    'اقترح خطة توزيع مهام ذكية لفعالية Career Day لـ 2000 طالب',
    'كيف أتعامل مع انخفاض حماس متطوع بسبب ضغط الامتحانات العملية؟',
    'مين أنسب المتطوعين المؤهلين للترشح لقيادة اللجان الموسم القادم؟'
  ];

  const handleSendPrompt = (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';

      if (query.includes('حشود') || query.includes('تنظيم') || query.includes('بوابات') || query.includes('سشن')) {
        reply = `إليك يا قائدنا ملخص السشن التكتيكي لإدارة الحشود:\n\n` +
          `📌 **محاور السشن الرئيسية**:\n` +
          `1. **هندسة المداخل وممرات التدفق (Funneling Technique)**: منع التكدس بتقسيم الطوابير قبل البوابة بـ 20 متراً.\n` +
          `2. **بروتوكول اللاسلكي المشفر والتوجيه الصوتي**: الإبلاغ السريع عند وصول نسبة استيعاب القاعة إلى 80%.\n` +
          `3. **تمرين المحاكاة**: التعامل مع تدافع 150 طالباً عند فتح الأبواب بدون تصريح دخول.\n\n` +
          `💡 تم تضمين الخطة الأكاديمية الكاملة مع ورشة العمل في تبويب **"صانع السشنات والحقائب التدريبية"**!`;
      } else if (query.includes('مهام') || query.includes('فعالية') || query.includes('توزيع') || query.includes('Career')) {
        reply = `تم إعداد حزمة المهام الذكية لفعالية Career Day باللجان الـ 6:\n\n` +
          `• 🛡️ **التنظيم**: تأمين منصة المسرح والمدخل الرئيسي ومسارات كبار الزوار (40 XP).\n` +
          `• 👥 **الموارد البشرية**: تشغيل نقاط الـ QR Code وتسجيل الحضور الميداني (30 XP).\n` +
          `• 📷 **التصوير**: التغطية الفوتوغرافية وجلسات تصوير المتحدثين والرعاة (35 XP).\n` +
          `• 🎨 **التصميم**: مراجعة بنرات الشركات الراعية والشاشات الترحيبية (35 XP).\n` +
          `• 🎬 **المونتاج**: تسليم ريلز ملخص أول ساعتين من الفعالية خلال 45 دقيقة (45 XP).\n` +
          `• ✍️ **صناعة المحتوى**: تغطية لايف ستوري ونشر الاقتباسات الملهمة للضيوف (30 XP).\n\n` +
          `💡 يمكنك اعتماد وتعميم هذه المهام مباشرة من تبويب **"صانع التكليفات الذكي"**!`;
      } else if (query.includes('ضغط') || query.includes('امتحانات') || query.includes('تحفيز') || query.includes('فتور')) {
        reply = `يا قائدنا العزيز، المتطوع في كليات جامعة الإسكندرية (خاصة الكليات العملية كالطب والهندسة) يمر بمرحلة ضغط موسمي. إليك بروتوكول الاحتواء:\n\n` +
          `1. **المكالمة الداعمة الشخصية**: اتصل به بدون أي عتاب، واسأله عن جدول دراسته وتفهم ظروفه تماماً.\n` +
          `2. **التكليف المصغر (Micro-Tasking)**: أسند له مهاماً لا تتجاوز 15 دقيقة أو اسمح له بالعمل عن بعد.\n` +
          `3. **الاستراحة المجدولة المعتمدة**: منحه إجازة تطوعية معلنة لأسبوعين حتى انتهاء الميدتيرم، مع التأكيد على مكانته في الفريق.\n` +
          `4. **التقدير المعنوي**: منحه وسام "بطل التحدي الأكاديمي" على مجهوده.`;
      } else if (query.includes('صحة') || query.includes('لجان') || query.includes('Health') || query.includes('مؤشر')) {
        reply = `مؤشر صحة الفريق العام حالياً هو **${teamHealthScore}% 🟢**.\n\n` +
          `المعادلة الرياضية المعتمدة:\n` +
          `• 35% الحضور الميداني عبر الـ QR Code\n` +
          `• 35% نسبة إنجاز وتسليم المهام المعتمدة\n` +
          `• 15% متوسط التقييم الفني والأداء العام\n` +
          `• 15% معدل رضا الأعضاء وسرعة معالجة الشكاوى\n\n` +
          `كافة اللجان الـ 6 تعمل بمستوى أداء ممتاز ومنضبط.`;
      } else {
        reply = `أهلاً بك يا قائدنا! تم تحليل استفسارك بناءً على قاعدة بيانات أنشطة اتحاد طلاب جامعة الإسكندرية للموسم الحالي 2026/2027. كيف يمكنني دعم قيادتك للفريق الآن؟`;
      }

      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 600);
  };

  // Comprehensive Training Session Generator Logic
  const handleGenerateComprehensiveSession = () => {
    setIsGeneratingSession(true);
    setTimeout(() => {
      let plan: ComprehensiveSessionPlan;

      if (selectedSessionTopic.includes('حشود') || selectedSessionTopic.includes('تنظيم')) {
        plan = {
          topic: 'بروتوكولات إدارة الحشود وتأمين الفعاليات الكبرى والمدرجات',
          category: 'committee-specialized',
          targetAudience: 'لجنة التنظيم والميدان + مسؤولو الأمن والسلامة الطلابية',
          duration: '120 دقيقة تدريبية مكثفة',
          level: 'متقدم واحترافي',
          equipmentRequired: [
            'أجهزة لاسلكي (Walkie-Talkie) بترددات مخصصة',
            'مخطط طبوغرافي لمدرجات وقاعات جامعة الإسكندرية',
            'أشرطة تنظيم المسارات وأعمدة التوجيه',
            'شاشات عرض لحالات دراسية سابقة'
          ],
          smartObjectives: [
            'إتقان تقنية القمع (Funneling) لخفض سرعة تدافع الحشود بنسبة 60% عند المداخل.',
            'تطبيق شفرات الطوارئ والنداءات اللاسلكية بدقة وسرعة لا تتعدى 10 ثوانٍ.',
            'إدارة إخلاء آمن ومنظم لقاعة تسع 1500 طالب في أقل من 4 دقائق في حالات الطوارئ.',
            'تنفيذ بروتوكول استقبال وتأمين كبار الزوار (VIP) وعمداء الكليات باحترافية.'
          ],
          modules: [
            {
              time: '25 دقيقة',
              title: 'الوحدة الأولى: ديناميكا الحشود ونقاط الاختناق (Crowd Dynamics & Choke Points)',
              coreConcepts: [
                'نظرية الكثافة الحرجة (متر مربع / 4 أشخاص كحد أقصى للأمان).',
                'تحديد نقاط التكدس في مداخل مجمع الكليات الإنسانية ومجمع الشاطبي.',
                'استراتيجية التدفق أحادي الاتجاه (One-Way Traffic Flow) داخل الممرات.'
              ],
              trainerTalkingPoints: 'ركز على أن ابتسامة المتطوع وثباته الانفعالي هما خط الدفاع الأول. عندما يرى الجمهور متطوعاً واثقاً وهادئاً، تنخفض وتيرة التوتر بنسبة 70%. لا تصرخ أبداً في وجه الجمهور، بل استخدم الإشارات التوجيهية الواضحة واللغة الإيجابية الحازمة.',
              alexandriaCaseExample: 'في حفل تخرج كلية الهندسة 2025 بمدرج الاحتفالات الكبرى، تم تجنب تكدس 2500 ولي أمر عبر فتح 3 بوابات متدرجة بدلاً من بوابة واحدة، مع تقسيم المسارات حسب ألوان البادجات.',
              commonMistakes: [
                'الوقوف أمام تيار الحشد مباشرة بدلاً من التوجيه من جانبي المسار.',
                'استخدام نبرة صوت عدائية أو التلويح بالأيدي بعصبية.'
              ]
            },
            {
              time: '35 دقيقة',
              title: 'الوحدة الثانية: بروتوكول الاتصالات اللاسلكية والشفرات التكتيكية (Tactical Radio Protocols)',
              coreConcepts: [
                'قاموس النداءات السريعة: "ألفا 1 = البوابة الرئيسية"، "كود ريد = طوارئ طبية"، "كود بلو = ازدحام حرج".',
                'قاعدة الـ 3 ثوانٍ قبل التحدث لمنع تقطيع بداية الرسالة اللاسلكية.',
                'حظر الأحاديث الجانبية على القناة العامة للعمليات للحفاظ على نظافة التردد.'
              ],
              trainerTalkingPoints: 'الرسالة اللاسلكية يجب أن تجيب عن 3 أسئلة في 5 ثوانٍ فقط: (من يتحدث؟ أين المكان بالضبط؟ ما المطلوب فوراً؟). مثال: "تنظيم 2 إلى غرفة العمليات.. تكدس أمام بوابة 3.. نطلب تعزيز 4 متطوعين فوراً.. انتهى".',
              alexandriaCaseExample: 'خلال مؤتمر الشباب في كلية الطب، أدى التبليغ اللاسلكي الدقيق في غضون 8 ثوانٍ إلى وصول فريق الإسعاف الطبي لحالة إغماء دون إثارة أي هلع بين الحاضرين.',
              commonMistakes: [
                'الضغط المستمر على زر التحدث (PTT) دون إعطاء فرصة لسماع الرد.',
                'ذكر أسماء الطلاب أو تفاصيل شخصية غير لائقة عبر الأثير العام.'
              ]
            },
            {
              time: '35 دقيقة',
              title: 'الوحدة الثالثة: بروتوكول كبار الزوار (VIP Protocol) وخطة الإخلاء السريع',
              coreConcepts: [
                'مصفوفة مقاعد الصف الأول وأولويات الجلوس الرسمية لرئيس الجامعة والنواب والعمداء.',
                'مسار الخروج الآمن (Green Line) الخالي تماماً من أي عوائق طوال الفعالية.',
                'خطة الإخلاء المتدرج: إخلاء الصفوف الخلفية أولاً لفتح ممرات الخروج دون تدافع.'
              ],
              trainerTalkingPoints: 'كبار الزوار يقدرون الاحترام العالي والسرعة والانضباط. لا تطلب تصويراً شخصياً مع الضيوف أثناء أداء مهمتك، واحرص على التحية الرسمية بوقفة مستقيمة وبشاشة.',
              alexandriaCaseExample: 'تأمين موكب وزير التعليم العالي ورئيس الجامعة في افتتاح مركز الابتكار دون تعطيل حركة الطلاب داخل الحرم.',
              commonMistakes: [
                'ترك المنصة الرئيسية خالية من متطوعي التأمين في أوقات الاستراحة.',
                'إغلاق مخارج الطوارئ بأقفال حديدية أثناء الفعالية.'
              ]
            },
            {
              time: '25 دقيقة',
              title: 'الوحدة الرابعة: الخلاصة والجاهزية النفسية والذهنية للفعالية',
              coreConcepts: [
                'تغذية المتطوعين وجدول الراحات الدورية (كل 90 دقيقة عمل يتلوها 15 دقيقة راحة).',
                'فحص الزي الموحد (Official Uniform) والبادجات المضيئة قبل بدء الحدث.',
                'تسجيل الحضور والانصراف اللحظي عبر نظام V-OS لتوثيق الساعات التطوعية.'
              ],
              trainerTalkingPoints: 'أنتم واجهة جامعة الإسكندرية والاتحاد أمام المجتمع والضيوف. نجاح الفعالية يبدأ من انضباط أصغر متطوع على البوابة وينتهي برضا آخر زائر يغادر المقر.',
              alexandriaCaseExample: 'التزام 120 متطوعاً بالزي الرسمي للاتحاد في استقبال وفود الجامعات العربية خلق انطباعاً مبهراً نشرته كافة الصحف الرسمية.',
              commonMistakes: [
                'مغادرة موقع الخدمة دون استئذان الهيد أو تأمين بديل.',
                'استخدام الهاتف المحمول للألعاب أو السوشيال ميديا أثناء الوقوف على البوابات.'
              ]
            }
          ],
          simulationWorkshop: {
            name: 'تمرين "الدقائق العشر الحرجة": محاكاة أزمة تدافع وعطل كهربائي مفاجئ',
            crisisScenario: 'الساعة 10:45 ص قبل بدء المؤتمر بـ 15 دقيقة، حدث انقطاع مفاجئ للتيار الكهربائي عن البوابة الرئيسية A، وتجمع 400 طالب يرغبون في الدخول معاً، بينما بدأ بعضهم في التدافع بصوت عالٍ، ويوجد عميد كلية الهندسة في سيارته ينتظر الدخول من المسار المجاور.',
            teamRoles: [
              'فريق القيادة واللاسلكي (2 متطوعين): توجيه الأوامر والتواصل مع العمليات.',
              'فريق احتواء الجمهور (6 متطوعين): استخدام مكبرات الصوت اليدوية وتقسيم الطابور.',
              'فريق مسار الـ VIP (3 متطوعين): تأمين فتح البوابة الجانبية لسيارة العميد.',
              'فريق الفحص اليدوي السريع (4 متطوعين): استبدال فحص الـ QR بالكشوف الورقية الاحتياطية.'
            ],
            executionSteps: [
              'الدقيقة 1: إطلاق نداء "كود بلو - بوابة A" واستدعاء الدعم.',
              'الدقيقة 2-4: تشكيل جدار بشري منظم بالابتسامة لتحويل الطابور إلى مسارين متوازيين.',
              'الدقيقة 5-7: فتح المسار الجانبي لكبار الزوار دون احتكاك مع الجمهور.',
              'الدقيقة 8-10: البدء في الفحص اليدوي المزدوج واستعادة تدفق الدخول السلس.'
            ],
            successCriteria: 'استعادة الهدوء التام في أقل من 8 دقائق، دخول كبار الزوار بسلام، وعدم وقوع أي احتكاك أو إصابة.'
          },
          trainerCrisisFaq: [
            {
              question: 'ماذا أفعل إذا رفض طالب الالتزام بالطابور وحاول تجاوز البوابة بالقوة؟',
              idealAnswer: 'قف في مساره بهدوء وثبات، وافتح ذراعيك بشكل إرشادي غير عدائي، وقل بنبرة هادئة وحازمة: "يا باشمهندس احترامك للزملاء المنظمين ووقوفك في مكانك يضمن دخول الجميع بأمان، تفضل معي لتسهيل دخولك". إذا أصر، يتم إبلاغ مسؤول الأمن الجامعي فوراً دون الاشتباك معه.'
            },
            {
              question: 'ماذا لو سألني أحد الضيوف عن مكان قاعة لا أعرفها؟',
              idealAnswer: 'لا تقل "لا أعرف" مطلقاً، بل قل بابتسامة: "لحظات يا فندم وسأرشد حضرتك لأدق مسار"، ثم استفسر عبر اللاسلكي فوراً ورافقه أو وجهه للمتطوع الأقرب للقاعة.'
            },
            {
              question: 'ماذا لو شعرت بالإجهاد الشديد أو العطش أثناء الوقوف في حرارة الشمس؟',
              idealAnswer: 'أبلغ قائد مجموعتك عبر الإشارة أو اللاسلكي لطلب متطوع بديل (Rotation Relay)، ولا تغادر موقعك قبل استلام زميلك للموقع رسمياً.'
            }
          ],
          evaluationRubric: [
            { criterion: 'الفهم النظري وتطبيق تقنيات التدفق', weight: '30%', description: 'القدرة على رسم وتنفيذ مسارات الدخول ومنع التكدس.' },
            { criterion: 'سرعة الاستجابة في تمرين المحاكاة', weight: '25%', description: 'اتخاذ القرارات السليمة وضبط النفس في الأزمات.' },
            { criterion: 'دقة الاتصالات اللاسلكية والشفرات', weight: '25%', description: 'الإيجاز والوضوح في نقل البلاغات الميدانية.' },
            { criterion: 'المظهر والانضباط بالزي الموحد', weight: '20%', description: 'الوقفة الاحترافية واللباقة في التعامل مع الجمهور.' }
          ],
          postSessionAssignment: {
            title: 'إعداد مخطط أمني وتدفق لمدرج كليتك في فعالية قادمة',
            deadline: 'خلال 48 ساعة من تاريخ السشن',
            instructions: 'قم برسم مخطط مبسط لمداخل ومخارج أكبر مدرج في كليتك موضحاً عليه: موقع البوابات، نقاط فحص الـ QR، مسار الطوارئ، ومواقع تمركز 8 متطوعين.',
            expectedDeliverable: 'رفع ملف PDF أو صورة واضحة للمخطط على منصة V-OS للحصول على +35 XP.'
          },
          keyTakeaways: [
            'الابتسامة والهدوء هما السلاح الأقوى لضبط أي حشد جامعي.',
            'الاتصال اللاسلكي الواضح يحل المشكلة في 5 ثوانٍ قبل أن تتحول لأزمة.',
            'سلامة الجمهور والمتطوعين هي الأولوية المطلقة فوق أي اعتبار.',
            'التنظيم المحترف يعكس هيبة ومكانة اتحاد طلاب جامعة الإسكندرية.'
          ]
        };
      } else if (selectedSessionTopic.includes('إلقاء') || selectedSessionTopic.includes('تحدث') || selectedSessionTopic.includes('Speaking')) {
        plan = {
          topic: 'فن الإلقاء والتحدث الجماهيري والخطابة المؤثرة (Public Speaking & Stage Presence)',
          category: 'soft-skills',
          targetAudience: 'قادة اللجان، المتحدثون الرسميون، ومقدمو الفعاليات (MCs)',
          duration: '100 دقيقة تفاعلية',
          level: 'متقدم واحترافي',
          equipmentRequired: [
            'ميكروفون لاسلكي احترافي (Handheld & Lavalier)',
            'منصة إلقاء (Podium)',
            'كاميرا تصوير لمراجعة لغة الجسد فيديو للمتدربين',
            'مؤقت تنازلي رقمي'
          ],
          smartObjectives: [
            'التغلب على رهبة المسرح وخفض نبضات التوتر في أول 60 ثانية باستخدام تمارين التنفس الحجابي.',
            'إتقان صياغة المقدمة الخاطفة (Hook) في 15 ثانية لجذب انتباه 1000 مستمع.',
            'توظيف التنوع الصوتي (Vocal Variety) وتغيير النبرة والوقفات الدرامية المؤثرة.',
            'إدارة لغة الجسد وحركة الأيدي ونظرات العين التوزيعية (Eye Contact) عبر 3 زوايا للقاعة.'
          ],
          modules: [
            {
              time: '20 دقيقة',
              title: 'الوحدة الأولى: كسر الرهبة والتحضير الذهني والجسدي (Stage Fright Mastery)',
              coreConcepts: [
                'فسيولوجيا الخوف من المسرح وإفراز الأدرينالين وكيفية تحويله لطاقة إيجابية حماسية.',
                'تمرين التنفس المربع 4-4-4-4 لتهدئة الجهاز العصبي قبل الصعود على المنصة.',
                'إحماء الصوت ومخارج الحروف والتدريب على نطق الكلمات الصعبة.'
              ],
              trainerTalkingPoints: 'تذكر أن الجمهور في صفك ويريد أن يراك تنجح! الخوف شعور طبيعي يمر به كبار الخطباء، والفارق الوحيد هو أن القائد المحترف يروض الخوف ليجعله تركيزاً حاداً وحضوراً مبهراً.',
              alexandriaCaseExample: 'أحد متطوعي الاتحاد في مؤتمر التوظيف تغلب على توتره أمام رئيس الجامعة عبر الوقوف ثابتاً لـ 3 ثوانٍ وابتسامة عميقة قبل نطق الكلمة الأولى، مما خطف إعجاب الحضور فوراً.',
              commonMistakes: [
                'البدء بالاعتذار للجمهور مثل "أنا آسف مش محضر كويس أو متوتر".',
                'الإمساك بالورقة بيدين ترتجفان بدلاً من تثبيتها على المنصة أو الاعتماد على بطاقات الملاحظات (Flashcards).'
              ]
            },
            {
              time: '30 دقيقة',
              title: 'الوحدة الثانية: هندسة الخطاب المؤثر وهيكل الـ 3 أجزاء (Speech Architecture)',
              coreConcepts: [
                'الخطاف الذهبي (The Hook): قصة قصيرة، إحصائية صادمة، أو سؤال تفاعلي يرفع أيدي الحضور.',
                'المتن المتماسك (The 3 Pillars): عدم تشتيت المستمع في أكثر من 3 أفكار رئيسية.',
                'الخاتمة الملهمة والدعوة للفعل (Call to Action): العبارة التي سيتذكرها الحاضرون بعد أسبوع.'
              ],
              trainerTalkingPoints: 'لا تسرد معلومات جافة، بل اروِ قصصاً ومواقف إنسانية حية. الأرقام تقنع العقل، لكن المشاعر والقصص هي التي تحرك القلوب وتصنع التأثير الدائم.',
              alexandriaCaseExample: 'كلمة افتتاح معسكر إعداد القادة بدأت بإحصائية عن إنجازات متطوعي جامعة الإسكندرية في 10 سنوات، مما رفع الحماس والهتاف بالقاعة في أول دقيقة.',
              commonMistakes: [
                'الاستطراد في مقدمات طويلة وتقليدية مكررة تفقد الجمهور شغفه.',
                'إنهاء الكلمة ببرود مثل "وده كان كل اللي عندي وشكراً".'
              ]
            },
            {
              time: '30 دقيقة',
              title: 'الوحدة الثالثة: لغة الجسد، الاتصال البصري، وهندسة الصوت (Vocal & Body Presence)',
              coreConcepts: [
                'قاعدة الـ 3 ثوانٍ في النظرات: تقسيم القاعة إلى يمين، وسط، ويسار، والنظر لشخص محدد في كل قطاع.',
                'حركة المسرح الهادفة (The Floor Triangle): عدم التسمر في مكان واحد مع تجنب التململ العشوائي.',
                'فن الصمت والوقفة المؤثرة (The Power of the Pause) قبل النقطة الهامة لإثارة الفضول.'
              ],
              trainerTalkingPoints: 'صوتك هو أداة موسيقية، إذا حافظت على نفس النغمة والوتيرة (Monotone) سينام الجمهور في 5 دقائق. ارفع نبرتك عند الحماس، واخفضها عند التركيز على معلومة حساسة، واستخدم الصمت لتجعل الكلمات تستقر في عقولهم.',
              alexandriaCaseExample: 'استخدام أحد مقدمي الفعاليات لوقفة صمت مدتها ثانيتان قبل إعلان اسم الفائز بدرع التميز، حبس أنفاس 800 طالب وجعل اللحظة لا تُنسى.',
              commonMistakes: [
                'وضع اليدين في الجيوب أو تشبيك الذراعين على الصدر (وضعية دفاعية).',
                'التحدث بسرعة مفرطة لإنهاء الخطاب سريعاً.'
              ]
            },
            {
              time: '20 دقيقة',
              title: 'الوحدة الرابعة: التعامل مع المقاطعات والأعطال الفنية بذكاء',
              coreConcepts: [
                'ماذا تفعل عند انقطاع صوت الميكروفون؟ الاستمرار بصوت قوي واستدعاء الفني بالإشارة الهادئة.',
                'التعامل مع أسئلة الجمهور المحرجة والمشككة بلباقة ودبلوماسية.',
                'إعادة جذب انتباه القاعة إذا انشغل الحضور بالهواتف.'
              ],
              trainerTalkingPoints: 'القائد المتميز هو من يحول العطل الفني إلى لقطة طريفة يضحك عليها الجمهور، كأن يقول بابتسامة: "يبدو أن حتى الميكروفون انبهر بطاقة شباب جامعة الإسكندرية!".',
              alexandriaCaseExample: 'انقطاع شاشة العرض (Projector) أثناء عرض تقديمي، فقام المتحدث بالنزول بين الطلاب والشرح التفاعلي بالحوار، فكانت الجلسة الأنجح في المؤتمر.',
              commonMistakes: [
                'الارتباك واللوم العلني لفريق الصوتيات أمام الجمهور.',
                'الدخول في جدال شخصي أو حاد مع طالب معترض.'
              ]
            }
          ],
          simulationWorkshop: {
            name: 'تمرين "دقيقة الشجاعة والتأثير" أمام الجمهور المباشر',
            crisisScenario: 'يُمنح كل متدرب موضوعاً مفاجئاً (مثال: إقناع 500 طالب بالانضمام لفريق التطوع / كلمة شكر مؤثرة لعميد الكلية / افتتاح مؤتمر علمي) ويصعد على المنصة لإلقاء مقدمة وخاتمة في 60 ثانية بالضبط مع تقييم الفيديو المباشر.',
            teamRoles: [
              'الخطيب الملقي: المتدرب الذي يقف على المنصة.',
              'لجنة التحكيم النظيرة: 3 زملاء يسجلون الملاحظات في كشف التقييم.',
              'فريق التشويش المفتعل: طالب يُحدث صوتاً خفيفاً لاختبار ثبات الخطيب.'
            ],
            executionSteps: [
              'الخطيب يأخذ 30 ثانية لتنظيم الأفكار في بطاقة واحدة.',
              'الصعود بثقة وثبات، والوقوف 3 ثوانٍ قبل التحدث.',
              'إلقاء الخطاب في 60 ثانية واستخدام وقفة مؤثرة واحدة على الأقل.',
              'تلقي التغذية الراجعة الإيجابية والتحسينية من المدرب فوراً.'
            ],
            successCriteria: 'التحدث بثقة دون كلمات حشو مكررة (أاااه، يعني)، المحافظة على النظرات البصرية، واستخدام نبرة صوت حماسية واضحة.'
          },
          trainerCrisisFaq: [
            {
              question: 'ماذا أفعل لو نسيت الفكرة التالية تماماً وأنا على المسرح؟',
              idealAnswer: 'خذ نفساً هادئاً، وابتسم للجمهور، واستخدم وقفة درامية واشرب رشفة ماء، أو كرر آخر عبارة قلتها بصيغة سؤال، مثل: "وهذا يضعنا أمام السؤال الأهم: كيف نحقق ذلك؟" سيعطيك هذا 5 ثوانٍ ثمينة لتذكر الفكرة التالية بسلاسة.'
            },
            {
              question: 'كيف أتعامل مع الرجفة في صوتي أو ركبتي؟',
              idealAnswer: 'اضغط أصابع قدميك بخفة داخل الحذاء لتفريغ الطاقة الزائدة، وتحرك خطوتين بثبات للأمام، وتحدث بنبرة أعمق من صدرك وليس من حنجرتك.'
            },
            {
              question: 'ما الطريقة المثلى لضبط الوقت وعدم تجاوزه؟',
              idealAnswer: 'اتفق مع أحد المنظمين في الصف الأول على إشارات خفية (مثال: رفع بطاقة صفراء عند تبقي دقيقتين، وبطاقة حمراء عند انتهاء الوقت).'
            }
          ],
          evaluationRubric: [
            { criterion: 'قوة الخطاف والمقدمة الخاطفة', weight: '25%', description: 'جذب الانتباه في أول 15 ثانية دون تردد.' },
            { criterion: 'التنوع الصوتي والوقفات المؤثرة', weight: '25%', description: 'تجنب الوتيرة الواحدة والتحكم في مخارج الألفاظ.' },
            { criterion: 'لغة الجسد والاتصال البصري', weight: '25%', description: 'توزيع النظرات وثبات الوقفة وحركة اليدين المعبرة.' },
            { criterion: 'الخاتمة الملهمة والدعوة للفعل', weight: '25%', description: 'ترك أثر عميق ورسالة واضحة لا تُنسى.' }
          ],
          postSessionAssignment: {
            title: 'تسجيل فيديو مدته دقيقتان لعرض فكرة مبادرة طلابية',
            deadline: 'خلال 72 ساعة',
            instructions: 'قم بتسجيل فيديو لنفسك وأنت واقف تتحدث عن فكرة مبادرة تخدم كليتك في جامعة الإسكندرية مراعياً: المقدمة، التنوع الصوتي، ولغة الجسد.',
            expectedDeliverable: 'رفع الفيديو على المنصة لمراجعته ومنح +40 XP وشارة المتحدث اللامع.'
          },
          keyTakeaways: [
            'الجمهور لن يتذكر كل ما قلت، لكنه لن ينسى أبداً كيف جعلته يشعر.',
            'التنفس والوقفة الهادئة هما سر الثقة والسيطرة على المنصة.',
            'البساطة والصدق في الحديث يلمسان القلوب أسرع من الكلمات المعقدة.',
            'الممارسة المستمرة هي الطريق الوحيد لصناعة خطيب استثنائي.'
          ]
        };
      } else {
        // Montage / Video / Creative Bootcamp
        plan = {
          topic: 'صناعة الريلز السريعة والمونتاج الديناميكي للفعاليات الطلابية (Viral Reels & Fast-Paced Editing)',
          category: 'committee-specialized',
          targetAudience: 'لجنة المونتاج والفيديو ولجنة صناعة المحتوى والتصوير',
          duration: '110 دقائق عملية',
          level: 'متقدم واحترافي',
          equipmentRequired: [
            'أجهزة لابتوب محملة ببرامج المونتاج (Premiere Pro / DaVinci / CapCut Pro)',
            'حزم خطوط عربية حديثة ومؤثرات صوتية (SFX Pack)',
            'مواد خام مصورة (Raw Footage) لفعاليات جامعة الإسكندرية السابقة',
            'سماعات رأس عالية الدقة'
          ],
          smartObjectives: [
            'تسليم فيديو ريلز احترافي مدته 30 ثانية في أقل من 45 دقيقة من انتهاء تصوير الفعالية.',
            'إتقان هندسة الخطاف البصري (Visual Hook) في أول 3 ثوانٍ لرفع نسبة المشاهدة بنسبة 80%.',
            'تطبيق تقطيع اللقطات المتزامن مع الإيقاع الموسيقي (Beat Matching & Speed Ramping).',
            'تصحيح الألوان السينمائي (Color Grading & LUTs) ليناسب الإضاءة المتنوعة للقاعات.'
          ],
          modules: [
            {
              time: '25 دقيقة',
              title: 'الوحدة الأولى: تشريح الريلز الفيروسي وسيكولوجية المشاهد (Viral Psychology)',
              coreConcepts: [
                'معدل الاحتفاظ بالجمهور (Audience Retention Rate) وأهمية الثواني الثلاث الأولى.',
                'تنسيق الأبعاد الرأسية 9:16 ومنطقة الأمان (Safe Zones) للنصوص والأزرار.',
                'استراتيجية الحركة المستمرة (Seamless Loops) لجعل المشاهد يعيد تشغيل الريلز تلقائياً.'
              ],
              trainerTalkingPoints: 'المونتاج ليس مجرد لصق لقطات، بل هو سرد قصصي مشحون بالعاطفة والطاقة. في أول 3 ثوانٍ، يجب أن يشهد المشاهد إما لقطة مذهلة، أو وجهاً يبتسم بحماس، أو جملة نصية تطرح تساؤلاً لا يمكن تجاهله.',
              alexandriaCaseExample: 'ريلز اليوم الرياضي للجامعة حقق 65,000 مشاهدة على تيك توك وإنستجرام بسبب البداية بلقطة حركة سريعة مع صوت صافرة الحكم وكلمة جذابة في أول ثانية.',
              commonMistakes: [
                'البدء بشعار ثابت أو نص طويل ممل يستغرق 4 ثوانٍ.',
                'وضع النصوص الهامة أسفل الشاشة بحيث يغطيها كابشن التطبيق.'
              ]
            },
            {
              time: '35 دقيقة',
              title: 'الوحدة الثانية: تقنيات التقطيع الديناميكي ومزامنة الإيقاع (Beat Sync & Ramping)',
              coreConcepts: [
                'تحديد علامات الإيقاع (Markers) على التراك الصوتي قبل وضع الفيديو.',
                'استخدام تقنية تسريع وإبطاء الحركة (Speed Ramping) لإبراز اللحظات الحماسية.',
                'الانتقالات الطبيعية (Match Cuts & Whip Pans) دون الإفراط في الانتقالات البصرية المبتذلة.'
              ],
              trainerTalkingPoints: 'الانتقال الجيد هو الذي لا يلاحظه المشاهد بعينه، بل يشعر به كأنه تدفق طبيعي للمشهد. احرص على أن تكون كل قطيعة مرتبطة بضربة طبل أو مؤثر صوتي Whoosh ناعم.',
              alexandriaCaseExample: 'فيديو توثيق المؤتمر العلمي لطب الإسكندرية استخدم تقطيعاً سريعاً على دقات الإيقاع مع تكبير خفيف (Punch-in Zoom) على تفاعل الطلاب، مما جعله عصرياً وشبابياً للغاية.',
              commonMistakes: [
                'استخدام انتقالات 3D قديمة ومشتتة للانتباه.',
                'إبقاء اللقطة ثابتة لأكثر من 2.5 ثانية في الفيديوهات الحماسية.'
              ]
            },
            {
              time: '30 دقيقة',
              title: 'الوحدة الثالثة: تصميم الصوت وتصحيح الألوان (Sound Design & Color Craft)',
              coreConcepts: [
                'مستويات الصوت القياسية: الموسيقى (-18dB)، التعليق الصوتي (-6dB)، المؤثرات (-12dB).',
                'إضافة طبقات المؤثرات الصوتية (Risers, Impacts, Camera Clicks) لإحياء الفيديو.',
                'تعديل توازن اللون الأبيض (White Balance) وتوحيد ألوان الكاميرات المختلفة.'
              ],
              trainerTalkingPoints: 'الصوت يمثل 60% من جودة الفيديو! فيديو بجودة صورة متوسطة وصوت ممتاز سينال إعجاب المشاهدين، بينما فيديو 4K بصوت رديء أو موسيقى غير متناسقة سيتجاوزه المشاهد فوراً.',
              alexandriaCaseExample: 'إضافة صوت نقرة الكاميرا عند ظهور لقطات المصورين في ريلز التكريم رفع التفاعل بنسبة 40%.',
              commonMistakes: [
                'رفع صوت الموسيقى الخلفية لدرجة تغطي على صوت المتحدث.',
                'الإفراط في تشبع الألوان (Oversaturation) لتظهر وجوه الطلاب بلون برتقالي فاقع.'
              ]
            },
            {
              time: '20 دقيقة',
              title: 'الوحدة الرابعة: سير العمل فائق السرعة أثناء الفعاليات الحية (Live Event Fast Workflow)',
              coreConcepts: [
                'تجهيز القوالب مسبقاً (Pre-made Templates): الهوية، الخطوط، والنهاية الرسمية.',
                'استلام بطاقات الذاكرة السريعة (SD Cards) والتفريغ الفوري على SSD.',
                'التصدير بإعدادات محسنة للإنستجرام وتيك توك (H.264, 1080x1920, 30fps, 15Mbps).'
              ],
              trainerTalkingPoints: 'في التغطية الإعلامية، من ينشر أولاً هو من يملك التريند! هدف فريق المونتاج بالاتحاد هو خروج أول ريلز ملخص قبل مغادرة الضيوف للقاعة.',
              alexandriaCaseExample: 'نشر فيديو ختام حفل الاستقبال بعد 20 دقيقة فقط من كلمة العميد حقق أعلى نسبة مشاركات في تاريخ صفحة الاتحاد.',
              commonMistakes: [
                'البحث عن الموسيقى والمؤثرات أثناء الفعالية بدلاً من تجهيز مكتبة مسبقة.',
                'التصدير بمعدل بت (Bitrate) عالي جداً مما يجعل الملف ثقيلاً وبطيء الرفع.'
              ]
            }
          ],
          simulationWorkshop: {
            name: 'تحدي "الريلز الخاطف": مونتاج فيديو كامل في 30 دقيقة',
            crisisScenario: 'تم تزويد كل متدرب بمجلد يحتوي على 15 لقطة خام مصورة بكاميرات وهواتف مختلفة لفعالية افتتاح الموسم، والمطلوب اختيار أفضل 8 لقطات، وتركيب موسيقى حماسية، وضبط الألوان وإضافة مؤثرات صوتية وتصدير فيديو جاهز للنشر في 30 دقيقة.',
            teamRoles: [
              'المونتير المنفذ: يقوم بالتقطيع وتطبيق المؤثرات.',
              'المراجع الفني (النائب): يتأكد من مطابقة أبعاد النصوص ومستويات الصوت.',
              'مسؤول التصدير: يضبط إعدادات التصدير ومراقبة الجودة النهائية.'
            ],
            executionSteps: [
              'الدقائق 1-5: مراجعة اللقطات وتحديد لقطة الخطاف الأولى.',
              'الدقائق 6-15: التقطيع على إيقاع الموسيقى وإضافة الزوم الديناميكي.',
              'الدقائق 16-25: إضافة المؤثرات الصوتية وتصحيح الألوان وكتابة النصوص.',
              'الدقائق 26-30: تصدير الفيديو والمراجعة الشاملة على الهاتف.'
            ],
            successCriteria: 'تسليم فيديو احترافي مدته 25-35 ثانية بإيقاع جذاب ومطابق لهوية الاتحاد في الوقت المحدد.'
          },
          trainerCrisisFaq: [
            {
              question: 'ماذا أفعل لو كانت لقطات الإضاءة في القاعة مظلمة وضعيفة جداً؟',
              idealAnswer: 'استخدم رفع الظلال (Shadows Boost) مع تقليل الضوضاء (Noise Reduction)، وحول بعض اللقطات الصعبة إلى نمط أبيض وأسود عالي التباين (Black & White Dramatic) لتبدو كقرار إخراجي فني مقصود.'
            },
            {
              question: 'كيف أختار موسيقى مناسبة دون انتهاك حقوق الملكية (Copyright Strike)؟',
              idealAnswer: 'استخدم الموسيقى المرخصة المعتمدة في مكتبة الاتحاد أو الصوتيات الرائجة (Trending Audio) مباشرة من داخل تطبيق إنستجرام وتيك توك عند النشر.'
            },
            {
              question: 'لو تعطل البرنامج أو تجمد الجهاز فجأة ماذا أفعل؟',
              idealAnswer: 'فعل ميزة الحفظ التلقائي (Auto-Save) كل 3 دقائق، واحتفظ بنسخة المشروع على قرص SSD خارجي سريع.'
            }
          ],
          evaluationRubric: [
            { criterion: 'قوة الخطاف البصري والمقدمة', weight: '30%', description: 'الجاذبية والسرعة في أول 3 ثوانٍ.' },
            { criterion: 'مزامنة الإيقاع وتناسق التقطيع', weight: '25%', description: 'الانسجام التام بين الصورة والضربات الموسيقية.' },
            { criterion: 'هندسة الصوت وتوازن المؤثرات', weight: '25%', description: 'وضوح الصوت وعدم وجود تشويش أو علو مفاجئ.' },
            { criterion: 'سرعة التسليم والالتزام بالوقت', weight: '20%', description: 'القدرة على إنهاء العمل بجودة عالية تحت ضغط الوقت.' }
          ],
          postSessionAssignment: {
            title: 'صناعة ريلز تعريفي بلجنتك وتوثيق كواليس العمل',
            deadline: 'خلال 4 أيام',
            instructions: 'قم بتصوير ومونتاج فيديو مدته 30-45 ثانية يوثق كواليس اجتماع أو نشاط لجنتك مراعياً التقطيع الإيقاعي وتصميم الصوت.',
            expectedDeliverable: 'رفع الفيديو بصيغة MP4 على المنصة مع كابشن مقترح للحصول على +45 XP.'
          },
          keyTakeaways: [
            'الريلز الناجح يخطف العين في ثانية، ويحرك المشاعر في 15 ثانية، ويبقى في الذاكرة طويلاً.',
            'الصوت النقي والمؤثرات المدروسة تضاعف قيمة العمل البصري.',
            'البساطة والسرعة في التغطية الحية تصنعان الفارق بين التميز والغياب.',
            'فريق المونتاج هو صانع البريق النهائي لجهود كافة متطوعي الاتحاد.'
          ]
        };
      }

      setGeneratedSession(plan);
      setIsGeneratingSession(false);
    }, 800);
  };

  const handleCopySession = () => {
    if (!generatedSession) return;
    const text = `حقيبة تدريبية موسعة: ${generatedSession.topic}\n` +
      `الفئة: ${generatedSession.targetAudience} • المدة: ${generatedSession.duration} • المستوى: ${generatedSession.level}\n\n` +
      `الأهداف التعليمية:\n` +
      generatedSession.smartObjectives.map(o => `• ${o}`).join('\n') +
      `\n\nالمحاور التدريبية:\n` +
      generatedSession.modules.map(m => `📌 ${m.time} - ${m.title}\nالمفاهيم: ${m.coreConcepts.join('، ')}\nنقاط المدرب: ${m.trainerTalkingPoints}\nمثال إسكندرية: ${m.alexandriaCaseExample}`).join('\n\n') +
      `\n\nورشة المحاكاة والأزمة:\n${generatedSession.simulationWorkshop.name}\n${generatedSession.simulationWorkshop.crisisScenario}\n\nالدروس المستفادة:\n` +
      generatedSession.keyTakeaways.map(k => `✓ ${k}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  // AI Task Package Generator
  const handleGenerateTaskPackage = () => {
    setIsGeneratingTasks(true);
    setTimeout(() => {
      setGeneratedTaskPackage({
        eventGoal: taskArchitectGoal,
        tasks: [
          {
            committeeId: 'comm-org',
            committeeName: 'لجنة التنظيم والميدان',
            taskTitle: 'تأمين المداخل وتدفق الحشود والمسرح الرئيسي',
            description: `تنفيذ خطة تأمين وتوجيه الطلاب في فعالية "${taskArchitectGoal}"، وتوزيع 15 متطوعاً على البوابات والمدرجات ومرافقة كبار الزوار.`,
            xpReward: 40,
            subtasks: [
              'فحص أجهزة الباركود واللاسلكي قبل بدء الفعالية بساعة',
              'توزيع المتطوعين على بوابات الدخول ومدرج الاحتفالات',
              'تأمين مقاعد الصف الأول لعمداء الكليات وضيوف الشرف',
              'تنظيم خروج الطلاب بسلاسة بعد انتهاء الحفل'
            ],
            evaluationCriteria: 'الانضباط التام في التواجد وعدم حدوث أي تكدس أو اختناق عند البوابات.'
          },
          {
            committeeId: 'comm-hr',
            committeeName: 'لجنة الموارد البشرية (HR)',
            taskTitle: 'إدارة تسجيل الحضور الميداني والتقييم اللحظي',
            description: `تشغيل نقاط الـ Dynamic QR Code ورصد الحضور الفعلي للمتطوعين وتوزيع الوجبات وجداول الاستراحة الدورية.`,
            xpReward: 35,
            subtasks: [
              'فتح جلسة الحضور الرقمية ومسح أكواد المتطوعين عند الدخول',
              'متابعة الحالات الطارئة والاعتذارات والتنسيق مع القادة',
              'توزيع فترات الراحة (15 دقيقة لكل متطوع بالتناوب)',
              'إغلاق جلسة الحضور وتسجيل مدة الخدمة لكل عضو'
            ],
            evaluationCriteria: 'دقة رصد الحضور بنسبة 100% ورضا المتطوعين عن تنظيم فترات الراحة.'
          },
          {
            committeeId: 'comm-media',
            committeeName: 'لجنة التصوير الفوتوغرافي والفيديوغرافي',
            taskTitle: 'التغطية الفوتوغرافية الشاملة وتوثيق لقطات الضيوف',
            description: `التقاط صور عالية الدقة لكلمات المتحدثين، تفاعل الجمهور، ولقطات البورتريه الرسمية لكبار الزوار ورفعها للأرشفة السحابية.`,
            xpReward: 35,
            subtasks: [
              'تصوير 50 لقطة مختارة بجودة عالية وتكوين بصري سليم',
              'توثيق ردود أفعال الطلاب وفقرات التكريم الرسمية',
              'تفريغ بطاقات الذاكرة وتصنيف الصور في مجلدات السحابة',
              'تسليم أفضل 10 صور فورية للجنة صناعة المحتوى للنشر العاجل'
            ],
            evaluationCriteria: 'وضوح الإضاءة، حدة التركيز (Focus)، وسرعة تسليم الصور الفورية.'
          },
          {
            committeeId: 'comm-design',
            committeeName: 'لجنة التصميم',
            taskTitle: 'تصميم البنرات الترحيبية وقوالب شاشات العرض المباشرة',
            description: `إعداد الشاشات الترحيبية وتصميم بطاقات تكريم الضيوف وقوالب الإعلانات الرقمية للفعالية بالهوية المعتمدة للاتحاد.`,
            xpReward: 35,
            subtasks: [
              'مراجعة وتجهيز خلفيات الشاشة الرئيسية (LED Wall)',
              'تصميم بنرات الترحيب بالرعاة والضيوف بأبعاد الطباعة الصحيحة',
              'إعداد قوالب التغطية الحية لقصص السوشيال ميديا',
              'تجهيز شهادات التقدير والدروع التكريمية'
            ],
            evaluationCriteria: 'التطابق الكامل مع الهوية البصرية وخلو النصوص من أي أخطاء لغوية.'
          },
          {
            committeeId: 'comm-montage',
            committeeName: 'لجنة المونتاج والفيديو',
            taskTitle: 'إنتاج ريلز فيديو سريع ونشر التغطية الحية',
            description: `مونتاج وتسليم فيديو ريلز إيقاعي مدته 30 ثانية يلخص بهجة وحماس الفعالية للنشر على تيك توك وإنستجرام خلال ساعة واحدة.`,
            xpReward: 45,
            subtasks: [
              'استلام اللقطات المصورة من فريق الميديا كل 30 دقيقة',
              'مونتاج فيديو ترويجي مبكر ومزامنته مع إيقاع صوتي جذاب',
              'إضافة المؤثرات البصرية وتصحيح الألوان السينمائي',
              'تصدير الفيديو الرأسي 9:16 بجودة عالية وتسليمه للنشر'
            ],
            evaluationCriteria: 'سرعة الإنجاز والجاذبية البصرية والاحتفاظ بانتباه المشاهد حتى النهاية.'
          },
          {
            committeeId: 'comm-content',
            committeeName: 'لجنة صناعة المحتوى',
            taskTitle: 'صياغة التغطية الحية والبيان الصحفي الرسمي',
            description: `كتابة نصوص الستوري والمنشورات الترويجية والبيان الختامي الموجه للصحافة والصفحات الرسمية لجامعة الإسكندرية.`,
            xpReward: 30,
            subtasks: [
              'كتابة نصوص ترحيبية وتغطية حية للاقتباسات الملهمة للضيوف',
              'صياغة كابشن حماسي ينشر مع الفيديو والصور الرسمية',
              'إعداد البيان الصحفي الرسمي المعتمد للاتحاد',
              'الرد على استفسارات الطلاب وتفاعل الجمهور في التعليقات'
            ],
            evaluationCriteria: 'البلاغة اللغوية، الحماس، ودقة نقل أسماء وألقاب القيادات والضيوف.'
          }
        ]
      });
      setIsGeneratingTasks(false);
    }, 750);
  };

  const handleApplyAITasks = () => {
    if (!generatedTaskPackage) return;
    generatedTaskPackage.tasks.forEach(t => {
      createTask({
        title: t.taskTitle,
        description: t.description,
        committeeId: t.committeeId,
        committeeName: t.committeeName,
        xpReward: t.xpReward,
        maxPoints: t.xpReward,
        priority: 'High',
        status: 'Assigned',
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        subtasks: t.subtasks.map((s, idx) => ({ id: `sub-${idx + 1}`, title: s, completed: false }))
      });
    });
    showNotification('success', 'تم اعتماد وإسناد حزمة المهام الذكية للجان الـ 6 بنجاح! 🚀');
  };

  // Crisis simulator scenarios data - 20 Comprehensive Scenarios
  const crisisScenarios: CrisisScenario[] = [
    {
      id: 'crisis-1',
      title: 'أزمة تكدس وتدافع 300 طالب على بوابة مدرج الاحتفالات',
      location: 'مجمع العلوم الإنسانية بالشاطبي - البوابة الرئيسية A',
      urgency: 'حرجة جداً',
      context: 'قبل بدء ندوة النجم الضيف بـ 10 دقائق، امتلأت مقاعد القاعة (800 مقعد)، وتجمع 300 طالب إضافي بالخارج يرغبون في الدخول رافضين التراجع، مع تصاعد الهتافات وبدء الضغط على الأبواب الزجاجية.',
      options: [
        {
          id: 'opt-1',
          text: 'غلق الأبواب بالقوة واستدعاء الأمن الجامعي لفض التجمع وتفريق الطلاب فوراً.',
          score: 40,
          critique: 'قرار متسرع قد يؤدي لاشتباك وتصعيد التوتر وهتافات سلبية تضر بسمعة الاتحاد وتفسد الفعالية.'
        },
        {
          id: 'opt-2',
          text: 'الخروج للطلاب بمكبر الصوت، والاعتذار بلباقة عن اكتمال العدد، مع الإعلان الفوري عن فتح قاعة مجاورة بشاشة عرض وبث مباشر (Live Stream) وتوزيع استمارات أولوية للفعالية القادمة.',
          score: 98,
          critique: 'قرار قيادي تكتيكي استثنائي 👑! احتواء ذكي للموقف، بديل عملي فوري، وامتصاص كامل لغضب الحضور باحترافية.'
        },
        {
          id: 'opt-3',
          text: 'السماح للجميع بالدخول والوقوف في الممرات والجلوس على الأدراج.',
          score: 30,
          critique: 'مخاطرة أمنية كبرى ⚠️! إغلاق ممرات الطوارئ قد يسبب كوارث وتدافع لا قدر الله في حالة حدوث أي طارئ.'
        }
      ]
    },
    {
      id: 'crisis-2',
      title: 'اعتذار مفاجئ لـ 6 مصورين ومونتيرين من لجنة الميديا قبل الفعالية بساعة',
      location: 'مقر المؤتمر السنوي - كلية الطب',
      urgency: 'عالية',
      context: 'بسبب امتحان شفوي طارئ، اعتذر 6 مصورين ومونتيرين، بينما تبقت ساعة واحدة على وصول عميد الكلية والضيوف لتغطية الافتتاح.',
      options: [
        {
          id: 'opt-1',
          text: 'إلغاء التغطية المصورة والاعتماد فقط على كتابة منشورات نصية بعد انتهاء الحدث.',
          score: 25,
          critique: 'فشل إعلامي كامل، يضيع الجهد المبذول وتوثيق الحدث الأهم في الموسم.'
        },
        {
          id: 'opt-2',
          text: 'تفعيل الاستدعاء التكتيكي للمتطوعين الاحتياطيين من كليات قريبة، وتكليف أعضاء التصميم وصناعة المحتوى الذين يجيدون التصوير لتغطية الزوايا الحرجة مع ضبط قائمة اللقطات الأساسية فقط.',
          score: 96,
          critique: 'إدارة أزمات متقنة ومرونة تشغيلية عالية 👏! استثمار متعدد المهارات وسد الثغرة فوراً دون هلع.'
        },
        {
          id: 'opt-3',
          text: 'إرسال رسائل توبيخية للمعتذرين في جروب الواتساب لتهديدهم بخصم النقاط.',
          score: 10,
          critique: 'سلوك قيادي خاطئ وغير فعال، لا يحل المشكلة الحالية ويزيد الاحتراق النفسي للفريق.'
        }
      ]
    },
    {
      id: 'crisis-3',
      title: 'انقطاع التيار الكهربائي ونظام الصوت في القاعة الكبرى أثناء كلمة الضيف الرئيسي',
      location: 'مركز مؤتمرات جامعة الإسكندرية بالشاطبي',
      urgency: 'حرجة جداً',
      context: 'أثناء إلقاء الشخصية العامة كلمته أمام 1200 طالب، انقطعت الكهرباء عن الميكروفونات والشاشات تماماً وساد الصمت والهمهمات في القاعة.',
      options: [
        {
          id: 'opt-1',
          text: 'إخلاء القاعة فوراً والإعلان عن إلغاء الندوة لتجنب الإحراج.',
          score: 20,
          critique: 'استسلام سريع ينهي الفعالية بالفشل دون استنفاد الحلول البديلة.'
        },
        {
          id: 'opt-2',
          text: 'تدخل رئيس لجنة التنظيم فوراً لتوجيه المتطوعين بتشغيل كشافات الهواتف باتجاه المسرح، وتوفير الميكروفون المتنقل اللاسلكي الذي يعمل بالبطارية من حقيبة الطوارئ، والتنسيق الفوري مع فني الصيانة.',
          score: 95,
          critique: 'حضور ذهني رائع واستخدام فوري للعتاد الاحتياطي حول الموقف المحرج لمشهد تفاعلي ملهم 💡.'
        },
        {
          id: 'opt-3',
          text: 'الطلب من الضيف أن يرفع صوته بدون ميكروفون والاستمرار في القاعة الكبيرة.',
          score: 45,
          critique: 'حل غير عملي في قاعة تسع 1200 شخص، سيفقد 80% من الحضور القدرة على السماع.'
        }
      ]
    },
    {
      id: 'crisis-4',
      title: 'مشادة حادة بين متطوع تنظيم وطالب حاضر على مدخل كبار الزوار VIP',
      location: 'مجمع كليات العلوم والهندسة',
      urgency: 'عالية',
      context: 'حاول طالب غير مصرح له الدخول من ممر الـ VIP الخاص برؤساء الشركات، فقام متطوع بمنعه بأسلوب جاف وتطورت المشادة إلى تلاسن صوتي واحتشاد الطلاب.',
      options: [
        {
          id: 'opt-1',
          text: 'مساندة المتطوع علناً في المشادة وتوبيخ الطالب لإظهار هيبة فريق التنظيم.',
          score: 30,
          critique: 'تصرف انفعالي يفاقم الأزمة ويظهر الاتحاد بمظهر عدائي أمام الجمهور.'
        },
        {
          id: 'opt-2',
          text: 'تدخل هيد التنظيم فوراً بهدوء، سحب المتطوع خلف النقطة الأمنية، أخذ الطالب جانباً بابتسامة، والاعتذار عن أسلوب الحوار وشرح قواعد المسارات والترحيب به من المدخل العام المخصص.',
          score: 97,
          critique: 'فصل ذكي لأطراف النزاع، امتصاص فوري للاحتقان، وحفاظ على بروتوكول التنظيم بقمة اللباقة 🤝.'
        },
        {
          id: 'opt-3',
          text: 'استدعاء الأمن الجامعي فوراً لتحرير محضر ضد الطالب وطرده من الكلية.',
          score: 40,
          critique: 'تضخيم غير مبرر لمشكلة كان يمكن حلها في 30 ثانية بأسلوب قيادي واثق.'
        }
      ]
    },
    {
      id: 'crisis-5',
      title: 'وصول وفد رفيع المستوى مفاجئ وغير مدرج بجدول البروتوكول والمقاعد محجوزة',
      location: 'قاعة الاحتفالات الكبرى - إدارة الجامعة',
      urgency: 'عالية',
      context: 'حضر وفد من 5 عمداء كليات ورؤساء قطاعات بدون إشعار مسبق قبل بدء الحفل بـ 5 دقائق، بينما الصفوف الأولى المخصصة للـ VIP مكتملة تماماً.',
      options: [
        {
          id: 'opt-1',
          text: 'إبلاغ الوفد بالاعتذار لعدم وجود أماكن متبقية والطلب منهم الجلوس في الصفوف الخلفية.',
          score: 25,
          critique: 'خطأ بروتوكولي جسيم يسبب حرجاً بالغاً لإدارة الجامعة والاتحاد.'
        },
        {
          id: 'opt-2',
          text: 'إعادة توزيع مقاعد الصف الثاني سريعاً بنقل أعضاء الاتحاد والمنظمين للوقوف في ممرات الإشراف، واستقبال الوفد في استراحة كبار الزوار لمدة دقيقتين ريثما يتم تجهيز وتوسيع الصف الأول بمقاعد إضافية.',
          score: 98,
          critique: 'إدارة بروتوكولية ملكية 👑، تضحية المنظمين بمقاعدهم تعكس روح المسؤولية والاحترافية.'
        },
        {
          id: 'opt-3',
          text: 'إجبار بعض الطلاب الجالسين في الصف الثالث على القيام والوقوف بالخلف.',
          score: 35,
          critique: 'تصرف غير عادل يولد احتقاناً شديداً وشعوراً بالإهانة لدى الطلاب.'
        }
      ]
    },
    {
      id: 'crisis-6',
      title: 'هطول أمطار غزيرة ورياح شديدة أثناء معرض الأنشطة المفتوح بالساحة',
      location: 'ساحة مجمع الكليات النظرية',
      urgency: 'حرجة جداً',
      context: 'أثناء تواجد 2000 طالب في المعرض المفتوح وبدء العروض، هطلت نوة الإسكندرية المطرية بغزارة مع رياح قوية تهدد بتلف الأجهزة والشاشات وخيام اللجان.',
      options: [
        {
          id: 'opt-1',
          text: 'ترك المعدات والهروب فوراً لحماية النفس دون خطة إخلاء.',
          score: 15,
          critique: 'فوضى عارمة وخسائر مادية كبرى للأجهزة والمعدات المستأجرة.'
        },
        {
          id: 'opt-2',
          text: 'تفعيل خطة الإخلاء البديلة المعتمدة فوراً: توجيه الجمهور عبر مسارات واضحة لممرات الكليات المغطاة، وتوزيع فريق التنظيم لتغطية وحمل الأجهزة الإلكترونية بالمشمعات الواقية ونقلها لقاعة بهو الكلية.',
          score: 97,
          critique: 'تطبيق مثالي لخطة الطوارئ مع الحفاظ التام على الأرواح والأجهزة وسير النشاط بمرونة 🌧️.'
        },
        {
          id: 'opt-3',
          text: 'الإصرار على استمرار العروض تحت الأمطار لإثبات الحماس الطلابي.',
          score: 20,
          critique: 'مخاطرة شديدة تهدد بصعق كهربائي وإصابات وانزلاقات بين الطلاب.'
        }
      ]
    },
    {
      id: 'crisis-7',
      title: 'تداول منشور سلبي وشائعة مضللة حول الفعالية وتصاعد التعليقات الغاضبة',
      location: 'منصات التواصل الاجتماعي - غرفة العمليات الرقمية',
      urgency: 'متوسطة إلى عالية',
      context: 'نشرت إحدى الصفحات الطلابية غير الرسمية ادعاءً بأن الاتحاد يقوم بتمييز طلاب كليات معينة وتوزيع شهادات غير معتمدة، وتفاعل مع المنشور أكثر من 500 طالب في ساعة.',
      options: [
        {
          id: 'opt-1',
          text: 'تجاهل المنشور تماماً واعتباره مجرد كلام عابر على السوشيال ميديا.',
          score: 35,
          critique: 'التجاهل يسمح للشائعة بالتضخم والتحول لرأي عام سلبي يضر بمصداقية الاتحاد.'
        },
        {
          id: 'opt-2',
          text: 'الدخول في مشادات في التعليقات من الحسابات الشخصية للمتطوعين لتكذيب الصفحة بعنف.',
          score: 25,
          critique: 'تصرف عشوائي يعطي مصداقية للمهاجمين ويشعل حرباً كلامية غير مهنية.'
        },
        {
          id: 'opt-3',
          text: 'صياغة بيان رسمي موثق ومرئي من لجنة صناعة المحتوى، يحتوي على صور وفيديوهات تكريم لكافة الكليات وتوضيح الاعتماد الأكاديمي، ونشره عبر الصفحة الرسمية مع الرد بلباقة واحترافية على الاستفسارات.',
          score: 96,
          critique: 'إدارة أزمات إعلامية ممتازة 📱، الرد بالحقائق والأدلة المرئية ينهي الشائعة ويكسب ثقة الجمهور.'
        }
      ]
    },
    {
      id: 'crisis-8',
      title: 'تلف بطاقة الذاكرة (SD Card Corrupt) المحتوية على صور تكريم العمداء',
      location: 'غرفة المونتاج والتجهيز',
      urgency: 'عالية',
      context: 'أثناء محاولة تفريغ صور الكاميرا الرئيسية لحفل التخرج، أظهرت بطاقة الذاكرة خطأ تالف، وفقدت صور اللحظات الرسمية للعمداء وضيوف الشرف.',
      options: [
        {
          id: 'opt-1',
          text: 'عمل تهيئة (Format) للبطاقة فوراً ومسح كل شيء.',
          score: 10,
          critique: 'كارثة تقنية تؤدي لفقدان البيانات للأبد واستحالة استرجاعها.'
        },
        {
          id: 'opt-2',
          text: 'إيقاف الكتابة على البطاقة فوراً، استخدام برنامج استعادة البيانات الاحترافي من حقيبة الدعم الفني، وجمع صور ومقاطع الكاميرات المساندة وكاميرات الهواتف بدقة 4K للمتطوعين المتواجدين بالزوايا كنسخة إسناد.',
          score: 95,
          critique: 'تعامل تقني محترف ومرونة في تجميع اللقطات من زوايا متعددة أنقذت التوثيق الرسمي 📸.'
        },
        {
          id: 'opt-3',
          text: 'إخفاء الأمر وعدم إبلاغ القيادة والأمل في ألا يلاحظ أحد غياب الصور.',
          score: 20,
          critique: 'انعدام للأمانة المهنية وسيتسبب في أزمة كبرى عند طلب الإدارة للصور الرسمية.'
        }
      ]
    },
    {
      id: 'crisis-9',
      title: 'انهيار بنر الرعاة الرئيسي الخلفي للمسرح قبل موعد الافتتاح بـ 15 دقيقة',
      location: 'مسرح قاعة المؤتمرات المركزية',
      urgency: 'عالية',
      context: 'سقط الحامل المعدني (Truss) للبنر الإعلاني الرئيسي على المسرح نتيجة خلل في التثبيت، وباتت خلفية المسرح مشوهة قبل دخول الضيوف بربع ساعة.',
      options: [
        {
          id: 'opt-1',
          text: 'بدء الفعالية والمسرح في هذه الحالة المنهارة لضيق الوقت.',
          score: 25,
          critique: 'مظهر سيء جداً يغضب الرعاة ويوحي بانعدام التجهيز والاحترافية.'
        },
        {
          id: 'opt-2',
          text: 'تحويل خلفية شاشة الـ LED الإلكترونية الرئيسية فوراً لعرض تصميم الهوية وشعارات الرعاة بدقة عالية، ونقل البنر المنهار خلف الكواليس وإعادة تثبيته كخلفية للتصوير الخارجي (Photo Booth).',
          score: 98,
          critique: 'حل تكتيكي ذكي واستثمار أمثل للشاشات الذكية حول الأزمة لفرصة ممتازة 🎨.'
        },
        {
          id: 'opt-3',
          text: 'تأجيل الحفل لمدة ساعتين حتى يأتي النجار أو الفني لإصلاحه.',
          score: 30,
          critique: 'تأخير غير مقبول يضيع مواعيد كبار الزوار والجدول الزمني لليوم بالكامل.'
        }
      ]
    },
    {
      id: 'crisis-10',
      title: 'نفاد وجبات الإعاشة والمياه المخصصة للمتطوعين مع استمرار الفعالية لـ 5 ساعات إضافية',
      location: 'غرفة الإعاشة واللوجستيات',
      urgency: 'متوسطة إلى عالية',
      context: 'بسبب تمديد الفعالية، نفدت وجبات الغداء وزجاجات المياه، وبدأ المتطوعون في الشعور بالإرهاق والجوع وهبوط الطاقة بعد 8 ساعات عمل متواصل.',
      options: [
        {
          id: 'opt-1',
          text: 'الطلب من المتطوعين الصبر والتحمل والعمل بدون طعام حتى نهاية اليوم.',
          score: 20,
          critique: 'إهمال لحقوق المتطوعين يؤدي لانهيار بدني ونفسي وتسرب وغضب مبرر.'
        },
        {
          id: 'opt-2',
          text: 'صرف ميزانية طوارئ فورية، طلب وجبات سريعة وعصائر ومياه بالتنسيق مع أقرب مطعم جامعي، وعمل جدول استراحة دوري (15 دقيقة لكل 4 متطوعين) لتناول الطعام واستعادة النشاط.',
          score: 97,
          critique: 'قيادة إنسانية تهتم بصحة وكرامة فريقها، وتجدول الراحة دون إخلال بالميدان 🥪.'
        },
        {
          id: 'opt-3',
          text: 'السماح لجميع المتطوعين بمغادرة مواقعهم والذهاب للمطاعم في وقت واحد.',
          score: 35,
          critique: 'ترك البوابات والمسرح فارغين تماماً سيسبب فوضى عارمة في الفعالية.'
        }
      ]
    },
    {
      id: 'crisis-11',
      title: 'اكتشاف تذاكر وأساور معصم (Wristbands) مزورة يتداولها طلاب غير مسجلين',
      location: 'بوابة الدخول الإلكترونية B',
      urgency: 'عالية',
      context: 'أثناء فحص الدخول لملتقى التوظيف، لاحظ فريق التنظيم وجود أساور معصم مقلدة بألوان باهتة مع طلاب يحاولون الدخول دون حجز مسبق.',
      options: [
        {
          id: 'opt-1',
          text: 'غض الطرف والسماح لهم بالدخول حتى لا نحدث ضجة على البوابة.',
          score: 20,
          critique: 'تشجيع للتزوير والظلم للطلاب الذين انتظروا وسجلوا بالطرق الرسمية.'
        },
        {
          id: 'opt-2',
          text: 'الاعتماد الفوري على المسح الضوئي لـ QR Code الرقمي من تطبيق المنصة كمعيار تحقق وحيد، وتوجيه حاملي الأساور المشكوك فيها لمكتب الاستعلامات لتسجيلهم في قائمة انتظار المسار الثاني.',
          score: 96,
          critique: 'تطبيق صارم للتحقق الرقمي يمنع التسلل ويعامل الجميع بلباقة ونظام 🛡️.'
        },
        {
          id: 'opt-3',
          text: 'الاشتباك مع الطلاب وسحب الأساور بالقوة وإحالتهم للتحقيق الجنائي فوراً.',
          score: 35,
          critique: 'رد فعل مبالغ فيه قد يوقع المتطوعين في أزمات قانونية وتصعيد لا لزوم له.'
        }
      ]
    },
    {
      id: 'crisis-12',
      title: 'تعرض أحد المتطوعين للإغماء والإجهاد الحراري الشديد في الممر المزدحم',
      location: 'الممر المركزي لكلية التجارة',
      urgency: 'حرجة جداً',
      context: 'سقط متطوع مغشياً عليه نتيجة الازدحام الشديد وارتفاع الحرارة أثناء تأمين الممر، واحتشد حوله الطلاب مسببين ارتباكاً.',
      options: [
        {
          id: 'opt-1',
          text: 'محاولة إيقاظه بسكب المياه الباردة بكثافة على وجهه في وسط الزحام.',
          score: 30,
          critique: 'إجراء طبي خاطئ قد يسبب مضاعفات وصعوبة في التنفس.'
        },
        {
          id: 'opt-2',
          text: 'عمل حلقة تأمين فورية لإبعاد التجمهر وتوفير الهواء، استدعاء فريق الإسعاف الطبي المتواجد بنقطة الطوارئ فوراً، ونقل المتطوع برفق للمكان المظلل وجلوسه في وضع الإفاقة ورفع قدميه.',
          score: 98,
          critique: 'بروتوكول إسعاف وإنقاذ نموذجي يضع سلامة المتطوع كأولوية قصوى 🚑.'
        },
        {
          id: 'opt-3',
          text: 'تركه مكانه والتركيز فقط على تنظيم طابور الطلاب.',
          score: 10,
          critique: 'إهمال جسيم ومخالفة لأبسط معايير الإنسانية والمسؤولية القيادية.'
        }
      ]
    },
    {
      id: 'crisis-13',
      title: 'تأخر وصول المتحدث الرئيسي والمحاضر لمدة 45 دقيقة عن فقرته بالقاعة الممتلئة',
      location: 'قاعة المحاضرات المركزية',
      urgency: 'متوسطة إلى عالية',
      context: 'علق المتحدث الرئيسي في زحام كوبري ستانلي، وبات من المؤكد تأخره 45 دقيقة، بينما يجلس 600 طالب في القاعة بانتظار بدء الفقرة.',
      options: [
        {
          id: 'opt-1',
          text: 'ترك الطلاب يجلسون في صمت وملل لمدة 45 دقيقة مع إعلان التأخير فقط.',
          score: 30,
          critique: 'سيبدأ الطلاب في مغادرة القاعة ونشر انتقادات حادة للاتحاد.'
        },
        {
          id: 'opt-2',
          text: 'تدخل مقدم الحفل (MC) ومسؤول الفعاليات لتقديم فقرة تفاعلية ومسابقات خفيفة بجوائز فورية من الرعاة، أو تقديم فقرة عرض قصص نجاح طلابية ملهمة ومناقشة تفاعلية لملء الفراغ الزمني ببهجة واحترافية.',
          score: 97,
          critique: 'تحويل وقت الانتظار الميت إلى فقرة حماسية وممتعة نالت إعجاب الجمهور 🎤.'
        },
        {
          id: 'opt-3',
          text: 'إلغاء الندوة وطلب مغادرة الطلاب وتأجيلها لأسبوع قادم.',
          score: 25,
          critique: 'إحباط للطلاب وإضاعة للجهد التنظيمي المبذول دون مبرر قاهر.'
        }
      ]
    },
    {
      id: 'crisis-14',
      title: 'تزامن حجز القاعة مع نشاط أكاديمي موازي ورفض أستاذ المادة إخلاء المسرح',
      location: 'مدرج الاحتفالات بكلية الحقوق',
      urgency: 'عالية',
      context: 'حضر أستاذ جامعي لإعطاء محاضرة تعويضية في نفس القاعة مدعياً أحقيته بالمكان ورفض إخلاء المسرح قبل فعالية الاتحاد بـ 20 دقيقة.',
      options: [
        {
          id: 'opt-1',
          text: 'الدخول في جدال حاد مع الأستاذ وقطع الميكروفون عنه بالقوة.',
          score: 15,
          critique: 'سوء أدب وتعدي على عضو هيئة تدريس يسبب مساءلة قانونية وفصل للمتطوعين.'
        },
        {
          id: 'opt-2',
          text: 'تحدث رئيس الفريق مع الأستاذ بمنتهى التقدير والاحترام وعرض خطاب الحجز المعتمد من عميد الكلية ورعاية الشباب، مع التنسيق الفوري مع وكيل الكلية لنقل محاضرة الأستاذ إلى مدرج مجاور مجهز ومكيف مع مساعدة الطلاب في الانتقال السلس.',
          score: 98,
          critique: 'قمة النضج والدبلوماسية الإدارية، حل المشكلة باحترام المقامات وتطبيق النظام ⚖️.'
        },
        {
          id: 'opt-3',
          text: 'إلغاء فعالية الاتحاد والانسحاب التام من الكلية.',
          score: 30,
          critique: 'ضياع مجهود أسابيع طويلة بسبب التردد والافتقار للمرونة في التواصل مع إدارة الكلية.'
        }
      ]
    },
    {
      id: 'crisis-15',
      title: 'نزاع وانقسام حاد بين هيد لجنة الموارد البشرية وهيد لجنة التنظيم داخل غرفة العمليات',
      location: 'غرفة العمليات المشتركة',
      urgency: 'متوسطة إلى عالية',
      context: 'اختلف هيد التنظيم وهيد الـ HR حول صلاحيات توزيع الأعضاء وتصاعد النقاش بينهما بغضب وتوقف إصدار التوجيهات للميدان.',
      options: [
        {
          id: 'opt-1',
          text: 'الانحياز لصديقك منهما وتوبيخ الآخر أمام بقية أعضاء اللجنة.',
          score: 20,
          critique: 'تدمير للتماسك القيادي وخلق تحزبات وانقسام سام داخل الفريق.'
        },
        {
          id: 'opt-2',
          text: 'تدخل نائب رئيس الفريق فوراً لفرض الصمت، تذكير الاثنين باللائحة الداخلية التي تحدد بوضوح أن التوزيع الميداني للتنظيم والاعتماد والمتابعة للـ HR، وعقد جلسة تصفية نفوس بعد انتهاء اليوم.',
          score: 96,
          critique: 'حسم قيادي عادل، حوكمة باللوائح المعتمدة، وضمان عدم تأثر الميدان بالخلاف ⚖️.'
        },
        {
          id: 'opt-3',
          text: 'ترك الغرفة مفتوحة ليتشاجرا حتى يتوصلا لحل بمفردهما.',
          score: 15,
          critique: 'غياب كامل للقيادة يترك الفعالية بدون توجيه ميداني في أوقات الذروة.'
        }
      ]
    },
    {
      id: 'crisis-16',
      title: 'انفجار كابل شاشة العرض الرئيسية (LED Display) وتعذر تشغيل العرض التقديمي',
      location: 'منصة المسرح الرئيسي',
      urgency: 'عالية',
      context: 'حدث التماس كهربائي في كابل HDMI للشاشة العملاقة قبل عرض الفيديو الترويجي، وتوقفت الشاشة عن الاستجابة.',
      options: [
        {
          id: 'opt-1',
          text: 'إلغاء الفيديو الترويجي وتخطي الفقرة كاملة.',
          score: 40,
          critique: 'إلغاء فقرة أساسية كلف إنتاجها ساعات طويلة دون محاولة بديلة.'
        },
        {
          id: 'opt-2',
          text: 'استبدال الكابل فوراً بكابل الإسناد الاحتياطي (Backup Cable) من صندوق الطوارئ التقني واستخدام محول لاسلكي (Wireless HDMI Receiver) جاهز مسبقاً خلال دقيقتين.',
          score: 97,
          critique: 'جاهزية تقنية احترافية (Redundancy System) تعيد البث في ثوانٍ ⚡.'
        },
        {
          id: 'opt-3',
          text: 'العبث في لوحة الكهرباء العامة بدون معرفة هندسية.',
          score: 10,
          critique: 'خطر جسيم قد يؤدي لصعق كهربائي أو حريق بالقاعة لا قدر الله.'
        }
      ]
    },
    {
      id: 'crisis-17',
      title: 'طلب مفاجئ من القنوات الإخبارية والصحف لإجراء لقاءات حية ومؤتمر صحفي',
      location: 'المدخل الشرفي لجامعة الإسكندرية',
      urgency: 'متوسطة',
      context: 'وصل مراسلو القنوات الفضائية والصحف الكبرى لتغطية المبادرة، وطلبوا لقاءات حية مع المتطوعين فوراً دون إذن مسبق.',
      options: [
        {
          id: 'opt-1',
          text: 'السماح لأي متطوع بالحديث أمام الكاميرات كيفما يشاء دون توجيه.',
          score: 30,
          critique: 'مخاطرة بصدور تصريحات غير دقيقة أو متناقضة تضر بالصورة الرسمية للاتحاد.'
        },
        {
          id: 'opt-2',
          text: 'توجيه الفريق الإعلامي لاستقبال المراسلين بلباقة في القاعة المخصصة، وتكليف المتحدث الرسمي للاتحاد ورئيس الفريق فقط لإجراء اللقاءات بناءً على نقاط الحديث المعتمدة (Talking Points).',
          score: 98,
          critique: 'انضباط إعلامي واحترافية مؤسسية تعكس هيبة اتحاد طلاب جامعة الإسكندرية 📺.'
        },
        {
          id: 'opt-3',
          text: 'طرد الصحفيين ومنعهم من التصوير نهائياً بدعوى عدم وجود تصريح ورقي.',
          score: 25,
          critique: 'عدائية غير مبررة تخسر الاتحاد تغطية إعلامية إيجابية واسعة لجهود متطوعيه.'
        }
      ]
    },
    {
      id: 'crisis-18',
      title: 'فقدان طفل لأحد الزوار في ساحة المعرض الطلابي واختفاء أسرته وسط الزحام',
      location: 'المعرض الخارجي للأنشطة الطلابية',
      urgency: 'حرجة جداً',
      context: 'وجد متطوع طفلاً يبكي (5 سنوات) تائهاً عن والدته وسط ساحة المعرض المزدحمة بـ 3000 زائر.',
      options: [
        {
          id: 'opt-1',
          text: 'النداء عبر مكبرات الصوت المركزية باسم الطفل وأوصافه وتفاصيل ملابسه علناً.',
          score: 45,
          critique: 'إجراء قد يسبب هلعاً عاماً ويسهل انتحال الصفة، الأفضل نداء الأم للحضور لنقطة الاستعلامات.'
        },
        {
          id: 'opt-2',
          text: 'اصطحاب الطفل فوراً لخيمة الرعاية والاستعلامات وتأمينه بواسطة متطوعتين وتقديم عصير ولعبة له لتهدئته، وإرسال نداء مركزي للأم للحضور لنقطة الاستعلامات والتحقق الصارم من هويتها قبل التسليم.',
          score: 98,
          critique: 'بروتوكول أمني وإنساني متكامل للأطفال المفقودين يضمن السلامة والسرية والهدوء 🧸.'
        },
        {
          id: 'opt-3',
          text: 'ترك الطفل في مكانه بالشارع والبحث عن الأم بمفرده.',
          score: 10,
          critique: 'تعريض حياة الطفل للخطر الشديد في بيئة مزدحمة ومفتوحة.'
        }
      ]
    },
    {
      id: 'crisis-19',
      title: 'نقص في دروع التكريم والميداليات أثناء مراسم التكريم الختامي على الهواء مباشرة',
      location: 'خلف كواليس المسرح الرسمي',
      urgency: 'عالية',
      context: 'أثناء صعود أوائل الكليات للمنصة، اكتشفت لجنة البروتوكول نقص 3 دروع تكريمية مقارنة بعدد المكرمين الذين تصاعدت أسماؤهم في الميكروفون.',
      options: [
        {
          id: 'opt-1',
          text: 'تخطي الأسماء الثلاثة دون تكريمهم على المسرح.',
          score: 15,
          critique: 'إحراج وإهانة بالغة للطلاب المتفوقين وعائلاتهم الحاضرة في القاعة.'
        },
        {
          id: 'opt-2',
          text: 'تسليمهم شهادات التقدير والورود الفاخرة على المسرح مع التقاط الصورة التذكارية مع العميد، وتوجيههم بلباقة خلف الكواليس لإهدائهم الدروع الإضافية وتوصيلها لمنازلهم مع خطاب شكر خاص.',
          score: 95,
          critique: 'إنقاذ للمشهد التكريمي بذكاء دون إشعار الجمهور بأي ارتباك مع حفظ كرامة المكرمين 🎖️.'
        },
        {
          id: 'opt-3',
          text: 'إيقاف الحفل على المسرح والمطالبة بالبحث عن الدروع المفقودة بصوت عالي.',
          score: 25,
          critique: 'إفساد للبهجة الختامية وإظهار عدم الكفاءة التنظيمية أمام الجميع.'
        }
      ]
    },
    {
      id: 'crisis-20',
      title: 'إعلان الأرصاد عن تعطيل الدراسة وسوء الأحوال الجوية لليوم التالي لفعالية ممتدة',
      location: 'غرفة القيادة المركزية',
      urgency: 'عالية',
      context: 'في منتصف اليوم الأول لمؤتمر طلابي يستمر يومين، صدر قرار رسمي من المحافظ ورئيس الجامعة بتعليق الدراسة غداً لسوء الطقس، بينما حجزت الفنادق للضيوف.',
      options: [
        {
          id: 'opt-1',
          text: 'الإصرار على فتح الأبواب غداً وتحدي قرار الجامعة.',
          score: 15,
          critique: 'مخالفة قانونية جسيمة وتعريض حياة الطلاب والضيوف للمخاطر.'
        },
        {
          id: 'opt-2',
          text: 'تفعيل التحول الرقمي الفوري (Virtual Shift): الإعلان السريع عن نقل جلسات اليوم الثاني لتبث عبر منصة Zoom وYouTube الرسمية للاتحاد مع إرسال روابط الجلسات وتأمين إقامة الضيوف وتكريمهم افتراضياً.',
          score: 98,
          critique: 'مرونة رقمية قيادية مذهلة، امتثال للقوانين واستمرار النجاح دون توقف 💻.'
        },
        {
          id: 'opt-3',
          text: 'إلغاء كل شيء وقطع التواصل مع الضيوف والطلاب.',
          score: 20,
          critique: 'إهدار للميزانية وإساءة لسمعة الاتحاد أمام المتحدثين وشركاء النجاح.'
        }
      ]
    }
  ];

  const currentCrisis = crisisScenarios.find(c => c.id === selectedCrisisId) || crisisScenarios[0];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/70 border-purple-500/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/40 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>المساعد الذكي «شربيني» • Sherbini Executive AI Master</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>مركز الذكاء الاصطناعي وصانع السشنات التكتيكية مع «شربيني»</span>
            <Bot className="w-6 h-6 text-purple-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
            تفاعل صوتي ذكي مع شربيني، بناء حقائب وسشنات تدريبية مفصلة، توليد المهام الميدانية، ومحاكاة 20 أزمة قيادية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono">
            {getUserHonorific()}
          </span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap rounded-xl bg-slate-900/80 p-1 border border-slate-800 gap-1 no-print">
        {[
          { id: 'chat', label: '🎙️ المرشد الصوتي الذكي (Voice AI)' },
          { id: 'sessions', label: '📚 صانع السشنات والورش التدريبية الموسعة' },
          { id: 'task-architect', label: '⚡ صانع التكليفات والمهام التكتيكية' },
          { id: 'crisis-sim', label: '🛡️ محاكي الأزمات والسيناريوهات الميدانية' },
          { id: 'motivation', label: '💡 استشارات الدعم النفسي والتحفيز' },
          { id: 'risks', label: '👑 كاشف المخاطر والتعاقب القيادي' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Voice & Text Interactive AI Chat */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 glass-card p-5 flex flex-col justify-between min-h-[580px] border-purple-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-purple-950/20 shadow-2xl">
            
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md">
                    <BrainCircuit className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-2">
                      <span>المرشد التنفيذي الصوتي المباشر</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </h3>
                    <p className="text-[10px] text-purple-300 font-medium">يدعم التحدث بالمايكروفون والاستماع للإجابات بالصوت العربي</p>
                  </div>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold animate-pulse">
                    <Mic className="w-3.5 h-3.5" />
                    <span>جاري الاستماع لصوتك الآن...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {quickPrompts.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(qp)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 text-[11px] font-semibold border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer text-right"
                  >
                    💡 {qp}
                  </button>
                ))}
              </div>

              {/* Chat Message Stream */}
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-black shadow-md ${
                      msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    }`}>
                      {msg.role === 'user' ? 'أنت' : 'AI'}
                    </div>

                    <div className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed whitespace-pre-line shadow-md relative group ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                        <span>{msg.time}</span>
                        {msg.role === 'ai' && speechSynthesisAvailable && (
                          <button
                            onClick={() => speakText(msg.text, idx)}
                            className="flex items-center gap-1 text-purple-300 hover:text-purple-100 font-bold cursor-pointer transition-colors"
                          >
                            {currentlySpeakingIndex === idx ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                                <span className="text-rose-400">إيقاف القراءة</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>استماع للإجابة 🔊</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse p-3 bg-purple-950/20 rounded-xl border border-purple-500/20">
                    <Bot className="w-4 h-4" />
                    <span>جاري صياغة التوجيه القيادي الذكي وتحليل بيانات الفريق...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Bar with Voice Recognition */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }}
              className="flex items-center gap-2 pt-3 border-t border-slate-800"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/40 animate-pulse' 
                    : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/40'
                }`}
                title={isListening ? 'إيقاف التسجيل الصوتي' : 'تحدث بالمايكروفون (Voice In)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input 
                type="text"
                placeholder={isListening ? 'جاري الاستماع... تحدث الآن' : 'اكتب سؤالك أو استشارتك القيادية للمساعد...'}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="glass-input text-xs flex-1"
              />

              <button 
                type="submit"
                disabled={!inputQuery.trim()}
                className="btn-primary text-xs py-2.5 px-4 shrink-0 cursor-pointer shadow-lg shadow-purple-600/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>إرسال</span>
              </button>
            </form>

          </div>

          {/* Quick Leadership Tools Sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-5 border-purple-500/30 bg-purple-950/20">
              <h3 className="text-xs font-black text-white mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>دليل القائد الذكي السريع</span>
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                المرشد الصوتي مدرب خصيصاً على لوائح أنشطة اتحاد طلاب جامعة الإسكندرية وأساليب إدارة فرق العمل الطلابية.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  🎙️ <strong>التحدث الصوتي:</strong> اضغط على علامة المايك للتحدث بالعامية أو الفصحى.
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  🔊 <strong>القراءة الصوتية:</strong> اضغط على "استماع للإجابة" للاستماع للتوجيه بنبرة واضحة.
                </div>
              </div>
            </div>

            {/* Quick Health Summary */}
            <div className="glass-card p-5 border-emerald-500/30 bg-emerald-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-white">صحة الفريق العام</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{teamHealthScore}% 🟢</span>
              </div>
              <p className="text-[11px] text-slate-300">
                محسوب بالمعادلة الموزونة للجان الـ 6 (35% حضور + 35% مهام + 15% أداء + 15% رضا).
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Comprehensive In-Depth Session & Workshop Builder */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span>صانع السشنات والحقائب التدريبية الموسعة (Elite Workshop & Session Builder)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  محتوى أكاديمي وتطبيقي كثيف وشامل يشمل الأهداف الذكية، محاور الشرح، ورش المحاكاة، دليل الأسئلة المحرجة، والتكليفات
                </p>
              </div>

              <button
                onClick={handleGenerateComprehensiveSession}
                disabled={isGeneratingSession}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingSession ? 'جاري بناء الحقيبة الأكاديمية...' : 'توليد السشن التدريبي الشامل بالذكاء الاصطناعي'}</span>
              </button>
            </div>

            {/* Config options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">تصنيف البرنامج</label>
                <select
                  value={selectedSessionCategory}
                  onChange={(e) => {
                    const cat = e.target.value as any;
                    setSelectedSessionCategory(cat);
                    if (cat === 'soft-skills') {
                      setSelectedSessionTopic('القيادة التكتيكية وإدارة الأزمات الميدانية');
                    } else {
                      setSelectedSessionTopic('بروتوكولات إدارة الحشود وتأمين الفعاليات الكبرى والمدرجات');
                    }
                  }}
                  className="input-field text-xs"
                >
                  <option value="soft-skills">🌟 مهارات شخصية وقيادية (Soft Skills)</option>
                  <option value="committee-specialized">🏛️ معسكرات اللجان التخصصية الـ 6</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">موضوع السشن</label>
                <select
                  value={selectedSessionTopic}
                  onChange={(e) => setSelectedSessionTopic(e.target.value)}
                  className="input-field text-xs"
                >
                  {selectedSessionCategory === 'soft-skills' ? (
                    <>
                      <option value="القيادة التكتيكية وإدارة الأزمات الميدانية">👑 القيادة التكتيكية وإدارة الأزمات الميدانية</option>
                      <option value="فن الإلقاء والتحدث الجماهيري والخطابة (Public Speaking)">🎤 فن الإلقاء والتحدث الجماهيري والخطابة (Public Speaking)</option>
                      <option value="إدارة الوقت والموازنة بين التطوع والدراسة">⏱️ إدارة الوقت والموازنة بين التطوع والدراسة</option>
                      <option value="الذكاء العاطفي والتفاوض وحل النزاعات">🤝 الذكاء العاطفي والتفاوض وحل النزاعات</option>
                      <option value="بناء الروح المعنوية وتحفيز فرق العمل">🔥 بناء الروح المعنوية وتحفيز فرق العمل</option>
                    </>
                  ) : (
                    <>
                      <option value="بروتوكولات إدارة الحشود وتأمين الفعاليات الكبرى والمدرجات">🛡️ لجنة التنظيم: إدارة الحشود وتأمين الفعاليات والمدرجات</option>
                      <option value="إدارة التقييم والمقابلات والتحفيز (HR Mastery)">👥 لجنة الموارد البشرية: المقابلات والتقييم 360 والتحفيز</option>
                      <option value="فنون التوثيق الصحفي والإضاءة والريلز السريعة">📷 لجنة التصوير: التوثيق الصحفي والإضاءة السريعة</option>
                      <option value="الهوية البصرية وتصميم البنرات والسوشيال ميديا">🎨 لجنة التصميم: الهوية البصرية والبنرات الرقمية</option>
                      <option value="صناعة الريلز السريعة والمونتاج الديناميكي">🎬 لجنة المونتاج: صناعة الريلز السريعة والتقطيع الإيقاعي</option>
                      <option value="فن كتابة الإعلانات والبيانات الرسمية (Viral Copywriting)">✍️ لجنة صناعة المحتوى: الكتابة الفيروسية والبيانات الصحفية</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الفئة المستهدفة</label>
                <select
                  value={selectedSessionAudience}
                  onChange={(e) => setSelectedSessionAudience(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="جميع لجان المتطوعين الـ 6">🌐 جميع لجان المتطوعين الـ 6</option>
                  <option value="قادة ونواب اللجان فقط">👑 قادة ونواب اللجان فقط (Heads & Vices)</option>
                  <option value="المتطوعون الجدد (Onboarding)">🌱 المتطوعون الجدد (Onboarding)</option>
                  {committees.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generated Comprehensive Session View */}
            {generatedSession ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/95 border border-indigo-500/40 shadow-2xl space-y-8 printable-document">
                
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-black text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/40">
                        حقيبة تدريبية أكاديمية وتطبيقية معتمدة
                      </span>
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30">
                        المستوى: {generatedSession.level}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        ⏱️ {generatedSession.duration}
                      </span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">{generatedSession.topic}</h4>
                    <p className="text-xs text-slate-400 mt-1">الفئة المستهدفة: <strong className="text-slate-200">{generatedSession.targetAudience}</strong></p>
                  </div>

                  <div className="flex items-center gap-2 no-print">
                    <button
                      onClick={handleCopySession}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all shadow"
                    >
                      {copiedSession ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedSession ? 'تم النسخ بنجاح' : 'نسخ النص كاملاً'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
                    >
                      <Printer className="w-4 h-4" />
                      <span>طباعة الخطة (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* Prerequisites & Smart Objectives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h5 className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      <span>الأهداف الإجرائية والتعليمية (SMART Objectives):</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {generatedSession.smartObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h5 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4" />
                      <span>التجهيزات والمتطلبات الفنية للورشة:</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {generatedSession.equipmentRequired.map((eq, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{eq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* In-Depth Detailed Modules */}
                <div className="space-y-4">
                  <h5 className="text-sm font-black text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>المحاور والوحدات التدريبية المفصلة ونقاط الشرح (In-Depth Modules):</span>
                  </h5>

                  <div className="space-y-4">
                    {generatedSession.modules.map((m, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                          <div className="text-xs font-black text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold border border-indigo-500/30">
                              {idx + 1}
                            </span>
                            <span className="text-sm">{m.title}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-500/30 w-fit">
                            ⏱️ {m.time}
                          </span>
                        </div>

                        {/* Core concepts */}
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 mb-1">المفاهيم العلمية والمنهجية:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {m.coreConcepts.map((concept, cIdx) => (
                              <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 text-[11px] border border-slate-800 font-medium">
                                • {concept}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Trainer Talking Points */}
                        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-200 leading-relaxed">
                          <strong className="text-purple-300 block mb-1">🎙️ نقاط التوجيه والشرح للمدرب (Trainer Talking Points):</strong>
                          {m.trainerTalkingPoints}
                        </div>

                        {/* Real-life Alexandria Case Example */}
                        <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/20 text-xs text-slate-200 leading-relaxed">
                          <strong className="text-sky-300 block mb-1">🏛️ دراسة حالة ومثال واقعي من جامعة الإسكندرية:</strong>
                          {m.alexandriaCaseExample}
                        </div>

                        {/* Common Mistakes */}
                        <div>
                          <div className="text-[11px] font-bold text-rose-400 mb-1">⚠️ أخطاء شائعة يجب التنبيه عليها:</div>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {m.commonMistakes.map((mistake, mIdx) => (
                              <li key={mIdx} className="flex items-center gap-1.5 text-rose-200">
                                <span className="text-rose-400">✕</span>
                                <span>{mistake}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Crisis Simulation Workshop */}
                <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Flame className="w-5 h-5" />
                    <h5 className="text-sm font-black text-amber-300">
                      ورشة العمل والتطبيق العملي: {generatedSession.simulationWorkshop.name}
                    </h5>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-slate-200 leading-relaxed">
                    <strong className="text-amber-300 block mb-1">🚨 سيناريو الأزمة الواقعي:</strong>
                    {generatedSession.simulationWorkshop.crisisScenario}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-xs font-black text-slate-300 mb-1.5">👥 توزيع الأدوار على المتدربين:</h6>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {generatedSession.simulationWorkshop.teamRoles.map((role, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-400">▪</span>
                            <span>{role}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h6 className="text-xs font-black text-slate-300 mb-1.5">📋 خطوات التنفيذ الزمني:</h6>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {generatedSession.simulationWorkshop.executionSteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="font-mono text-amber-400 text-[10px] font-bold">{sIdx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-xs text-emerald-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 font-medium">
                    🏆 <strong>معيار النجاح والتفوق في التمرين:</strong> {generatedSession.simulationWorkshop.successCriteria}
                  </div>
                </div>

                {/* Trainer Crisis FAQ */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4" />
                    <span>دليل المدرب لإدارة الأسئلة والمواقف المحرجة (Trainer FAQ & Tough Questions):</span>
                  </h5>

                  <div className="space-y-3">
                    {generatedSession.trainerCrisisFaq.map((faq, fIdx) => (
                      <div key={fIdx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span className="text-rose-400 font-mono">سؤال:</span>
                          <span>{faq.question}</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed pr-8">
                          <strong className="text-emerald-400 font-mono ml-1">الإجابة النموذجية:</strong>
                          {faq.idealAnswer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evaluation Rubric Table */}
                <div>
                  <h5 className="text-xs font-black text-slate-300 mb-2.5 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>مصفوفة تقييم المتدربين (Evaluation Rubric & Scoring Matrix):</span>
                  </h5>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900 text-slate-400">
                        <tr>
                          <th className="p-2.5">معيار التقييم</th>
                          <th className="p-2.5">الوزن النسبي</th>
                          <th className="p-2.5">الوصف ومؤشر الأداء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/60 text-slate-300">
                        {generatedSession.evaluationRubric.map((rub, rIdx) => (
                          <tr key={rIdx}>
                            <td className="p-2.5 font-bold text-white">{rub.criterion}</td>
                            <td className="p-2.5 font-mono text-amber-400 font-bold">{rub.weight}</td>
                            <td className="p-2.5 text-slate-300">{rub.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Post-Session Assignment */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-blue-300 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4" />
                      <span>التكليف والمهمة العملية بعد السشن: {generatedSession.postSessionAssignment.title}</span>
                    </h5>
                    <span className="font-mono text-[10px] text-blue-400 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                      الموعد: {generatedSession.postSessionAssignment.deadline}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{generatedSession.postSessionAssignment.instructions}</p>
                  <div className="text-[11px] text-emerald-400 font-semibold pt-1 border-t border-white/5">
                    المخرج المتوقع: {generatedSession.postSessionAssignment.expectedDeliverable}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">صانع الحقائب التدريبية الأكاديمية والتطبيقية</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  اختر تصنيف السشن والموضوع المطلوب واضغط على الزر أعلاه لتوليد محتوى تدريبي متكامل باللغة العربية مطابق لمعايير اتحاد طلاب جامعة الإسكندرية.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 3: AI Task & Mission Architect */}
      {activeTab === 'task-architect' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border-sky-500/30 bg-gradient-to-br from-sky-950/20 via-slate-900 to-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-sky-400" />
                  <span>صانع التكليفات والمهام التكتيكية الذكي (AI Task & Mission Architect)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  اكتب هدف الفعالية ليقوم الذكاء الاصطناعي بتوليد حزمة مهام مقسمة تلقائياً على اللجان الـ 6 مع النقاط والمهام الفرعية
                </p>
              </div>

              <button
                onClick={handleGenerateTaskPackage}
                disabled={isGeneratingTasks || !taskArchitectGoal.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingTasks ? 'جاري بناء التكليفات...' : 'توليد حزمة المهام للجان الـ 6'}</span>
              </button>
            </div>

            {/* Input goal */}
            <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                عنوان وهدف الفعالية / التكليف العام للاتحاد:
              </label>
              <input
                type="text"
                value={taskArchitectGoal}
                onChange={(e) => setTaskArchitectGoal(e.target.value)}
                placeholder="مثال: تنظيم المؤتمر السنوي للتوظيف بمشاركة 40 شركة و 3000 طالب..."
                className="input-field text-xs"
              />
            </div>

            {/* Generated Task Package */}
            {generatedTaskPackage && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 font-bold">حزمة المهام المولدة لـ:</span>
                    <h4 className="text-base font-black text-white">{generatedTaskPackage.eventGoal}</h4>
                  </div>

                  {canManageAll && (
                    <button
                      onClick={handleApplyAITasks}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد وإسناد كافة المهام للجان الآن 🚀</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedTaskPackage.tasks.map((taskItem, tIdx) => (
                    <div key={tIdx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-sky-500/40 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                            {taskItem.committeeName}
                          </span>
                          <h5 className="text-xs font-black text-white mt-1 leading-snug">{taskItem.taskTitle}</h5>
                        </div>
                        <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                          +{taskItem.xpReward} XP
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {taskItem.description}
                      </p>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-1">المهام الفرعية التنفيذية:</div>
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {taskItem.subtasks.map((st, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-sky-400 font-bold">✓</span>
                              <span className="truncate">{st}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400">
                        <strong>معيار التقييم:</strong> {taskItem.evaluationCriteria}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Leadership Crisis Simulator */}
      {activeTab === 'crisis-sim' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>محاكي الأزمات والسيناريوهات الميدانية (Leadership Crisis Simulator)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  اختبر مهاراتك القيادية وسرعة اتخاذ القرار في مواقف ميدانية محرجة مع تقييم فوري وتوجيهات تكتيكية
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">اختر السيناريو:</span>
                <select
                  value={selectedCrisisId}
                  onChange={(e) => {
                    setSelectedCrisisId(e.target.value);
                    setUserSelectedOptionId(null);
                  }}
                  className="input-field text-xs py-1.5"
                >
                  {crisisScenarios.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Crisis Details Card */}
            <div className="p-6 rounded-2xl bg-slate-950/90 border border-rose-500/30 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                      🚨 {currentCrisis.urgency}
                    </span>
                    <span className="text-xs text-slate-400">📍 {currentCrisis.location}</span>
                  </div>
                  <h4 className="text-lg font-black text-white">{currentCrisis.title}</h4>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-slate-200 leading-relaxed font-medium">
                <strong className="text-rose-300 block mb-1">📋 سياق الموقف والمأزق الميداني:</strong>
                {currentCrisis.context}
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-black text-white">ما هو قرارك القيادي الفوري لحل هذا الموقف؟</h5>

                <div className="space-y-2.5">
                  {currentCrisis.options.map(option => (
                    <div
                      key={option.id}
                      onClick={() => setUserSelectedOptionId(option.id)}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                        userSelectedOptionId === option.id
                          ? option.score >= 80 
                            ? 'bg-emerald-950/50 border-emerald-500 shadow-lg' 
                            : 'bg-rose-950/50 border-rose-500 shadow-lg'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-semibold text-slate-200 leading-relaxed">{option.text}</div>
                        {userSelectedOptionId === option.id && (
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-black shrink-0 ${
                            option.score >= 80 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {option.score}/100 نقطة
                          </span>
                        )}
                      </div>

                      {userSelectedOptionId === option.id && (
                        <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-300 leading-relaxed">
                          <strong className={option.score >= 80 ? 'text-emerald-400' : 'text-rose-400'}>
                            تقييم المرشد القيادي:
                          </strong> {option.critique}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: Volunteer Motivation & Psychological Advice Suite */}
      {activeTab === 'motivation' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Top Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xl shadow-lg">
                🧠
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>عيادة الدعم النفسي والتحفيز القيادي مع «شربيني»</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Sherbini Mental Wellness & Drive
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  أدوات علمية موجهة لمعالجة الاحتراق النفسي، توازن الدراسة والنشاط، متلازمة المحتال، وإعادة شحن الروح المعنوية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                💚 الرعاية النفسية أولوية قيادية
              </span>
            </div>
          </div>

          {/* Core Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Burnout Protocol */}
            <div className="glass-card p-6 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-400" />
                <span>1. بروتوكول علاج وتشخيص الاحتراق التطوعي (Burnout Recovery)</span>
              </h3>
              
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-emerald-300 block">🔍 علامات الإنذار المبكر الـ 4:</span>
                <p>• النفور المفاجئ وتأجيل الرد على جروبات الواتساب والتكليفات.</p>
                <p>• الشعور بأن المجهود المبذول غير مقدر أو لا يحدث فارقاً حقيقياً.</p>
                <p>• سرعة الانفعال والتحسس الزائد من أي ملاحظات أو تعديلات فنية.</p>
                <p>• الإرهاق البدني المستمر وقلة ساعات النوم بسبب ضغط الفعاليات.</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h4 className="font-bold text-white mb-1">خطة التعافي السريع في 72 ساعة (72-Hour Reset):</h4>
                  <p className="text-slate-400 leading-relaxed">
                    1. <strong>تجميد المهام فوراً:</strong> إعفاء العضو من أي تكليف تنفيذي لمدة 3 أيام دون خصم نقاط أو لوم.<br/>
                    2. <strong>جلسة تفريغ آمنة (1-on-1):</strong> لقاء ودي مع مسؤول الـ HR أو مستشار الفريق للاستماع فقط بدون إصدار أحكام.<br/>
                    3. <strong>إعادة الدمج بمهام خفيفة:</strong> تكليفه بمهمة إبداعية مرنة تمنحه شعوراً بالإنجاز الفوري.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Academic vs Activity Equilibrium */}
            <div className="glass-card p-6 border-sky-500/30 bg-gradient-to-br from-sky-950/20 via-slate-900 to-slate-900 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-sky-400" />
                <span>2. معادلة التوازن الأكاديمي والنشاط الطلابي (Academic Equilibrium)</span>
              </h3>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-sky-500/20 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-sky-300 block">📐 نظام الكتل الزمنية (Time-Blocking Matrix):</span>
                <p>• <strong>كتلة التركيز الأكاديمي (60%):</strong> 3 ساعات يومياً دون فتح تطبيقات الاتحاد أو الرد على الرسائل.</p>
                <p>• <strong>كتلة النشاط الطلابي (25%):</strong> ساعة ونصف محددة مساءً لتنفيذ المهام والتواصل الميداني.</p>
                <p>• <strong>كتلة الشحن الذاتي (15%):</strong> راحة كاملة، رياضة، ونوم صحي لا يقل عن 7 ساعات.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <h4 className="font-bold text-white mb-1">وضع طوارئ الامتحانات (Exam Freeze Mode):</h4>
                <p className="text-slate-400 leading-relaxed">
                  يُفعل رسمياً قبل امتحانات الميدتيرم والفاينال بأسبوعين، حيث تُخفض متطلبات المهام بنسبة 70%، وتتحول اجتماعات اللجان لتسجيلات صوتية مختصرة لا تتجاوز 5 دقائق.
                </p>
              </div>
            </div>

            {/* 3. Imposter Syndrome in Leadership */}
            <div className="glass-card p-6 border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-900 to-slate-900 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>3. علاج متلازمة المحتال للقيادات الشابة (Imposter Syndrome)</span>
              </h3>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-purple-300 block">💭 الفكرة السلبية الشائعة:</span>
                <p className="italic">"أنا أصبحت رئيس لجنة بالصدفة.. سيكتشف الجميع قريباً أنني لست كفؤاً بما يكفي للقيادة!"</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white">العلاج القيادي العملي مع شربيني:</h4>
                  <p className="text-slate-400">• <strong>سجل الانتصارات اليومية (Wins Ledger):</strong> دوّن نجاحاً صغيراً واحداً أنجزته لجنتك يومياً.</p>
                  <p className="text-slate-400">• <strong>القيادة التشاركية:</strong> لست مطالباً بمعرفة كل شيء! قوة القائد الحقيقي تكمن في تمكين أعضاء فريقه والاستفادة من مهاراتهم.</p>
                  <p className="text-slate-400">• <strong>الخطأ هو أسرع طريق للتعلم:</strong> الفشل في تفصيلة صغيرة أثناء تنظيم فعالية يصنع منك خبيراً للمواسم القادمة.</p>
                </div>
              </div>
            </div>

            {/* 4. Tactical Mindfulness & Box Breathing */}
            <div className="glass-card p-6 border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-amber-400" />
                <span>4. تمرين التنفس التكتيكي لتهدئة التوتر في 3 دقائق (Box Breathing)</span>
              </h3>

              <p className="text-xs text-slate-300">
                يستخدمه قادة العمليات والمتحدثون لخفض نبضات القلب والسيطرة الفورية على التوتر قبل الصعود للمسرح أو أثناء الأزمات:
              </p>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                  <span className="text-lg font-mono font-black text-amber-400 block mb-1">4 ثوانٍ</span>
                  <span className="font-bold text-white text-[11px]">شهيق عميق</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">من الأنف ببطء</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                  <span className="text-lg font-mono font-black text-amber-400 block mb-1">4 ثوانٍ</span>
                  <span className="font-bold text-white text-[11px]">حبس النفس</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">ثبات واسترخاء</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                  <span className="text-lg font-mono font-black text-amber-400 block mb-1">4 ثوانٍ</span>
                  <span className="font-bold text-white text-[11px]">زفير هادئ</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">تفريغ كل الهواء</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                  <span className="text-lg font-mono font-black text-amber-400 block mb-1">4 ثوانٍ</span>
                  <span className="font-bold text-white text-[11px]">راحة وسكون</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">تكرار 4 مرات</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200">
                💡 <strong>نصيحة شربيني:</strong> كرر هذا التمرين لـ 4 دورات متتالية لتشعر بانخفاض فوري في هرمون الكورتيزول واستعادة التركيز الذهني الكامل.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 6: Risks & Succession */}
      {activeTab === 'risks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Detector */}
          <div className="glass-card p-5 border-rose-500/30 bg-rose-950/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-black text-white">كاشف مخاطر انسحاب الأعضاء (Risk Detection)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                {highRiskMembers.length} تنبيه
              </span>
            </div>

            <div className="space-y-3">
              {highRiskMembers.map(m => (
                <div key={m.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{m.fullName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                      {m.engagementRisk} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{m.currentCommitteeName} • نسبة الحضور {m.performance.attendanceRate}% • الكلية: {m.college}</p>
                  <div className="text-[11px] text-rose-300 bg-rose-950/50 p-2 rounded-lg border border-rose-500/20 font-medium">
                    💡 التوصية الذكية: جلسة استماع ومتابعة من لجنة HR لتنسيق جدول المهام.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Succession Planning */}
          <div className="glass-card p-5 border-amber-500/30 bg-amber-950/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">خطة التعاقب القيادي للموسم القادم (Succession 2027/2028)</h3>
              </div>
              <span className="text-xs text-amber-300 font-bold">قادة المستقبل</span>
            </div>

            <div className="space-y-3">
              {successionCandidates.map(({ member, leadershipScore, recommendedRole }) => (
                <div key={member.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={member.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shadow" />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">{member.fullName}</div>
                      <div className="text-xs text-amber-400 font-semibold">{recommendedRole}</div>
                      <div className="text-[10px] text-slate-400">{member.college}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-amber-400 font-mono">{leadershipScore}%</div>
                    <div className="text-[10px] text-slate-400 font-medium">كفاءة قيادية</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
