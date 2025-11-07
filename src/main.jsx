import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SceneContainer from './Scene/SceneManage'
import * as THREE from 'three';

import MemoryMonitor from './Utils/MemoryLeakMonitor';
// const memoryMonitor = new MemoryMonitor();

// memoryMonitor.start(2000);
// window.addEventListener('beforeunload', () => {
//   memoryMonitor.stop();
// });

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    location.reload(); // 全页刷新
  });
}
window.THREE = THREE;
createRoot(document.getElementById('root')).render(
  <SceneContainer />
)
