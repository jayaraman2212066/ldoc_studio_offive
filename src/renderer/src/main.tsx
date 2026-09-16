import './browserMockBridge';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import brandLogo from '@brand/logo.png?url';
import './design/global.css';
import './i18n';
import { useStore } from './store/store';
import { realtimeAgentRunner } from './services/realtimeAgentRunner';

(window as any).__store = useStore;
(window as any).__runner = realtimeAgentRunner;

window.addEventListener('cth:test-dispatch', ((e: CustomEvent) => {
  const { agentId, task } = e.detail || {};
  const agent = useStore.getState().agents.find((a) => a.id === agentId);
  if (agent && task) {
    void realtimeAgentRunner.dispatchAgentTask(agent, task);
  }
}) as EventListener);


const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = brandLogo;
document.head.appendChild(favicon);

const splashMark = document.querySelector('#cth-splash .mk');
if (splashMark) {
  const img = document.createElement('img');
  img.src = brandLogo;
  img.alt = 'Universal Company';
  img.style.cssText = 'height:56px;width:auto;display:block';
  splashMark.replaceWith(img);
}

const root = document.getElementById('root');
if (!root) throw new Error('No root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
