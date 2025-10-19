// store.js - 创建状态存储
import { create } from 'zustand';

// 定义状态和修改方法
export const useHeroStore = create((set) => ({
    user: { model: null },
    setModel: (model) => set((state) => ({ user: { model } })) //state是旧属性
}));