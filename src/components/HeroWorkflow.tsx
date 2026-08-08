import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, FileText, Search, ShieldCheck } from 'lucide-react';

const steps = [
  { n: '01', icon: Search, title: 'أرسل التعليمات', text: 'التخصص، الموضوع، المطلوب والموعد.' },
  { n: '02', icon: FileText, title: 'نحوّلها لخطة', text: 'نحدد النطاق، المراجع، المنهج والمخرجات.' },
  { n: '03', icon: Check, title: 'تابع برقم الطلب', text: 'حالة واضحة بدون تسجيل دخول أو رسائل ضايعة.' },
];

export default function HeroWorkflow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % steps.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.aside className='hero-workflow' initial={{ opacity: 0, x: -32, rotate: -1.5 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ delay: 0.16, duration: 0.7 }}>
      <div className='workflow-glow' aria-hidden='true'/>
      <div className='workflow-head'><span>مسار الطلب</span><b>LIVE FLOW</b></div>
      <div className='workflow-stack'>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const selected = active === index;
          return (
            <button key={step.n} type='button' className={`workflow-step ${selected ? 'active' : ''}`} onClick={() => setActive(index)}>
              <motion.span className='workflow-num' animate={selected ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(254,95,58,0)','0 0 0 11px rgba(254,95,58,.09)','0 0 0 0 rgba(254,95,58,0)'] } : { scale: 1 }} transition={{ duration: 1.2 }}><Icon size={15}/></motion.span>
              <span className='workflow-copy'><b>{step.title}</b><small>{step.text}</small></span>
              <span className='workflow-index'>{step.n}</span>
            </button>
          );
        })}
      </div>
      <motion.div key={active} className='workflow-preview' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className='preview-top'><span>مَرجِع</span><b>{steps[active].n} / 03</b></div>
        <div className='preview-lines'><i/><i/><i/></div>
        <div className='preview-chip'><ShieldCheck size={14}/> {active === 0 ? 'تعليمات واضحة' : active === 1 ? 'نطاق وسعر قبل التنفيذ' : 'رقم مرجعي آمن'}</div>
      </motion.div>
    </motion.aside>
  );
}
