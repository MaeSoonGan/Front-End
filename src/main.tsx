import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

registerSW({
  onNeedRefresh() {
    console.log('새 버전이 있습니다. 새로고침이 필요합니다.');
  },
  onOfflineReady() {
    console.log('오프라인에서도 사용할 준비가 되었습니다.');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);