import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from 'lucide-react';
import { gsap } from 'gsap';
import type { ResearchDocument } from '../data/researchDocuments';
import ResearchVisualScene, { getResearchTheme } from './ResearchVisualScene';

type Props = { document: ResearchDocument; onClose: () => void };

const sceneSeconds = 4.5;
const preferredPages = [1, 4, 8, 11, 16, 19];

export default function ResearchStoryMode({ document, onClose }: Props) {
  const theme = getResearchTheme(document.id);
  const scenes = useMemo(() => preferredPages.map((number) => document.pages.find((page) => page.number === number)).filter(Boolean) as ResearchDocument['pages'], [document.pages]);
  const total = Math.max(sceneSeconds, scenes.length * sceneSeconds);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frame = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const sceneRef = useRef<HTMLElement | null>(null);

  const sceneIndex = Math.min(scenes.length - 1, Math.floor(elapsed / sceneSeconds));
  const scene = scenes[Math.max(0, sceneIndex)];
  const progress = Math.min(100, (elapsed / total) * 100);

  useEffect(() => {
    if (!playing) {
      last.current = null;
      if (frame.current) cancelAnimationFrame(frame.current);
      return;
    }
    const tick = (now: number) => {
      if (last.current === null) last.current = now;
      const delta = (now - last.current) / 1000;
      last.current = now;
      setElapsed((value) => {
        const next = value + delta;
        if (next >= total) {
          setPlaying(false);
          return total;
        }
        return next;
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      last.current = null;
    };
  }, [playing, total]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const context = gsap.context(() => {
      gsap.fromTo('.story-scene-kicker', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .38, ease: 'power3.out' });
      gsap.fromTo('.story-scene h2', { y: 22, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .55, ease: 'power3.out' });
      gsap.fromTo('.story-scene-copy', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .5, delay: .08, ease: 'power3.out' });
    }, sceneRef);
    return () => context.revert();
  }, [sceneIndex]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === ' ') {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === 'ArrowLeft') setElapsed((value) => Math.min(total, value + sceneSeconds));
      if (event.key === 'ArrowRight') setElapsed((value) => Math.max(0, value - sceneSeconds));
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose, total]);

  if (!scene) return null;

  const style = {'--story-accent':theme.accent,'--story-soft':theme.soft,'--story-ink':theme.ink} as CSSProperties;
  const jump = (index: number) => setElapsed(Math.max(0, Math.min(total, index * sceneSeconds + .01)));

  return <motion.div className='story-overlay' style={style} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <section className='story-shell' role='dialog' aria-modal='true' aria-label={`العرض المتحرك: ${document.title}`}>
      <header className='story-topbar'>
        <div><small>MARJA STORY MODE</small><strong>{document.title}</strong></div>
        <button type='button' onClick={onClose} aria-label='إغلاق العرض المتحرك'><X size={18}/></button>
      </header>

      <div className='story-stage'>
        <AnimatePresence mode='wait'>
          <motion.article ref={sceneRef} key={`${document.id}-${scene.number}`} className='story-scene' initial={{opacity:0,scale:.985}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.99}} transition={{duration:.24}}>
            <div className='story-scene-copy'>
              <span className='story-scene-kicker'>{scene.kicker} · {String(scene.number).padStart(2,'0')}</span>
              <h2>{scene.title}</h2>
              <p>{scene.paragraphs[0]}</p>
              {scene.paragraphs[1] && <p>{scene.paragraphs[1]}</p>}
              <div className='story-scene-tags'><span>{theme.name}</span><span>{document.standard}</span><span>{document.studyType}</span></div>
            </div>
            <div className='story-scene-visual'><ResearchVisualScene documentId={document.id} pageNumber={scene.number}/></div>
          </motion.article>
        </AnimatePresence>
      </div>

      <footer className='story-controls'>
        <div className='story-transport'>
          <button type='button' onClick={() => jump(Math.max(0,sceneIndex-1))} aria-label='المشهد السابق'><ChevronRight size={17}/></button>
          <button type='button' className='story-play' onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>{playing ? <Pause size={18}/> : <Play size={18}/>}</button>
          <button type='button' onClick={() => jump(Math.min(scenes.length-1,sceneIndex+1))} aria-label='المشهد التالي'><ChevronLeft size={17}/></button>
          <button type='button' onClick={() => {setElapsed(0);setPlaying(true);}} aria-label='إعادة من البداية'><RotateCcw size={15}/></button>
        </div>
        <label className='story-scrubber'>
          <span>{Math.floor(elapsed)}s</span>
          <input aria-label='الانتقال في العرض المتحرك' type='range' min='0' max={total} step='.05' value={elapsed} onChange={(event) => {setPlaying(false);setElapsed(Number(event.target.value));}} style={{'--story-progress':`${progress}%`} as CSSProperties}/>
          <span>{Math.ceil(total)}s</span>
        </label>
        <div className='story-scenes'>{scenes.map((item,index) => <button type='button' key={item.number} className={index===sceneIndex?'active':''} onClick={() => jump(index)} aria-label={`مشهد ${index+1}`}>{String(index+1).padStart(2,'0')}</button>)}</div>
      </footer>
    </section>
  </motion.div>;
}
