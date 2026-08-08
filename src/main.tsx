import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import EnhancementLayer from './components/EnhancementLayer';
import './index.css';
import './interactive.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EnhancementLayer />
    <App />
  </StrictMode>
);
