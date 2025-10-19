import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Scene from './Scene/Scene'
import * as THREE from 'three';

// 全局挂载THREE（配合之前的Vite配置）
window.THREE = THREE;
createRoot(document.getElementById('root')).render(
  <Scene />
)
