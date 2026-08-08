import { useEffect, useState } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import { fallbackSettings, supabase, type MarjaSiteSettings } from '../lib/supabase';
import './credential-control.css';

export default function AdminCredentialControl() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [documentNumber, setDocumentNumber] = useState(fallbackSettings.freelanceDocument);
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user || !mounted) return;
      const { data: admin } = await supabase.from('marja_admins').select('user_id').eq('user_id', user.id).maybeSingle();
      if (!admin || !mounted) return;
      const { data: row } = await supabase.from('marja_site_settings').select('content').eq('id', 'main').single();
      if (row?.content) {
        const content = row.content as Partial<MarjaSiteSettings>;
        setDocumentNumber(content.freelanceDocument ?? fallbackSettings.freelanceDocument);
        setEnabled(content.features?.showFreelanceDocument ?? true);
      }
      setReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  async function save() {
    setMessage('');
    const { data: row, error: readError } = await supabase.from('marja_site_settings').select('content').eq('id', 'main').single();
    if (readError || !row?.content) { setMessage(readError?.message || 'تعذر قراءة الإعدادات.'); return; }
    const current = row.content as Partial<MarjaSiteSettings>;
    const next = {
      ...current,
      freelanceDocument: documentNumber.trim(),
      features: { ...fallbackSettings.features, ...(current.features ?? {}), showFreelanceDocument: enabled },
    };
    const { error } = await supabase.from('marja_site_settings').update({ content: next, updated_at: new Date().toISOString() }).eq('id', 'main');
    setMessage(error ? error.message : 'تم حفظ وثيقة العمل الحر وإعداد ظهورها.');
  }

  if (!ready) return null;
  return <>
    <button className='credential-admin-trigger' onClick={() => setVisible(true)}><BadgeCheck size={17}/> توثيق العمل</button>
    {visible && <div className='credential-admin-backdrop' onClick={() => setVisible(false)}>
      <section className='credential-admin-card' onClick={(e) => e.stopPropagation()}>
        <header><div><small>BUSINESS CREDENTIAL</small><h3>وثيقة العمل الحر</h3></div><button onClick={() => setVisible(false)} aria-label='إغلاق'><X size={18}/></button></header>
        <label>رقم الوثيقة<input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} dir='ltr'/></label>
        <label className='credential-toggle'><div><b>إظهارها في الموقع</b><small>تظهر تحت قسم الثقة، وتدخل في structured data.</small></div><input type='checkbox' checked={enabled} onChange={(e) => setEnabled(e.target.checked)}/></label>
        <button className='admin-primary' onClick={save}>حفظ التوثيق</button>
        {message && <p>{message}</p>}
      </section>
    </div>}
  </>;
}
