import { ReadingRecord } from '../types';
import { getCardById } from '../data/cardDeck';
import { getCardInterpretation } from '../constants/interpretations';
import { FiveElement } from '../types';

interface CardData {
  name: string; position: number; strength: string;
  element: FiveElement; overall: string;
  career: string; love: string; wealth: string; health: string;
}

function extract(reading: ReadingRecord): CardData[] {
  return reading.cards.map((c) => {
    const card = getCardById(c.cardId);
    const interp = getCardInterpretation(c.cardId);
    return {
      name: c.nameZh, position: c.position, strength: c.strengthState,
      element: card?.fiveElement ?? '土',
      overall: interp?.aspects.overall ?? '',
      career: interp?.aspects.career ?? '',
      love: interp?.aspects.love ?? '',
      wealth: interp?.aspects.wealth ?? '',
      health: interp?.aspects.health ?? '',
    };
  });
}

function focus(q: string): { key: keyof CardData; label: string } {
  if (/感情|愛情|婚姻|伴侶|戀愛|分手|桃花/.test(q)) return { key: 'love', label: '感情' };
  if (/事業|工作|職|升遷|創業|求職|轉行/.test(q)) return { key: 'career', label: '事業' };
  if (/財|錢|投資|收入|賺|生意/.test(q)) return { key: 'wealth', label: '財運' };
  if (/健康|病|身體/.test(q)) return { key: 'health', label: '健康' };
  return { key: 'overall', label: '綜合' };
}

function strengthWord(s: string) {
  return s === '廟' ? '力量充沛' : s === '旺' ? '气势正盛' : s === '利' ? '平稳可用' : '力量受制';
}

function generateReport(reading: ReadingRecord): string {
  const cards = extract(reading);
  const f = focus(reading.question);
  const [a, b, c] = cards;
  let r = '';

  // 牌局解读
  r += `您的问题是：「${reading.question}」\n\n`;
  r += `三张牌依次为【${a.name}】【${b.name}】【${c.name}】。\n\n`;

  r += `${a.name}（${strengthWord(a.strength)}·${a.element}）是本局核心。${a.overall}\n`;
  r += `对「${f.label}」而言，${String(a[f.key]).replace(/^[^。]*。/, '')}\n\n`;

  r += `${b.name}（${strengthWord(b.strength)}·${b.element}）作为第二张牌加入后：${b.overall}\n`;
  r += `它在本局中的作用是：${String(b[f.key]).replace(/^[^。]*。/, '')}\n\n`;

  r += `${c.name}（${strengthWord(c.strength)}·${c.element}）收尾，提示了最终需要留意的方面。${c.overall}\n`;
  r += `它给出的信号是：${String(c[f.key]).replace(/^[^。]*。/, '')}\n\n`;

  // 四化影响（重点：仅分析抽中且受四化影响的牌）
  if (reading.sihuaEffects.length > 0) {
    const relevant = reading.sihuaEffects.filter(s =>
      cards.some(cd => cd.name === s.starName)
    );
    if (relevant.length > 0) {
      r += `【四化影响】${reading.sihuaYear}年${reading.sihuaMonth}月：\n`;
      for (const s of relevant) {
        const impact = s.transformation === '化祿' ? '利好增强，机遇增多' :
          s.transformation === '化權' ? '掌控力提升，宜主动争取' :
          s.transformation === '化科' ? '名声显扬，才华被看见' :
          '阻滞困顿，需谨慎行事';
        r += `${s.starName}${s.transformation}（${s.source}）：${impact}。${s.meaning}\n`;
      }
      r += '\n';
    }
  }

  // 综合判断
  r += `综合来看：${a.name}定义了基本方向，${b.name}提供了变化条件，${c.name}标出了注意事项。`;
  r += `三者构成的整体画面是——${a.overall.replace(/。.*/, '')}，在此背景下${b.name}的加入意味着需要${b.strength === '陷' ? '更加谨慎地' : '积极地'}应对变化，而${c.name}则提醒${String(c[f.key]).substring(0, 40)}。`;

  // 建议
  r += `\n\n建议：`;
  const tips: string[] = [];
  if (a.strength === '廟' || a.strength === '旺') {
    tips.push(`${a.name}当前力量充沛，可以此为出发点主动推进`);
  } else if (a.strength === '陷') {
    tips.push(`${a.name}力量受制，当前不宜正面突破，以守为攻`);
  }
  if (b.strength === '陷') {
    tips.push(`${b.name}陷位带来的变数需要特别留意，做好预案`);
  }
  tips.push(`综合${a.name}与${b.name}的互动，${c.name}的提示不可忽视`);
  r += tips.join('；') + '。';

  r += `\n\n—— 雨露紫灵牌`;
  return r;
}

// === AI Prompt ===

function buildPrompt(reading: ReadingRecord): string {
  const cards = extract(reading);
  const f = focus(reading.question);

  const cardInfo = cards.map(c => {
    const isMajor = getCardById(c.name)?.category === 'major';
    return `【${c.name}】第${c.position}张·${strengthWord(c.strength)}·${c.element}·${isMajor ? '主星' : '辅杂'}\n牌意：${c.overall}\n对「${f.label}」的含义：${c[f.key]}`;
  }).join('\n\n');

  const sihua = reading.sihuaEffects.length > 0
    ? reading.sihuaEffects.map(s => `${s.starName}·${s.transformation}(${s.source})：${s.meaning}`).join('；')
    : '无四化影响';

  return `你是紫微斗數命理师。请基于以下牌局，为用户的问题写一份解读报告。

用户问题：${reading.question}
分析焦点：${f.label}
时空：${reading.sihuaYear}年${reading.sihuaMonth}月
四化：${sihua}

抽出的三张牌：
${cardInfo}

请写一段连贯的解读（250-350字），包含：
1. 这三张牌组合在一起，对用户问题的核心判断是什么（不要逐张罗列，要综合成一个整体判断）
2. 如果有四化影响到任何一张抽中的牌，指出四化如何改变了牌的力量
3. 基于牌意给出2-3条务实的行动建议

原则：
- 以牌意为重（星曜本質是第一分析工具）
- 四化对主星的影响必须纳入考量
- 五行生克仅作辅助参考，不要过度分析
- 直接、清晰、有用。像一位经验丰富的命理师在对来问者说话`;
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
      max_tokens: 800,
      messages: [{ role: 'user', content: buildPrompt(reading) }],
    }),
  });
  if (!resp.ok) throw new Error(`API ${resp.status}`);
  return (await resp.json()).content[0].text;
}

export function generateFallbackReport(reading: ReadingRecord): string {
  return generateReport(reading);
}
