// 紫微斗数四化系统
// 化禄 · 化权 · 化科 · 化忌

export type SiHuaType = '化祿' | '化權' | '化科' | '化忌';

export interface SiHuaEffect {
  starId: string;
  starName: string;
  transformation: SiHuaType;
  source: '流年' | '流月';
  meaning: string;
}

// 十天干四化表
const GAN_SIHUA: Record<string, Record<SiHuaType, string>> = {
  '甲': { '化祿': 'star_lianzhen', '化權': 'star_pojun', '化科': 'star_wuqu', '化忌': 'star_taiyang' },
  '乙': { '化祿': 'star_tianji', '化權': 'star_tianliang', '化科': 'star_ziwei', '化忌': 'star_taiyin' },
  '丙': { '化祿': 'star_tiantong', '化權': 'star_tianji', '化科': 'star_wenchang', '化忌': 'star_lianzhen' },
  '丁': { '化祿': 'star_taiyin', '化權': 'star_tiantong', '化科': 'star_tianji', '化忌': 'star_jumen' },
  '戊': { '化祿': 'star_tanlang', '化權': 'star_taiyin', '化科': 'star_youbi', '化忌': 'star_tianji' },
  '己': { '化祿': 'star_wuqu', '化權': 'star_tanlang', '化科': 'star_tianliang', '化忌': 'star_wenqu' },
  '庚': { '化祿': 'star_taiyang', '化權': 'star_wuqu', '化科': 'star_taiyin', '化忌': 'star_tiantong' },
  '辛': { '化祿': 'star_jumen', '化權': 'star_taiyang', '化科': 'star_wenqu', '化忌': 'star_wenchang' },
  '壬': { '化祿': 'star_tianliang', '化權': 'star_ziwei', '化科': 'star_zuofu', '化忌': 'star_wuqu' },
  '癸': { '化祿': 'star_pojun', '化權': 'star_jumen', '化科': 'star_taiyin', '化忌': 'star_tanlang' },
};

// 十天干
const GANS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];

// 年上起月法：五虎遁 — 根据年干推算月干
// 甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚上，丁壬壬位顺行流，戊癸何处起？甲寅之上好追求
const MONTH_STEM_START: Record<string, number> = {
  '甲': 2, '己': 2, // 丙寅
  '乙': 4, '庚': 4, // 戊寅
  '丙': 6, '辛': 6, // 庚寅
  '丁': 8, '壬': 8, // 壬寅
  '戊': 0, '癸': 0, // 甲寅
};

export function getYearGanZhi(date: Date): { gan: string; zhi: string; zodiac: string } {
  const year = date.getFullYear();
  const offset = (year - 4) % 60;
  return {
    gan: GANS[offset % 10],
    zhi: ZHI[offset % 12],
    zodiac: ZODIAC[offset % 12],
  };
}

export function getLunarMonthNumber(date: Date): number {
  // 简化农历月估算，以节气为参考
  // 立春(2/4)为寅月(1), 惊蛰(3/6)为卯月(2), ...
  const monthStarts = [4, 6, 5, 5, 6, 6, 7, 8, 8, 8, 7, 7]; // 节气近似日期
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // 粗略计算：若日期在节气之后，则为该月；否则上个月
  if (d >= monthStarts[m - 1]) {
    return m; // 寅月=1... 但这边简单对应公历月
  }
  return m === 1 ? 12 : m - 1;
}

export function getMonthGan(yearGan: string, lunarMonth: number): string {
  const startIdx = MONTH_STEM_START[yearGan] ?? 0;
  const idx = (startIdx + lunarMonth - 1) % 10;
  return GANS[idx];
}

export function getCurrentSiHua(date: Date): {
  yearGan: string;
  yearZhi: string;
  yearZodiac: string;
  monthGan: string;
  monthZhi: string;
  lunarMonth: number;
  yearEffects: SiHuaEffect[];
  monthEffects: SiHuaEffect[];
} {
  const yearInfo = getYearGanZhi(date);
  const yearGan = yearInfo.gan;

  // 计算月干支
  const lunarMonth = getLunarMonthNumber(date);
  const monthGan = getMonthGan(yearGan, lunarMonth);
  const monthZhi = ZHI[(lunarMonth - 1 + 2) % 12]; // 寅月为正月

  // 流年四化
  const yearSiHua = GAN_SIHUA[yearGan];
  const yearEffects: SiHuaEffect[] = [];
  if (yearSiHua) {
    for (const [type, starId] of Object.entries(yearSiHua)) {
      yearEffects.push({
        starId,
        starName: '',
        transformation: type as SiHuaType,
        source: '流年',
        meaning: getSiHuaMeaning(type as SiHuaType, starId),
      });
    }
  }

  // 流月四化
  const monthSiHua = GAN_SIHUA[monthGan];
  const monthEffects: SiHuaEffect[] = [];
  if (monthSiHua) {
    for (const [type, starId] of Object.entries(monthSiHua)) {
      monthEffects.push({
        starId,
        starName: '',
        transformation: type as SiHuaType,
        source: '流月',
        meaning: getSiHuaMeaning(type as SiHuaType, starId),
      });
    }
  }

  return {
    yearGan,
    yearZhi: yearInfo.zhi,
    yearZodiac: yearInfo.zodiac,
    monthGan,
    monthZhi,
    lunarMonth,
    yearEffects,
    monthEffects,
  };
}

export function checkDrawnStarsSiHua(
  drawnStarIds: string[],
  sihuaInfo: ReturnType<typeof getCurrentSiHua>,
): SiHuaEffect[] {
  const results: SiHuaEffect[] = [];
  const allEffects = [...sihuaInfo.yearEffects, ...sihuaInfo.monthEffects];
  for (const id of drawnStarIds) {
    const hits = allEffects.filter((e) => e.starId === id);
    for (const hit of hits) {
      results.push({ ...hit, starName: id }); // starName filled by caller
    }
  }
  return results;
}

function getSiHuaMeaning(type: SiHuaType, starId: string): string {
  const meanings: Record<SiHuaType, string> = {
    '化祿': '財祿降臨，機遇增多，得財順利，人緣轉佳。凡事順遂，有意外之喜。',
    '化權': '權力增強，主導力提升，適合爭取主導權。專業能力被看見，有晉升之機。',
    '化科': '名聲顯揚，學業考試有利，才華被賞識。適合展現專業與才藝。',
    '化忌': '阻滯困頓，易生波折，須謹慎行事。情緒易受影響，宜保持冷靜。',
  };
  return meanings[type];
}

export { GANS, ZHI };
