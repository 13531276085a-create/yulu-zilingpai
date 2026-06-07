export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${mins}`;
}

export function formatDateShort(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];

export function getChineseYearInfo(date: Date): { stem: string; branch: string; zodiac: string } {
  const year = date.getFullYear();
  const offset = (year - 4) % 60;
  const stemIdx = offset % 10;
  const branchIdx = offset % 12;
  return {
    stem: HEAVENLY_STEMS[stemIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    zodiac: ZODIAC[branchIdx],
  };
}
