import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, BookOpen, Check, ChevronLeft, ChevronRight, FileText, Minus, Plus, ShieldCheck, X } from 'lucide-react';
import type { ResearchDocument } from '../data/researchDocuments';
import { getEnhancedResearchDocument } from '../data/enhancedResearch';
import ResearchVisualScene, { getResearchTheme } from './ResearchVisualScene';
import './research-reader.css';
import './research-visuals.css';

type Props = { document:ResearchDocument; onClose:()=>void; onRequest:()=>void };

export default function FullResearchReader({document,onClose,onRequest}:Props){
  const enhancedDocument=getEnhancedResearchDocument(document.id) ?? document;
  const theme=getResearchTheme(enhancedDocument.id);
  const [page,setPage]=useState(0);
  const [zoom,setZoom]=useState(100);
  useEffect(()=>{setPage(0);setZoom(100)},[enhancedDocument.id]);
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape') onClose();
      if(event.key==='ArrowLeft') setPage(v=>Math.min(enhancedDocument.pages.length-1,v+1));
      if(event.key==='ArrowRight') setPage(v=>Math.max(0,v-1));
    };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[enhancedDocument.pages.length,onClose]);
  const current=enhancedDocument.pages[page];
  const progress=useMemo(()=>Math.round(((page+1)/enhancedDocument.pages.length)*100),[page,enhancedDocument.pages.length]);
  const go=(n:number)=>setPage(Math.max(0,Math.min(enhancedDocument.pages.length-1,n)));
  const shellStyle={'--reader-accent':theme.accent,'--reader-soft':theme.soft,'--reader-ink':theme.ink} as CSSProperties;

  return <motion.div className='reader-overlay' role='presentation' onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <motion.section className={`reader-shell reader-theme-${enhancedDocument.id}`} style={shellStyle} role='dialog' aria-modal='true' aria-label={`معاينة البحث الكامل: ${enhancedDocument.title}`} onClick={e=>e.stopPropagation()} initial={{opacity:0,y:24,scale:.985}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:18,scale:.99}}>
      <header className='reader-topbar'>
        <div className='reader-title'><span className='reader-brand'>م</span><div><small>{theme.name} • {enhancedDocument.studyType} • {enhancedDocument.standard}</small><strong>{enhancedDocument.title}</strong></div></div>
        <div className='reader-tools'><span className='reader-page-count'><BookOpen size={14}/>{enhancedDocument.pageCount} صفحة</span><button type='button' onClick={()=>setZoom(v=>Math.max(80,v-10))} aria-label='تصغير'><Minus size={15}/></button><b>{zoom}%</b><button type='button' onClick={()=>setZoom(v=>Math.min(120,v+10))} aria-label='تكبير'><Plus size={15}/></button><button className='reader-close' type='button' onClick={onClose} aria-label='إغلاق'><X size={18}/></button></div>
      </header>

      <div className='reader-progress'><motion.span animate={{width:`${progress}%`}}/></div>

      <div className='reader-layout'>
        <aside className='reader-sidebar'>
          <div className='reader-sidebar-head'><FileText size={15}/><div><b>محتويات البحث</b><small>{theme.name}</small></div></div>
          <nav>{enhancedDocument.pages.map((item,index)=><button type='button' key={item.number} className={page===index?'active':''} onClick={()=>go(index)}><span>{String(item.number).padStart(2,'0')}</span><div><b>{item.title}</b><small>{item.kicker}</small></div></button>)}</nav>
          <div className='reader-integrity'><ShieldCheck size={17}/><p><b>بحث عرض أكاديمي احترافي.</b> المحتوى منهجي ومتكامل، وأي نتائج رقمية لا تُعرض إلا من بيانات حقيقية أو مصدر موثق.</p></div>
        </aside>

        <main className='reader-stage'>
          <button className='reader-nav prev' type='button' onClick={()=>go(page-1)} disabled={page===0} aria-label='الصفحة السابقة'><ChevronRight/></button>
          <div className='paper-viewport'>
            <AnimatePresence mode='wait'>
              <motion.article key={`${enhancedDocument.id}-${page}`} className={`research-paper theme-${enhancedDocument.id} ${current.number===1?'cover-page':''}`} style={{transform:`scale(${zoom/100})`}} initial={{opacity:0,x:-24,rotateY:-2}} animate={{opacity:1,x:0,rotateY:0}} exit={{opacity:0,x:24,rotateY:2}} transition={{duration:.25}}>
                <div className='paper-watermark'>MARJA • {theme.name.toUpperCase()}</div>
                {current.number===1?<>
                  <div className='cover-mark'><span>م</span><b>مَرجِع</b></div>
                  <div className='cover-rule'/><span className='paper-kicker'>{current.kicker}</span><h1>{current.title}</h1><p className='cover-sub'>بحث أكاديمي كامل • تجربة تفاعلية مختلفة حسب نوع الدراسة</p>
                  <ResearchVisualScene documentId={enhancedDocument.id} pageNumber={current.number}/>
                  <div className='cover-meta'><span>{theme.name}</span><span>20-page research experience</span><span>{enhancedDocument.standard}</span></div>
                </>:<>
                  <div className='paper-heading'><span>{String(current.number).padStart(2,'0')}</span><div><small>{current.kicker}</small><h2>{current.title}</h2></div></div>
                  <div className='paper-body'>{current.paragraphs.map((text,index)=><p key={index}>{text}</p>)}</div>
                  {[8,10,11,13,16,17,19].includes(current.number)&&<ResearchVisualScene documentId={enhancedDocument.id} pageNumber={current.number}/>} 
                </>}
                {current.number===1?null:<>{current.bullets&&<ul className='paper-bullets'>{current.bullets.map(item=><li key={item}><Check size={13}/><span>{item}</span></li>)}</ul>}{current.table&&<div className='paper-table'><table><thead><tr>{current.table.headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{current.table.rows.map((row,index)=><tr key={index}>{row.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>}{current.note&&<div className='paper-note'>{current.note}</div>}</>}
                <footer className='paper-page-footer'><span>مَرجِع • {theme.name}</span><b>{current.number} / {enhancedDocument.pageCount}</b></footer>
              </motion.article>
            </AnimatePresence>
          </div>
          <button className='reader-nav next' type='button' onClick={()=>go(page+1)} disabled={page===enhancedDocument.pages.length-1} aria-label='الصفحة التالية'><ChevronLeft/></button>
        </main>
      </div>

      <footer className='reader-bottombar'><div><span>صفحة {page+1} من {enhancedDocument.pageCount} • {theme.name}</span><div className='reader-dots'>{enhancedDocument.pages.map((_,index)=><button aria-label={`صفحة ${index+1}`} type='button' className={index===page?'active':''} onClick={()=>go(index)} key={index}/>)}</div></div><button type='button' className='btn accent' onClick={onRequest}>أبغى بحث بنفس المستوى <ArrowLeft size={16}/></button></footer>
    </motion.section>
  </motion.div>;
}
