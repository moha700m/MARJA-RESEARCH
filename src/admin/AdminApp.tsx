import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Activity, Bot, CheckCircle2, Eye, FileText, KeyRound, LayoutDashboard, LogOut, RefreshCw, Save, Search, Settings, ShieldCheck } from 'lucide-react';
import { fallbackSettings, supabase, type MarjaSiteSettings } from '../lib/supabase';
import './admin.css';

type Tab = 'overview' | 'content' | 'pricing' | 'seo' | 'requests' | 'ai' | 'security';
type Provider = { provider: string; enabled: boolean; model: string; secret_name: string; hasSecret: boolean };
type RequestRow = {
  id: string;
  name: string;
  contact: string;
  university: string;
  major: string;
  title: string;
  deadline: string;
  details: string;
  service: string;
  pages: number;
  urgency: string;
  estimate: number;
  status: string;
  admin_note: string;
  created_at: string;
  updated_at: string;
};
type EventRow = { id: number; action: string; created_at: string; details: Record<string, unknown> };

const statusLabels: Record<string, string> = {
  new: 'جديد',
  reviewing: 'مراجعة الطلب',
  in_progress: 'قيد التنفيذ',
  waiting_client: 'بانتظار العميل',
  ready: 'جاهز للتسليم',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const providerLabels: Record<string, string> = { openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google AI' };

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [claimToken, setClaimToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [settings, setSettings] = useState<MarjaSiteSettings>(fallbackSettings);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [secretInputs, setSecretInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(false); return; }
    checkAdmin();
  }, [session?.user.id]);

  useEffect(() => {
    if (isAdmin) loadAdminData();
  }, [isAdmin]);

  const requestStats = useMemo(() => ({
    total: requests.length,
    active: requests.filter((r) => ['new', 'reviewing', 'in_progress', 'waiting_client'].includes(r.status)).length,
    ready: requests.filter((r) => r.status === 'ready').length,
    value: requests.reduce((sum, item) => sum + Number(item.estimate || 0), 0),
  }), [requests]);

  async function invokeAdmin(body: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke('marja-admin', { body });
    if (error) throw error;
    if (data?.error) throw new Error(String(data.error));
    return data;
  }

  async function checkAdmin() {
    if (!session) return;
    const { data } = await supabase.from('marja_admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
    setIsAdmin(Boolean(data));
  }

  async function loadAdminData() {
    setMessage('');
    const [{ data: settingRow }, { data: requestRows }, { data: eventRows }] = await Promise.all([
      supabase.from('marja_site_settings').select('content').eq('id', 'main').single(),
      supabase.from('marja_requests').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('marja_admin_events').select('id,action,created_at,details').order('created_at', { ascending: false }).limit(30),
    ]);
    if (settingRow?.content) {
      const content = settingRow.content as Partial<MarjaSiteSettings>;
      setSettings({
        ...fallbackSettings,
        ...content,
        prices: { ...fallbackSettings.prices, ...(content.prices ?? {}) },
        features: { ...fallbackSettings.features, ...(content.features ?? {}) },
      });
    }
    setRequests((requestRows ?? []) as RequestRow[]);
    setEvents((eventRows ?? []) as EventRow[]);
    try {
      const status = await invokeAdmin({ action: 'status' });
      setProviders((status.providers ?? []) as Provider[]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر تحميل إعدادات الذكاء الاصطناعي.');
    }
  }

  async function authSubmit(event: FormEvent, mode: 'login' | 'signup') {
    event.preventDefault();
    setAuthMessage('');
    if (!email || password.length < 8) { setAuthMessage('اكتب بريدك وكلمة مرور 8 أحرف على الأقل.'); return; }
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setAuthMessage(error ? error.message : 'تم تسجيل الدخول.');
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/admin` } });
      setAuthMessage(error ? error.message : 'تم إنشاء الحساب. إذا طلب تأكيد البريد، افتح رسالة Supabase ثم ارجع للوحة.');
    }
  }

  async function claimAdmin(event: FormEvent) {
    event.preventDefault();
    setAuthMessage('');
    try {
      await invokeAdmin({ action: 'claim', token: claimToken });
      setIsAdmin(true);
      setClaimToken('');
      setAuthMessage('تم تفعيل حساب الإدارة بنجاح.');
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'تعذر تفعيل الإدارة.');
    }
  }

  async function saveSettings() {
    if (!session) return;
    setSaving(true); setMessage('');
    const { error } = await supabase.from('marja_site_settings').update({
      content: settings,
      updated_at: new Date().toISOString(),
      updated_by: session.user.id,
    }).eq('id', 'main');
    setSaving(false);
    setMessage(error ? error.message : 'تم حفظ إعدادات الموقع. افتح الصفحة الرئيسية أو حدّثها لرؤية التغيير.');
  }

  async function updateRequest(row: RequestRow, patch: Partial<RequestRow>) {
    const { error } = await supabase.from('marja_requests').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', row.id);
    if (error) { setMessage(error.message); return; }
    setRequests((items) => items.map((item) => item.id === row.id ? { ...item, ...patch } : item));
    setMessage(`تم تحديث الطلب ${row.id}.`);
  }

  async function saveProvider(provider: Provider) {
    try {
      await invokeAdmin({ action: 'update-provider', provider: provider.provider, enabled: provider.enabled, model: provider.model });
      setMessage(`تم حفظ إعداد ${providerLabels[provider.provider] ?? provider.provider}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر الحفظ.'); }
  }

  async function saveSecret(provider: Provider) {
    const secret = (secretInputs[provider.provider] ?? '').trim();
    if (!secret) { setMessage('الصق المفتاح أولًا.'); return; }
    try {
      await invokeAdmin({ action: 'save-secret', provider: provider.provider, secret, enabled: provider.enabled, model: provider.model });
      setSecretInputs((state) => ({ ...state, [provider.provider]: '' }));
      setProviders((items) => items.map((item) => item.provider === provider.provider ? { ...item, hasSecret: true } : item));
      setMessage('تم حفظ المفتاح مشفرًا. لن يظهر مرة أخرى في المتصفح.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر حفظ المفتاح.'); }
  }

  async function clearSecret(provider: Provider) {
    try {
      await invokeAdmin({ action: 'clear-secret', provider: provider.provider });
      setProviders((items) => items.map((item) => item.provider === provider.provider ? { ...item, hasSecret: false, enabled: false } : item));
      setMessage('تم حذف المفتاح وتعطيل المزود.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر حذف المفتاح.'); }
  }

  if (!authReady) return <div className='admin-loading'>جاري تحميل لوحة مَرجِع…</div>;

  if (!session) return <main className='admin-auth-shell' dir='rtl'>
    <section className='admin-auth-card'>
      <div className='admin-mark'>م</div>
      <span className='admin-kicker'>MARJA ADMIN</span>
      <h1>لوحة الإدارة الخاصة</h1>
      <p>تسجيل دخول آمن لإدارة المحتوى والأسعار والطلبات وSEO ومفاتيح الذكاء الاصطناعي.</p>
      <form onSubmit={(e) => authSubmit(e, 'login')}>
        <label>البريد الإلكتروني<input type='email' value={email} onChange={(e) => setEmail(e.target.value)} autoComplete='email'/></label>
        <label>كلمة المرور<input type='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password'/></label>
        <button className='admin-primary' type='submit'>تسجيل الدخول</button>
        <button className='admin-secondary' type='button' onClick={(e) => authSubmit(e as unknown as FormEvent, 'signup')}>إنشاء حساب الإدارة لأول مرة</button>
      </form>
      {authMessage && <div className='admin-message'>{authMessage}</div>}
      <a href='/'>العودة للموقع</a>
    </section>
  </main>;

  if (!isAdmin) return <main className='admin-auth-shell' dir='rtl'>
    <section className='admin-auth-card'>
      <ShieldCheck size={34}/>
      <span className='admin-kicker'>ONE-TIME SETUP</span>
      <h1>تفعيل المالك الأول</h1>
      <p>حسابك مسجل، لكنه ليس مديرًا بعد. أدخل رمز التهيئة لمرة واحدة فقط.</p>
      <form onSubmit={claimAdmin}>
        <label>رمز التهيئة<input value={claimToken} onChange={(e) => setClaimToken(e.target.value)} autoComplete='off'/></label>
        <button className='admin-primary' type='submit'>تفعيل لوحة الإدارة</button>
      </form>
      {authMessage && <div className='admin-message'>{authMessage}</div>}
      <button className='admin-secondary' onClick={() => supabase.auth.signOut()}>تسجيل الخروج</button>
    </section>
  </main>;

  return <main className='admin-app' dir='rtl'>
    <aside className='admin-sidebar'>
      <a className='admin-logo' href='/'><span>م</span><div><b>مَرجِع</b><small>لوحة المالك</small></div></a>
      <nav>
        {([
          ['overview', LayoutDashboard, 'نظرة عامة'], ['content', FileText, 'محتوى الموقع'], ['pricing', Settings, 'الأسعار والخصائص'], ['seo', Search, 'SEO'], ['requests', Activity, 'الطلبات'], ['ai', Bot, 'الذكاء الاصطناعي'], ['security', ShieldCheck, 'الأمان والسجل'],
        ] as Array<[Tab, typeof LayoutDashboard, string]>).map(([key, Icon, label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}><Icon size={18}/>{label}</button>)}
      </nav>
      <div className='admin-sidebar-bottom'>
        <a href='/' target='_blank' rel='noreferrer'><Eye size={16}/> فتح الموقع</a>
        <button onClick={() => supabase.auth.signOut()}><LogOut size={16}/> تسجيل الخروج</button>
      </div>
    </aside>

    <section className='admin-main'>
      <header className='admin-topbar'><div><span>لوحة التحكم</span><h2>{tab === 'overview' ? 'كل شيء في مكان واحد' : ({content:'محتوى الموقع',pricing:'الأسعار والخصائص',seo:'تهيئة محركات البحث',requests:'إدارة الطلبات',ai:'مفاتيح ومزودو الذكاء الاصطناعي',security:'الأمان وسجل الإدارة'} as Record<string,string>)[tab]}</h2></div><button className='admin-icon-button' onClick={loadAdminData} title='تحديث'><RefreshCw size={18}/></button></header>
      {message && <div className='admin-banner'>{message}</div>}

      {tab === 'overview' && <div className='admin-stack'>
        <div className='admin-stat-grid'>
          <article><small>كل الطلبات</small><strong>{requestStats.total}</strong></article>
          <article><small>طلبات نشطة</small><strong>{requestStats.active}</strong></article>
          <article><small>جاهزة للتسليم</small><strong>{requestStats.ready}</strong></article>
          <article><small>قيمة تقديرية</small><strong>{requestStats.value.toLocaleString('ar-SA')} ر.س</strong></article>
        </div>
        <section className='admin-panel'><div className='admin-panel-head'><div><span>حالة الإنتاج</span><h3>الموقع جاهز للتحكم من هنا</h3></div><CheckCircle2 size={24}/></div><div className='admin-check-grid'><span>Supabase CMS</span><span>RLS مفعّل</span><span>طلبات وتتبّع</span><span>SEO قابل للتعديل</span><span>AI secrets مشفرة</span><span>Vercel Production</span></div></section>
        <section className='admin-panel'><div className='admin-panel-head'><div><span>آخر الطلبات</span><h3>أحدث النشاط</h3></div></div><RequestTable rows={requests.slice(0, 6)} onUpdate={updateRequest}/></section>
      </div>}

      {tab === 'content' && <div className='admin-stack'>
        <section className='admin-panel'><PanelTitle title='الواجهة الرئيسية' subtitle='غيّر النصوص التي يراها العميل مباشرة.'/>
          <div className='admin-form-grid'>
            <Field label='اسم العلامة' value={settings.brandName} onChange={(v) => setSettings({...settings,brandName:v})}/>
            <Field label='العبارة الصغيرة' value={settings.heroKicker} onChange={(v) => setSettings({...settings,heroKicker:v})}/>
            <Field label='العنوان الرئيسي' value={settings.heroTitle} onChange={(v) => setSettings({...settings,heroTitle:v})}/>
            <Field label='الكلمة المميزة' value={settings.heroAccent} onChange={(v) => setSettings({...settings,heroAccent:v})}/>
            <Field wide label='وصف الهيرو' value={settings.heroDescription} onChange={(v) => setSettings({...settings,heroDescription:v})} multiline/>
            <Field label='زر الطلب' value={settings.primaryCta} onChange={(v) => setSettings({...settings,primaryCta:v})}/>
            <Field label='زر النماذج' value={settings.secondaryCta} onChange={(v) => setSettings({...settings,secondaryCta:v})}/>
            <Field label='رقم واتساب مع رمز الدولة' value={settings.whatsapp} onChange={(v) => setSettings({...settings,whatsapp:v})} placeholder='9665XXXXXXXX'/>
            <Field wide label='شريط إعلان اختياري' value={settings.announcement} onChange={(v) => setSettings({...settings,announcement:v})} placeholder='مثال: استقبال الطلبات لهذا الأسبوع متاح الآن'/>
          </div><SaveBar saving={saving} onSave={saveSettings}/>
        </section>
      </div>}

      {tab === 'pricing' && <div className='admin-stack'>
        <section className='admin-panel'><PanelTitle title='أسعار البداية' subtitle='تنعكس على بطاقات الخدمات والحاسبة والطلب المرسل.'/>
          <div className='admin-form-grid pricing'>
            {Object.entries(settings.prices).map(([key,value]) => <label key={key}>{({proposal:'خطة ومقترح',sources:'مصادر ومراجع',review:'مراجعة وتدقيق',analysis:'تحليل بيانات',slides:'عرض تقديمي',full:'دعم البحث الكامل'} as Record<string,string>)[key]}<div className='price-input'><input type='number' min='0' value={value} onChange={(e) => setSettings({...settings,prices:{...settings.prices,[key]:Number(e.target.value)}})}/><span>ر.س</span></div></label>)}
          </div>
        </section>
        <section className='admin-panel'><PanelTitle title='إظهار الأقسام' subtitle='أخفِ قسمًا مؤقتًا بدون حذف الكود.'/>
          <div className='admin-toggle-list'>
            {Object.entries(settings.features).map(([key,value]) => <label key={key}><div><b>{({showWhatsappStory:'قصة محادثة المشروع',showPortfolio:'نماذج الأبحاث',showPricing:'قسم الأسعار',showTracking:'تتبع الطلب'} as Record<string,string>)[key]}</b><small>يمكن إعادة تشغيله في أي وقت.</small></div><input type='checkbox' checked={value} onChange={(e) => setSettings({...settings,features:{...settings.features,[key]:e.target.checked}})}/></label>)}
          </div><SaveBar saving={saving} onSave={saveSettings}/>
        </section>
      </div>}

      {tab === 'seo' && <div className='admin-stack'>
        <section className='admin-panel'><PanelTitle title='SEO الأساسي' subtitle='هذه البيانات تتغير في title/meta عند تحميل الموقع.'/>
          <div className='admin-form-grid'>
            <Field wide label='SEO Title' value={settings.seoTitle} onChange={(v) => setSettings({...settings,seoTitle:v})}/>
            <Field wide label='Meta Description' value={settings.seoDescription} onChange={(v) => setSettings({...settings,seoDescription:v})} multiline/>
            <Field wide label='الكلمات المفتاحية — افصل بينها بفاصلة' value={settings.seoKeywords.join(', ')} onChange={(v) => setSettings({...settings,seoKeywords:v.split(',').map((x)=>x.trim()).filter(Boolean)})}/>
          </div>
          <div className='seo-preview'><small>معاينة نتيجة البحث</small><b>{settings.seoTitle}</b><span>marja-live-moha700ms-projects.vercel.app</span><p>{settings.seoDescription}</p></div>
          <SaveBar saving={saving} onSave={saveSettings}/>
        </section>
        <section className='admin-panel'><PanelTitle title='ملفات SEO المثبتة' subtitle='جاهزة في النسخة المنشورة.'/>
          <div className='admin-check-grid'><span>robots.txt</span><span>sitemap.xml</span><span>canonical</span><span>Open Graph</span><span>Twitter Card</span><span>JSON-LD</span><span>Web Manifest</span><span>Arabic lang/RTL</span></div>
        </section>
      </div>}

      {tab === 'requests' && <section className='admin-panel'><PanelTitle title='طلبات العملاء' subtitle='غيّر الحالة والملاحظة، وسيشاهد العميل الحالة الجديدة عند التتبع.'/><RequestTable rows={requests} onUpdate={updateRequest}/></section>}

      {tab === 'ai' && <div className='admin-stack'>
        <section className='admin-panel ai-intro'><KeyRound size={26}/><div><h3>المفاتيح لا تُحفظ داخل الموقع</h3><p>أي API Key تدخله هنا ينتقل إلى السيرفر ويُخزن مشفرًا في Supabase Vault. المتصفح بعد الحفظ يعرف فقط أن المفتاح موجود.</p></div></section>
        {providers.map((provider) => <section className='admin-panel provider-card' key={provider.provider}>
          <div className='provider-head'><div><span>{providerLabels[provider.provider] ?? provider.provider}</span><h3>{provider.hasSecret ? 'مفتاح محفوظ' : 'لا يوجد مفتاح'}</h3></div><i className={provider.hasSecret ? 'ok' : ''}>{provider.hasSecret ? 'SECURED' : 'EMPTY'}</i></div>
          <div className='admin-form-grid'>
            <label>الحالة<select value={provider.enabled ? 'on' : 'off'} onChange={(e) => setProviders((items)=>items.map((item)=>item.provider===provider.provider?{...item,enabled:e.target.value==='on'}:item))}><option value='off'>معطل</option><option value='on'>مفعّل</option></select></label>
            <Field label='المودل الافتراضي' value={provider.model} onChange={(v)=>setProviders((items)=>items.map((item)=>item.provider===provider.provider?{...item,model:v}:item))} placeholder='مثال: gpt-5.6'/>
            <label className='wide'>API Key جديد<input type='password' value={secretInputs[provider.provider] ?? ''} onChange={(e)=>setSecretInputs({...secretInputs,[provider.provider]:e.target.value})} placeholder={provider.hasSecret?'اتركه فارغًا للإبقاء على المفتاح الحالي':'الصق المفتاح هنا'}/></label>
          </div>
          <div className='provider-actions'><button className='admin-secondary' onClick={()=>saveProvider(provider)}>حفظ الإعدادات</button><button className='admin-primary' onClick={()=>saveSecret(provider)}>حفظ المفتاح بأمان</button>{provider.hasSecret&&<button className='admin-danger' onClick={()=>clearSecret(provider)}>حذف المفتاح</button>}</div>
        </section>)}
      </div>}

      {tab === 'security' && <div className='admin-stack'>
        <section className='admin-panel'><PanelTitle title='حماية اللوحة' subtitle='Supabase Auth + RLS + claim لمرة واحدة.'/><div className='admin-check-grid'><span>Auth session</span><span>Admin allowlist</span><span>Row Level Security</span><span>Vault encryption</span><span>Server-side secret writes</span><span>Audit events</span></div></section>
        <section className='admin-panel'><PanelTitle title='آخر أحداث الإدارة' subtitle='سجل مختصر للتغييرات الحساسة.'/><div className='audit-list'>{events.map((event)=><article key={event.id}><b>{event.action}</b><span>{new Date(event.created_at).toLocaleString('ar-SA')}</span></article>)}</div></section>
      </div>}
    </section>
  </main>;
}

function PanelTitle({title,subtitle}:{title:string;subtitle:string}) { return <div className='admin-panel-head'><div><span>إعداد</span><h3>{title}</h3><p>{subtitle}</p></div></div>; }

function Field({label,value,onChange,wide=false,multiline=false,placeholder=''}:{label:string;value:string;onChange:(value:string)=>void;wide?:boolean;multiline?:boolean;placeholder?:string}) {
  return <label className={wide?'wide':''}>{label}{multiline?<textarea rows={4} value={value} placeholder={placeholder} onChange={(e)=>onChange(e.target.value)}/>:<input value={value} placeholder={placeholder} onChange={(e)=>onChange(e.target.value)}/>}</label>;
}

function SaveBar({saving,onSave}:{saving:boolean;onSave:()=>void}) { return <div className='admin-savebar'><button className='admin-primary' onClick={onSave} disabled={saving}><Save size={16}/>{saving?'جاري الحفظ…':'حفظ ونشر التغييرات'}</button></div>; }

function RequestTable({rows,onUpdate}:{rows:RequestRow[];onUpdate:(row:RequestRow,patch:Partial<RequestRow>)=>void}) {
  if (!rows.length) return <div className='admin-empty'>ما فيه طلبات حتى الآن.</div>;
  return <div className='request-list'>{rows.map((row)=><article className='request-row' key={row.id}>
    <div className='request-main'><span>{row.id}</span><h4>{row.title}</h4><p>{row.name} · {row.university} · {row.contact}</p><small>{new Date(row.created_at).toLocaleString('ar-SA')} · {row.pages} صفحة · {row.estimate} ر.س</small></div>
    <div className='request-controls'><select value={row.status} onChange={(e)=>onUpdate(row,{status:e.target.value})}>{Object.entries(statusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><input value={row.admin_note} placeholder='ملاحظة داخلية' onChange={(e)=>onUpdate(row,{admin_note:e.target.value})}/></div>
  </article>)}</div>;
}
