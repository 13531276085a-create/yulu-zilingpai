import { ReadingRecord } from '../types';
import { getCardById } from '../data/cardDeck';
import { getCardInterpretation } from '../constants/interpretations';
import { FiveElement } from '../types';

interface CardData {
  id: string; name: string; position: number; strength: string;
  element: FiveElement; category: 'major' | 'auxiliary' | 'misc';
  overall: string; career: string; love: string; wealth: string; health: string;
  keywords: string[];
  yinYang: string;
}

function extract(reading: ReadingRecord): CardData[] {
  return reading.cards.map((c) => {
    const card = getCardById(c.cardId);
    const interp = getCardInterpretation(c.cardId);
    return {
      id: c.cardId,
      name: c.nameZh,
      position: c.position,
      strength: c.strengthState,
      element: card?.fiveElement ?? '土',
      category: card?.category ?? 'misc',
      overall: interp?.aspects.overall ?? '',
      career: interp?.aspects.career ?? '',
      love: interp?.aspects.love ?? '',
      wealth: interp?.aspects.wealth ?? '',
      health: interp?.aspects.health ?? '',
      keywords: card?.keywords ?? [],
      yinYang: card?.yinYang ?? '',
    };
  });
}

/** Determine question subject type */
function identifySubject(q: string): '物' | '人' | '事' | '混合' {
  const wu = /物|手机|东西|钥匙|钱包|车|房|找|丢|遗失|宠物|戒指|项链|手表|电脑|证件/;
  const ren = /人|他|她|对方|朋友|对象|伴侣|父母|孩子|领导|同事|感情|恋爱|婚姻/;
  const shi = /事|工作|事业|考试|面试|搬家|旅行|投资|钱|财|健康|病情|官司/;
  if (wu.test(q) && !ren.test(q)) return '物';
  if (ren.test(q)) return '人';
  if (shi.test(q)) return '事';
  return '混合';
}

/** Divergent meaning layers for each card */
function divergentMeanings(card: CardData, subject: string): string[] {
  const layers: Record<string, string[]> = {
    // 主星的多义层次
    '天魁': ['贵人相助、男性长辈', '贵重财物、有价值的东西', '领导/老板/上级', '帮助的力量'],
    '天鉞': ['女性贵人、暗中相助', '珍贵物品', '权威人士之助'],
    '太陽': ['男性、父亲/丈夫', '光明正大之事', '能源/发光体', '公众事务'],
    '太陰': ['女性、母亲/妻子', '钱财（田宅主）', '幽静/隐藏之美', '情感之事'],
    '巨門': ['口舌是非', '暗中的事/隐私', '管道/通道', '法律/诉讼'],
    '天機': ['朋友/同事', '变动/移动', '小事物/群聚之物', '计谋/思考'],
    '天同': ['小孩/晚辈', '享乐/放松之事', '协调/融合', '不着急的结果'],
    '廉貞': ['囚禁/约束', '血光/冲突', '精明/算计之人', '职场竞争'],
    '天府': ['仓库/储存', '稳重可靠之人', '积蓄/保守', '空间/场地'],
    '貪狼': ['欲望/桃花', '才艺/交际', '投机取巧', '多方周旋'],
    '七殺': ['杀伐果断', '冲动鲁莽之人', '突破/破局', '争斗对抗'],
    '破軍': ['破坏/推翻', '大变动/改革', '消耗/损伤', '独行之人'],
    '天相': ['服务/辅佐', '温和之人', '文书/证件', '协调事务'],
    '天梁': ['老人/长辈', '庇佑/护持', '拖延/迟缓', '慈善/公益'],
    '紫微': ['高位者/领导', '稳定不动', '高贵/孤傲', '权威决定'],
    '武曲': ['钱财/金属', '刚强果断之人', '金融/银行', '决断之事'],
    // 辅星的多义层次
    '寡宿': ['孤独一人', '势单力薄', '单独/独自的状态', '没有援助'],
    '陰煞': ['看不见/隐藏', '小人暗中作祟', '藏起来的东西', '暗中之事'],
    '火星': ['急促/突发', '冲动/火爆', '火气/炎症', '快速变化'],
    '鈴星': ['暗火/慢性', '暗中酝酿的麻烦', '慢性问题', '隐忍后爆发'],
    '擎羊': ['刀伤/冲突', '直接的对抗', '切割/分离', '明面的伤害'],
    '陀羅': ['纠缠/绕圈', '拖延/反反复复', '麻烦/阻碍', '慢性折磨'],
    '祿存': ['财富/积累', '稳固的财物', '储存/积蓄', '不动之财'],
    '地劫': ['波折/空亡', '突然的损失', '虚空/不确定', '天灾意外'],
    '地空': ['空想/不实', '落空/失望', '精神层面的困扰', '虚无幻想'],
    '文昌': ['文书/证件', '考试/学历', '文化/学识', '契约合同'],
    '文曲': ['口才/表达', '艺术/才艺', '花言巧语', '舆论/信息'],
    '左輔': ['辅助/帮手', '助力（男性）', '增援力量', '辅助角色'],
    '右弼': ['辅助/帮手', '助力（女性）', '增援力量', '辅助角色'],
    '天刑': ['刑法/规则', '伤病/痛苦', '约束/限制', '纪律制裁'],
    '天姚': ['桃花/暧昧', '诱惑/陷阱', '表面美好', '虚情假意'],
    '天馬': ['跑动/奔波', '移动/旅行', '快速变化', '驿马星动'],
    // 杂曜
    '天哭': ['悲伤/哭泣', '失落/沮丧', '不好的消息', '情感低落'],
    '天虛': ['空虚/不实', '虚弱/不足', '虚假/空壳', '根基不稳'],
    '孤辰': ['孤独/孤寡', '独居/独处', '格格不入', '自我封闭'],
  };

  // Wildcard: try keyword-based layer generation
  const name = card.name;
  if (layers[name]) return layers[name];

  // Fallback: generate from card keywords + category
  const cat = card.category === 'major' ? '主星' : card.category === 'auxiliary' ? '辅星' : '杂曜';
  const base = [
    `${card.keywords.slice(0, 2).join('、')}`,
    `对${subject === '物' ? '物品' : subject === '人' ? '人物' : '事情'}的影响`,
    `${cat}·${card.element}属性`,
    `${card.yinYang}性力量`,
  ];
  return base;
}

function strengthWord(s: string) {
  return s === '廟' ? '庙旺（力量充分）' : s === '旺' ? '旺相（气势正盛）' : s === '利' ? '平利（力量可用）' : '落陷（力量受制）';
}

function isMajorStar(card: CardData): boolean {
  return card.category === 'major';
}

function allMinor(cards: CardData[]): boolean {
  return cards.every(c => c.category !== 'major');
}

function hasMajor(cards: CardData[]): boolean {
  return cards.some(c => c.category === 'major');
}

// =======================================================
// Divergent-style fallback report
// =======================================================
function generateDivergentReport(reading: ReadingRecord): string {
  const cards = extract(reading);
  const q = reading.question;
  const subject = identifySubject(q);
  const [a, b, c] = cards;

  let r = '';

  // ── Section 1: 主体判定 ──
  const subjectLabel = subject === '物' ? '物品' : subject === '人' ? '人物/人际' : subject === '事' ? '事项' : '混合';
  const starStatus = allMinor(cards)
    ? '三张牌均非十四主星，牌面力量有限，提示此事时效性极强，需立即行动，否则局势易变。'
    : hasMajor(cards)
      ? '牌面包含主星，整体力量结构较为稳固，有一定的时间窗口可以思考和行动。'
      : '牌面力量一般，需结合具体星曜判断。';

  r += `✦ 主体判定：您问的是「${q}」，核心主体为【${subjectLabel}】。${starStatus}\n\n`;

  // ── Section 2: 牌象分层（发散含义） ──
  r += `✦ 牌象分层解读\n`;
  r += `┌──────────────────────────────┐\n`;

  [a, b, c].forEach((card, i) => {
    const layers = divergentMeanings(card, subject);
    const num = ['一', '二', '三'][i];
    const strength = strengthWord(card.strength);
    const isMajor = isMajorStar(card) ? '【主星】' : '【辅/杂】';
    r += `│ 第${num}张：${card.name}  ${strengthLabel(i, card)}${isMajor}\n`;
    r += `│   含义层一：${layers[0] || card.overall.substring(0, 30)}\n`;
    if (layers[1]) r += `│   含义层二：${layers[1]}\n`;
    if (layers[2]) r += `│   含义层三：${layers[2]}\n`;
    if (i < 2) r += `│\n`;
  });
  r += `└──────────────────────────────┘\n\n`;

  // ── Section 3: 情景推演 ──
  r += `✦ 情景推演（发散思维）\n\n`;

  // Build two divergent scenarios
  const a1 = divergentMeanings(a, subject)[0];
  const b1 = divergentMeanings(b, subject)[0];
  const c1 = divergentMeanings(c, subject)[0];
  const a2 = divergentMeanings(a, subject)[divergentMeanings(a, subject).length > 1 ? 1 : 0];
  const b2 = divergentMeanings(b, subject)[divergentMeanings(b, subject).length > 1 ? 1 : 0];

  r += `推演 A（正向解读）：\n`;
  r += `  如果${a.name}取其「${a1}」之意，${b.name}为「${b1}」，${c.name}为「${c1}」——\n`;
  r += `  那么整体线索指向：${buildScenario(subject, 'positive', a, b, c)}\n\n`;

  r += `推演 B（谨慎解读）：\n`;
  r += `  如果${a.name}取其「${a2}」之意，${b.name}为「${b2}」，${c.name}取负面含义——\n`;
  r += `  那么需要警惕：${buildScenario(subject, 'cautious', a, b, c)}\n\n`;

  // ── Section 4: 综合判断 ──
  r += `✦ 综合判断\n\n`;

  // Probability assessment
  const probFactors: string[] = [];
  if (hasMajor(cards)) probFactors.push('牌面有主星坐镇，根基较稳');
  else probFactors.push('三牌皆非主星，力量偏弱');
  if (cards.some(c => c.strength === '廟' || c.strength === '旺')) probFactors.push('有庙旺之星加持');
  if (cards.some(c => c.strength === '陷')) probFactors.push('有落陷之星拖累');
  probFactors.push(`${a.element}·${b.element}·${c.element}三行${analyzeElements(a, b, c)}`);

  const probText = probFactors.join('；');

  r += `力量评估：${probText}。\n`;
  r += `综合概率判断：${probabilityVerdict(cards, subject)}。\n\n`;

  r += `三张牌构成的整体画面是——${holisticPicture(a, b, c, subject)}${cards.some(c => c.strength === '陷') ? '但由于部分牌落陷，力量打了折扣，需看具体情况。' : ''}\n\n`;

  // ── Section 5: 行动建议 ──
  r += `✦ 行动建议\n\n`;

  if (allMinor(cards)) {
    r += `⚠ 关键提醒：三张牌均非十四主星，力量有限且时效性强。这意味着——您不行动，事情就会朝另一个方向走。必须把握时间窗口。\n\n`;
  }

  if (subject === '物') {
    r += buildMaterialAdvice(cards);
  } else if (subject === '人') {
    r += buildPersonAdvice(cards);
  } else {
    r += buildGeneralAdvice(cards);
  }

  // ── Section 6: 验盘提示 ──
  r += `\n✦ 验盘提示\n`;
  r += `事后复盘时可对照：如果${a.name}的「${divergentMeanings(a, subject)[0]}」含义成立，则结果应为______；如果${c.name}含义更突出，则可能走向______。最终答案往往在两张牌的交界处。\n`;

  r += `\n—— 雨露紫灵牌 · AI 占卜师视角`;
  return r;
}

function strengthLabel(i: number, card: CardData): string {
  const s = card.strength;
  const emoji = s === '廟' ? '⊕' : s === '旺' ? '△' : s === '利' ? '○' : '⊖';
  return `${emoji}${strengthWord(card.strength)} `;
}

function buildScenario(
  subject: string, tone: 'positive' | 'cautious',
  a: CardData, b: CardData, c: CardData
): string {
  if (tone === 'positive') {
    if (subject === '物') return `${a.name}的正面力量推动下，${b.name}的条件配合，物品有被找到/取回的可能性。${c.name}提示需要关注的方向。`;
    if (subject === '人') return `${a.name}代表的人际力量正面推动，结合${b.name}的变化条件，关系/人际走向积极。${c.name}提示需要注意的细节。`;
    return `${a.name}的正面力量引导下，${b.name}的配合条件有利，事情有向好发展的空间。${c.name}提示需要注意的方面。`;
  }
  if (subject === '物') return `${a.name}如果取其不利含义，加上${b.name}的阻力，物品可能被人为干预（藏起/拿走/转移）。${c.name}提示潜在的阻碍点。`;
  if (subject === '人') return `${a.name}的负面表现加上${b.name}的不利因素，关系中可能出现误解/隐瞒/第三方的干扰。${c.name}提示需要防范的方向。`;
  return `${a.name}如果取负面含义，加上${b.name}的不利因素，事情可能遇到阻碍。${c.name}提示需要警惕的方向。`;
}

function analyzeElements(a: CardData, b: CardData, c: CardData): string {
  const elements: string[] = [a.element, b.element, c.element];
  const unique: string[] = [...new Set(elements)];
  if (unique.length === 1) return `同属${unique[0]}，力量集中但缺乏调和`;
  if (unique.length === 3) return '三者各异，覆盖面广但力量分散';
  // 2 unique: check 生克
  const sheng: Record<string, string> = { '木火': '木生火·顺生有利', '火土': '火生土·顺生有利', '土金': '土生金·顺生有利', '金水': '金生水·顺生有利', '水木': '水生木·顺生有利' };
  const ke: Record<string, string> = { '木土': '木克土·有牵制', '土水': '土克水·有牵制', '水金': '水泄金·力量减弱', '金木': '金克木·有牵制', '火金': '火克金·有牵制' };
  for (const [k, v] of Object.entries(sheng)) {
    if (unique.includes(k[0]) && unique.includes(k[1])) return v;
  }
  for (const [k, v] of Object.entries(ke)) {
    if (unique.includes(k[0]) && unique.includes(k[1])) return v;
  }
  return '五行交织，需具体研判';
}

function probabilityVerdict(cards: CardData[], subject: string): string {
  const hasMiao = cards.some(c => c.strength === '廟');
  const hasXian = cards.filter(c => c.strength === '陷').length;
  const majorCount = cards.filter(c => c.category === 'major').length;
  const allMinor = cards.every(c => c.category !== 'major');

  if (allMinor) {
    if (hasMiao) return '约四成把握。虽然牌面力量有限（无主星），但庙旺之力提供一线希望。需立即行动，迟则生变。';
    if (hasXian >= 2) return '不足两成。三辅/杂全陷，力量极为薄弱，事情不以人的意志为转移，做好心理准备。';
    return '约三成把握。三张牌均非主星，提示此事变数较大，积极行动可能有转机，拖延则大概率落空。';
  }

  if (hasMiao && hasXian === 0 && majorCount >= 2) return '约六至七成把握。主星庙旺，根基扎实，事情往好的方向发展概率较大。';
  if (hasXian >= 2) return '约三成把握。落陷之星偏多，虽有主星但力量受限，宜做好两手准备。';
  if (hasMiao) return '约五成把握。有强星支撑但也有限制因素，需要主动争取。';
  return '约五成把握。牌面力量均衡，走向取决于实际应对而非牌面本身。';
}

function holisticPicture(a: CardData, b: CardData, c: CardData, subject: string): string {
  if (subject === '物') {
    return `${a.name}定义了物品的基本状态——${a.overall.substring(0, 40)}；${b.name}介入后，条件变为${b.strength === '陷' ? '需要更细致地溯源' : '有了更清晰的方向'}；${c.name}的收尾提示了最终需要注意的环节。三者共同指向一个线索：物品的"去"或"留"，取决于${a.strength === '廟' || a.strength === '旺' ? '正面的外力介入' : '行动的速度和方向'}。`;
  }
  if (subject === '人') {
    return `${a.name}代表了关系中核心的力量——${a.overall.substring(0, 30)}。${b.name}的加入改变了格局，带来了${b.strength === '陷' ? '需要特别注意的变数' : '新的可能性'}。${c.name}收尾揭示了关系走向的关键因素。三牌合参，此关系的发展取决于${a.element}与${c.element}之间的五行互动。`;
  }
  return `${a.name}定调了事情的基本方向——${a.overall.substring(0, 40)}。${b.name}提供了变化的条件，${c.name}标出了最终需要关注的环节。三个维度合在一起，指向了一条从「${a.name}的本质」出发，经过「${b.name}的变动」，最终落脚于「${c.name}的提示」的路径。`;
}

function buildMaterialAdvice(cards: CardData[]): string {
  const tips: string[] = [];
  if (cards.some(c => c.name === '天魁')) tips.push('1. 有贵人星——寻求店主、管理者、男性相关人士的帮助比独自寻找更有效');
  if (cards.some(c => c.name === '陰煞')) tips.push('2. 有隐藏星——物品可能被收起而非丢失，仔细检查台面/抽屉/角落等容易被"藏"起来的位置');
  if (cards.some(c => c.name === '寡宿' || c.name === '孤辰')) tips.push('3. 寡宿提示物品孤零零在某处——回到最后使用的地点仔细找');
  if (cards.some(c => c.name === '天馬' || c.name === '天機')) tips.push('4. 驿马星动——物品可能已经被移动过，追溯移动路径是关键');
  if (cards.some(c => c.strength === '陷')) tips.push('5. 有落陷之星——第一次寻找可能落空，坚持二次或三次尝试');
  if (cards.every(c => c.category !== 'major')) tips.push('★ 最重要的是：时间！无主星之时，越早行动越有利。拖过今天就可能是完全不同的结果。');
  if (tips.length === 0) tips.push('1. 追溯物品最后出现的位置\n2. 询问周围可能接触过的人\n3. 不要只凭记忆——实际回到现场搜寻');
  return tips.join('\n');
}

function buildPersonAdvice(cards: CardData[]): string {
  const tips: string[] = [];
  if (cards.some(c => c.name === '天魁' || c.name === '天鉞')) tips.push('1. 有贵人星——关系中可能有第三方调停或长辈介入的机会');
  if (cards.some(c => c.name === '巨門')) tips.push('2. 巨门主口舌——沟通是关键，但需注意措辞和时机，容易说错话');
  if (cards.some(c => c.name === '陰煞')) tips.push('3. 暗星出现——关系中可能有你不知道的信息，先了解再判断');
  if (cards.some(c => c.yinYang === '陰')) tips.push('4. 阴星偏多——情绪因素较大，冷静后再做决定');
  if (tips.length === 0) tips.push('1. 先了解对方的真实想法\n2. 不要在情绪激动时做决定\n3. 给彼此时间和空间');
  return tips.join('\n');
}

function buildGeneralAdvice(cards: CardData[]): string {
  const tips: string[] = [];
  if (cards.some(c => c.strength === '廟' || c.strength === '旺')) tips.push('1. 有庙旺之星——当前的时机是有利的，宜主动出击');
  if (cards.some(c => c.strength === '陷')) tips.push('2. 有落陷之星——此时不适合正面突破，以守为攻，等待转机');
  if (cards.some(c => c.name === '天機' || c.name === '天馬')) tips.push('3. 变动之星出现——计划要灵活，情况可能会快速变化');
  tips.push('4. 三张牌的五行属性已成格局——顺势而为胜于逆势硬扛');
  return tips.join('\n');
}

// =======================================================
// AI Prompt (divergent thinking style)
// =======================================================
function buildPrompt(reading: ReadingRecord): string {
  const cards = extract(reading);
  const subject = identifySubject(reading.question);
  const [a, b, c] = cards;

  const cardsDetail = cards.map(c => {
    const layers = divergentMeanings(c, subject).join(' / ');
    return `【${c.name}】第${c.position}张·${strengthWord(c.strength)}·${c.element}·${isMajorStar(c) ? '主星' : '辅/杂星'}
多义层：${layers}
牌意：${c.overall.substring(0, 100)}`;
  }).join('\n\n');

  return `你是一位经验丰富的紫微斗数占卜师。你用发散性思维解牌，不逐张罗列，而是从整体观的视角综合分析。

用户的问题是：「${reading.question}」
问的主体是：${subject === '物' ? '物品（非人）' : subject === '人' ? '人物/人际' : '事项'}
时空：${reading.sihuaYear}年${reading.sihuaMonth}月
四化：${reading.sihuaEffects.length > 0 ? reading.sihuaEffects.map(s => `${s.starName}·${s.transformation}(${s.source})：${s.meaning}`).join('；') : '无四化影响'}

抽出的三张牌：
${cardsDetail}

请用以下框架写一份解读报告（300-400字），使用繁体中文：

1. 【主体判定】先判断问的是物/人/事，然后看三张牌里有没有十四主星——没有主星说明力量有限、时效性强；有主星根基比较稳。

2. 【发散解读】每张牌至少给2-3层含义（如天魁→贵人/贵重物品/男老板）。不要逐张罗列，而是在三张牌的互动中找到最合理的含义组合。像占卜师在推敲：「如果这张是X意思，那张是Y意思，那么整体就是Z」。

3. 【情景推演】给出至少两种可能的解读路径：
   - 正向推演：如果取各牌的正面含义→结论是什么
   - 谨慎推演：如果取各牌的不利含义→需要注意什么

4. 【综合判断】从整体观给出判断：
   - 力量评估（主星/辅星、庙旺/落陷的组合效应）
   - 概率判断（给出数字，如「约四成把握」）
   - 三张牌共同构成的画面是什么

5. 【行动建议】2-3条具体可操作的建议。特别是无主星时，强调时机的重要性——必须立即行动。

原则：
- 发散思维：不要给唯一的答案，展示多种可能性然后收敛到最合理的
- 整体观：三张牌一起看，相互修正，不是三个独立故事
- 诚实：概率不高就说出来，不要过度乐观
- 像在对来问者说话，直接、清晰、有力量`;
}

export async function generateAIReport(reading: ReadingRecord, apiKey: string): Promise<string> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildPrompt(reading) }],
    }),
  });
  if (!resp.ok) throw new Error(`API ${resp.status}`);
  return (await resp.json()).content[0].text;
}

export function generateFallbackReport(reading: ReadingRecord): string {
  return generateDivergentReport(reading);
}
