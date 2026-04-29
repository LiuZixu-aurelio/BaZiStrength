export const elementCN = { mu: '木', huo: '火', tu: '土', jin: '金', shui: '水' }

export const tenGodMap = {
  mu: { mu: '比劫', huo: '食伤', tu: '财', jin: '官杀', shui: '印' },
  huo: { huo: '比劫', tu: '食伤', jin: '财', shui: '官杀', mu: '印' },
  tu: { tu: '比劫', jin: '食伤', shui: '财', mu: '官杀', huo: '印' },
  jin: { jin: '比劫', shui: '食伤', mu: '财', huo: '官杀', tu: '印' },
  shui: { shui: '比劫', mu: '食伤', huo: '财', tu: '官杀', jin: '印' }
}

export function calcPatternScore(monthGod, godCount, score) {
  let s = 45
  s += 22
  if (monthGod === '官杀') {
    if (godCount['印'] > 0) s += 12
    if (godCount['食伤'] > 0) s += 8
  } else if (monthGod === '财') {
    if (godCount['官杀'] > 0) s += 12
    if (godCount['食伤'] > 0) s += 6
  } else if (monthGod === '食伤') {
    if (godCount['财'] > 0) s += 12
    if (godCount['印'] > 0) s += 4
  } else if (monthGod === '印') {
    if (godCount['官杀'] > 0) s += 12
  } else {
    if (godCount['食伤'] > 0 || godCount['财'] > 0 || godCount['官杀'] > 0) s += 8
  }

  if (score >= -10 && score <= 10) s += 12
  else if ((score > 10 && score <= 70) || (score < -10 && score >= -70)) s += 6
  else s -= 6

  if (godCount['食伤'] > 0 && godCount['官杀'] > 0 && godCount['印'] === 0) s -= 12
  if (s > 98) s = 98
  if (s < 20) s = 20
  return Math.round(s)
}

export function getPatternJudge(score) {
  if (score >= 85) return '成格清纯'
  if (score >= 70) return '成格较好'
  if (score >= 55) return '成格可用'
  if (score >= 40) return '格局未稳'
  return '难以成格'
}

export function analyzePattern(dayElem, monthBranchElem, score, allElems) {
  const monthGod = tenGodMap[dayElem][monthBranchElem]
  const gods = Object.values(allElems).map((e) => tenGodMap[dayElem][e])
  const godCount = { 比劫: 0, 食伤: 0, 财: 0, 官杀: 0, 印: 0 }
  gods.forEach((g) => { godCount[g] += 1 })

  const patternScore = calcPatternScore(monthGod, godCount, score)
  const judge = getPatternJudge(patternScore)

  const nameMap = { 印: '印绶格', 官杀: '官杀格', 财: '财格', 食伤: '食伤格', 比劫: '比劫格' }
  const name = nameMap[monthGod] || '比劫格'
  const desc = `月令主气为${monthGod}，结合全局十神分布（比劫${godCount['比劫']}、食伤${godCount['食伤']}、财${godCount['财']}、官杀${godCount['官杀']}、印${godCount['印']}）进行评估。`

  return { name, desc, patternScore, judge, monthGod }
}

export function buildComboInsight(patternName, score) {
  const state = score <= -10 ? 'weak' : score >= 10 ? 'strong' : 'mid'
  const type = patternName.includes('官杀') ? '官杀' : patternName.includes('财') ? '财' : patternName.includes('食伤') ? '食伤' : patternName.includes('印') ? '印' : '比劫'
  const title = `${type}格 · ${state === 'weak' ? '身偏弱' : state === 'strong' ? '身偏强' : '身中和'}`

  const pool = {
    官杀: {
      weak: ['责任感强但易紧绷，先稳情绪与节奏。','感情里别只讲标准，多讲感受。','财务上先稳现金流再扩张。'],
      strong: ['执行与掌控力强，注意沟通柔性。','关系中减少控制欲，多倾听。','收益能力好，但防过度冒进。'],
      mid: ['稳重理性，适合长期目标。','感情偏重承诺与责任。','财务节奏宜稳健复利。']
    },
    财: {
      weak: ['现实驱动力强，但易被事务拖累。','感情避免把压力直接投射给对方。','先防风险再求收益。'],
      strong: ['资源整合力强，经营意识好。','注意工作与陪伴平衡。','适合主动经营，务必止损。'],
      mid: ['务实稳健，收支观念较清晰。','关系中重共同目标。','适合长期资产配置。']
    },
    食伤: {
      weak: ['想法多表达强，需防精力分散。','感情沟通要先共情后讲道理。','先聚焦一条变现路径。'],
      strong: ['表达与创作能力突出。','魅力强但要避免锋芒过露。','能力变现潜力高，重兑现率。'],
      mid: ['创意与执行较平衡。','关系修复沟通能力较好。','收入结构可做长期迭代。']
    },
    印: {
      weak: ['学习力强但易多想，行动要分步。','感情慢热，重安全感。','偏稳健理财，重长期。'],
      strong: ['专业意识强，注意别过于保守。','关系里增加情绪表达。','核心稳健+小比例进取。'],
      mid: ['耐心与稳定性好。','适合长期陪伴型关系。','财务曲线偏稳。']
    },
    比劫: {
      weak: ['重情义，易受外界影响。','感情边界要清晰。','控制人情型支出。'],
      strong: ['主见强，行动果断。','减少对抗式沟通。','避免短线频繁交易。'],
      mid: ['独立与协作平衡。','关系中讲义气与稳定。','适合长期主义增值。']
    }
  }

  const [desc, love, wealth] = pool[type][state]
  const health = state === 'weak' ? '注意睡眠、压力恢复与规律运动，先恢复再冲刺。' : state === 'strong' ? '防过劳与情绪累积，维持稳定作息和有氧力量搭配。' : '整体可控，保持作息规律并定期体检。'

  return { title, desc, love: `感情婚姻：${love}`, health: `健康状态：${health}`, wealth: `财务状态：${wealth}` }
}
