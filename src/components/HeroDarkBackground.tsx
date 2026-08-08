import { useEffect, useState } from 'react';
import '../hero-video.css';

export default function HeroDarkBackground(){
  const [isDark,setIsDark]=useState(()=>typeof document!=='undefined'&&document.documentElement.dataset.theme==='dark');
  const [reduceMotion,setReduceMotion]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(()=>{
    const root=document.documentElement;
    const syncTheme=()=>setIsDark(root.dataset.theme==='dark');
    const observer=new MutationObserver(syncTheme);
    observer.observe(root,{attributes:true,attributeFilter:['data-theme']});
    syncTheme();

    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion=()=>setReduceMotion(media.matches);
    media.addEventListener('change',syncMotion);
    syncMotion();

    return()=>{
      observer.disconnect();
      media.removeEventListener('change',syncMotion);
    };
  },[]);

  if(!isDark||reduceMotion) return null;

  return <div className='hero-video-bg' aria-hidden='true'>
    <video className='hero-video-media' autoPlay muted loop playsInline preload='metadata'>
      <source src='/videos/marja-hero-dark-mobile.mp4' type='video/mp4' media='(max-width: 700px)'/>
      <source src='/videos/marja-hero-dark-desktop.mp4' type='video/mp4' media='(min-width: 701px)'/>
    </video>
    <div className='hero-video-overlay'/>
  </div>;
}
