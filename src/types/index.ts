// === Five Elements & Polarity ===
export type FiveElement = '木' | '火' | '土' | '金' | '水';
export type YinYang = '陽' | '陰';
export type Direction = '東' | '南' | '西' | '北' | '東南' | '西南' | '東北' | '西北' | '中央';
export type StrengthState = '廟' | '旺' | '利' | '陷';
export type StarCategory = 'major' | 'auxiliary' | 'misc';

// === Card Definition ===
export interface CardDefinition {
  id: string;
  nameZh: string;
  category: StarCategory;
  fiveElement: FiveElement;
  yinYang: YinYang;
  direction: Direction;
  defaultStrength: StrengthState;
  keywords: string[];
  description: string;
  palaceAssociations: string[];
  symbol: string;
}

// === Palace Definition ===
export interface PalaceDefinition {
  id: string;
  nameZh: string;
  domain: string;
  fiveElement: FiveElement;
  description: string;
}

// === Interpretation Segments ===
export interface AspectInterpretation {
  career: string;
  love: string;
  wealth: string;
  health: string;
  overall: string;
}

// === Drawn Card ===
export interface DrawnCard {
  cardId: string;
  position: number;
  nameZh: string;
  strengthState: StrengthState;
  palaceId?: string;
}

// === SiHua ===
export type SiHuaType = '化祿' | '化權' | '化科' | '化忌';

export interface SiHuaEffect {
  starId: string;
  starName: string;
  transformation: SiHuaType;
  source: '流年' | '流月';
  meaning: string;
}

// === Reading Record ===
export interface ReadingRecord {
  id: string;
  timestamp: number;
  question: string;
  cards: DrawnCard[];
  interpretation: string;
  aspectBreakdown: AspectInterpretation;
  sihuaEffects: SiHuaEffect[];
  sihuaYear: string;
  sihuaMonth: string;
}

// === App Settings ===
export interface AppSettings {
  drawCount: 3 | 5;
  enableVibration: boolean;
  showPalaceContext: boolean;
  fontSize: 'medium' | 'large';
  aiApiKey: string;
}

// === Navigation Param List ===
export type RootStackParamList = {
  Home: undefined;
  Draw: { question: string };
  Result: { reading: ReadingRecord };
  History: undefined;
  HistoryDetail: { reading: ReadingRecord };
  Encyclopedia: undefined;
  CardDetail: { card: CardDefinition };
  Settings: undefined;
};
