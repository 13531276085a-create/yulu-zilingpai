import { FiveElement, YinYang } from '../types';

export const ELEMENT_COLORS: Record<FiveElement, string> = {
  '木': '#4CAF50',
  '火': '#F44336',
  '土': '#FF9800',
  '金': '#FFD700',
  '水': '#2196F3',
};

export const ELEMENT_GENERATING: Record<FiveElement, FiveElement> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木',
};

export const ELEMENT_OVERCOMING: Record<FiveElement, FiveElement> = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木',
};

export const YIN_YANG_SYMBOL: Record<YinYang, string> = {
  '陽': '⚊',
  '陰': '⚋',
};
