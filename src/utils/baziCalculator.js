import { Solar } from 'lunar-typescript'

export const stems = ['jia', 'yi', 'bing', 'ding', 'wu', 'ji', 'geng', 'xin', 'ren', 'gui']
export const stemCN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
export const branches = ['zi', 'chou', 'yin', 'mao', 'chen', 'si', 'wu', 'wei', 'shen', 'you', 'xu', 'hai']
export const branchCN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export const toElementByStem = {
  jia: 'mu', yi: 'mu',
  bing: 'huo', ding: 'huo',
  wu: 'tu', ji: 'tu',
  geng: 'jin', xin: 'jin',
  ren: 'shui', gui: 'shui'
}

export const toElementByBranch = {
  yin: 'mu', mao: 'mu',
  si: 'huo', wu: 'huo',
  chen: 'tu', wei: 'tu', xu: 'tu', chou: 'tu',
  shen: 'jin', you: 'jin',
  zi: 'shui', hai: 'shui'
}

export const relationTable = {
  jin: { jin: 1.5, mu: -0.5, shui: -0.5, huo: -1.5, tu: 1 },
  mu: { jin: -1.5, mu: 1.5, shui: 1, huo: -0.5, tu: -0.5 },
  shui: { jin: 1, mu: -0.5, shui: 1.5, huo: -0.5, tu: -1.5 },
  huo: { jin: -0.5, mu: 1, shui: -1.5, huo: 1.5, tu: -0.5 },
  tu: { jin: -0.5, mu: -1.5, shui: -0.5, huo: 1, tu: 1.5 }
}

const weight = { yt: 5, yd: 15, mt: 15, md: 45, dd: 20, ht: 5, hd: 15 }
const stemMapCN = { 甲: 'jia', 乙: 'yi', 丙: 'bing', 丁: 'ding', 戊: 'wu', 己: 'ji', 庚: 'geng', 辛: 'xin', 壬: 'ren', 癸: 'gui' }
const branchMapCN = { 子: 'zi', 丑: 'chou', 寅: 'yin', 卯: 'mao', 辰: 'chen', 巳: 'si', 午: 'wu', 未: 'wei', 申: 'shen', 酉: 'you', 戌: 'xu', 亥: 'hai' }

export function splitGanZhi(gz) {
  const stem = gz.slice(0, 1)
  const branch = gz.slice(1)
  return { stem: stemMapCN[stem], branch: branchMapCN[branch] }
}

export function formatPillar(p) {
  return `${stemCN[stems.indexOf(p.stem)]}${branchCN[branches.indexOf(p.branch)]}`
}

export function validateInput({ year, month, day, hour, minute }) {
  const y = Number(year)
  const m = Number(month)
  const dNum = Number(day)
  const hh = Number(hour)
  const mm = Number(minute)

  if (!y || !m || !dNum || y < 1900 || y > 2100 || m < 1 || m > 12 || dNum < 1 || dNum > 31 || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    return { valid: false, error: '请检查出生日期和时间输入范围' }
  }

  const d = new Date(y, m - 1, dNum, hh, mm, 0)
  if (d.getFullYear() !== y || d.getMonth() !== m - 1 || d.getDate() !== dNum) {
    return { valid: false, error: '日期不存在，请重新输入' }
  }

  return { valid: true, value: { y, m, dNum, hh, mm } }
}

export function calculateBaziAndPower({ y, m, dNum, hh, mm }) {
  const solar = Solar.fromYmdHms(y, m, dNum, hh, mm, 0)
  const lunar = solar.getLunar()

  const yP = splitGanZhi(lunar.getYearInGanZhiExact())
  const mP = splitGanZhi(lunar.getMonthInGanZhiExact())
  const dP = splitGanZhi(lunar.getDayInGanZhiExact2())
  const hP = splitGanZhi(lunar.getTimeInGanZhi())

  const dayElem = toElementByStem[dP.stem]
  const items = {
    yt: toElementByStem[yP.stem],
    yd: toElementByBranch[yP.branch],
    mt: toElementByStem[mP.stem],
    md: toElementByBranch[mP.branch],
    dd: toElementByBranch[dP.branch],
    ht: toElementByStem[hP.stem],
    hd: toElementByBranch[hP.branch]
  }

  let p = 0
  Object.keys(items).forEach((k) => {
    p += relationTable[dayElem][items[k]] * weight[k]
  })

  return {
    pillars: { yP, mP, dP, hP },
    dayElem,
    items,
    power: Math.round(p)
  }
}

export function getPowerLevel(p) {
  if (p >= 150) return '很强'
  if (p >= 70) return '强'
  if (p >= 10) return '较强'
  if (p >= -10) return '平衡'
  if (p >= -70) return '较弱'
  if (p >= -150) return '弱'
  return '很弱'
}
