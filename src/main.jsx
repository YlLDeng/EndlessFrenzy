import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SceneContainer from './Scene/SceneManage'
import "./main.css";
import * as THREE from 'three';
import MemoryMonitor from './Utils/MemoryLeakMonitor';

const designWidth = 3840;
const baseFontSize = 24;
function setRemUnit() {
  const deviceWidth = document.documentElement.clientWidth;
  const scale = deviceWidth / designWidth;
  document.documentElement.style.fontSize = baseFontSize * Math.min(scale, 2) + 'px';
}

setRemUnit();

window.addEventListener('resize', setRemUnit);
window.THREE = THREE;
createRoot(document.getElementById('root')).render(
  <SceneContainer />
)
