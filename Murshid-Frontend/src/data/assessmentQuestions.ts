/**
 * Assessment Questions for Major Recommendation System
 * These questions help AI understand student's interests, skills, and preferences
 */

export interface AssessmentQuestion {
  id: string;
  category: 'interests' | 'skills' | 'preferences' | 'personality';
  questionEn: string;
  questionAr: string;
  type: 'multiple-choice' | 'scale' | 'text';
  options?: {
    valueEn: string;
    valueAr: string;
    score?: number;
  }[];
  scaleLabels?: {
    min: { en: string; ar: string };
    max: { en: string; ar: string };
  };
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // === INTERESTS SECTION ===
  {
    id: 'int-1',
    category: 'interests',
    questionEn: 'Which of these subjects interests you the most?',
    questionAr: 'أي من هذه المواد يثير اهتمامك أكثر؟',
    type: 'multiple-choice',
    options: [
      { valueEn: 'Mathematics and Logic', valueAr: 'الرياضيات والمنطق' },
      { valueEn: 'Science and Research', valueAr: 'العلوم والبحث' },
      { valueEn: 'Technology and Programming', valueAr: 'التكنولوجيا والبرمجة' },
      { valueEn: 'Arts and Design', valueAr: 'الفنون والتصميم' },
      { valueEn: 'Business and Economics', valueAr: 'الأعمال والاقتصاد' },
      { valueEn: 'Healthcare and Medicine', valueAr: 'الرعاية الصحية والطب' },
      { valueEn: 'Social Sciences and Psychology', valueAr: 'العلوم الاجتماعية وعلم النفس' },
      { valueEn: 'Languages and Communication', valueAr: 'اللغات والتواصل' },
    ],
  },
  {
    id: 'int-2',
    category: 'interests',
    questionEn: 'What type of activities do you enjoy in your free time?',
    questionAr: 'ما نوع الأنشطة التي تستمتع بها في وقت فراغك؟',
    type: 'multiple-choice',
    options: [
      { valueEn: 'Solving puzzles and brain teasers', valueAr: 'حل الألغاز والألعاب الذهنية' },
      { valueEn: 'Creating art or music', valueAr: 'الاعمال الفنية او الموسيقية' },
      { valueEn: 'Building or fixing things', valueAr: 'بناء أو إصلاح الأشياء' },
      { valueEn: 'Reading and learning new things', valueAr: 'القراءة وتعلم أشياء جديدة' },
      { valueEn: 'Socializing and helping others', valueAr: 'التواصل الاجتماعي ومساعدة الآخرين' },
      { valueEn: 'Playing strategy games', valueAr: 'لعب ألعاب الاستراتيجية' },
      { valueEn: 'Writing or blogging', valueAr: 'الكتابة أو التدوين' },
      { valueEn: 'Sports and physical activities', valueAr: 'الرياضة والأنشطة البدنية' },
    ],
  },
  {
    id: 'int-3',
    category: 'interests',
    questionEn: 'Which career field sounds most appealing to you?',
    questionAr: 'أي مجال مهني يبدو الأكثر جاذبية بالنسبة لك؟',
    type: 'multiple-choice',
    options: [
      { valueEn: 'Technology and Innovation', valueAr: 'التكنولوجيا والابتكار' },
      { valueEn: 'Healthcare and Medicine', valueAr: 'الرعاية الصحية والطب' },
      { valueEn: 'Business and Entrepreneurship', valueAr: 'الأعمال وريادة الأعمال' },
      { valueEn: 'Education and Training', valueAr: 'التعليم والتدريب' },
      { valueEn: 'Engineering and Construction', valueAr: 'الهندسة والبناء' },
      { valueEn: 'Creative Arts and Media', valueAr: 'الفنون الإبداعية والإعلام' },
      { valueEn: 'Law and Justice', valueAr: 'القانون والعدالة' },
      { valueEn: 'Environmental and Agricultural Sciences', valueAr: 'العلوم البيئية والزراعية' },
    ],
  },
  {
    id: 'int-4',
    category: 'interests',
    questionEn: 'What motivates you the most when thinking about your future career?',
    questionAr: 'ما الذي يحفزك أكثر عند التفكير في مسيرتك المهنية المستقبلية؟',
    type: 'multiple-choice',
    options: [
      { valueEn: 'Making a positive impact on society', valueAr: 'إحداث تأثير إيجابي على المجتمع' },
      { valueEn: 'Financial stability and high salary', valueAr: 'الاستقرار المالي والراتب العالي' },
      { valueEn: 'Creative expression and innovation', valueAr: 'التعبير الإبداعي والابتكار' },
      { valueEn: 'Solving complex problems', valueAr: 'حل المشكلات المعقدة' },
      { valueEn: 'Helping and caring for others', valueAr: 'مساعدة ورعاية الآخرين' },
      { valueEn: 'Building and creating things', valueAr: 'بناء وإنشاء الأشياء' },
      { valueEn: 'Leadership and management', valueAr: 'القيادة والإدارة' },
      { valueEn: 'Research and discovery', valueAr: 'البحث والاكتشاف' },
    ],
  },

  // === SKILLS SECTION ===
  {
    id: 'skill-1',
    category: 'skills',
    questionEn: 'How would you rate your mathematical and analytical skills?',
    questionAr: 'كيف تقيم مهاراتك في الرياضيات والتحليل؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Weak', ar: 'ضعيف' },
      max: { en: 'Excellent', ar: 'ممتاز' },
    },
  },
  {
    id: 'skill-2',
    category: 'skills',
    questionEn: 'How comfortable are you with technology and computers?',
    questionAr: 'ما مدى ارتياحك للتكنولوجيا والحواسيب؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Not comfortable', ar: 'غير مرتاح' },
      max: { en: 'Very comfortable', ar: 'مرتاح جداً' },
    },
  },
  {
    id: 'skill-3',
    category: 'skills',
    questionEn: 'How would you rate your communication and interpersonal skills?',
    questionAr: 'كيف تقيم مهارات التواصل والتعامل مع الآخرين لديك؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Need improvement', ar: 'بحاجة للتحسين' },
      max: { en: 'Excellent', ar: 'ممتازة' },
    },
  },
  {
    id: 'skill-4',
    category: 'skills',
    questionEn: 'How creative are you when it comes to solving problems or making things?',
    questionAr: 'ما مدى إبداعك في حل المشكلات أو صنع الأشياء؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Not very creative', ar: 'لست مبدعاً جداً' },
      max: { en: 'Very creative', ar: 'مبدع جداً' },
    },
  },
  {
    id: 'skill-5',
    category: 'skills',
    questionEn: 'Which skills do you think are your strongest? (Choose your top strength)',
    questionAr: 'ما هي المهارات التي تعتقد أنها الأقوى لديك؟ (اختر أقوى مهاراتك)',
    type: 'multiple-choice',
    options: [
      { valueEn: 'Problem-solving and critical thinking', valueAr: 'حل المشكلات والتفكير النقدي' },
      { valueEn: 'Creativity and artistic ability', valueAr: 'الإبداع والقدرة الفنية' },
      { valueEn: 'Leadership and teamwork', valueAr: 'القيادة والعمل الجماعي' },
      { valueEn: 'Technical and hands-on skills', valueAr: 'المهارات التقنية والعملية' },
      { valueEn: 'Writing and communication', valueAr: 'الكتابة والتواصل' },
      { valueEn: 'Attention to detail and organization', valueAr: 'الاهتمام بالتفاصيل والتنظيم' },
      { valueEn: 'Empathy and helping others', valueAr: 'التعاطف ومساعدة الآخرين' },
      { valueEn: 'Research and analysis', valueAr: 'البحث والتحليل' },
    ],
  },

  // === PREFERENCES SECTION ===
  {
    id: 'pref-1',
    category: 'preferences',
    questionEn: 'What kind of work environment do you prefer?',
    questionAr: 'ما نوع بيئة العمل التي تفضلها؟',
    type: 'multiple-choice',
    options: [
      { valueEn: 'Office environment with a team', valueAr: 'بيئة مكتبية مع فريق' },
      { valueEn: 'Laboratory or research setting', valueAr: 'مختبر أو بيئة بحثية' },
      { valueEn: 'Creative studio or workshop', valueAr: 'استوديو إبداعي أو ورشة عمل' },
      { valueEn: 'Hospital or clinical setting', valueAr: 'مستشفى أو بيئة سريرية' },
      { valueEn: 'Outdoor or fieldwork', valueAr: 'عمل خارجي أو ميداني' },
      { valueEn: 'Remote/flexible work from anywhere', valueAr: 'عمل عن بعد/مرن من أي مكان' },
      { valueEn: 'Industrial or manufacturing site', valueAr: 'موقع صناعي أو تصنيعي' },
      { valueEn: 'Educational institution', valueAr: 'مؤسسة تعليمية' },
    ],
  },
  {
    id: 'pref-2',
    category: 'preferences',
    questionEn: 'Do you prefer working with people, data, or things?',
    questionAr: 'هل تفضل العمل مع الناس أم البيانات أم الأدوات؟',
    type: 'multiple-choice',
    options: [
      { valueEn: 'Working with people (teaching, counseling, managing)', valueAr: 'العمل مع الناس (التدريس، الاستشارة، الإدارة)' },
      { valueEn: 'Working with data (research, analysis, programming)', valueAr: 'العمل مع البيانات (البحث، التحليل، البرمجة)' },
      { valueEn: 'Working with things (building, designing, repairing)', valueAr: 'العمل مع الأدوات (البناء، التصميم، الإصلاح)' },
      { valueEn: 'A mix of all three', valueAr: 'مزيج من الثلاثة' },
    ],
  },
  {
    id: 'pref-3',
    category: 'preferences',
    questionEn: 'How do you feel about working with hands-on practical tasks?',
    questionAr: 'كيف تشعر حيال العمل بمهام عملية يدوية؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Prefer theoretical work', ar: 'أفضل العمل النظري' },
      max: { en: 'Love hands-on work', ar: 'أحب العمل العملي' },
    },
  },
  {
    id: 'pref-4',
    category: 'preferences',
    questionEn: 'Would you prefer a structured routine or variety and unpredictability?',
    questionAr: 'هل تفضل روتيناً منظماً أم التنوع وعدم القدرة على التنبؤ؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Structured routine', ar: 'روتين منظم' },
      max: { en: 'Variety and change', ar: 'التنوع والتغيير' },
    },
  },

  // === PERSONALITY SECTION ===
  {
    id: 'pers-1',
    category: 'personality',
    questionEn: 'Are you more of an introvert (prefer working alone) or extrovert (energized by social interaction)?',
    questionAr: 'هل أنت أكثر انطوائية (تفضل العمل بمفردك) أم انفتاحية (تستمد الطاقة من التفاعل الاجتماعي)؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Introvert', ar: 'انطوائي' },
      max: { en: 'Extrovert', ar: 'منفتح' },
    },
  },
  {
    id: 'pers-2',
    category: 'personality',
    questionEn: 'How do you approach challenges and problems?',
    questionAr: 'كيف تتعامل مع التحديات والمشاكل؟',
    type: 'multiple-choice',
    options: [
      { valueEn: 'Analyze logically and systematically', valueAr: 'أحلل بشكل منطقي ومنهجي' },
      { valueEn: 'Think creatively and outside the box', valueAr: 'أفكر بشكل إبداعي وخارج الصندوق' },
      { valueEn: 'Seek advice and collaborate with others', valueAr: 'أطلب النصيحة وأتعاون مع الآخرين' },
      { valueEn: 'Try different solutions until something works', valueAr: 'أجرب حلولاً مختلفة حتى ينجح شيء ما' },
    ],
  },
  {
    id: 'pers-3',
    category: 'personality',
    questionEn: 'How comfortable are you with taking risks and trying new things?',
    questionAr: 'ما مدى ارتياحك لخوض المخاطر وتجربة أشياء جديدة؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Prefer safety', ar: 'أفضل الأمان' },
      max: { en: 'Love taking risks', ar: 'أحب المخاطرة' },
    },
  },
  {
    id: 'pers-4',
    category: 'personality',
    questionEn: 'Do you prefer to focus on the big picture or the details?',
    questionAr: 'هل تفضل التركيز على الصورة الكبيرة أم التفاصيل؟',
    type: 'scale',
    scaleLabels: {
      min: { en: 'Details oriented', ar: 'موجه نحو التفاصيل' },
      max: { en: 'Big picture thinker', ar: 'مفكر في الصورة الكبيرة' },
    },
  },

  // === OPEN-ENDED QUESTIONS ===
  {
    id: 'open-1',
    category: 'interests',
    questionEn: 'Describe your dream job in a few words (optional but helpful for better recommendations)',
    questionAr: 'صف وظيفة أحلامك في بضع كلمات (اختياري ولكنه مفيد للحصول على توصيات أفضل)',
    type: 'text',
  },
  {
    id: 'open-2',
    category: 'interests',
    questionEn: 'What are your top 3 hobbies or things you love doing?',
    questionAr: 'ما هي أهم 3 هوايات أو أشياء تحب القيام بها؟',
    type: 'text',
  },
];

export const getCategoryProgress = (
  answers: Record<string, string | number>,
  category: AssessmentQuestion['category']
): number => {
  const categoryQuestions = assessmentQuestions.filter((q) => q.category === category);
  const answeredQuestions = categoryQuestions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '');
  return categoryQuestions.length > 0 ? (answeredQuestions.length / categoryQuestions.length) * 100 : 0;
};

export const getTotalProgress = (answers: Record<string, string | number>): number => {
  const totalQuestions = assessmentQuestions.length;
  const answeredQuestions = Object.keys(answers).filter((key) => answers[key] !== undefined && answers[key] !== '');
  return totalQuestions > 0 ? (answeredQuestions.length / totalQuestions) * 100 : 0;
};
