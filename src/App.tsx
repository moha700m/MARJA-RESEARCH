import { FormEvent, useMemo, useState } from 'react';
import { api } from './lib/api';
import { MotionConfig, motion } from 'motion/react';
import { ArrowLeft, BarChart3, BookOpenCheck, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, Clock3, Eye, FileSearch, FileText, GraduationCap, Laptop2, Microscope, Presentation, School, Search, Send, ShieldCheck, Sparkles, Stethoscope, Users2 } from 'lucide-react';
import FullResearchReader from './components/FullResearchReader';
import { getResearchDocument } from './data/researchDocuments';

type ServiceKey = 'proposal' | 'sources' | 'review' | 'analysis' | 'slides' | 'full';
type CategoryKey = 'all' | 'health' | 'business' | 'education' | 'tech' | 'social';
type TrackResult = { id: string; service: string; status: string; createdAt: string; deadline: string; title: string };
type Service = { key: ServiceKey; title: string; short: string; price: number; icon: typeof FileText };
type ShowcaseItem = { id: string; category: Exclude<CategoryKey, 'all'>; title: string; subtitle: string; studyType: string; service: ServiceKey; standard: string; problem: string; outcome: string; deliverables: string[]; tags: string[] };

const services: Service[] = [
  { key: 'proposal', title: 'خطة ومقترح بحث', short: 'ترتيب الفكرة، المشكلة، الأهداف، الأسئلة والمنهجية.', price: 89, icon: FileText },
  { key: 'sources', title: 'مصادر ومراجع', short: 'مصادر حديثة وموثوقة مع APA أو Harvard أو IEEE.', price: 109, icon: FileSearch },
  { key: 'review', title: 'مراجعة وتدقيق', short: 'مراجعة اللغة والترابط والتنسيق قبل التسليم.', price: 129, icon: BookOpenCheck },
  { key: 'analysis', title: 'تحليل بيانات', short: 'تنظيم النتائج والجداول وشرحها بطريقة مفهومة.', price: 189, icon: BarChart3 },
  { key: 'slides', title: 'عرض تقديمي', short: 'تحويل المشروع إلى عرض مختصر ومرتب وواضح.', price: 139, icon: Presentation },
  { key: 'full', title: 'دعم البحث الكامل', short: 'مرافقة أكاديمية من الفكرة حتى المراجعة النهائية.', price: 329, icon: Sparkles },
];

const categories: Array<{ key: CategoryKey; label: string; icon: typeof Microscope }> = [
  { key: 'all', label: 'كل النماذج', icon: Sparkles },
  { key: 'health', label: 'صحي وتمريض', icon: Stethoscope },
  { key: 'business', label: 'إدارة وأعمال', icon: BriefcaseBusiness },
  { key: 'education', label: 'تعليم', icon: School },
  { key: 'tech', label: 'تقنية', icon: Laptop2 },
  { key: 'social', label: 'اجتماعي', icon: Users2 },
];

const showcase: ShowcaseItem[] = [
  { id: 'ai-education-prisma', category: 'education', title: 'الذكاء الاصطناعي في التعليم الجامعي', subtitle: 'مراجعة منهجية منظمة من السؤال حتى مخطط الفرز', studyType: 'Systematic Review', service: 'full', standard: 'PRISMA 2020', problem: 'موضوع واسع ومئات الدراسات بدون طريقة واضحة للفرز والمقارنة.', outcome: 'نموذج عرض منظم يوضح السؤال، كلمات البحث، معايير الاشتمال، جدول الدراسات ومسار PRISMA.', deliverables: ['سؤال بحث واستراتيجية بحث', 'جدول استخراج الدراسات', 'هيكل نتائج ومناقشة'], tags: ['PRISMA', 'Literature Review', 'APA 7'] },
  { id: 'nursing-burnout', category: 'health', title: 'الإرهاق الوظيفي لدى طاقم التمريض', subtitle: 'دراسة مقطعية باستبيان وخطة تحليل', studyType: 'Cross-sectional', service: 'analysis', standard: 'STROBE', problem: 'متغيرات كثيرة واستبيان يحتاج تحويله إلى فرضيات وتحليل قابل للتفسير.', outcome: 'نموذج متكامل للدراسة المقطعية: متغيرات، codebook، تحليل وصفي واختبارات ارتباط وانحدار.', deliverables: ['استبيان منظم', 'Codebook للمتغيرات', 'خطة جداول ورسوم'], tags: ['Nursing', 'STROBE', 'Regression'] },
  { id: 'sleep-performance', category: 'social', title: 'النوم والتحصيل لدى طلاب الجامعة', subtitle: 'خطة بحث كمية وتحليل ارتباطي', studyType: 'Observational', service: 'analysis', standard: 'SAP + STROBE', problem: 'الحاجة لفصل العوامل المؤثرة وتحديد التحليل قبل رؤية النتائج.', outcome: 'نموذج SAP يحدد المتغيرات الأساسية والمربكات والتحليل الرئيسي وتحليلات الحساسية.', deliverables: ['خطة تحليل إحصائي', 'جدول المتغيرات', 'قوالب نتائج مسبقة'], tags: ['SAP', 'Correlation', 'Sensitivity'] },
  { id: 'digital-cx', category: 'business', title: 'تجربة العميل الرقمية وإعادة الشراء', subtitle: 'بحث تسويقي كمي من الفرضيات إلى النتائج', studyType: 'Quantitative Survey', service: 'analysis', standard: 'APA 7', problem: 'تحويل مفاهيم تجربة العميل والرضا والولاء إلى متغيرات قابلة للقياس.', outcome: 'نموذج يربط الإطار النظري بالاستبيان والفرضيات ثم يجهز مسار التحليل والتفسير.', deliverables: ['نموذج مفاهيمي', 'استبيان Likert', 'خطة تحليل وانحدار'], tags: ['Marketing', 'Likert', 'Regression'] },
  { id: 'influencer-purchase', category: 'business', title: 'مصداقية المؤثرين وقرار الشراء', subtitle: 'استبيان تسويقي جاهز للدراسة الكمية', studyType: 'Survey Research', service: 'proposal', standard: 'APA 7', problem: 'الحاجة لقياس الثقة والخبرة والجاذبية والنية الشرائية بدون أسئلة مشتتة.', outcome: 'نموذج عرض لاستبيان مختصر بمحاور واضحة وتعريف تشغيلي لكل متغير وخطة صدق وثبات.', deliverables: ['محاور الاستبيان', 'تعريفات تشغيلية', 'خطة Reliability'], tags: ['Questionnaire', 'Cronbach α', 'Marketing'] },
  { id: 'engagement-turnover', category: 'business', title: 'الارتباط الوظيفي ونية ترك العمل', subtitle: 'نموذج بحث موارد بشرية وتحليل عوامل', studyType: 'Correlational', service: 'analysis', standard: 'APA 7', problem: 'تداخل الرضا والارتباط والنية في نموذج واحد يحتاج فرضيات واضحة.', outcome: 'نموذج يختصر المتغيرات ويحدد العلاقات والاختبارات والجداول النهائية المتوقعة.', deliverables: ['فرضيات قابلة للاختبار', 'مصفوفة متغيرات', 'خطة تحليل إحصائي'], tags: ['HR', 'Correlation', 'SPSS-ready'] },
  { id: 'phishing-awareness', category: 'tech', title: 'وعي التصيد الإلكتروني لدى طلاب الجامعات', subtitle: 'بحث تقني باستبيان ومؤشر معرفة', studyType: 'Cross-sectional', service: 'full', standard: 'STROBE', problem: 'قياس الوعي الأمني يحتاج أسئلة معرفة وسلوك وثقة بدل سؤال عام واحد.', outcome: 'نموذج بحث يضم score للمعرفة، محاور السلوك، خصائص العينة وخطة تحليل للفروق والعوامل المرتبطة.', deliverables: ['استبيان أمني', 'Scoring rubric', 'خطة جداول وتحليل'], tags: ['Cybersecurity', 'Survey', 'Scoring'] },
  { id: 'blended-learning', category: 'education', title: 'التعلم المدمج ومستوى التحصيل', subtitle: 'مقترح دراسة تعليمية قبل/بعد', studyType: 'Quasi-experimental', service: 'proposal', standard: 'Research Proposal', problem: 'فكرة تعليمية تحتاج تحويلها لتدخل ومخرجات وقياس قبل وبعد.', outcome: 'نموذج مقترح يحدد التدخل، العينة، أدوات القياس، الجدول الزمني والتحليل المناسب.', deliverables: ['خطة منهجية', 'أداة قياس قبل/بعد', 'Timeline للتنفيذ'], tags: ['Education', 'Pre/Post', 'Methodology'] },
  { id: 'telehealth-qualitative', category: 'health', title: 'تجربة المرضى مع الاستشارات عن بُعد', subtitle: 'دراسة نوعية بدليل مقابلة وتحليل موضوعي', studyType: 'Qualitative', service: 'full', standard: 'COREQ-style', problem: 'تجربة المريض لا تختصر في أرقام وتحتاج أسئلة مقابلة ومحاور تحليل واضحة.', outcome: 'نموذج نوعي يتضمن دليل مقابلة شبه منظم، خطة ترميز، themes متوقعة وطريقة توثيق التحليل.', deliverables: ['Interview guide', 'Coding framework', 'خطة Thematic Analysis'], tags: ['Qualitative', 'Interview', 'Themes'] },
  { id: 'fraud-ai-review', category: 'tech', title: 'الذكاء الاصطناعي في اكتشاف الاحتيال المالي', subtitle: 'مراجعة أدبية تقنية مرتبة حسب النماذج والبيانات', studyType: 'Literature Review', service: 'sources', standard: 'IEEE-style', problem: 'الدراسات التقنية كثيرة والمقارنة تصبح سردًا بدون تصنيف للبيانات والخوارزميات والمقاييس.', outcome: 'نموذج مراجعة يصنف الأعمال حسب Dataset وModel وMetrics ويستخرج الفجوات بوضوح.', deliverables: ['خريطة كلمات بحث', 'Comparison matrix', 'هيكل فجوة بحثية'], tags: ['AI', 'IEEE', 'Literature Matrix'] },
  { id: 'sme-digital-case', category: 'business', title: 'التحول الرقمي في منشأة صغيرة', subtitle: 'دراسة حالة تربط المشكلة بالحل والمؤشرات', studyType: 'Case Study', service: 'full', standard: 'Case Study', problem: 'قصة التحول تحتاج أدلة ومؤشرات قبل/بعد بدل وصف إنشائي.', outcome: 'نموذج دراسة حالة به سياق، مشكلة، تدخل، مؤشرات نجاح، مخاطر ودروس مستفادة.', deliverables: ['Case framework', 'KPIs قبل/بعد', 'ملخص تنفيذي'], tags: ['Case Study', 'Digital', 'KPIs'] },
  { id: 'scientific-poster', category: 'health', title: 'ملصق علمي وعرض مناقشة لمشروع صحي', subtitle: 'تحويل البحث الطويل إلى قصة بصرية قصيرة', studyType: 'Poster + Presentation', service: 'slides', standard: 'Scientific Poster', problem: 'المشروع العلمي قوي لكن عرضه مزدحم ولا يوضح الرسالة الأساسية بسرعة.', outcome: 'نموذج Poster وعرض مناقشة يختصر المشكلة والمنهج والنتائج/النتائج المتوقعة والخلاصة بصريًا.', deliverables: ['Poster structure', '10–12 شريحة', 'ملخص ونقاط نقاش'], tags: ['Poster', 'Slides', 'Presentation'] },
];

const heroSteps = [
  { n: '01', title: 'أرسل التعليمات', text: 'التخصص، الموضوع، المطلوب والموعد.' },
  { n: '02', title: 'نعطيك المسار والسعر', text: 'نحدد المطلوب الفعلي ونرتب الأولويات.' },
  { n: '03', title: 'تابع برقم الطلب', text: 'تعرف حالة طلبك بدون تسجيل دخول.' },
];

function App() {
  const [service, setService] = useState<ServiceKey>('full');
  const [pages, setPages] = useState(15);
  const [urgency, setUrgency] = useState('normal');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [trackId, setTrackId] = useState('');
  const [tracking, setTracking] = useState<TrackResult | null>(null);
  const [trackError, setTrackError] = useState('');
  const [portfolioFilter, setPortfolioFilter] = useState<CategoryKey>('all');
  const [activeSample, setActiveSample] = useState<ShowcaseItem | null>(null);

  const selected = services.find((item) => item.key === service) ?? services[5];
  const filteredShowcase = useMemo(() => portfolioFilter === 'all' ? showcase : showcase.filter((item) => item.category === portfolioFilter), [portfolioFilter]);
  const activeDocument = activeSample ? getResearchDocument(activeSample.id) : null;
  const estimate = useMemo(() => {
    const extraPages = Math.max(0, pages - 5) * 8;
    const multiplier = urgency === 'urgent' ? 1.4 : urgency === 'fast' ? 1.2 : 1;
    return Math.round((selected.price + extraPages) * multiplier);
  }, [pages, selected.price, urgency]);

  const goOrder = () => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  const chooseService = (key: ServiceKey) => { setService(key); document.getElementById('price')?.scrollIntoView({ behavior: 'smooth' }); };
  const requestLike = (key: ServiceKey) => { setService(key); setActiveSample(null); document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' }); };

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitError(''); setOrderId('');
    const form = new FormData(event.currentTarget);
    const payload = { name: String(form.get('name') ?? '').trim(), contact: String(form.get('contact') ?? '').trim(), university: String(form.get('university') ?? '').trim(), major: String(form.get('major') ?? '').trim(), title: String(form.get('title') ?? '').trim(), deadline: String(form.get('deadline') ?? '').trim(), details: String(form.get('details') ?? '').trim(), service, pages, urgency, estimate };
    if (!payload.name || !payload.contact || !payload.university || !payload.title || !payload.deadline || payload.details.length < 15) { setSubmitError('كمّل الحقول المطلوبة، واكتب تفاصيل كافية عن المطلوب.'); return; }
    setSaving(true);
    try { const response = await api.post<{ id: string }>('/api/requests', payload); const id = String(response.data.id); setOrderId(id); setTrackId(id); event.currentTarget.reset(); }
    catch { setSubmitError('تعذر إرسال الطلب الآن. جرّب مرة ثانية بعد قليل.'); }
    finally { setSaving(false); }
  }

  async function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setTracking(null); setTrackError('');
    const id = trackId.trim(); if (!id) { setTrackError('أدخل رقم الطلب أولًا.'); return; }
    try { const response = await api.get<TrackResult>(`/api/requests/${encodeURIComponent(id)}`); setTracking(response.data); }
    catch { setTrackError('ما لقينا طلب بهذا الرقم. تأكد منه وحاول مرة ثانية.'); }
  }

  return <MotionConfig reducedMotion='user' transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}><main className='site'>
    <header className='topbar'><nav className='wrap nav'><a href='#top' className='logo'><span>م</span> مَرجِع</a><div className='navlinks'><a href='#services'>الخدمات</a><a href='#work'>نماذجنا</a><a href='#price'>السعر</a><a href='#how'>الطريقة</a><a href='#track'>تتبع طلبك</a></div><button className='btn dark desktop-cta' onClick={goOrder}>ابدأ طلبك <ArrowLeft size={16}/></button></nav></header>

    <section className='hero wrap' id='top'>
      <motion.div className='hero-copy' initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
        <motion.div className='pill' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}><GraduationCap size={16}/> دعم أكاديمي مرتب للطالب الجامعي</motion.div>
        <h1><motion.span initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.14, duration: 0.7 }}>متورط في بحثك؟</motion.span><motion.em initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.25, duration: 0.7 }}>خلّ البداية علينا.</motion.em></h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}>أرسل متطلبات الدكتور وموعد التسليم. نرتّب لك الخطة والمصادر والتحليل والمراجعة في مسار واضح بدل ما تضيع بين عشر مهام.</motion.p>
        <motion.div className='hero-actions' initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}><button className='btn accent' onClick={goOrder}>أرسل المطلوب <ArrowLeft size={18}/></button><a className='btn ghost' href='#work'>شوف نماذجنا</a></motion.div>
        <motion.div className='trust' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.56 }}><span><Check/> مصادر موثقة</span><span><Check/> تسعير واضح</span><span><Check/> تتبع برقم طلب</span></motion.div>
      </motion.div>
      <motion.aside className='hero-card' initial={{ opacity: 0, x: -34, rotate: -2 }} animate={{ opacity: 1, x: 0, rotate: -1 }} transition={{ delay: 0.18, duration: 0.7 }}>
        <div className='card-head'><span>طلبك في 3 خطوات</span><b>01 — 03</b></div>
        <div className='steps-sequence'>{heroSteps.map((step, index) => <motion.div className='step' key={step.n} initial={{ opacity: 0, x: -24, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 0.48 + index * 0.24, duration: 0.5 }}><motion.strong animate={{ boxShadow: ['0 0 0 0 rgba(254,95,58,0)', '0 0 0 9px rgba(254,95,58,.08)', '0 0 0 0 rgba(254,95,58,0)'] }} transition={{ delay: 0.7 + index * 0.24, duration: 1.1 }}>{step.n}</motion.strong><div><b>{step.title}</b><span>{step.text}</span></div></motion.div>)}</div>
        <motion.div className='safe' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.24 }}><ShieldCheck size={20}/><span>دعم أكاديمي وتعليمي مسؤول. الطالب مسؤول عن فهم العمل والالتزام بسياسة جامعته.</span></motion.div>
      </motion.aside>
    </section>

    <section className='marquee'><motion.div className='wrap marquee-row' initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}><span>APA 7</span><i/><span>Harvard</span><i/><span>IEEE</span><i/><span>PRISMA</span><i/><span>STROBE</span><i/><span>تحليل بيانات</span><i/><span>عروض تقديمية</span></motion.div></section>

    <section className='section wrap' id='services'><div className='section-head'><div><span className='eyebrow'>وش موقفك الآن؟</span><h2>اختر الشيء اللي موقفك.</h2></div><p>ما تحتاج تشتري باقة كبيرة. اختر الجزء اللي تحتاجه، ونحسب لك التقدير مباشرة.</p></div><div className='services'>{services.map((item, index) => { const Icon = item.icon; return <motion.button key={item.key} className={`service ${service === item.key ? 'active' : ''}`} onClick={() => chooseService(item.key)} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.01 }}><div className='service-top'><span>0{index + 1}</span><div><Icon size={22}/></div></div><h3>{item.title}</h3><p>{item.short}</p><footer><strong>من {item.price} ر.س</strong><ArrowLeft size={16}/></footer></motion.button>; })}</div></section>

    <section className='portfolio-section' id='work'><div className='wrap'>
      <motion.div className='section-head work-head' initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><div><span className='eyebrow'>كتالوج الأعمال</span><h2>نماذج تخليك تعرف المستوى قبل ما تطلب.</h2></div><p>كل نموذج الآن يفتح كبحث كامل من 18 صفحة: غلاف، ملخص، فهرس، أدبيات، منهجية، تحليل، نتائج توضيحية، مناقشة، مراجع وملحق.</p></motion.div>

      <motion.div className='case-study' initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }}>
        <div className='case-copy'><span className='case-badge'>مشروع موثّق • تمريض وأطفال</span><h3>The Silent Safety Signal</h3><p>حوّلنا فكرة عن قلق الأم كإشارة مبكرة لتدهور الطفل إلى بروتوكول بحث منظم قابل للمراجعة العلمية والأخلاقية، مع أداة جمع بيانات وخطة تحليل وخطة تطبيق.</p><div className='case-meta'><span><b>الدراسة</b> رصدية مستقبلية</span><span><b>الفئة</b> أطفال 0–14 سنة</span><span><b>المعيار</b> STROBE-style</span><span><b>الحالة</b> قبل جمع البيانات</span></div><button className='btn case-cta' onClick={() => requestLike('full')}>أبغى مشروع بنفس المستوى <ArrowLeft size={16}/></button></div>
        <div className='case-visual'><motion.div className='doc-card doc-one' animate={{ y: [0, -8, 0], rotate: [-4, -2.5, -4] }} transition={{ duration: 5, repeat: Infinity }}><small>PROTOCOL</small><b>The Silent Safety Signal</b><i/><i/><i/><span>0–14 years · Cohort</span></motion.div><motion.div className='doc-card doc-two' animate={{ y: [0, 7, 0], rotate: [4, 2.5, 4] }} transition={{ duration: 5.6, repeat: Infinity }}><small>STUDY FORM</small><b>Maternal Concern Signal</b><i/><i/><i/><span>Arabic + English</span></motion.div><div className='case-counter'><strong>6+</strong><span>مخرجات مترابطة</span></div></div>
      </motion.div>

      <div className='portfolio-toolbar'><div className='portfolio-tabs'>{categories.map(({ key, label, icon: Icon }) => <button key={key} type='button' className={portfolioFilter === key ? 'active' : ''} onClick={() => setPortfolioFilter(key)}><Icon size={14}/>{label}</button>)}</div><span>{filteredShowcase.length} نموذج عرض</span></div>

      <motion.div layout className='showcase-grid'>{filteredShowcase.map((item, index) => <motion.article layout key={item.id} className='showcase-card' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.035, 0.28) }} whileHover={{ y: -7 }}><div className='sample-top'><span>نموذج عرض من تنفيذنا</span><b>{item.standard}</b></div><div className='sample-preview' aria-hidden='true'><div className='preview-sheet back'/><div className='preview-sheet mid'/><div className='preview-sheet front'><small>{item.studyType}</small><strong>{item.title}</strong><i/><i/><i/><i/></div></div><div className='sample-meta'><span>{item.studyType}</span><span>{item.subtitle}</span><span className='page-chip'>18 صفحة</span></div><h3>{item.title}</h3><p>{item.problem}</p><div className='sample-outcome'><small>النتيجة اللي بنيناها</small><span>{item.outcome}</span></div><div className='work-tags'>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><footer><button type='button' className='preview-btn' onClick={() => setActiveSample(item)}><Eye size={14}/> معاينة البحث الكامل</button><button type='button' className='request-btn' onClick={() => requestLike(item.service)}>أبغى مثله <ArrowLeft size={14}/></button></footer></motion.article>)}</motion.div>

      <div className='portfolio-note'><ShieldCheck size={20}/><p><b>واضحين في عرض الأعمال:</b> النماذج الكاملة بحثية وتعليمية من تنفيذنا لعرض مستوى العمل. أي صفحة نتائج بلا بيانات ميدانية فعلية موسومة بوضوح بأنها توضيحية، ولا ننسب درجات أو عملاء أو نتائج غير موثقة.</p></div>
    </div></section>

    <section className='price-section' id='price'><div className='wrap price-layout'><motion.div className='price-copy' initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}><span className='eyebrow light'>حاسبة سريعة</span><h2>اعرف ميزانيتك<br/>قبل ما ترسل.</h2><p>التقدير مبدئي، والسعر النهائي يتأكد بعد مراجعة تعليمات الدكتور وحجم العمل الحقيقي.</p><div className='selected-box'><selected.icon size={24}/><div><small>الخدمة المختارة</small><strong>{selected.title}</strong></div></div></motion.div><motion.div className='calculator' initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><label>الخدمة<select value={service} onChange={(e) => setService(e.target.value as ServiceKey)}>{services.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}</select></label><label><span className='label-row'>عدد الصفحات المتوقع <b>{pages} صفحة</b></span><input aria-label='عدد الصفحات' type='range' min='5' max='60' value={pages} onChange={(e) => setPages(Number(e.target.value))}/><span className='range-ends'><small>5</small><small>60</small></span></label><div className='speed'><button type='button' className={urgency === 'normal' ? 'active' : ''} onClick={() => setUrgency('normal')}><b>عادي</b><span>5 أيام+</span></button><button type='button' className={urgency === 'fast' ? 'active' : ''} onClick={() => setUrgency('fast')}><b>سريع</b><span>2–4 أيام</span></button><button type='button' className={urgency === 'urgent' ? 'active' : ''} onClick={() => setUrgency('urgent')}><b>مستعجل</b><span>أقل من 48 ساعة</span></button></div><div className='estimate'><div><span>التقدير المبدئي</span><small>السعر النهائي بعد مراجعة التفاصيل</small></div><strong>{estimate}<em> ر.س</em></strong></div><button className='btn accent full' onClick={goOrder}>كمّل الطلب <ArrowLeft size={18}/></button></motion.div></div></section>

    <section className='section wrap how' id='how'><div className='section-head'><div><span className='eyebrow'>طريقة الشغل</span><h2>واضح من أول رسالة.</h2></div><p>نحتاج منك المعلومات اللي تؤثر فعلًا على البحث، ونبني عليها العمل.</p></div><div className='how-grid'>{[{ icon: Search, n: '01', t: 'نفهم المطلوب', p: 'تعليمات الدكتور، التخصص، الموضوع والموعد.' },{ icon: Clock3, n: '02', t: 'نثبت النطاق', p: 'وش بنسوي بالضبط، كم يحتاج، والتكلفة.' },{ icon: BookOpenCheck, n: '03', t: 'تنفيذ ومراجعة', p: 'نرتب المحتوى ونراجع الوضوح والمصادر والتنسيق.' }].map((item, index) => { const Icon = item.icon; return <motion.article key={item.n} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }}><Icon/><span>{item.n}</span><h3>{item.t}</h3><p>{item.p}</p></motion.article>; })}</div></section>

    <section className='order-section' id='order'><div className='wrap order-layout'><div className='order-copy'><span className='eyebrow light'>طلب جديد</span><h2>أرسلها بطريقتك.<br/>إحنا نرتّبها.</h2><p>ما تحتاج تكتب وصف رسمي. انسخ تعليمات الدكتور أو اشرح وش ناقصك.</p><div className='order-benefits'><span><ShieldCheck/><b>خصوصية الطلب</b></span><span><Clock3/><b>رقم مرجعي مباشر</b></span></div></div><form className='order-form' onSubmit={submitOrder}><div className='fields two'><label>الاسم *<input name='name' placeholder='اسمك الأول يكفي'/></label><label>وسيلة التواصل *<input name='contact' placeholder='05xxxxxxxx أو البريد'/></label></div><div className='fields two'><label>الجامعة *<input name='university' placeholder='اسم الجامعة'/></label><label>التخصص<input name='major' placeholder='مثال: تمريض'/></label></div><label>عنوان البحث أو الموضوع *<input name='title' placeholder='حتى لو كان مبدئي'/></label><div className='fields two'><label>موعد التسليم *<input name='deadline' type='date'/></label><label>الخدمة<input value={selected.title} readOnly/></label></div><label>تعليمات الدكتور + المطلوب *<textarea name='details' rows={6} placeholder='مثال: مطلوب 15 صفحة، APA 7، مصادر من آخر 5 سنوات، وأحتاج مراجعة المنهجية...'/></label><div className='submit-row'><div><small>التقدير الحالي</small><strong>{estimate} ر.س</strong></div><button className='btn accent' type='submit' disabled={saving}>{saving ? 'جاري الإرسال...' : 'إرسال الطلب'} <Send size={17}/></button></div>{submitError && <div className='alert error'>{submitError}</div>}{orderId && <div className='alert success'><CheckCircle2/><div><b>تم استلام طلبك</b><span>رقم الطلب: <strong>{orderId}</strong></span><small>احتفظ فيه للتتبع.</small></div></div>}</form></div></section>

    <section className='section wrap' id='track'><div className='track'><div className='track-copy'><span className='eyebrow'>تتبع طلبك</span><h2>رقم واحد يكفي.</h2><p>نعرض لك حالة الطلب والخدمة والموعد فقط. بيانات التواصل والجامعة ما تظهر هنا.</p></div><form onSubmit={trackOrder}><div className='track-input'><input aria-label='رقم الطلب' value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder='الصق رقم الطلب هنا'/><button className='btn dark' type='submit'>عرض الحالة</button></div>{trackError && <div className='alert error'>{trackError}</div>}{tracking && <div className='track-result'><div className='track-status'><span>الحالة الحالية</span><b>{tracking.status}</b></div><div className='track-details'><div><small>الموضوع</small><strong>{tracking.title}</strong></div><div><small>الخدمة</small><strong>{tracking.service}</strong></div><div><small>موعد التسليم</small><strong>{tracking.deadline}</strong></div></div></div>}</form></div></section>

    <section className='section wrap faq'><div><span className='eyebrow'>قبل الطلب</span><h2>الأسئلة اللي تهمك.</h2></div><div className='faq-list'><details open><summary>هل الخدمة تسوي البحث بدل الطالب؟ <ChevronDown/></summary><p>الخدمة للدعم الأكاديمي: تخطيط، مصادر، شرح، تحليل، مراجعة وتنسيق. الطالب مسؤول عن فهم المحتوى والالتزام بسياسة جامعته.</p></details><details><summary>هل كل النماذج المعروضة أعمال عملاء؟ <ChevronDown/></summary><p>لا. المشروع الصحي المميز موثّق لدينا، وبقية النماذج نماذج عرض قمنا ببنائها لإظهار مستوى التنفيذ بدون ادعاء عميل أو درجة أو نتيجة غير موثقة.</p></details><details><summary>هل أقدر أرسل تعليمات الدكتور كاملة؟ <ChevronDown/></summary><p>نعم، وهذا الأفضل. انسخ التعليمات في خانة التفاصيل حتى يكون التقدير والعمل أدق.</p></details></div></section>

    <footer className='footer'><div className='wrap footer-inner'><div><a href='#top' className='logo inverted'><span>م</span> مَرجِع</a><p>دعم أكاديمي يرتب لك الطريق.</p></div><div className='footer-links'><a href='#services'>الخدمات</a><a href='#work'>نماذجنا</a><a href='#price'>السعر</a><a href='#order'>ابدأ طلب</a><a href='#track'>تتبع</a></div><small>© 2026 مَرجِع — للاستخدام الأكاديمي المسؤول.</small></div></footer>
    <button className='mobile-action btn accent' onClick={goOrder}>ابدأ طلبك <ArrowLeft size={17}/></button>

    {activeSample && activeDocument && <FullResearchReader document={activeDocument} onClose={() => setActiveSample(null)} onRequest={() => requestLike(activeSample.service)}/>} 
  </main></MotionConfig>;
}

export default App;
