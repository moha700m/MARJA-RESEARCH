import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpenCheck, Calculator, ChevronUp, FileText, Search, X } from 'lucide-react';

const actions = [
  { id: 'order', label: 'ابدأ طلبك', hint: 'أرسل المطلوب مباشرة', icon: FileText },
  { id: 'work', label: 'شوف الأبحاث', hint: '12 نموذج بحث كامل', icon: BookOpenCheck },
  { id: 'price', label: 'احسب السعر', hint: 'تقدير فوري قبل الطلب', icon: Calculator },
  { id: 'track', label: 'تتبع طلبك', hint: 'برقم الطلب فقط', icon: Search },
];

export default function MobileQuickDrawer() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  return <>
    <button type='button' className='quick-drawer-trigger' onClick={() => setOpen(true)} aria-haspopup='dialog' aria-expanded={open}>
      <span>اختصارات</span><ChevronUp size={16}/>
    </button>
    <AnimatePresence>
      {open && <>
        <motion.button type='button' className='quick-drawer-backdrop' aria-label='إغلاق الاختصارات' onClick={() => setOpen(false)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}/>
        <motion.section
          className={`quick-drawer ${expanded ? 'is-expanded' : ''}`}
          role='dialog'
          aria-modal='true'
          aria-label='اختصارات مَرجِع'
          initial={{y:'100%',opacity:.98}}
          animate={{y:0,opacity:1}}
          exit={{y:'100%',opacity:.98}}
          transition={{type:'spring',duration:.44,bounce:.12}}
          drag='y'
          dragConstraints={{top:0,bottom:180}}
          dragElastic={{top:0,bottom:.32}}
          onDragEnd={(_,info) => {
            if (info.offset.y > 90 || info.velocity.y > 650) setOpen(false);
          }}
        >
          <div className='quick-drawer-handle' aria-hidden='true'/>
          <header>
            <div><small>وصول سريع</small><strong>وش تبي تسوي الآن؟</strong></div>
            <div className='quick-drawer-head-actions'>
              <button type='button' onClick={() => setExpanded(value => !value)} aria-label={expanded ? 'تصغير اللوحة' : 'توسيع اللوحة'}><ChevronUp className={expanded ? 'rotated' : ''} size={16}/></button>
              <button type='button' onClick={() => setOpen(false)} aria-label='إغلاق'><X size={17}/></button>
            </div>
          </header>
          <div className='quick-drawer-grid'>
            {actions.map(({id,label,hint,icon:Icon}) => <button type='button' key={id} onClick={() => go(id)}>
              <span className='quick-drawer-icon'><Icon size={19}/></span>
              <span><b>{label}</b><small>{hint}</small></span>
            </button>)}
          </div>
          <p className='quick-drawer-note'>اسحب اللوحة للأسفل للإغلاق. الحركة تتعطل تلقائيًا عند تفعيل تقليل الحركة في جهازك.</p>
        </motion.section>
      </>}
    </AnimatePresence>
  </>;
}
