import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  Activity, ArrowLeft, ArrowUpRight, BarChart3, BookOpenCheck, Bookmark, BriefcaseBusiness,
  Check, CheckCircle2, ChevronDown, Clock3, Database, FileSearch, FileText, GitCompare,
  GraduationCap, Laptop2, LayoutDashboard, Microscope, Plus, Presentation, School,
  Search, Send, ShieldCheck, SlidersHorizontal, Sparkles, Stethoscope, Users2, X
} from 'lucide-react';
import FullResearchReader from './components/FullResearchReader';
import { getResearchDocument } from './data/researchDocuments';

type ServiceKey = 'proposal' | 'sources' | 'review' | 'analysis' | 'slides' | 'full';
type CategoryKey = 'all' | 'health' | 'business' | 'education' | 'tech' | 'social';
type TrackResult = { id: string; service: string; status: string; createdAt: string; deadline: string; title: string };
type WorkspaceTab = 'overview' | 'library' | 'saved';
type Service = { key: ServiceKey; title: string; short: string; price: number; icon: typeof FileText };
type ShowcaseItem = {
  id: string;
  category: Exclude<CategoryKey, 'all'>;
  title: string;
  subtitle: string;
  studyType: string;
  service: ServiceKey;
  standard: string;
  problem: string;
  outcome: string;
  deliverables: string[];
  tags: string[];
  signal: string;
};

const services: Service[] = [
  { key: 'proposal', title: 'خطة ومقترح بحث', short: 'من فكرة مبعثرة إلى سؤال وأهداف ومنهجية قابلة للمراجعة.', price: 89, icon: FileText },
  { key: 'sources', title: 'بحث ومراجع', short: 'مراجع أصلية ومختارة، مرتبطة بسؤال البحث لا قائمة حشو.', price: 109, icon: FileSearch },
  { key: 'review', title: 'مراجعة وتدقيق', short: 'مراجعة منطقية ولغوية وتنسيقية قبل التسليم النهائي.', price: 129, icon: BookOpenCheck },
  { key: 'analysis', title: 'خطة تحليل بيانات', short: 'متغيرات، Codebook، جداول، واختبارات يحددها السؤال.', price: 189, icon: BarChart3 },
  { key: 'slides', title: 'عرض ومناقشة', short: 'تحويل البحث إلى قصة بصرية مختصرة وسهلة الشرح.', price: 139, icon: Presentation },
  { key: 'full', title: 'مسار بحث كامل', short: 'مرافقة منظمة من تحديد السؤال حتى المراجعة والتسليم.', price: 329, icon: Sparkles },
];

const categories: Array<{ key: CategoryKey; label: string; icon: typeof Microscope }> = [
  { key: 'all', label: 'كل الدراسات', icon: Sparkles },
  { key: 'health', label: 'صحي وتمريض', icon: Stethoscope },
  { key: 'business', label: 'إدارة وأعمال', icon: BriefcaseBusiness },
  { key: 'education', label: 'تعليم', icon: School },
  { key: 'tech', label: 'تقنية', icon: Laptop2 },
  { key: 'social', label: 'اجتماعي', icon: Users2 },
];

const showcase: ShowcaseItem[] = [
  {
    id: 'ai-education-prisma', category: 'education', title: 'الذكاء الاصطناعي في التعليم الجامعي',
    subtitle: 'مراجعة منهجية من سؤال البحث حتى مصفوفة الأدلة', studyType: 'Systematic Review',
    service: 'full', standard: 'PRISMA 2020',
    problem: 'موضوع واسع يحتاج استراتيجية بحث ومعايير فرز بدل سرد عام للدراسات.',
    outcome: 'مسار واضح للسؤال، البحث، الفرز، استخراج الدراسات، تركيب الأدلة وصياغة الفجوة.',
    deliverables: ['استراتيجية بحث', 'مصفوفة استخراج', 'خطة نتائج ومناقشة'], tags: ['PRISMA', 'Evidence map', 'APA 7'],
    signal: 'أدلة قابلة للتتبع',
  },
  {
    id: 'nursing-burnout', category: 'health', title: 'الإرهاق الوظيفي لدى طاقم التمريض',
    subtitle: 'دراسة مقطعية باستبيان وخطة تحليل مسبقة', studyType: 'Cross-sectional Study',
    service: 'analysis', standard: 'STROBE',
    problem: 'متغيرات كثيرة تحتاج تعريفًا تشغيليًا وربطًا صحيحًا بين الأداة والتحليل.',
    outcome: 'تصميم مقطعي منظم يوضح المتغيرات، العينة، Codebook والتحليل الوصفي والارتباطي.',
    deliverables: ['استبيان منظم', 'Codebook', 'خطة جداول ورسوم'], tags: ['Nursing', 'STROBE', 'Regression'],
    signal: 'منهج قابل للتكرار',
  },
  {
    id: 'sleep-performance', category: 'social', title: 'النوم والتحصيل لدى طلاب الجامعة',
    subtitle: 'خطة بحث كمية وتحليل ارتباطي قبل رؤية النتائج', studyType: 'Observational Study',
    service: 'analysis', standard: 'SAP + STROBE',
    problem: 'تحديد التحليل بعد ظهور الأرقام يفتح باب الانحياز؛ لذلك تُثبت الخطة مسبقًا.',
    outcome: 'خطة تحليل تحدد المتغيرات الأساسية والمربكات والتحليل الرئيس وتحليلات الحساسية.',
    deliverables: ['خطة إحصائية', 'جدول المتغيرات', 'قالب نتائج'], tags: ['SAP', 'Correlation', 'Sensitivity'],
    signal: 'لا نتائج قبل البيانات',
  },
  {
    id: 'digital-cx', category: 'business', title: 'تجربة العميل الرقمية وإعادة الشراء',
    subtitle: 'بحث تسويقي كمي من المفاهيم إلى نموذج القياس', studyType: 'Quantitative Survey',
    service: 'analysis', standard: 'APA 7',
    problem: 'تحويل تجربة العميل والرضا والثقة إلى متغيرات يمكن قياسها ومناقشتها.',
    outcome: 'نموذج مفاهيمي واستبيان Likert وخطة فحص الثبات والانحدار والتفسير.',
    deliverables: ['نموذج مفاهيمي', 'استبيان Likert', 'خطة تحليل'], tags: ['Marketing', 'Likert', 'Regression'],
    signal: 'مفاهيم قابلة للقياس',
  },
  {
    id: 'phishing-awareness', category: 'tech', title: 'وعي التصيد الإلكتروني لدى طلاب الجامعات',
    subtitle: 'قياس معرفة وسلوك ومؤشر وعي أمني', studyType: 'Cross-sectional Study',
    service: 'full', standard: 'STROBE',
    problem: 'سؤال عام عن الوعي لا يكفي؛ القياس يحتاج سيناريوهات ودرجات وتعريفات.',
    outcome: 'أداة تجمع المعرفة والسلوك، مع Scoring rubric وخطة مقارنة للفروق والعوامل المرتبطة.',
    deliverables: ['استبيان أمني', 'Scoring rubric', 'خطة تحليل'], tags: ['Cybersecurity', 'Survey', 'Scoring'],
    signal: 'أداة قبل النتيجة',
  },
  {
    id: 'telehealth-qualitative', category: 'health', title: 'تجربة المرضى مع الاستشارات عن بُعد',
    subtitle: 'مقابلات شبه منظمة وتحليل موضوعي', studyType: 'Qualitative Study',
    service: 'full', standard: 'COREQ-style',
    problem: 'التجربة الإنسانية لا تختصر في رقم وتحتاج دليل مقابلة ومسار ترميز شفاف.',
    outcome: 'دليل مقابلة، Coding framework، مذكرات تحليل وخريطة Themes قابلة للمراجعة.',
    deliverables: ['Interview guide', 'Coding framework', 'خطة Thematic Analysis'], tags: ['Qualitative', 'Interview', 'Themes'],
    signal: 'صوت المشاركين أولًا',
  },
  {
    id: 'fraud-ai-review', category: 'tech', title: 'الذكاء الاصطناعي في اكتشاف الاحتيال المالي',
    subtitle: 'مراجعة تقنية تقارن البيانات والنماذج والمقاييس', studyType: 'Literature Review',
    service: 'sources', standard: 'IEEE-style',
    problem: 'المقارنة التقنية تصبح سطحية بدون تصنيف Dataset وModel وMetrics.',
    outcome: 'مصفوفة مقارنة تبرز قابلية المقارنة، فجوات البيانات، وعدم توازن الفئات وقابلية التفسير.',
    deliverables: ['خريطة كلمات بحث', 'Comparison matrix', 'فجوة بحثية'], tags: ['AI', 'IEEE', 'Literature Matrix'],
    signal: 'مقارنة لا سرد',
  },
  {
    id: 'blended-learning', category: 'education', title: 'التعلم المدمج ومستوى التحصيل',
    subtitle: 'مقترح شبه تجريبي بقياس قبلي وبعدي', studyType: 'Quasi-experimental Study',
    service: 'proposal', standard: 'Research Proposal',
    problem: 'الفكرة التعليمية تحتاج تدخلًا ومخرجات وقياسًا يوضح ما الذي تغيّر.',
    outcome: 'مقترح يحدد التدخل، المجموعات، أدوات القياس، الجدول الزمني والتحليل المناسب.',
    deliverables: ['خطة منهجية', 'أداة قبل/بعد', 'Timeline'], tags: ['Education', 'Pre/Post', 'Methodology'],
    signal: 'تدخل يمكن تقييمه',
  },
  {
    id: 'sme-digital-case', category: 'business', title: 'التحول الرقمي في منشأة صغيرة',
    subtitle: 'دراسة حالة تربط القرار بمؤشرات تشغيلية', studyType: 'Case Study',
    service: 'full', standard: 'Case Study',
    problem: 'قصة التحول تحتاج مصادر متعددة ومؤشرات قبل/بعد بدل وصف إنشائي.',
    outcome: 'إطار دراسة حالة يربط السياق بالمشكلة والتدخل ومؤشرات النجاح والمخاطر.',
    deliverables: ['Case framework', 'KPIs قبل/بعد', 'ملخص تنفيذي'], tags: ['Case Study', 'Digital', 'KPIs'],
    signal: 'سياق + دليل',
  },
  {
    id: 'influencer-purchase', category: 'business', title: 'مصداقية المؤثرين وقرار الشراء',
    subtitle: 'نموذج قياس يربط الثقة بالنية الشرائية', studyType: 'Survey Research',
    service: 'sources', standard: 'APA 7',
    problem: 'الحديث عن تأثير المؤثرين يحتاج تعريف المصداقية وملاءمة المنتج قبل تفسير السلوك.',
    outcome: 'نموذج مفاهيمي واستبيان يفرّق بين الخبرة والثقة والتشابه المدرك وقرار الشراء.',
    deliverables: ['نموذج مفاهيمي', 'مقياس موثق', 'خطة فحص الثبات'], tags: ['Influencer', 'Trust', 'Marketing'],
    signal: 'المفهوم قبل السؤال',
  },
  {
    id: 'engagement-turnover', category: 'business', title: 'الارتباط الوظيفي ونية ترك العمل',
    subtitle: 'تحليل موارد بشرية يضبط العوامل المربكة', studyType: 'Correlational Study',
    service: 'analysis', standard: 'APA 7',
    problem: 'العلاقة بين الارتباط ونية المغادرة قد تتأثر بالدعم والرضا والقطاع الوظيفي.',
    outcome: 'خطة قياس وتحليل تفصل الارتباط عن العوامل المصاحبة وتوضح حدود الاستنتاج.',
    deliverables: ['مقاييس موثقة', 'Codebook', 'نموذج انحدار'], tags: ['HR', 'Engagement', 'Turnover'],
    signal: 'تحليل بلا قفزات',
  },
  {
    id: 'scientific-poster', category: 'education', title: 'ملصق علمي وعرض مناقشة لمشروع صحي',
    subtitle: 'تحويل تقرير كامل إلى قصة بصرية قابلة للشرح', studyType: 'Research Communication Project',
    service: 'slides', standard: 'Scientific Poster',
    problem: 'الملصق العلمي ليس ملخصًا مزحومًا؛ يحتاج تسلسلًا بصريًا يحافظ على دقة النتائج.',
    outcome: 'Storyboard يربط السؤال والمنهج والنتائج والخلاصة مع فحص القراءة وكثافة النص.',
    deliverables: ['Storyboard', 'ملصق علمي', 'أسئلة مناقشة'], tags: ['Poster', 'Presentation', 'Health'],
    signal: 'الدليل يُشرح بصريًا',
  },
];

const heroSteps = [
  { n: '01', title: 'نثبت السؤال', text: 'نحوّل المطلوب إلى نطاق وأهداف قابلة للفحص.' },
  { n: '02', title: 'نبني الدليل', text: 'نربط المصادر بالمنهج والأداة والمخرج.' },
  { n: '03', title: 'نسلّم بوضوح', text: 'تشاهد البحث وتعرف ما هو حقيقي وما يحتاج بيانات.' },
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
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('overview');
  const [workspaceQuery, setWorkspaceQuery] = useState('');
  const [workspaceCategory, setWorkspaceCategory] = useState<CategoryKey>('all');
  const [savedIds, setSavedIds] = useState<string[]>(['ai-education-prisma', 'nursing-burnout']);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const selected = services.find((item) => item.key === service) ?? services[5];
  const filteredShowcase = useMemo(
    () => portfolioFilter === 'all' ? showcase : showcase.filter((item) => item.category === portfolioFilter),
    [portfolioFilter],
  );
  const workspaceItems = useMemo(() => {
    const query = workspaceQuery.trim().toLocaleLowerCase('ar');
    return showcase.filter((item) => {
      const matchesTab = workspaceTab !== 'saved' || savedIds.includes(item.id);
      const matchesCategory = workspaceCategory === 'all' || item.category === workspaceCategory;
      const haystack = [item.title, item.subtitle, item.studyType, item.standard, ...item.tags].join(' ').toLocaleLowerCase('ar');
      return matchesTab && matchesCategory && (!query || haystack.includes(query));
    });
  }, [savedIds, workspaceCategory, workspaceQuery, workspaceTab]);
  const compareItems = useMemo(() => showcase.filter((item) => compareIds.includes(item.id)), [compareIds]);
  const activeDocument = activeSample ? getResearchDocument(activeSample.id) : null;
  const estimate = useMemo(() => {
    const extraPages = Math.max(0, pages - 5) * 8;
    const multiplier = urgency === 'urgent' ? 1.4 : urgency === 'fast' ? 1.2 : 1;
    return Math.round((selected.price + extraPages) * multiplier);
  }, [pages, selected.price, urgency]);

  const goOrder = () => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  const chooseService = (key: ServiceKey) => {
    setService(key);
    document.getElementById('price')?.scrollIntoView({ behavior: 'smooth' });
  };
  const requestLike = (key: ServiceKey) => {
    setService(key);
    setActiveSample(null);
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleSaved = (id: string) => setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleCompare = (id: string) => setCompareIds((current) => {
    if (current.includes(id)) return current.filter((item) => item !== id);
    return current.length >= 2 ? [...current.slice(1), id] : [...current, id];
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLibraryOpen(false);
        setCompareOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');
    setOrderId('');
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? '').trim(),
      contact: String(form.get('contact') ?? '').trim(),
      university: String(form.get('university') ?? '').trim(),
      major: String(form.get('major') ?? '').trim(),
      title: String(form.get('title') ?? '').trim(),
      deadline: String(form.get('deadline') ?? '').trim(),
      details: String(form.get('details') ?? '').trim(),
      service, pages, urgency, estimate,
    };
    if (!payload.name || !payload.contact || !payload.university || !payload.title || !payload.deadline || payload.details.length < 15) {
      setSubmitError('كمّل الحقول المطلوبة، واكتب تفاصيل كافية عن المطلوب.');
      return;
    }
    setSaving(true);
    try {
      const { api } = await import('./lib/api');
      const response = await api.post<{ id: string }>('/api/requests', payload);
      const id = String(response.data.id);
      setOrderId(id);
      setTrackId(id);
      event.currentTarget.reset();
    } catch {
      setSubmitError('تعذر إرسال الطلب الآن. جرّب مرة ثانية بعد قليل.');
    } finally {
      setSaving(false);
    }
  }

  async function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTracking(null);
    setTrackError('');
    const id = trackId.trim();
    if (!id) {
      setTrackError('أدخل رقم الطلب أولًا.');
      return;
    }
    try {
      const { api } = await import('./lib/api');
      const response = await api.get<TrackResult>('/api/requests/' + encodeURIComponent(id));
      setTracking(response.data);
    } catch {
      setTrackError('ما لقينا طلب بهذا الرقم. تأكد منه وحاول مرة ثانية.');
    }
  }

  return (
    <MotionConfig reducedMotion='user' transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
      <main className='site'>
        <div className='announcement'>
          <div className='wrap announcement-inner'>
            <span><span className='live-dot' /> معاينات بحثية منظمة — قبل أن تطلب، شوف طريقة البناء</span>
            <a href='#integrity'>كيف نحافظ على أمانة البحث <ArrowLeft size={14} /></a>
          </div>
        </div>

        <header className='topbar'>
          <nav className='wrap nav'>
            <a href='#top' className='logo'><span>م</span><strong>مَرجِع</strong><small>RESEARCH STUDIO</small></a>
            <div className='navlinks'>
              <a href='#workspace'>مساحة البحث</a>
              <a href='#services'>الخدمات</a>
              <a href='#work'>مكتبة الأبحاث</a>
              <a href='#how'>كيف نعمل</a>
              <a href='#track'>تتبع طلبك</a>
            </div>
            <button className='btn dark desktop-cta' type='button' onClick={goOrder}>ابدأ مشروعك <ArrowLeft size={16} /></button>
          </nav>
        </header>

        <section className='hero wrap' id='top'>
          <motion.div className='hero-copy' initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div className='hero-kicker'><GraduationCap size={16} /><span>استوديو بحثي عربي للطلاب والباحثين</span><b>01 / 2026</b></div>
            <h1><span>بحثك ما يحتاج كلام أكثر.</span><em>يحتاج مسار أقوى.</em></h1>
            <p>نحوّل تعليمات الدكتور والفكرة المبعثرة إلى سؤال واضح، مصادر قابلة للتتبع، منهج قابل للمراجعة، ومخرجات تعرف كيف تشرحها — بدون نتائج مختلقة أو ادعاءات أكبر من الدليل.</p>
            <div className='hero-actions'>
              <button className='btn accent' type='button' onClick={goOrder}>ابدأ بتفاصيل مشروعك <ArrowLeft size={18} /></button>
              <a className='btn ghost' href='#work'>تصفح مكتبة الأبحاث</a>
            </div>
            <div className='hero-trust'>
              <span><Check size={15} /> مصادر مرتبطة بالسؤال</span>
              <span><Check size={15} /> منهج قبل النتائج</span>
              <span><Check size={15} /> معاينة فعلية داخل الموقع</span>
            </div>
          </motion.div>

          <motion.aside className='hero-panel' initial={{ opacity: 0, x: -28, rotate: 1.5 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ delay: 0.12, duration: 0.7 }}>
            <div className='panel-noise' />
            <div className='panel-header'><span>PROJECT / 001</span><b>قيد المراجعة</b></div>
            <div className='panel-title'><small>بحث مقطعي • STROBE</small><h2>الإرهاق الوظيفي<br />لدى طاقم التمريض</h2><p>مثال على تحويل فكرة واسعة إلى مكونات يستطيع العميل مراجعتها قبل البداية.</p></div>
            <div className='research-ladder'>
              {heroSteps.map((step, index) => (
                <div className={'ladder-item ' + (index === 1 ? 'active' : '')} key={step.n}>
                  <span>{step.n}</span><div><b>{step.title}</b><small>{step.text}</small></div><i>{index === 2 ? '✓' : '→'}</i>
                </div>
              ))}
            </div>
            <div className='panel-foot'><span><ShieldCheck size={15} /> نتائج الأبحاث الفعلية فقط</span><b>20 صفحة قابلة للتصفح</b></div>
          </motion.aside>
        </section>

        <section className='proof-rail' aria-label='مبادئ مَرجِع'>
          <div className='wrap proof-rail-grid'>
            <div><b>01</b><span>السؤال قبل الزخرفة</span></div>
            <div><b>02</b><span>المصدر يخدم الحجة</span></div>
            <div><b>03</b><span>المنهج يسبق النتيجة</span></div>
            <div><b>04</b><span>المخرج قابل للشرح</span></div>
          </div>
        </section>

        <section className='workspace-section section' id='workspace'>
          <div className='wrap'>
            <div className='workspace-intro'>
              <div><span className='eyebrow'>مَرجِع OS / مساحة البحث</span><h2>كل بحث له<br /><em>لوحة تشغيل.</em></h2><p>مو معرض أغلفة. هذه مساحة SaaS تختار منها المسار، تحفظ دراسة، تقارن منهجين، وتفتح الملف الكامل عندما تحتاج التفاصيل.</p></div>
              <div className='workspace-intro-actions'><span className='workspace-live'><span className='live-dot' /> النظام يعمل</span><button className='btn light' type='button' onClick={() => setLibraryOpen(true)}>فتح كل الملفات <ArrowLeft size={16} /></button></div>
            </div>

            <div className='workspace-frame'>
              <aside className='workspace-sidebar'>
                <div className='workspace-sidebar-brand'><span>م</span><div><b>مَرجِع</b><small>RESEARCH OS</small></div></div>
                <span className='workspace-sidebar-label'>مساحة العمل</span>
                <nav className='workspace-side-nav' aria-label='مساحة البحث'>
                  {([{ key: 'overview', label: 'نظرة عامة', icon: LayoutDashboard }, { key: 'library', label: 'كل الدراسات', icon: Database }, { key: 'saved', label: 'المحفوظة', icon: Bookmark }] as Array<{ key: WorkspaceTab; label: string; icon: typeof LayoutDashboard }>).map(({ key, label, icon: Icon }) => <button key={key} type='button' className={workspaceTab === key ? 'active' : ''} onClick={() => setWorkspaceTab(key)}><Icon size={16} /><span>{label}</span>{key === 'saved' && <b>{savedIds.length}</b>}</button>)}
                </nav>
                <span className='workspace-sidebar-label'>النظام</span>
                <div className='workspace-side-links'><a href='#how'><SlidersHorizontal size={15} /> طريقة البناء</a><a href='#integrity'><ShieldCheck size={15} /> بوابة النزاهة</a></div>
                <div className='workspace-side-note'><Activity size={17} /><div><b>آخر مزامنة</b><span>منهجيات ومراجع محدثة</span><small>منذ 4 دقائق</small></div></div>
              </aside>

              <div className='workspace-main'>
                <div className='workspace-topbar'><div><small>مَرجِع / مساحة الباحث</small><h3>لوحة الدراسات</h3></div><div className='workspace-top-actions'><label className='workspace-search'><Search size={17} /><input value={workspaceQuery} onChange={(event) => setWorkspaceQuery(event.target.value)} placeholder='ابحث عن موضوع أو منهج...' aria-label='ابحث في الدراسات' /></label><button className='workspace-add' type='button' onClick={goOrder}><Plus size={16} /> بحث جديد</button></div></div>
                <div className='workspace-metrics'><div><span>ملفات كاملة</span><b>12</b><small>20 صفحة لكل ملف</small></div><div><span>منهجيات</span><b>08</b><small>كمي · نوعي · مراجعات</small></div><div><span>قابل للتتبع</span><b>100%</b><small>مصادر وملاحظات واضحة</small></div><div className='workspace-metric-accent'><span>نتائج مختلقة</span><b>00</b><small>لا أرقام بلا بيانات</small></div></div>

                <div className='workspace-main-grid'>
                  <div className='workspace-catalog'>
                    <div className='workspace-catalog-head'><div><span className='workspace-eyebrow'>CATALOG / {workspaceTab === 'saved' ? 'SAVED' : 'LIVE'}</span><h4>{workspaceTab === 'saved' ? 'الدراسات المحفوظة' : 'ملفات بحث جاهزة للتصفح'}</h4></div><span className='workspace-result-count'>{workspaceItems.length} من {showcase.length}</span></div>
                    <div className='workspace-filters'>{categories.map(({ key, label }) => <button key={key} type='button' className={workspaceCategory === key ? 'active' : ''} onClick={() => setWorkspaceCategory(key)}>{label}</button>)}</div>
                    <div className='workspace-study-list'>
                      {workspaceItems.slice(0, workspaceTab === 'overview' ? 4 : 6).map((item, index) => <motion.article key={item.id} className='workspace-study-card' role='button' tabIndex={0} onClick={() => setActiveSample(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveSample(item); }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ delay: index * .045 }}>
                        <div className='workspace-study-index'><span>0{index + 1}</span><div className={'study-signal signal-' + item.category} /></div><div className='workspace-study-content'><div className='workspace-study-meta'><span>{item.studyType}</span><b>{item.standard}</b></div><h5>{item.title}</h5><p>{item.outcome}</p><div className='workspace-study-tags'>{item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className='workspace-study-actions'><button type='button' className={savedIds.includes(item.id) ? 'saved' : ''} onClick={(event) => { event.stopPropagation(); toggleSaved(item.id); }} aria-label={savedIds.includes(item.id) ? 'إزالة من المحفوظة' : 'حفظ الدراسة'} aria-pressed={savedIds.includes(item.id)}><Bookmark size={16} fill={savedIds.includes(item.id) ? 'currentColor' : 'none'} /></button><button type='button' className={compareIds.includes(item.id) ? 'selected' : ''} onClick={(event) => { event.stopPropagation(); toggleCompare(item.id); }} aria-label='إضافة للمقارنة' aria-pressed={compareIds.includes(item.id)}><GitCompare size={16} /></button><ArrowUpRight size={17} className='workspace-open-icon' /></div>
                      </motion.article>)}
                      {workspaceItems.length === 0 && <div className='workspace-empty'><Search size={20} /><b>ما لقينا دراسة بهذا الوصف</b><span>غيّر كلمة البحث أو أعد الفلترة.</span></div>}
                    </div>
                    <div className='workspace-catalog-foot'><span><ShieldCheck size={15} /> كل ملف يفتح كبحث كامل داخل الموقع</span><button type='button' onClick={() => setLibraryOpen(true)}>عرض المكتبة <ArrowLeft size={14} /></button></div>
                  </div>

                  <aside className='workspace-insights'><div className='workspace-insights-head'><div><span className='workspace-eyebrow'>METHOD SIGNALS</span><h4>إشارات قبل أن تبدأ</h4></div><Sparkles size={18} /></div><div className='method-signal'><span>01</span><div><b>السؤال محدد</b><small>كل ملف يبدأ بفجوة قابلة للفحص.</small></div><i>✓</i></div><div className='method-signal'><span>02</span><div><b>الأداة لها وظيفة</b><small>لا استبيان أو جدول بلا علاقة بالسؤال.</small></div><i>✓</i></div><div className='method-signal'><span>03</span><div><b>النتيجة لها مصدر</b><small>القالب يوضح أين تبدأ البيانات الفعلية.</small></div><i>✓</i></div><div className='workspace-compare-box'><div><GitCompare size={18} /><div><b>قارن دراستين</b><small>{compareIds.length ? `${compareIds.length} من 2 محددة` : 'اختر دراستين من القائمة'}</small></div></div><button type='button' disabled={compareIds.length < 2} onClick={() => setCompareOpen(true)}>فتح المقارنة <ArrowLeft size={14} /></button></div></aside>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='featured-section section wrap' aria-labelledby='featured-title'>
          <div className='section-head'>
            <div><span className='eyebrow'>لمحة من طريقة البناء</span><h2 id='featured-title'>البحث القوي<br />يُرى من هيكله.</h2></div>
            <p>لا نعرض لك غلافًا جميلًا فقط. كل نموذج يوضح السؤال، نوع الدراسة، معيار الإبلاغ، مخرجات التسليم وحدود ما يمكن قوله قبل توفر البيانات.</p>
          </div>
          <div className='featured-layout'>
            <motion.div className='blueprint-card' initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}>
              <div className='blueprint-top'><span>RESEARCH BLUEPRINT</span><b>v1.0 / PRE-DATA</b></div>
              <div className='blueprint-main'><div className='blueprint-index'>A<span>01</span></div><div><small>QUESTION → METHOD → EVIDENCE</small><h3>من الفكرة إلى<br /><em>قرار بحثي واضح</em></h3></div></div>
              <div className='blueprint-flow'>
                <div><span>01</span><b>السؤال</b><small>ماذا نريد أن نعرف؟</small></div><i /><div><span>02</span><b>الأداة</b><small>كيف سنقيسه؟</small></div><i /><div><span>03</span><b>الدليل</b><small>ماذا نستطيع استنتاجه؟</small></div>
              </div>
              <div className='blueprint-note'><ShieldCheck size={17} /><span><b>بوابة النزاهة</b> لا تظهر أرقام نتائج في النموذج ما لم توجد بيانات حقيقية ومصدر قابل للتتبع.</span></div>
            </motion.div>
            <motion.div className='featured-copy' initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .2 }}>
              <span className='case-label'>دراسة عرض تعليمية • قابلة للتخصيص</span>
              <h3>The Silent Safety Signal</h3>
              <p>مثال بصري على تحويل ملاحظة سريرية إلى بروتوكول رصدي: تعريف للمشكلة، أداة جمع، خطة تحليل، وحدود أخلاقية واضحة.</p>
              <div className='featured-metadata'><span><small>نوع الدراسة</small><b>رصدية مستقبلية</b></span><span><small>الفئة</small><b>أطفال 0–14 سنة</b></span><span><small>المعيار</small><b>STROBE-style</b></span><span><small>الحالة</small><b>قبل جمع البيانات</b></span></div>
              <div className='featured-output'><small>ما الذي يراه العميل؟</small><div><span>سؤال ومنهج</span><span>أداة جمع</span><span>خطة تحليل</span><span>حدود الاستنتاج</span></div></div>
              <button className='btn dark' type='button' onClick={() => requestLike('full')}>أبغى مشروع بنفس العمق <ArrowLeft size={16} /></button>
            </motion.div>
          </div>
        </section>

        <section className='library-section' id='work'>
          <div className='wrap'>
            <motion.div className='library-compact-head' initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div><span className='eyebrow'>مكتبة الأبحاث</span><h2>شوف المستوى<br />بدون زحمة.</h2><p>ثلاث لمحات كافية لتفهم طريقة البناء. المكتبة الكاملة تفتح عند الطلب في مساحة مستقلة.</p></div>
              <div className='library-compact-action'><div><b>12</b><span>ملفًا كاملًا قابلًا للتصفح</span></div><button className='btn dark' type='button' onClick={() => setLibraryOpen(true)}>استكشف المكتبة كاملة <ArrowLeft size={16} /></button></div>
            </motion.div>
            <div className='library-spotlights'>
              {showcase.slice(0, 3).map((item, index) => (
                <motion.button type='button' key={item.id} className='library-spotlight' onClick={() => setActiveSample(item)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ delay: index * .08 }} whileHover={{ y: -5 }} whileTap={{ scale: .985 }}>
                  <span className='spotlight-number'>0{index + 1}</span><div className='spotlight-body'><span>{item.studyType} <b>{item.standard}</b></span><h3>{item.title}</h3><p>{item.signal} · معاينة كاملة من 20 صفحة</p></div><span className='spotlight-arrow'><ArrowLeft size={17} /></span>
                </motion.button>
              ))}
            </div>
            <div className='library-compact-foot'><span><ShieldCheck size={16} /> مراجع حقيقية، ونتائج رقمية فقط عند توفر البيانات.</span><button type='button' onClick={() => setLibraryOpen(true)}>مشاهدة جميع النماذج <ArrowLeft size={14} /></button></div>
          </div>
        </section>

        <AnimatePresence>
          {libraryOpen && (
            <motion.div className='library-modal-backdrop' role='presentation' onClick={() => setLibraryOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.section className='library-modal' role='dialog' aria-modal='true' aria-labelledby='library-modal-title' onClick={(event) => event.stopPropagation()} initial={{ opacity: 0, y: 28, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .98 }}>
                <header className='library-modal-head'><div><span className='eyebrow'>FULL RESEARCH LIBRARY</span><h2 id='library-modal-title'>اختر البحث الذي تريد رؤيته.</h2><p>اضغط على أي نموذج لفتح المعاينة التفاعلية كاملة.</p></div><button type='button' className='library-modal-close' onClick={() => setLibraryOpen(false)} aria-label='إغلاق المكتبة'><X size={19} /></button></header>
                <div className='library-modal-toolbar'><div className='portfolio-tabs'>{categories.map(({ key, label, icon: Icon }) => <button key={key} type='button' className={portfolioFilter === key ? 'active' : ''} onClick={() => setPortfolioFilter(key)}><Icon size={14} />{label}</button>)}</div><span>{filteredShowcase.length} نماذج</span></div>
                <motion.div layout className='library-modal-grid'>{filteredShowcase.map((item, index) => <motion.button type='button' layout key={item.id} className='library-modal-item' onClick={() => { setLibraryOpen(false); setActiveSample(item); }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .03, .2) }}><span className='modal-item-index'>{String(index + 1).padStart(2, '0')}</span><div><span className='modal-item-meta'>{item.studyType} · {item.standard}</span><h3>{item.title}</h3><p>{item.signal} · 20 صفحة قابلة للتصفح</p></div><ArrowLeft size={17} /></motion.button>)}</motion.div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {compareOpen && compareItems.length === 2 && <motion.div className='compare-modal-backdrop' role='presentation' onClick={() => setCompareOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section className='compare-modal' role='dialog' aria-modal='true' aria-labelledby='compare-modal-title' onClick={(event) => event.stopPropagation()} initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }}>
              <header className='compare-modal-head'><div><span className='eyebrow'>RESEARCH COMPARE</span><h2 id='compare-modal-title'>الفرق يظهر في المنهج.</h2><p>مقارنة مختصرة تساعدك تختار المسار الصحيح قبل طلب المشروع.</p></div><button type='button' className='library-modal-close' onClick={() => setCompareOpen(false)} aria-label='إغلاق المقارنة'><X size={19} /></button></header>
              <div className='compare-grid'>{compareItems.map((item) => <article key={item.id} className='compare-card'><div className='compare-card-top'><span>{item.studyType}</span><b>{item.standard}</b></div><h3>{item.title}</h3><p>{item.problem}</p><dl><div><dt>المخرج</dt><dd>{item.outcome}</dd></div><div><dt>يحتاج</dt><dd>{item.deliverables.join(' · ')}</dd></div><div><dt>الإشارة</dt><dd>{item.signal}</dd></div></dl><button type='button' className='btn dark full' onClick={() => { setCompareOpen(false); setActiveSample(item); }}>افتح الملف الكامل <ArrowLeft size={15} /></button></article>)}</div>
              <footer className='compare-modal-foot'><span><ShieldCheck size={15} /> المقارنة تفحص التصميم والمخرج، لا تستبدل قراءة البحث الكامل.</span><button type='button' onClick={() => setCompareIds([])}>مسح المقارنة</button></footer>
            </motion.section>
          </motion.div>}
        </AnimatePresence>

        <section className='section wrap' id='services'>
          <div className='section-head'><div><span className='eyebrow'>الخدمات</span><h2>خذ الجزء الذي<br />يحتاجه بحثك الآن.</h2></div><p>لا تحتاج تبدأ بباقـة كبيرة. اختر نقطة التعطّل، وشاهد كيف ينعكس ذلك على التقدير قبل إرسال الطلب.</p></div>
          <div className='service-grid'>{services.map((item, index) => { const Icon = item.icon; return <motion.button key={item.key} type='button' className={'service-card ' + (service === item.key ? 'active' : '')} onClick={() => chooseService(item.key)} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ delay: index * .04 }}><div className='service-card-top'><span>0{index + 1}</span><Icon size={20} /></div><h3>{item.title}</h3><p>{item.short}</p><footer><b>من {item.price} ر.س</b><ArrowLeft size={15} /></footer></motion.button>; })}</div>
        </section>

        <section className='method-section section' id='how'>
          <div className='wrap method-layout'><div><span className='eyebrow'>كيف نعمل</span><h2>كل مرحلة لها<br /><em>مخرج واضح.</em></h2><p>الهدف أن تخرج من المشروع وأنت فاهم لماذا اختير السؤال والمنهج والتحليل، وليس فقط معك ملف طويل.</p><button className='btn light' type='button' onClick={goOrder}>ناقش مشروعك <ArrowLeft size={16} /></button></div><div className='method-steps'>{[{ icon: Search, n: '01', t: 'نقرأ المطلوب', p: 'تعليمات الدكتور، المجال، الموعد وما هو موجود عندك.' }, { icon: Microscope, n: '02', t: 'نصمم المسار', p: 'سؤال، مصادر، أداة، عينة، تحليل ومخرجات.' }, { icon: BookOpenCheck, n: '03', t: 'نراجع ونشرح', p: 'فحص اتساق، مصادر، تنسيق، وحدود الاستنتاج.' }].map(({ icon: Icon, n, t, p }, index) => <motion.article key={n} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .1 }}><span>{n}</span><Icon size={19} /><div><h3>{t}</h3><p>{p}</p></div></motion.article>)}</div></div>
        </section>

        <section className='price-section' id='price'>
          <div className='wrap price-layout'><div className='price-copy'><span className='eyebrow light'>حاسبة واضحة</span><h2>اعرف نطاقك<br />قبل الرسالة.</h2><p>التقدير مبدئي، ويتأكد بعد مراجعة المطلوب. العدد هنا للصفحات المتوقعة، وليس وعدًا بجودة تُقاس بالصفحات فقط.</p><div className='price-points'><span><Check size={15} /> السعر يتغير حسب المطلوب الفعلي</span><span><Check size={15} /> أولوية للمنهج والمصادر</span><span><Check size={15} /> لا نتائج مختلقة</span></div></div><motion.div className='calculator' initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}><label>الخدمة<select value={service} onChange={(event) => setService(event.target.value as ServiceKey)}>{services.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}</select></label><label><span className='label-row'>عدد الصفحات المتوقع <b>{pages} صفحة</b></span><input aria-label='عدد الصفحات' type='range' min='5' max='60' value={pages} onChange={(event) => setPages(Number(event.target.value))} /><span className='range-ends'><small>5</small><small>60</small></span></label><div className='speed'><button type='button' className={urgency === 'normal' ? 'active' : ''} onClick={() => setUrgency('normal')}><b>عادي</b><span>5 أيام+</span></button><button type='button' className={urgency === 'fast' ? 'active' : ''} onClick={() => setUrgency('fast')}><b>سريع</b><span>2–4 أيام</span></button><button type='button' className={urgency === 'urgent' ? 'active' : ''} onClick={() => setUrgency('urgent')}><b>مستعجل</b><span>أقل من 48 ساعة</span></button></div><div className='estimate'><div><span>التقدير المبدئي</span><small>يتأكد بعد مراجعة التفاصيل</small></div><strong>{estimate}<em> ر.س</em></strong></div><button className='btn accent full' type='button' onClick={goOrder}>كمّل تفاصيل المشروع <ArrowLeft size={17} /></button></motion.div></div>
        </section>

        <section className='order-section' id='order'>
          <div className='wrap order-layout'><div className='order-copy'><span className='eyebrow'>طلب جديد</span><h2>أرسل الفكرة.<br /><em>نرتّب الباقي.</em></h2><p>انسخ تعليمات الدكتور أو اشرح ما الذي ينقصك. لا تحتاج تكتب وصفًا رسميًا؛ نبدأ من المعلومات التي عندك.</p><div className='order-benefits'><span><ShieldCheck size={18} /><b>خصوصية الطلب</b><small>بيانات الطلب لا تظهر في صفحة التتبع العامة.</small></span><span><Clock3 size={18} /><b>رقم مرجعي مباشر</b><small>يصلك رقم تستطيع استخدامه لمتابعة الحالة.</small></span></div></div><form className='order-form' onSubmit={submitOrder}><div className='form-heading'><span>PROJECT INTAKE</span><b>املأ ما تعرفه فقط</b></div><div className='fields two'><label>الاسم *<input name='name' placeholder='اسمك الأول يكفي' /></label><label>وسيلة التواصل *<input name='contact' placeholder='05xxxxxxxx أو البريد' /></label></div><div className='fields two'><label>الجامعة *<input name='university' placeholder='اسم الجامعة' /></label><label>التخصص<input name='major' placeholder='مثال: تمريض' /></label></div><label>عنوان البحث أو الموضوع *<input name='title' placeholder='حتى لو كان مبدئيًا' /></label><div className='fields two'><label>موعد التسليم *<input name='deadline' type='date' /></label><label>الخدمة<input value={selected.title} readOnly /></label></div><label>تعليمات الدكتور + المطلوب *<textarea name='details' rows={6} placeholder='مثال: مطلوب مراجعة منهجية، مصادر من آخر 5 سنوات، APA 7، وتسليم قبل موعد المناقشة...' /></label><div className='submit-row'><div><small>التقدير الحالي</small><strong>{estimate} ر.س</strong></div><button className='btn accent' type='submit' disabled={saving}>{saving ? 'جاري الإرسال...' : 'إرسال الطلب'} <Send size={16} /></button></div>{submitError && <div className='alert error'>{submitError}</div>}{orderId && <div className='alert success'><CheckCircle2 /><div><b>تم استلام طلبك</b><span>رقم الطلب: <strong>{orderId}</strong></span><small>احتفظ به للتتبع.</small></div></div>}</form></div>
        </section>

        <section className='section wrap' id='track'><div className='track-card'><div className='track-copy'><span className='eyebrow'>تتبع الطلب</span><h2>رقم واحد يكفي.</h2><p>نعرض الحالة والخدمة والموعد فقط. بيانات التواصل والجامعة لا تظهر هنا.</p></div><form onSubmit={trackOrder}><div className='track-input'><input aria-label='رقم الطلب' value={trackId} onChange={(event) => setTrackId(event.target.value)} placeholder='الصق رقم الطلب هنا' /><button className='btn dark' type='submit'>عرض الحالة</button></div>{trackError && <div className='alert error'>{trackError}</div>}{tracking && <div className='track-result'><div className='track-status'><span>الحالة الحالية</span><b>{tracking.status}</b></div><div className='track-details'><div><small>الموضوع</small><strong>{tracking.title}</strong></div><div><small>الخدمة</small><strong>{tracking.service}</strong></div><div><small>موعد التسليم</small><strong>{tracking.deadline}</strong></div></div></div>}</form></div></section>

        <section className='integrity-section section' id='integrity'><div className='wrap integrity-layout'><div><span className='eyebrow'>أمانة البحث</span><h2>الجودة ليست ادعاءً.<br />هي أشياء يمكن فحصها.</h2></div><div className='integrity-grid'><article><span>01</span><ShieldCheck size={18} /><h3>مصدر قابل للتتبع</h3><p>كل مرجع يجب أن يخدم تعريفًا أو حجة أو أداة، لا أن يكون حشوًا في النهاية.</p></article><article><span>02</span><Microscope size={18} /><h3>منهج يسبق النتيجة</h3><p>نوضح ما يمكن قوله من التصميم وما لا يمكن استنتاجه قبل رؤية البيانات.</p></article><article><span>03</span><BookOpenCheck size={18} /><h3>قابل للمراجعة</h3><p>تفتح الملف، ترى الهيكل، وتعرف أين يحتاج مشروعك إلى بيانات أو قرار إضافي.</p></article></div></div></section>

        <section className='section wrap faq'><div><span className='eyebrow'>قبل الطلب</span><h2>الأسئلة التي<br />تفرق فعلًا.</h2></div><div className='faq-list'><details open><summary>هل تعرضون نتائج بحث حقيقية؟ <ChevronDown /></summary><p>المعاينات داخل الموقع نماذج تعليمية. نستخدم مراجع حقيقية وبناءً منهجيًا، لكن لا ننسب بيانات أو نتائج رقمية لعميل أو دراسة دون دليل ومصدر.</p></details><details><summary>هل كل نموذج عمل عميل؟ <ChevronDown /></summary><p>لا. نوضح في كل ملف أنه نموذج عرض قابل للتخصيص. الهدف أن ترى طريقة التفكير ومستوى التنظيم قبل الطلب.</p></details><details><summary>هل أستطيع إرسال تعليمات الدكتور كاملة؟ <ChevronDown /></summary><p>نعم، وهذا الأفضل. التعليمات والموعد وحجم المطلوب تساعدنا على تسعير النطاق وبناء المسار الصحيح.</p></details></div></section>

        <footer className='footer'><div className='wrap footer-inner'><div><a href='#top' className='logo inverted'><span>م</span><strong>مَرجِع</strong><small>RESEARCH STUDIO</small></a><p>دعم بحثي مرتب، قابل للفهم والمراجعة.</p></div><div className='footer-links'><a href='#services'>الخدمات</a><a href='#work'>مكتبة الأبحاث</a><a href='#price'>الحاسبة</a><a href='#order'>ابدأ مشروعك</a><a href='#track'>التتبع</a></div><small>© 2026 مَرجِع — للاستخدام الأكاديمي المسؤول.</small></div></footer>
        <button className='mobile-action btn accent' type='button' onClick={goOrder}>ابدأ مشروعك <ArrowLeft size={17} /></button>
        {activeSample && activeDocument && <FullResearchReader document={activeDocument} onClose={() => setActiveSample(null)} onRequest={() => requestLike(activeSample.service)} />}
      </main>
    </MotionConfig>
  );
}

export default App;
