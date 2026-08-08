import { motion } from 'motion/react';
import { Activity, BarChart3, BookOpen, BrainCircuit, CircleDot, Clock3, FileSearch, GitBranch, HeartPulse, Layers3, Network, Orbit, Presentation, ShieldCheck, ShoppingBag, Sparkles, Target, Users2, Workflow } from 'lucide-react';

type Props={documentId:string;pageNumber:number};

type Theme={name:string;accent:string;soft:string;ink:string;pattern:string;icon:typeof Sparkles};

export const researchThemes:Record<string,Theme>={
  'ai-education-prisma':{name:'PRISMA Evidence Lab',accent:'#6d5dfc',soft:'#efedff',ink:'#28244f',pattern:'grid',icon:FileSearch},
  'nursing-burnout':{name:'Clinical Workforce Pulse',accent:'#159a76',soft:'#e7f8f2',ink:'#173d35',pattern:'cross',icon:HeartPulse},
  'sleep-performance':{name:'Circadian Study',accent:'#4967d8',soft:'#edf1ff',ink:'#25345f',pattern:'dots',icon:Orbit},
  'digital-cx':{name:'Customer Journey Lab',accent:'#e7793d',soft:'#fff0e7',ink:'#5a3321',pattern:'rings',icon:ShoppingBag},
  'influencer-purchase':{name:'Influence Network',accent:'#d4509a',soft:'#fff0f8',ink:'#58253f',pattern:'mesh',icon:Network},
  'engagement-turnover':{name:'People Analytics',accent:'#a56b2c',soft:'#fff5e6',ink:'#54391f',pattern:'bars',icon:Users2},
  'phishing-awareness':{name:'Cyber Awareness Lab',accent:'#10a4c5',soft:'#e7faff',ink:'#123d48',pattern:'circuit',icon:ShieldCheck},
  'blended-learning':{name:'Learning Experiment',accent:'#7c64d5',soft:'#f1edff',ink:'#33295d',pattern:'steps',icon:Layers3},
  'telehealth-qualitative':{name:'Qualitative Theme Map',accent:'#d9695c',soft:'#fff0ed',ink:'#58302d',pattern:'waves',icon:BrainCircuit},
  'fraud-ai-review':{name:'Model Comparison Lab',accent:'#2d7f73',soft:'#e8f7f4',ink:'#163f39',pattern:'matrix',icon:GitBranch},
  'sme-digital-case':{name:'Transformation Dashboard',accent:'#d18a2d',soft:'#fff5e5',ink:'#593f1e',pattern:'kpi',icon:BarChart3},
  'scientific-poster':{name:'Research Storyboard',accent:'#ed5e4e',soft:'#fff0ed',ink:'#5b2b25',pattern:'poster',icon:Presentation},
};

const fallback:Theme={name:'Academic Research',accent:'#fe5f3a',soft:'#fff0eb',ink:'#3e302b',pattern:'grid',icon:BookOpen};

export const getResearchTheme=(id:string)=>researchThemes[id]??fallback;

function Flow({accent}:{accent:string}){const nodes=['Search','Screen','Eligibility','Included'];return <div className='rv-flow'>{nodes.map((n,i)=><motion.div key={n} className='rv-flow-node' initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.08}}><span style={{background:accent}}>{i+1}</span><b>{n}</b>{i<nodes.length-1&&<i/>}</motion.div>)}</div>}
function Bars({accent}:{accent:string}){return <div className='rv-bars'>{[68,84,49,76,58].map((h,i)=><motion.i key={i} style={{background:accent}} initial={{height:0}} animate={{height:`${h}%`}} transition={{delay:i*.06,duration:.45}}/>)}</div>}
function OrbitScene({accent}:{accent:string}){return <div className='rv-orbit'><motion.i animate={{rotate:360}} transition={{duration:12,repeat:Infinity,ease:'linear'}}/><motion.span style={{background:accent}} animate={{scale:[1,1.08,1]}} transition={{duration:2.4,repeat:Infinity}}><CircleDot/></motion.span><b>Sleep</b><em>Performance</em></div>}
function NetworkScene({accent}:{accent:string}){return <div className='rv-network'>{[0,1,2,3,4].map(i=><motion.span key={i} style={{borderColor:accent}} animate={{scale:[1,1.08,1]}} transition={{delay:i*.15,duration:2,repeat:Infinity}}/>)}<i/><i/><i/><i/></div>}
function TimelineScene({accent}:{accent:string}){return <div className='rv-timeline'>{['Pre','Intervention','Post','Compare'].map((n,i)=><div key={n}><motion.span style={{background:accent}} initial={{scale:0}} animate={{scale:1}} transition={{delay:i*.1}}>{i+1}</motion.span><b>{n}</b></div>)}</div>}
function ThemeCloud({accent}:{accent:string}){return <div className='rv-theme-cloud'>{['Access','Trust','Privacy','Continuity','Communication'].map((n,i)=><motion.span key={n} style={{borderColor:accent}} animate={{y:[0,-4,0]}} transition={{delay:i*.18,duration:2.8,repeat:Infinity}}>{n}</motion.span>)}</div>}
function Matrix({accent}:{accent:string}){return <div className='rv-matrix'>{['Dataset','Model','Recall','F1','AUC','Explain'].map((n,i)=><motion.span key={n} style={{background:i%2?`${accent}18`:`${accent}2b`,borderColor:`${accent}35`}} initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{delay:i*.05}}>{n}</motion.span>)}</div>}
function Funnel({accent}:{accent:string}){return <div className='rv-funnel'>{['Experience','Satisfaction','Trust','Repurchase'].map((n,i)=><motion.div key={n} style={{width:`${100-i*15}%`,borderColor:accent}} initial={{x:20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:i*.08}}>{n}</motion.div>)}</div>}
function Cyber({accent}:{accent:string}){return <div className='rv-cyber'><motion.div animate={{boxShadow:[`0 0 0 0 ${accent}15`,`0 0 0 18px ${accent}00`]}} transition={{duration:1.8,repeat:Infinity}}><ShieldCheck/></motion.div>{['URL','Sender','Urgency','Attachment'].map(n=><span key={n}>{n}</span>)}</div>}
function Poster(){return <div className='rv-poster'><motion.div whileHover={{rotate:-1,y:-2}}><b>QUESTION</b><i/><i/></motion.div><motion.div whileHover={{rotate:1,y:-2}}><b>METHOD</b><i/><i/><i/></motion.div><motion.div whileHover={{rotate:-1,y:-2}}><b>RESULT</b><i/><i/></motion.div></div>}
function KPIs({accent}:{accent:string}){return <div className='rv-kpis'>{[['Cycle','−32%'],['NPS','+18'],['Adoption','74%']].map(([a,b],i)=><motion.div key={a} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*.1}}><small>{a}</small><strong style={{color:accent}}>{b}</strong></motion.div>)}</div>}

export default function ResearchVisualScene({documentId,pageNumber}:Props){
  const t=getResearchTheme(documentId); const Icon=t.icon;
  let visual=<Bars accent={t.accent}/>;
  if(documentId==='ai-education-prisma') visual=<Flow accent={t.accent}/>;
  else if(documentId==='sleep-performance') visual=<OrbitScene accent={t.accent}/>;
  else if(documentId==='digital-cx') visual=<Funnel accent={t.accent}/>;
  else if(documentId==='influencer-purchase') visual=<NetworkScene accent={t.accent}/>;
  else if(documentId==='phishing-awareness') visual=<Cyber accent={t.accent}/>;
  else if(documentId==='blended-learning') visual=<TimelineScene accent={t.accent}/>;
  else if(documentId==='telehealth-qualitative') visual=<ThemeCloud accent={t.accent}/>;
  else if(documentId==='fraud-ai-review') visual=<Matrix accent={t.accent}/>;
  else if(documentId==='sme-digital-case') visual=<KPIs accent={t.accent}/>;
  else if(documentId==='scientific-poster') visual=<Poster/>;
  return <motion.section className={`research-visual rv-${t.pattern}`} style={{'--rv-accent':t.accent,'--rv-soft':t.soft,'--rv-ink':t.ink} as React.CSSProperties} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.35}}>
    <header><span style={{background:t.soft,color:t.accent}}><Icon size={15}/>{t.name}</span><small>Interactive research layer • p.{String(pageNumber).padStart(2,'0')}</small></header>
    {visual}
  </motion.section>
}
