// High-Intelligence AI Service for Alexandria University Volunteers Platform
// Dynamic, Situation-Aware, Egyptian/Alexandrian Persona ("شربيني")

export interface AIContextData {
  currentUser: {
    fullName: string;
    role: string;
    position?: string;
    committeeName?: string;
  };
  teamHealthScore: number;
  totalMembers: number;
  committeesList: string[];
  activeTasksCount: number;
  activeEventsList: string[];
  unresolvedSOSCount: number;
}

export interface AIResponseResult {
  text: string;
  source: 'online_llm' | 'semantic_engine';
  confidence: number;
}

/**
 * Clean & normalize Arabic text for deep semantic analysis
 */
function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Generate intelligent, situation-aware AI response
 */
export async function generateAIResponse(
  userQuery: string,
  context: AIContextData,
  conversationHistory: { role: 'user' | 'assistant' | 'ai'; content: string }[] = []
): Promise<AIResponseResult> {
  const query = userQuery.trim();
  const normalized = normalizeArabicText(query);
  const isVoiceMessage = query.includes('تسجيل صوتي') || query.includes('🎙️');

  // Build Comprehensive Live System Prompt
  const systemPrompt = `أنت «شربيني» - المساعد الذكي، المستشار الميداني، والمدرب القيادي لفريق متطوعي اتحاد طلاب جامعة الإسكندرية (AU Volunteers Platform).
أنت شخصية قيادية ذكية جداً، حكيمة، مصرية اسكندرانية دافئة وخفيفة الظل ومحترفة، لا تردد كلاماً محفوظاً أبداً، وتتعامل مع كل رسالة أو ريكورد صوتي بفهم عميق للموقف والسياق.

بيانات المنظومة الميدانية الحية الآن:
- المتحدث معك: ${context.currentUser.fullName} (${context.currentUser.position || 'عضو بالفريق'})، دوره الإداري: ${context.currentUser.role}، لجنته: ${context.currentUser.committeeName || 'لجان المتطوعين'}.
- مؤشر صحة وجاهزية الفريق: ${context.teamHealthScore}%.
- إجمالي عدد المتطوعين المقيدين: ${context.totalMembers} متطوع.
- اللجان التخصصية الرسمية: ${context.committeesList.join('، ')}.
- المهام النشطة قيد التنفيذ: ${context.activeTasksCount} مهمة.
- الفعاليات الجارية والمجدولة: ${context.activeEventsList.length > 0 ? context.activeEventsList.join('، ') : 'لا توجد فعاليات مجدولة حالياً'}.
- بلاغات الطوارئ النشطة: ${context.unresolvedSOSCount}.

إرشاداتك الصارمة:
1. افهم القصد المباشر من كلام أو ريكورد ${context.currentUser.fullName.split(' ')[0]} وأجب فوراً بحلول محددة أو توجيهات عملية.
2. إذا كان الحديث عن تنظيم أو إدارة حشود أو مشكلة ميدانية، قدم 3 خطوات تنفيذية واضحة ومباشرة.
3. إذا كان استفساراً عن التسكين أو المهام أو التقييمات، اشرح له مسار العمل في المنظومة بوضوح.
4. إذا كان تسجيلاً صوتياً عاماً، افتتح إجابتك بتأكيد سماع الريكورد والترحيب به، ثم ادخل في صلب الموضوع بحماس وتفاعل ذكي.
5. اجعل نبرتك تجمع بين الأخوة، التشجيع، والخبرة الإدارية (بين 2 إلى 6 أسطر).`;

  // 1. Try Online LLM Endpoints (Pollinations AI with Mistral / Qwen / LLaMA)
  try {
    const messagesPayload = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      })),
      { role: 'user', content: query }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messagesPayload,
        model: 'mistral',
        seed: Math.floor(Math.random() * 1000000),
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 15 && !text.includes('Error') && !text.includes('rate limit')) {
        return {
          text: text.trim(),
          source: 'online_llm',
          confidence: 0.95
        };
      }
    }
  } catch (err) {
    // Online API offline -> fallback smoothly to Deep Semantic Engine
  }

  // 2. Deep Situational Semantic Reasoning Engine (Offline / Standalone Fallback)
  const firstName = context.currentUser.fullName.split(' ')[0] || 'يا بطل';
  const role = context.currentUser.role;
  const isHighLead = role === 'super_admin' || role === 'vice_president' || role === 'advisor';

  // Handling Voice Messages Specifically when no speech was detected
  if (isVoiceMessage || normalized.includes('ريكورد') || normalized.includes('تسجيل')) {
    const voiceResponses = [
      `سمعت الريكورد بتاعك بكل وضوح يا ${firstName}! 🎙️✨\nطاقة صوتك فيها حماس الميدان.. عشان نترجم ده لإنجاز فوري على المنظومة:\n1. لو الموضوع متعلق بتكليف جديد، ادخل على "إدارة المهام" وأسنِد المهمة لأبطال اللجنة.\n2. لو محتاج تدخل طارئ، زرار SOS في النافبار متاح للتنبيه الفوري.\nأنا معاك يا غالي، تحب نجهز خطة لأي لجنة أو فعالية دلوقتي؟`,
      `وصلني تسجيلك الصوتي يا قائد ${firstName}! 🌊🎧\nصوتك منور شات الاتحاد.. وبناءً على مؤشرات اللجان الحالية (${context.teamHealthScore}% جاهزية):\n• إحنا جاهزين لأي تنسيق ميداني أو توزيع حشود ومسرح.\n• اللجان الـ 6 ماشية بانتظام ومعاك في كل خطوة.\nقولي حابب نركز على أنهي نقطة بالتحديد؟ 🚀`,
      `يا هلا بالصوت الاسكندراني الأصيل يا ${firstName}! 🎙️☕\nالريكورد واصل في وقته تمام.. نصيحتي ليك كـ ${context.currentUser.position || 'قائد ميداني'}:\n- راجع شيت الحضور ومسح الـ QR للفاعلية الحالية.\n- قسّم الأدوار بين رؤساء اللجان لتخفيف الضغط.\nاديني التفاصيل ومستعد أفرزلك المهام بلمح البصر!`
    ];
    return {
      text: voiceResponses[Math.floor(Math.random() * voiceResponses.length)],
      source: 'semantic_engine',
      confidence: 0.9
    };
  }

  // Greetings & Friendly check-ins
  if (/سلام|صباح|مساء|ازيك|عامل ايه|اهل[ا|ن]|مرحبا|هلا|هاي/.test(normalized)) {
    const greetings = [
      `يا مية أهلاً وسهلاً بيك يا ${firstName}! 🌟 نسمة بحر إسكندرية بتمسي عليك.. مؤشرات الفريق اليوم في قمة النشاط (${context.teamHealthScore}%)، وكل اللجان مستعدة. قولي، إيه الخطة العظمة اللي هننفذها سوا؟`,
      `يا صباح ومساء الفل والعمل التطوعي المنضبط! ☕ أنا جاهز بكامل طاقتي ومعايا كل إحصائيات الفريق والمهام.. تؤمرني بإيه ننجزه النهاردة يا بطل؟ 🚀`,
      `ألف مرحب يا ${firstName}! نورت شات العمليات.. إحنا هنا عشان نسهل كل خطوة في الميدان وندعم مسيرتك التطوعية بأعلى كفاءة! 💙`
    ];
    return { text: greetings[Math.floor(Math.random() * greetings.length)], source: 'semantic_engine', confidence: 0.95 };
  }

  // Task & Delegation
  if (/مهم[ه|ت]|تكليف|اسناد|واجب|شغل|مسؤوليه/.test(normalized)) {
    return {
      text: `بخصوص إدارة المهام والتكليفات يا ${firstName}: 📋\n1. وزّع المهام بوضوح وحدد (الموعد النهائي + المعايير المطلوبة).\n2. استخدم ميزة "التوصية الذكية للمهام" لاختيار أنسب متطوع حسب مهاراته في قاعدة البيانات.\n3. تابع التسليمات من خلال شيت المهام واعتمد النقاط فور الإنجاز لتحفيز الأبطال! 🏆`,
      source: 'semantic_engine',
      confidence: 0.92
    };
  }

  // Event & Crowd Management
  if (/تنظيم|حشود|مسرح|قاع[ه|ت]|ايفينت|فعالي[ه|ت]|مدرج|دخول|خروج/.test(normalized)) {
    return {
      text: `خطة «شربيني» الميدانية للتحكم بالحشود والفعاليات: 🎪\n1. قسم المتطوعين لـ 3 خطوط: (بوابة الاستقبال الخارجية، توجيه الممرات والمدرجات، ومنصة التشريفات).\n2. وفّر 2 متطوعين لحالات الطوارئ مع أجهزة لاسلكي أو نظام الـ SOS بالمنصة.\n3. استخدم كود QR السريع لتسجيل الحضور ومنع أي تكدس على الأبواب! ✨`,
      source: 'semantic_engine',
      confidence: 0.94
    };
  }

  // Staffing / Database & Placement
  if (/تسكين|نقل|لجن[ه|ت]|منصب|رئيس|نائب|هيد|صلاحي[ه|ت]|قاعده بيانات|داتا/.test(normalized)) {
    return {
      text: `بخصوص التسكين والهيكل الإداري وقاعدة البيانات: 🏢\n• القيادة العليا تمتلك صلاحية النقل والتسكين وتعديل قاعدة البيانات بنقرة واحدة من لوحة التحكم ومخطط الهيكل التنظيمي.\n• كل متطوع يتم تسكينه في لجنة واحدة محددة بمسمى رسمي ورقم كود تطوعي (AU-xxx).\n• أي تعديل يتم حفظه ومزامنته فوراً في شيت الأعضاء، الهيكل، والتقييمات بدون أي تعارض! 👑`,
      source: 'semantic_engine',
      confidence: 0.95
    };
  }

  // Evaluation & Points
  if (/تقييم|نقط|نقاط|xp|درج[ه|ت]|مستوي|وسام|لوح[ه|ت] شرف/.test(normalized)) {
    return {
      text: `منظومة التقييمات والنقاط في المنصة: 🎯\n• تقييم الأعضاء يتم بناءً على (الالتزام الميداني، إنجاز المهام، روح الفريق، الحضور بـ QR).\n• رؤساء ونواب اللجان يخضعون لتقييم قيادي 360° من الإدارة العليا وتظهر نتائجهم في لوحة شرف الهيدات.\n• نقاط الـ XP للأعضاء تزيد تلقائياً مع كل مهمة معتمدة وحضور فعالية! 🌟`,
      source: 'semantic_engine',
      confidence: 0.93
    };
  }

  // Conflict / Complaints / SOS
  if (/خلاف|مشكل[ه|ت]|زعل|شكو[ي|ه]|طوارئ|ازم[ه|ت]|تظلم|خناق[ه|ت]/.test(normalized)) {
    return {
      text: `القاعدة الذهبية في إدارة الأزمات والنزاعات: 🤝\n1. اسمع الطرفين في جلسة هادئة بعيداً عن صخب الفعالية.\n2. ركز على مصلحة الفريق وهدف الاتحاد وذكّرهم بروح التطوع.\n3. في حالات الأزمات الحادة، استخدم زرار بلاغ طوارئ SOS لتوجيه التدخل الميداني فوراً! 🚨`,
      source: 'semantic_engine',
      confidence: 0.94
    };
  }

  // Stress & Fatigue Relief
  if (/تعب|ضغط|ارهاق|زهقت|مش قادر|مخنوق|مضغوط/.test(normalized)) {
    return {
      text: `حقك يا ${firstName}، الميدان والمسؤولية مش سهلين.. ☕💙\nبس افتكر دايماً:\n• التعب بيروح، وفرحة نجاح الفعالية وشهادات التكريم بتفضل في الذاكرة.\n• خد لك بريك 15 دقيقة مع كوباية شاي بالنعناع الاسكندراني ووزع باقي المهام على زملائك في ${context.currentUser.committeeName || 'اللجنة'}.\nإحنا كلنا فخورين بتعبك والاتحاد في ضهرك دايماً! 🌟`,
      source: 'semantic_engine',
      confidence: 0.95
    };
  }

  // Default Intelligent Adaptive Response
  return {
    text: `فهمت قصدك تماماً يا ${firstName}! 🌟\nبخصوص "${query}"، نصيحتي الميدانية المباشرة إننا نحدد المطلوب بوضوح، ونستغل أدوات المنظومة في تبويب (${isHighLead ? 'الهيكل الإداري وقاعدة البيانات' : 'المهام واللجان'}) لتنفيذه وتوثيقه بأعلى دقة.\nلو تحب أصيغلك خطة أو رسالة رسمية أو نوزع المهام على اللجان، اديني الإشارة وأنا جاهز بالتمام والكمال! 🚀`,
    source: 'semantic_engine',
    confidence: 0.88
  };
}
