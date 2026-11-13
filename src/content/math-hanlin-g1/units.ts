/** 對齊均一「類翰林版」一年級數學單元編排（非翰林官方教材原文）
 * 參考：https://www.junyiacademy.org/topics/h-m1a
 */
export type MathKind =
  | 'count10'
  | 'compare'
  | 'order'
  | 'split'
  | 'shape'
  | 'add10'
  | 'sub10'
  | 'count30'
  | 'clock'
  | 'add20'
  | 'length'
  | 'sub20'
  | 'count100'
  | 'shape3d'
  | 'money'
  | 'calendar'
  | 'addSub2'
  | 'classify'

export type MathUnit = {
  unitId: number
  semester: '一上' | '一下'
  unitNo: number
  title: string
  blurb: string
  kind: MathKind
  playLabel: string
}

export const mathUnits: MathUnit[] = [
  {
    unitId: 101,
    semester: '一上',
    unitNo: 1,
    title: '10 以內的數',
    blurb: '點一點，找出對的數字',
    kind: 'count10',
    playLabel: '點點樂',
  },
  {
    unitId: 102,
    semester: '一上',
    unitNo: 2,
    title: '比長短',
    blurb: '誰比較長？用眼睛比一比',
    kind: 'compare',
    playLabel: '比一比',
  },
  {
    unitId: 103,
    semester: '一上',
    unitNo: 3,
    title: '順序與多少',
    blurb: '第幾個？誰比較多？',
    kind: 'order',
    playLabel: '排排隊',
  },
  {
    unitId: 104,
    semester: '一上',
    unitNo: 4,
    title: '分與合',
    blurb: '分開再合起來，還認識 0',
    kind: 'split',
    playLabel: '分分合合',
  },
  {
    unitId: 105,
    semester: '一上',
    unitNo: 5,
    title: '認識形狀',
    blurb: '圓形、三角形來找碴',
    kind: 'shape',
    playLabel: '形狀找找看',
  },
  {
    unitId: 106,
    semester: '一上',
    unitNo: 6,
    title: '10 以內的加法',
    blurb: '合起來是多少？',
    kind: 'add10',
    playLabel: '加法闖關',
  },
  {
    unitId: 107,
    semester: '一上',
    unitNo: 7,
    title: '10 以內的減法',
    blurb: '拿走以後剩多少？',
    kind: 'sub10',
    playLabel: '減法闖關',
  },
  {
    unitId: 108,
    semester: '一上',
    unitNo: 8,
    title: '30 以內的數',
    blurb: '數到 30，找漏掉的朋友',
    kind: 'count30',
    playLabel: '數到三十',
  },
  {
    unitId: 109,
    semester: '一上',
    unitNo: 9,
    title: '時間',
    blurb: '幾點整？幾點半？',
    kind: 'clock',
    playLabel: '時鐘轉轉',
  },
  {
    unitId: 201,
    semester: '一下',
    unitNo: 1,
    title: '20 以內的加法',
    blurb: '加一加，不超過 20',
    kind: 'add20',
    playLabel: '二十加法',
  },
  {
    unitId: 202,
    semester: '一下',
    unitNo: 2,
    title: '長度',
    blurb: '比一比，誰比較長',
    kind: 'length',
    playLabel: '量一量',
  },
  {
    unitId: 203,
    semester: '一下',
    unitNo: 3,
    title: '20 以內的減法',
    blurb: '減一減，看看剩多少',
    kind: 'sub20',
    playLabel: '二十減法',
  },
  {
    unitId: 204,
    semester: '一下',
    unitNo: 4,
    title: '100 以內的數',
    blurb: '十位個位，誰大誰小',
    kind: 'count100',
    playLabel: '數到一百',
  },
  {
    unitId: 205,
    semester: '一下',
    unitNo: 5,
    title: '形狀與形體',
    blurb: '平面形與立體形來作客',
    kind: 'shape3d',
    playLabel: '形體探險',
  },
  {
    unitId: 206,
    semester: '一下',
    unitNo: 6,
    title: '數數看有多少元',
    blurb: '1、5、10 元怎麼付',
    kind: 'money',
    playLabel: '零錢口袋',
  },
  {
    unitId: 207,
    semester: '一下',
    unitNo: 7,
    title: '幾月幾日星期幾',
    blurb: '今天星期幾？幾月幾日？',
    kind: 'calendar',
    playLabel: '日曆偵探',
  },
  {
    unitId: 208,
    semester: '一下',
    unitNo: 8,
    title: '兩位數的加減法',
    blurb: '兩位數加加減減',
    kind: 'addSub2',
    playLabel: '兩位加減',
  },
  {
    unitId: 209,
    semester: '一下',
    unitNo: 9,
    title: '分類整理',
    blurb: '哪一個不一樣？排一排',
    kind: 'classify',
    playLabel: '分類高手',
  },
]

export function getMathUnit(id: number) {
  return mathUnits.find((u) => u.unitId === id)
}

export function mathUnitsBySemester(semester: MathUnit['semester']) {
  return mathUnits.filter((u) => u.semester === semester)
}
