import { FormEvent, type ReactNode, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './admin.css';

type Props = { children: ReactNode };

export default function AdminAccessGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!email || password.length < 8) { setMessage('اكتب البريد وكلمة المرور.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMessage(error.message);
  }

  async function bootstrap() {
    setMessage('');
    if (!email.includes('@') || password.length < 10 || !token.trim()) {
      setMessage('لأول تفعيل: بريد صحيح + كلمة مرور 10 أحرف على الأقل + رمز التهيئة.');
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('marja-admin', { body: { action: 'bootstrap', email: email.trim(), password, token: token.trim() } });
      if (error) throw error;
      if (data?.error) throw new Error(String(data.error));
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (loginError) throw loginError;
      setToken('');
      setMessage('تم تفعيل حساب المالك.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر تفعيل حساب المالك.');
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className='admin-loading'>جاري تحميل لوحة مَرجِع…</div>;
  if (session) return <>{children}</>;

  return <main className='admin-auth-shell' dir='rtl'>
    <section className='admin-auth-card'>
      <div className='admin-mark'>م</div>
      <span className='admin-kicker'>PRIVATE OWNER ACCESS</span>
      <h1>لوحة إدارة مَرجِع</h1>
      <p>بعد أول تفعيل، تدخل من هنا ببريدك وكلمة المرور فقط. رمز التهيئة يُستخدم مرة واحدة ثم يُغلق تلقائيًا.</p>
      <form onSubmit={login}>
        <label>البريد الإلكتروني<input type='email' value={email} onChange={(e) => setEmail(e.target.value)} autoComplete='email'/></label>
        <label>كلمة المرور<input type='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password'/></label>
        <button className='admin-primary' type='submit' disabled={busy}>{busy ? 'جاري الدخول…' : 'تسجيل الدخول'}</button>
      </form>
      <div style={{borderTop:'1px solid #e3e0d8',paddingTop:18,marginTop:6}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><ShieldCheck size={18}/><b style={{fontSize:13}}>أول مرة فقط</b></div>
        <label style={{display:'grid',gap:8,fontSize:12,fontWeight:900}}>رمز التهيئة<input value={token} onChange={(e) => setToken(e.target.value)} autoComplete='off'/></label>
        <button className='admin-secondary' type='button' onClick={bootstrap} disabled={busy} style={{width:'100%',marginTop:12}}>إنشاء وتفعيل حساب المالك</button>
      </div>
      {message && <div className='admin-message' style={{marginTop:14}}>{message}</div>}
      <a href='/' style={{display:'inline-block',marginTop:16}}>العودة للموقع</a>
    </section>
  </main>;
}
