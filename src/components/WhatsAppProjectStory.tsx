import { useEffect, useState } from 'react';
import { CheckCheck, FileCheck2, FileText, MessageCircleMore, Paperclip, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const messages = [
  {side:'client',time:'10:12',text:'السلام عليكم، عندي بحث تمريض وأحتاج أرتبه كامل. الدكتور أرسل لنا المطلوب والتسليم بعد 6 أيام.'},
  {side:'marja',time:'10:13',text:'وعليكم السلام. أرسل تعليمات الدكتور والملف الموجود عندك، وبنرتب لك النطاق أولًا: المشكلة، الأهداف، المنهج، الأداة، التحليل والمراجع.'},
  {side:'client',time:'10:16',text:'تم. أهم شيء يكون واضح واحترافي وما يكون مجرد كلام كثير.'},
  {side:'marja',time:'10:25',text:'راجعنا المطلوب. بنبني البحث على مسار STROBE، ونفصل المتغيرات وخطة العينة والتحليل. النتائج الرقمية ما راح ننشئها بدون بيانات فعلية.'},
  {side:'marja',time:'18:40',text:'تحديث اليوم: المقدمة والفجوة البحثية والمنهجية خلصت، والمراجع مرتبة. أرسلنا لك نسخة مراجعة قبل الإخراج النهائي.',file:'Research_Draft_v2.pdf'},
  {side:'client',time:'19:03',text:'ممتاز، الترتيب واضح جدًا. كملوا بنفس الشكل.'},
  {side:'marja',time:'اليوم 14:18',text:'تم التسليم النهائي: البحث + المراجع + أداة الدراسة + نسخة العرض. وكل قسم عليه مراجعة تنسيق وجودة.',file:'Final_Research_Package.zip'},
];

export default function WhatsAppProjectStory(){
  const [visible,setVisible]=useState(1);
  const [playing,setPlaying]=useState(true);

  useEffect(()=>{
    if(!playing) return;
    const timer=window.setInterval(()=>setVisible(v=>v>=messages.length?1:v+1),1450);
    return()=>window.clearInterval(timer);
  },[playing]);

  return <section className='whatsapp-story section' aria-labelledby='whatsapp-story-title'>
    <div className='wrap whatsapp-story-grid'>
      <motion.div className='whatsapp-story-copy' initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.3}}>
        <span className='eyebrow'>من أول رسالة إلى التسليم</span>
        <h2 id='whatsapp-story-title'>شوف كيف يمشي المشروع<br/>بدون ما تضيع بين التفاصيل.</h2>
        <p>هذه محاكاة توضيحية لمسار مشروع بحثي داخل المحادثة. الهدف يوضح لك طريقة العمل والتحديثات والتسليم، وليس عرض محادثة عميل حقيقي.</p>
        <div className='whatsapp-proof-points'>
          <div><span><ShieldCheck size={19}/></span><b>نطاق واضح قبل البداية</b><p>نفصل المطلوب ونحدد المنهج والمخرجات قبل التنفيذ.</p></div>
          <div><span><FileCheck2 size={19}/></span><b>تحديثات أثناء العمل</b><p>تعرف وش خلص ووش باقي بدل انتظار التسليم للنهاية.</p></div>
          <div><span><Paperclip size={19}/></span><b>تسليم مرتب</b><p>الملفات النهائية تكون مجمعة وواضحة ومهيأة للمراجعة.</p></div>
        </div>
        <button className='chat-replay' type='button' onClick={()=>{setVisible(1);setPlaying(true)}}><MessageCircleMore size={17}/> أعد تشغيل المحادثة</button>
      </motion.div>

      <motion.div className='iphone-shell' initial={{opacity:0,y:28,rotateY:-7}} whileInView={{opacity:1,y:0,rotateY:0}} viewport={{once:true,amount:.2}} transition={{duration:.7,ease:[.22,1,.36,1]}}>
        <div className='iphone-hardware'><i/><span/><i/></div>
        <div className='chat-app'>
          <header className='chat-header'>
            <div className='chat-avatar'>م</div>
            <div><strong>مَرجِع</strong><span>{visible<messages.length?'متصل الآن':'تم التسليم ✓'}</span></div>
            <button type='button' onClick={()=>setPlaying(v=>!v)} aria-label={playing?'إيقاف الحركة':'تشغيل الحركة'}>{playing?'إيقاف':'تشغيل'}</button>
          </header>
          <div className='chat-date'>سيناريو توضيحي • مشروع بحثي</div>
          <div className='chat-thread' aria-live='polite'>
            <AnimatePresence initial={false}>
              {messages.slice(0,visible).map((message,index)=><motion.div key={`${message.time}-${index}`} className={`chat-message ${message.side}`} initial={{opacity:0,y:16,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.32,ease:[.23,1,.32,1]}}>
                <p>{message.text}</p>
                {message.file&&<div className='chat-file'><FileText size={19}/><div><b>{message.file}</b><span>ملف جاهز للمراجعة</span></div></div>}
                <small>{message.time}{message.side==='marja'&&<CheckCheck size={13}/>}</small>
              </motion.div>)}
            </AnimatePresence>
            {playing&&visible<messages.length&&<motion.div className='typing-bubble' initial={{opacity:0}} animate={{opacity:1}}><i/><i/><i/></motion.div>}
          </div>
          <footer className='chat-input-fake'><span>اكتب رسالة...</span><MessageCircleMore size={18}/></footer>
        </div>
      </motion.div>
    </div>
  </section>;
}
