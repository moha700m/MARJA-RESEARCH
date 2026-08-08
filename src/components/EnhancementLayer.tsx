import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Toaster, toast } from 'sonner';
import GSAPExperience from './GSAPExperience';
import InteractiveBento from './InteractiveBento';
import MobileQuickDrawer from './MobileQuickDrawer';
import ScrollProgress from './ScrollProgress';
import ThemeSwitcher from './ThemeSwitcher';
import WhatsAppProjectStory from './WhatsAppProjectStory';
import '../premium-experience.css';

function ProofStrip() {
  const items = [
    ['12', 'نموذج بحث متخصص'],
    ['20', 'صفحة لكل نموذج'],
    ['240', 'صفحة معاينة داخل الموقع'],
    ['5', 'مسارات تخصصية'],
  ];
  return <section className='proof-strip' aria-label='أرقام المنصة'><div className='wrap proof-grid'>{items.map(([value,label],index)=><motion.div key={label} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*.07}}><strong>{value}</strong><span>{label}</span></motion.div>)}</div></section>;
}

export default function EnhancementLayer() {
  const [bentoHost, setBentoHost] = useState<HTMLElement | null>(null);
  const [proofHost, setProofHost] = useState<HTMLElement | null>(null);
  const [whatsappHost, setWhatsappHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const portfolio = document.getElementById('work');
    const hero = document.getElementById('top');
    const price = document.getElementById('price');
    if (portfolio && !document.getElementById('enhanced-bento-host')) {
      const host = document.createElement('div');
      host.id = 'enhanced-bento-host';
      portfolio.parentNode?.insertBefore(host, portfolio);
      setBentoHost(host);
    }
    if (hero && !document.getElementById('enhanced-proof-host')) {
      const host = document.createElement('div');
      host.id = 'enhanced-proof-host';
      hero.insertAdjacentElement('afterend', host);
      setProofHost(host);
    }
    if (price && !document.getElementById('whatsapp-story-host')) {
      const host = document.createElement('div');
      host.id = 'whatsapp-story-host';
      price.parentNode?.insertBefore(host, price);
      setWhatsappHost(host);
    }

    document.querySelectorAll<HTMLElement>('.page-chip').forEach((node) => { node.textContent = '20 صفحة'; });
    const portfolioIntro = document.querySelector<HTMLElement>('.work-head > p');
    if (portfolioIntro) portfolioIntro.textContent = 'كل نموذج يفتح كبحث كامل من 20 صفحة: ملخص، فجوة بحثية، أدبيات، منهج، عينة، قياس، أخلاقيات، تحليل، مناقشة، توصيات ومراجع.';

    const pointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
      const target = (event.target as Element | null)?.closest<HTMLElement>('.service,.showcase-card,.case-study,.calculator,.order-form,.track,.how-grid article,.faq-list details');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      target.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    };
    window.addEventListener('pointermove', pointer, { passive: true });

    const steps = Array.from(document.querySelectorAll<HTMLElement>('.hero-card .step'));
    let active = 0;
    const tick = () => {
      steps.forEach((step,index) => step.classList.toggle('is-live', index === active));
      active = (active + 1) % Math.max(steps.length, 1);
    };
    tick();
    const timer = window.setInterval(tick, 2400);

    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('enhanced-visible');
    }), { threshold: .12 });
    document.querySelectorAll('.section,.portfolio-section,.price-section,.order-section,.track').forEach((node) => observer.observe(node));

    const relayAlerts = () => {
      document.querySelectorAll<HTMLElement>('.alert.success:not([data-toast-relayed])').forEach((node) => {
        node.dataset.toastRelayed = 'true';
        const text = node.innerText.trim();
        if (text) toast.success('تم استلام طلبك', { description: text.replace(/\s+/g,' ').slice(0,150) });
      });
      document.querySelectorAll<HTMLElement>('.alert.error:not([data-toast-relayed])').forEach((node) => {
        node.dataset.toastRelayed = 'true';
        const text = node.innerText.trim();
        if (text) toast.error('راجع البيانات', { description: text.replace(/\s+/g,' ').slice(0,150) });
      });
    };
    const toastObserver = new MutationObserver(relayAlerts);
    toastObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      window.removeEventListener('pointermove', pointer);
      window.clearInterval(timer);
      observer.disconnect();
      toastObserver.disconnect();
    };
  }, []);

  return <>
    <GSAPExperience/>
    <ScrollProgress/>
    <ThemeSwitcher/>
    <Toaster position='top-center' richColors closeButton visibleToasts={4} toastOptions={{duration:3600}}/>
    <div className='ambient-cursor' aria-hidden='true'/>
    {proofHost ? createPortal(<ProofStrip/>, proofHost) : null}
    {bentoHost ? createPortal(<InteractiveBento/>, bentoHost) : null}
    {whatsappHost ? createPortal(<WhatsAppProjectStory/>, whatsappHost) : null}
    <MobileQuickDrawer/>
  </>;
}
