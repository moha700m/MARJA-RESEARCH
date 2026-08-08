# مَرجِع — MARJA Research

منصة عربية لعرض خدمات الدعم الأكاديمي ونماذج الأعمال، مع حاسبة سعر، استقبال طلبات، وتتبع برقم مرجعي.

## الحالة الحالية

- Frontend: React 19 + Vite + TypeScript
- Motion: Motion for React
- Hosting target: Vercel
- API bridge (temporary): `/api/*` يتم تمريره إلى Backend النسخة الحالية على AppDeploy حتى يتم نقل البيانات إلى Backend مستقل.

## تشغيل محلي

```bash
npm install
npm run dev
```

## البناء

```bash
npm run build
```

## خارطة التطوير التالية

1. Full research preview experience: معاينة بحث كاملة متعددة الصفحات بدل الـmodal المختصر.
2. صفحات مستقلة لكل نموذج/Case Study قابلة للمشاركة.
3. معاينة PowerPoint واستبيان وتحليل بيانات تفاعلية.
4. نقل Backend الطلبات والتتبع من AppDeploy إلى قاعدة مستقلة (Neon/Supabase) ثم إزالة الـrewrite المؤقت.
5. Git workflow: branch -> Vercel Preview -> review -> merge to main -> production.

> مهم: نماذج العرض يجب ألا تُعرض كأعمال عملاء حقيقية أو نتائج/درجات موثقة إلا إذا توفر دليل فعلي بذلك.
