<script setup>
import { computed, ref } from 'vue'
import { toElementByBranch, validateInput, calculateBaziAndPower, formatPillar, getPowerLevel } from './utils/baziCalculator'
import { analyzePattern, buildComboInsight } from './services/patternAnalyzer'

const year = ref(new Date().getFullYear())
const month = ref(1)
const day = ref(1)
const hour = ref(12)
const minute = ref(0)

const error = ref('')
const power = ref(null)
const detail = ref('')
const pattern = ref('')
const patternDesc = ref('')
const patternScore = ref(null)
const patternJudge = ref('')

const comboTitle = ref('')
const comboDesc = ref('')
const comboLove = ref('')
const comboHealth = ref('')
const comboWealth = ref('')

const level = computed(() => (power.value === null ? '--' : getPowerLevel(power.value)))

function calculate() {
  error.value = ''

  const checked = validateInput({
    year: year.value,
    month: month.value,
    day: day.value,
    hour: hour.value,
    minute: minute.value
  })

  if (!checked.valid) {
    error.value = checked.error
    return
  }

  const { y, m, dNum, hh, mm } = checked.value
  const result = calculateBaziAndPower({ y, m, dNum, hh, mm })

  power.value = result.power
  detail.value = `四柱：年柱 ${formatPillar(result.pillars.yP)} ｜ 月柱 ${formatPillar(result.pillars.mP)} ｜ 日柱 ${formatPillar(result.pillars.dP)} ｜ 时柱 ${formatPillar(result.pillars.hP)}`

  const patternRes = analyzePattern(
    result.dayElem,
    toElementByBranch[result.pillars.mP.branch],
    result.power,
    result.items
  )

  pattern.value = patternRes.name
  patternDesc.value = patternRes.desc
  patternScore.value = patternRes.patternScore
  patternJudge.value = patternRes.judge

  const combo = buildComboInsight(patternRes.name, result.power)
  comboTitle.value = combo.title
  comboDesc.value = combo.desc
  comboLove.value = combo.love
  comboHealth.value = combo.health
  comboWealth.value = combo.wealth
}
</script>

<template>
  <main class="page">
    <section class="card">
      <header class="header">
        <h1>八字子平 · 身强身弱测算</h1>
        <p>输入生日和时间，自动换算四柱并进行日主强弱量化。</p>
      </header>

      <section class="body">
        <div class="inputs inputs-5">
          <label>年<input v-model.number="year" type="number" min="1900" max="2100" inputmode="numeric" /></label>
          <label>月<input v-model.number="month" type="number" min="1" max="12" inputmode="numeric" /></label>
          <label>日<input v-model.number="day" type="number" min="1" max="31" inputmode="numeric" /></label>
          <label>时（24小时）<input v-model.number="hour" type="number" min="0" max="23" inputmode="numeric" /></label>
          <label>分<input v-model.number="minute" type="number" min="0" max="59" step="1" inputmode="numeric" /></label>
          <button @click="calculate">开始测算</button>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="result">
          <div class="pillars">{{ detail || '请先输入生日时间后测算' }}</div>
          <div class="score">日主强度：{{ power ?? '--' }}（等级：{{ level }}）</div>
          <p class="hint">参考：很强 ≥150；强 70~149；较强 10~69；平衡 -10~9；较弱 -69~-11；弱 -149~-70；很弱 ≤-150</p>
        </div>

        <div class="result pattern-box">
          <div class="pattern-title">格局分析</div>
          <div class="pattern-name">{{ pattern || '待测算' }}</div>
          <div class="pattern-meta">成格指数：{{ patternScore ?? '--' }}% ｜ 判定：{{ patternJudge || '待判定' }}</div>
          <p class="pattern-desc">{{ patternDesc || '将在你完成测算后给出格局判断。' }}</p>
        </div>

        <div class="result combo-box">
          <div class="combo-title">格局 × 身强弱 联合解读</div>
          <div class="combo-name">{{ comboTitle || '待生成' }}</div>
          <p class="combo-desc">{{ comboDesc || '将在测算后给出该格局与当前身强弱状态结合的简要建议。' }}</p>
          <div class="combo-sub">感情婚姻</div>
          <p class="combo-item">{{ comboLove || '测算后显示' }}</p>
          <div class="combo-sub">健康状态</div>
          <p class="combo-item">{{ comboHealth || '测算后显示' }}</p>
          <div class="combo-sub">财务状态</div>
          <p class="combo-item">{{ comboWealth || '测算后显示' }}</p>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top right,#dfe7ff,#f3f6ff 50%,#f8fafc); }
.card { width: min(880px,100%); background:#fff; border:1px solid #e5e7eb; border-radius:20px; box-shadow:0 20px 50px rgba(36,66,140,.12); overflow:hidden; }
.header { padding:24px; background: linear-gradient(120deg,rgba(79,70,229,.12),rgba(79,70,229,.02)); border-bottom:1px solid #e5e7eb; }
.header h1 { margin:0; font-size:26px; }
.header p { margin:8px 0 0; color:#6b7280; }
.body { padding:24px; }
.inputs { display:grid; gap:12px; align-items:end; }
.inputs-5 { grid-template-columns: repeat(5, minmax(90px,1fr)) auto; }
label { display:grid; gap:8px; font-weight:600; font-size:14px; color:#374151; }
input { height:48px; border:1px solid #d1d5db; border-radius:12px; padding:0 12px; font-size:16px; }
input:focus { outline:none; border-color:#818cf8; box-shadow:0 0 0 4px rgba(99,102,241,.15); }
button { height:48px; border:none; border-radius:12px; background:#4f46e5; color:#fff; font-weight:700; padding:0 18px; cursor:pointer; }
button:hover { background:#4338ca; }
.result { margin-top:16px; border:1px solid #e5e7eb; border-radius:14px; background:#fafbff; padding:16px; }
.pillars { color:#4b5563; font-size:14px; margin-bottom:10px; }
.score { font-size:20px; font-weight:800; color:#0f766e; }
.hint { color:#6b7280; font-size:13px; margin-top:10px; line-height:1.7; }
.pattern-box { margin-top: 12px; background: #fffdf8; border-color: #f1e4c6; }
.pattern-title { font-size: 14px; color:#8a6a21; font-weight: 700; margin-bottom: 8px; }
.pattern-name { font-size: 20px; font-weight: 800; color:#7c5c16; margin-bottom: 6px; }
.pattern-meta { font-size: 13px; color:#8a6a21; margin-bottom: 8px; font-weight: 600; }
.pattern-desc { margin: 0; color:#5b4a2b; font-size: 14px; line-height: 1.7; }
.combo-box { margin-top: 12px; background: #f8fffd; border-color: #cdeee5; }
.combo-title { font-size: 14px; color:#0f766e; font-weight: 700; margin-bottom: 8px; }
.combo-name { font-size: 20px; font-weight: 800; color:#0f766e; margin-bottom: 6px; }
.combo-desc { margin: 0 0 10px 0; color:#1f4b47; font-size: 14px; line-height: 1.7; }
.combo-sub { font-size: 13px; font-weight: 700; color:#0f766e; margin-top: 8px; }
.combo-item { margin: 4px 0 0; color:#1f2937; font-size: 14px; line-height: 1.65; }
.error { color:#b91c1c; margin:8px 0 0; }
@media (max-width: 760px) { .inputs { grid-template-columns:1fr; } .header h1{font-size:22px;} .result{padding:14px;} .score{font-size:26px;} .pillars{font-size:13px;} .hint{font-size:12px;} .pattern-name{font-size:18px;} .combo-name{font-size:18px;} }
</style>
