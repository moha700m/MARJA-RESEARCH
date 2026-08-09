import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AdminAccessGate from './admin/AdminAccessGate';
import AdminApp from './admin/AdminApp';
import AdminCredentialControl from './admin/AdminCredentialControl';
import CmsRuntimeBridge from './components/CmsRuntimeBridge';
import './index.css';
import './cms.css';

const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <AdminAccessGate><AdminApp/><AdminCredentialControl/></AdminAccessGate> : <><CmsRuntimeBridge/><App/></>}
  </StrictMode>
);