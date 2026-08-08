import { useEffect, useMemo, useRef, useState } from 'react';
import '../hero-video.css';

export default function HeroDarkBackground(){
  const videoRef=useRef<HTMLVideoElement|null>(null);
  const [isDark,setIsDark]=useState(()=>typeof document!=='undefined'&&document.documentElement.dataset.theme==='dark');
  const [isMobile,setIsMobile]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width: 700px)').matches);
  const src=useMemo(()=>isMobile?'/videos/marja-hero-dark-mobile.mp4':'/videos/marja-hero-dark-desktop.mp4',[isMobile]);

  useEffect(()=>{
    const root=document.documentElement;
    const syncTheme=()=>setIsDark(root.dataset.theme==='dark');
    const observer=new MutationObserver(syncTheme);
    observer.observe(root,{attributes:true,attributeFilter:['data-theme']});
    syncTheme();

    const mobileMedia=window.matchMedia('(max-width: 700px)');
    const syncViewport=()=>setIsMobile(mobileMedia.matches);
    mobileMedia.addEventListener('change',syncViewport);
    syncViewport();

    return()=>{
      observer.disconnect();
      mobileMedia.removeEventListener('change',syncViewport);
    };
  },[]);

  useEffect(()=>{
    if(!isDark||!videoRef.current) return;
    const video=videoRef.current;
    video.muted=true;
    video.defaultMuted=true;
    video.load();
    const attempt=()=>void video.play().catch(()=>{});
    attempt();
    video.addEventListener('canplay',attempt,{once:true});
    return()=>video.removeEventListener('canplay',attempt);
  },[isDark,src]);

  if(!isDark) return null;

  return <div className='hero-video-bg' aria-hidden='true'>
    <video
      key={src}
      ref={videoRef}
      className='hero-video-media'
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload='auto'
      onCanPlay={(event)=>void event.currentTarget.play().catch(()=>{})}
    />
    <div className='hero-video-overlay'/>
  </div>;
}
