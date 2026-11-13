import type { MathKind } from '../content/math-hanlin-g1/units'

/** 每個數學單元固定三種玩法（與國語多模式對齊） */
export const MATH_MODE_ORDER = ['visual', 'number', 'challenge'] as const
export type MathModeId = (typeof MATH_MODE_ORDER)[number]

export type MathModeMeta = {
  id: MathModeId
  path: MathModeId
  tag: string
  title: string
  subtitle: string
}

const MODE_COPY: Record<
  MathKind,
  Record<MathModeId, Pick<MathModeMeta, 'tag' | 'title' | 'subtitle'>>
> = {
  count10: {
    visual: { tag: '看圖', title: '點點樂', subtitle: '點一點，數出有幾個' },
    number: { tag: '對應', title: '數字對對碰', subtitle: '看數字，選一樣多的圖' },
    challenge: { tag: '挑戰', title: '漏掉誰', subtitle: '找出缺少的數字' },
  },
  compare: {
    visual: { tag: '觀察', title: '比一比', subtitle: '哪一條比較長或比較短' },
    number: { tag: '判斷', title: '誰比較大', subtitle: '兩個數，誰比較大' },
    challenge: { tag: '挑戰', title: '三條排隊', subtitle: '找出最長的那一條' },
  },
  order: {
    visual: { tag: '排隊', title: '第幾個', subtitle: '從左邊數第幾個' },
    number: { tag: '順序', title: '下一個', subtitle: '下一個數字是誰' },
    challenge: { tag: '挑戰', title: '比多少', subtitle: '哪個比較多' },
  },
  split: {
    visual: { tag: '分解', title: '分分看', subtitle: '合起來是多少的一部分' },
    number: { tag: '合成', title: '合起來', subtitle: '兩邊加起來等於幾' },
    challenge: { tag: '挑戰', title: '找 0', subtitle: '有 0 的分合練習' },
  },
  shape: {
    visual: { tag: '形狀', title: '形狀找找看', subtitle: '看看是什麼形狀' },
    number: { tag: '名稱', title: '形狀點名', subtitle: '聽名稱找對的形' },
    challenge: { tag: '挑戰', title: '形狀捉迷藏', subtitle: '哪一個不是這個形' },
  },
  add10: {
    visual: { tag: '加法', title: '加法闖關', subtitle: '10 以內合起來' },
    number: { tag: '算式', title: '算式填填看', subtitle: '選出正確的答案' },
    challenge: { tag: '挑戰', title: '連加小考', subtitle: '稍難一點的加法' },
  },
  sub10: {
    visual: { tag: '減法', title: '減法闖關', subtitle: '拿走以後剩多少' },
    number: { tag: '算式', title: '算式填填看', subtitle: '選出正確的答案' },
    challenge: { tag: '挑戰', title: '連減小考', subtitle: '稍難一點的減法' },
  },
  count30: {
    visual: { tag: '點數', title: '數到三十', subtitle: '數一數有幾個' },
    number: { tag: '順序', title: '數字接龍', subtitle: '接下一個數字' },
    challenge: { tag: '挑戰', title: '找漏洞', subtitle: '序列裡少了誰' },
  },
  clock: {
    visual: { tag: '時鐘', title: '時鐘轉轉', subtitle: '看指針讀幾點' },
    number: { tag: '整點', title: '整點半點', subtitle: '選正確的時間' },
    challenge: { tag: '挑戰', title: '時間對對碰', subtitle: '文字和時鐘配一配' },
  },
  add20: {
    visual: { tag: '加法', title: '二十加法', subtitle: '20 以內加一加' },
    number: { tag: '算式', title: '算式填填看', subtitle: '選出正確的答案' },
    challenge: { tag: '挑戰', title: '進位小試', subtitle: '稍難的 20 以內加法' },
  },
  length: {
    visual: { tag: '長度', title: '量一量', subtitle: '比比誰比較長' },
    number: { tag: '比較', title: '長短判斷', subtitle: '用數字想誰比較長' },
    challenge: { tag: '挑戰', title: '找最長', subtitle: '三條裡面誰最長' },
  },
  sub20: {
    visual: { tag: '減法', title: '二十減法', subtitle: '20 以內減一減' },
    number: { tag: '算式', title: '算式填填看', subtitle: '選出正確的答案' },
    challenge: { tag: '挑戰', title: '借位小試', subtitle: '稍難的 20 以內減法' },
  },
  count100: {
    visual: { tag: '位值', title: '數到一百', subtitle: '十位個位分清楚' },
    number: { tag: '比較', title: '誰比較大', subtitle: '兩個兩位數比大小' },
    challenge: { tag: '挑戰', title: '找鄰居', subtitle: '前後的數字是誰' },
  },
  shape3d: {
    visual: { tag: '形體', title: '形體探險', subtitle: '平面與立體來作客' },
    number: { tag: '名稱', title: '形體點名', subtitle: '看說明選名字' },
    challenge: { tag: '挑戰', title: '誰不一樣', subtitle: '找出不同類的形' },
  },
  money: {
    visual: { tag: '錢幣', title: '零錢口袋', subtitle: '數數有多少元' },
    number: { tag: '合計', title: '算總價', subtitle: '加一加是多少元' },
    challenge: { tag: '挑戰', title: '怎麼付', subtitle: '夠不夠付錢' },
  },
  calendar: {
    visual: { tag: '星期', title: '日曆偵探', subtitle: '昨天今天明天' },
    number: { tag: '月份', title: '幾月幾日', subtitle: '這個月有幾天' },
    challenge: { tag: '挑戰', title: '星期接龍', subtitle: '再往後推一天' },
  },
  addSub2: {
    visual: { tag: '加減', title: '兩位加減', subtitle: '兩位數加加減減' },
    number: { tag: '算式', title: '算式填填看', subtitle: '選出正確的答案' },
    challenge: { tag: '挑戰', title: '混合小考', subtitle: '加與減輪流來' },
  },
  classify: {
    visual: { tag: '分類', title: '分類高手', subtitle: '哪一個不一樣' },
    number: { tag: '歸類', title: '同一國', subtitle: '找出同一類的' },
    challenge: { tag: '挑戰', title: '雙重分類', subtitle: '更刁鑽的找碴' },
  },
}

export function getMathModes(kind: MathKind): MathModeMeta[] {
  return MATH_MODE_ORDER.map((id) => ({
    id,
    path: id,
    ...MODE_COPY[kind][id],
  }))
}

export function getMathMode(kind: MathKind, modeId: string): MathModeMeta | undefined {
  if (!MATH_MODE_ORDER.includes(modeId as MathModeId)) return undefined
  return getMathModes(kind).find((m) => m.id === modeId)
}

export const MATH_MODES_PER_UNIT = MATH_MODE_ORDER.length
export const MATH_STARS_PER_MODE = 3
export const MATH_MAX_UNIT_STARS = MATH_MODES_PER_UNIT * MATH_STARS_PER_MODE
