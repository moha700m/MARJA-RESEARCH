import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AdminApp from './admin/AdminApp';
import AdminCredentialControl from './admin/AdminCredentialControl';
import CmsRuntimeBridge from './components/CmsRuntimeBridge';
import EnhancementLayer from './components/EnhancementLayer';
import './index.css';
import './interactive.css';
import './superstack.css';
import './cms.css';

const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <><AdminApp/><AdminCredentialControl/></> : <><CmsRuntimeBridge/><EnhancementLayer/><App/></>}
  </StrictMode>
);
