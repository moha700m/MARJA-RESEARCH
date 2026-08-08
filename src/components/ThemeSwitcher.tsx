import { useEffect, useMemo, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

type ThemeMode = 'system' | 'light' | 'dark';

const modes: Array<{id:ThemeMode;label:string;icon:typeof Sun}> = [
  {id:'system',label:'النظام',icon:Monitor},
  {id:'light',label:'فاتح',icon:Sun},
  {id:'dark',label:'داكن',icon:Moon},
];

function resolve(mode:ThemeMode){
  if(mode!=='system') return mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeSwitcher(){
  const [mode,setMode]=useState<ThemeMode>(()=>{
    if(typeof window==='undefined') return 'system';
    const saved=window.localStorage.getItem('marja-theme');
    return saved==='light'||saved==='dark'||saved==='system'?saved:'system';
  });
  const activeLabel=useMemo(()=>modes.find(item=>item.id===mode)?.label??'النظام',[mode]);

  useEffect(()=>{
    const media=window.matchMedia('(prefers-color-scheme: dark)');
    const apply=()=>{
      const resolved=resolve(mode);
      document.documentElement.dataset.theme=resolved;
      document.documentElement.dataset.themeMode=mode;
      document.documentElement.style.colorScheme=resolved;
    };
    apply();
    window.localStorage.setItem('marja-theme',mode);
    if(mode==='system') media.addEventListener('change',apply);
    return()=>media.removeEventListener('change',apply);
  },[mode]);

  return <div className='theme-switcher' role='group' aria-label={`المظهر الحالي: ${activeLabel}`}>
    {modes.map(({id,label,icon:Icon})=><button key={id} type='button' className={mode===id?'active':''} onClick={()=>setMode(id)} aria-pressed={mode===id} aria-label={`المظهر: ${label}`}>
      {mode===id&&<motion.span className='theme-active-pill' layoutId='theme-active-pill' transition={{type:'spring',duration:.42,bounce:.12}}/>}
      <Icon size={15}/><b>{label}</b>
    </button>)}
  </div>;
}
