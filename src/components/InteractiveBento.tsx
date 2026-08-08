import { motion } from 'motion/react';
import { BarChart3, BookOpenCheck, FileSearch, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

const bars = [78, 92, 64, 86];

export default function InteractiveBento() {
  return (
    <section className='bento-section wrap' aria-labelledby='bento-title'>
      <motion.div className='section-head' initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}>
        <div><span className='eyebrow'>كيف يتحول الطلب إلى تسليم؟</span><h2 id='bento-title'>مو مجرد ملف. مسار كامل تشوفه قدامك.</h2></div>
        <p>تجربة تفاعلية مستوحاة من أنماط Bento وworkspace previews في 21st.dev، لكن مبنية لهوية «مَرجِع» ومحتوى البحث نفسه.</p>
      </motion.div>

      <div className='bento-grid'>
        <SpotlightCard className='bento-card bento-plan'>
          <div className='bento-icon'><FileText/></div><span className='bento-kicker'>01 — تحويل التعليمات</span><h3>من كلام الدكتور إلى خطة واضحة</h3><p>نحوّل المتطلبات إلى نطاق، أسئلة، فصول، مراجع ومخرجات قابلة للمراجعة.</p>
          <div className='mini-doc'><motion.i initial={{ width: '24%' }} whileInView={{ width: '88%' }} viewport={{ once: true }} transition={{ duration: .8 }}/><motion.i initial={{ width: '18%' }} whileInView={{ width: '72%' }} viewport={{ once: true }} transition={{ duration: .7, delay: .12 }}/><motion.i initial={{ width: '20%' }} whileInView={{ width: '56%' }} viewport={{ once: true }} transition={{ duration: .65, delay: .22 }}/></div>
        </SpotlightCard>

        <SpotlightCard className='bento-card bento-sources'>
          <div className='bento-icon'><FileSearch/></div><span className='bento-kicker'>02 — مصادر قابلة للتتبع</span><h3>المراجع مو أسماء مرمية</h3><p>المصدر يخدم سؤالًا أو منهجًا أو أداة، ونوضح موقعه في البحث بدل حشو قائمة طويلة.</p>
          <div className='source-stream'>{['PRISMA','STROBE','APA 7','IEEE','COREQ'].map((item, index)=><motion.span key={item} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index*.08 }}><BookOpenCheck size={13}/>{item}</motion.span>)}</div>
        </SpotlightCard>

        <SpotlightCard className='bento-card bento-analysis'>
          <div className='bento-icon'><BarChart3/></div><span className='bento-kicker'>03 — تحليل مفهوم</span><h3>من الأرقام إلى معنى قابل للنقاش</h3><p>نرتب خطة التحليل والجداول وحجم الأثر والحدود قبل تفسير أي نتيجة.</p>
          <div className='analysis-bars'>{bars.map((value,index)=><div key={value}><span>V{index+1}</span><i><motion.b initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: .7, delay: index*.08 }}/></i><small>{value}</small></div>)}</div>
        </SpotlightCard>

        <SpotlightCard className='bento-card bento-delivery'>
          <div className='bento-icon'><Sparkles/></div><span className='bento-kicker'>04 — تسليم قابل للفهم</span><h3>20 صفحة تقدر تتصفحها قبل الطلب</h3><p>كل نموذج يفتح كبحث كامل منظم، مع فهرس وتنقل ومراجع وصفحات تحليل ومناقشة.</p>
          <div className='page-stack' aria-hidden='true'><motion.div animate={{ y:[0,-7,0], rotate:[-5,-3,-5] }} transition={{ duration:4.8, repeat:Infinity }}/><motion.div animate={{ y:[0,6,0], rotate:[4,2,4] }} transition={{ duration:5.4, repeat:Infinity }}/><div><ShieldCheck size={18}/><b>20</b><span>صفحة / نموذج</span></div></div>
        </SpotlightCard>
      </div>
    </section>
  );
}
