import React, { useState } from 'react'
import { DB } from '../data/mock'
import { t } from '../i18n'

/* ================= 基础件 ================= */
const C = { ink: '#1F2933', mut: '#8A9099', line: '#EEF0F3', accent: '#1F4E79', red: '#B23A28', green: '#3E6B4F', amber: '#96742A' }
const card = { background: '#fff', borderRadius: 10, padding: '12px 13px', marginBottom: 10, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }
const h4 = { fontSize: 12.5, fontWeight: 600, marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }
const lbl = { fontSize: 10.5, color: C.mut }
const num = { fontVariantNumeric: 'tabular-nums' }
const rowS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '5px 0', borderBottom: `1px dashed ${C.line}` }

function Hero({ title, sub, value, unit, delta, tone = C.accent }) {
  const up = delta && delta.startsWith('+')
  return (
    <div style={{ ...card, background: 'linear-gradient(135deg,#1F4E79,#2F6FA8)', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, opacity: .8 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 27, fontWeight: 600, ...num }}>{value}</span>
            {unit && <span style={{ fontSize: 11.5, opacity: .85 }}>{unit}</span>}
            {delta && <span style={{ fontSize: 11.5, padding: '1px 6px', borderRadius: 9,
              background: up ? 'rgba(255,255,255,.22)' : 'rgba(255,120,80,.3)' }}>{delta}</span>}
          </div>
        </div>
      </div>
      {sub && <div style={{ fontSize: 10.5, opacity: .82, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function Kpi({ k, v, sub, tone }) {
  return (
    <div style={{ background: '#fff', borderRadius: 9, padding: '9px 11px' }}>
      <div style={lbl}>{k}</div>
      <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2, color: tone || C.ink, ...num }}>{v}</div>
      {sub && <div style={{ fontSize: 10, color: C.mut, marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

function Bar({ v, max = 100, color = C.accent, target }) {
  return (
    <div style={{ position: 'relative', height: 7, background: '#EEF1F4', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ width: `${Math.min(100, Math.abs(v) / max * 100)}%`, height: '100%', background: color, borderRadius: 4 }} />
      {target != null && <div style={{ position: 'absolute', top: -1, bottom: -1, left: `${target / max * 100}%`,
        width: 1.5, background: '#B23A28', opacity: .65 }} />}
    </div>
  )
}

function Spark({ pts, color = C.accent, h = 40, w = 300 }) {
  const vals = pts.map(p => p.v)
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const span = hi - lo || 1
  const norm = v => ((v - lo) / span) * 0.78 + 0.11      // 拉伸到 11%~89%，让波动看得见
  const ys = pts.map((p, i) => ({ x: i / (pts.length - 1) * w, y: h - norm(p.v) * (h - 4) - 2 }))
  const d = ys.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ')
  const area = d + ` L${w} ${h} L0 ${h} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id={'g' + color.replace('#', '')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".28" /><stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      {[0.25, 0.5, 0.75].map(k => <line key={k} x1="0" y1={h * k} x2={w} y2={h * k} stroke="#E9EDF1" strokeWidth="1" />)}
      <path d={area} fill={`url(#g${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      {ys.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={i === ys.length - 1 ? 2.6 : 1.4} fill={color} />)}
    </svg>
  )
}

function Stack({ segs }) {
  const total = segs.reduce((a, b) => a + b.v, 0)
  return (
    <>
      <div style={{ display: 'flex', height: 9, borderRadius: 5, overflow: 'hidden', margin: '6px 0 7px' }}>
        {segs.map(s => <div key={s.k} style={{ width: `${s.v / total * 100}%`, background: s.c }} />)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {segs.map(s => (
          <span key={s.k} style={{ fontSize: 10.5, color: C.mut, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i style={{ width: 6, height: 6, borderRadius: 3, background: s.c, display: 'inline-block' }} />
            {t(s.k)} {s.v}{s.u || ''}
          </span>
        ))}
      </div>
    </>
  )
}

const Src = ({ en, extra }) => (
  <div style={{ fontSize: 10, color: '#B0B6BD', marginTop: 8, lineHeight: 1.7 }}>
    {en ? 'Source: platform event stream' : '数据来源：平台事件流'}　·　
    {en ? 'Updated 08:00 · Definition consistent with production' : '更新 08:00 · 口径与生产一致'}
    {extra ? `　·　${extra}` : ''}
  </div>
)

/* ================= 日报 ================= */
function Daily({ en }) {
  const [open, setOpen] = useState(false)
  const trend = [61, 63, 65, 68, 72, 75, 69].map((v, i) => ({ v, max: 100 }))
  const todo = [
    { t: '临期预警', d: en ? 'Oat Milk 12 ctn · 2 days' : '燕麦奶 12 箱 · 剩 2 天', tag: '高', tone: C.red, age: '0.9 h' },
    { t: '到货差异', d: en ? 'Fresh Milk short 2 ctn' : '鲜奶 少 2 箱', tag: '中', tone: C.amber, age: '2.1 h' },
    { t: '断货预警', d: en ? 'Coconut Milk · 58% of safety' : '厚椰乳 · 安全库存 58%', tag: '高', tone: C.red, age: '3.4 h' },
  ]
  return (
    <>
      <Hero title={en ? 'Store health · today' : '门店健康 · 今日'} sub={en ? 'Star Meet Store (SH2014) · East China Shanghai North' : '星汇里店（SH2014）· 华东 沪北'}
        value={78} unit={en ? 'score' : '分'} delta="+2" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <Kpi k={en ? 'Open items' : '今日待办'} v={2} sub={en ? '1 high priority' : '其中高优先 1'} tone={C.red} />
        <Kpi k={en ? 'Completed' : '今日完成'} v={5} sub={en ? 'avg 1.2h each' : '平均耗时 1.2h'} tone={C.green} />
        <Kpi k={en ? 'Expiry handled' : '临期处置率'} v="69%" sub={en ? 'target 85%' : '目标 85%'} tone={C.red} />
        <Kpi k={en ? 'Variance closed' : '差异闭环率'} v="80%" sub={en ? 'target 85%' : '目标 85%'} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Handling rate · last 7 days' : '临期处置率 · 近 7 天'}
          <span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'today 69%' : '今日 69%'}</span></div>
        <Spark pts={trend} color={C.accent} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.mut, marginTop: 2 }}>
          <span>10-16</span><span>10-19</span><span>10-22</span>
        </div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[[en ? 'Best' : '最好', '78%', '10-21'], [en ? 'Worst' : '最差', '61%', '10-16'], [en ? '7d change' : '7 天变化', '+8pp', '']].map(([k, v, d]) => (
            <div key={k} style={{ background: '#F7F9FB', borderRadius: 7, padding: '6px 8px' }}>
              <div style={lbl}>{k}</div><div style={{ fontSize: 13, fontWeight: 600, ...num }}>{v}</div>
              {d && <div style={{ fontSize: 9.5, color: C.mut }}>{d}</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Today’s queue' : '今日待办清单'}
          <span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'sorted by aging' : '按停留时长排序'}</span></div>
        {todo.map(x => (
          <div key={x.t} style={rowS}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i style={{ width: 6, height: 6, borderRadius: 3, background: x.tone }} />
              <span><b style={{ fontWeight: 600 }}>{t(x.t)}</b><span style={{ color: C.mut }}> · {x.d}</span></span>
            </span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: x.tone, border: `1px solid ${x.tone}33`, borderRadius: 4, padding: '0 4px' }}>{x.tag}</span>
              <span style={{ ...num, color: C.mut, fontSize: 11 }}>{x.age}</span>
            </span>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Data & definition' : '数据与口径'}</div>
        <div style={{ fontSize: 11, color: '#4A5158', lineHeight: 1.9 }}>
          {en ? 'Expiry handling = logged ÷ triggered (T-2 windows). Responses measured to first action.'
            : '临期处置率 = 已登记 ÷ 命中数（T-2 窗口）；响应时长按首次动作时间计。'}
          <br />{en ? 'Not included: revenue, GMV, gross margin — those live in the Lakehouse BI.'
            : '不含营业额、GMV、毛利——归湖仓 BI。'}
        </div>
        <Src en={en} />
      </div>
    </>
  )
}

/* ================= 周报 ================= */
function Weekly({ en }) {
  const rank = [
    { n: '星汇里店', v: 86, d: '+4' }, { n: '云栖里店', v: 79, d: '+1' }, { n: '青柠广场店', v: 71, d: '-2' },
    { n: '拾光里店', v: 64, d: '-5' }, { n: '风铃广场店', v: 58, d: '+2' }, { n: '锦鲤广场店', v: 52, d: '0' },
  ]
  return (
    <>
      <Hero title={en ? 'Weekly execution · W43' : '本周执行 · 第 43 周'} sub={en ? '12 stores in region · vs last week +6pp' : '辖区 12 家门店 · 较上周 +6pp'}
        value={79} unit="%" delta="+6" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <Kpi k={en ? 'Order adoption' : '订货建议采纳率'} v="76%" sub={en ? '+3pp WoW' : '周环比 +3pp'} />
        <Kpi k={en ? 'Variance closure' : '差异闭环率'} v="80%" sub={en ? 'target 85%' : '目标 85%'} />
        <Kpi k={en ? 'Expiry loss (est.)' : '临期损失（估）'} v="¥2,140" sub={en ? 'of 12 stores' : '辖区 12 店合计'} tone={C.red} />
        <Kpi k={en ? 'Avg response' : '预警平均响应'} v="3.4h" sub={en ? 'target ≤4h' : '目标 ≤4h'} tone={C.green} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Store ranking' : '门店执行排名'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'vs last week' : '较上周'}</span></div>
        {rank.map((s, i) => (
          <div key={s.n} style={{ padding: '4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
              <span><b style={{ color: C.mut, marginRight: 5 }}>{i + 1}</b>{t(s.n)}</span>
              <span style={{ ...num }}>
                {s.v}%
                <span style={{ marginLeft: 6, fontSize: 10, color: s.d.startsWith('-') ? C.red : s.d === '0' ? C.mut : C.green }}>{s.d}</span>
              </span>
            </div>
            <Bar v={s.v} color={s.v < 60 ? C.red : s.v < 75 ? C.amber : C.accent} target={85} />
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Loss composition' : '损失构成'}</div>
        <Stack segs={[{ k: '临期', v: 1240, c: C.red, u: '' }, { k: '差异', v: 520, c: C.amber }, { k: '断货', v: 310, c: C.accent }, { k: '盘点差异', v: 70, c: '#B0B6BD' }]} />
        <div style={{ ...lbl, marginTop: 6 }}>{en ? 'Unit: ¥ · estimated from event stream' : '单位：元 · 由事件流估算'}</div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Three things this week' : '本周三件事'}</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.9, color: '#4A5158' }}>
          ① {en ? 'Expiry losses concentrate on oat milk (58% of total).' : '临期损失集中在燕麦奶，占总损失 58%。'}
          <br />② {en ? '3 stores in Shanghai North stay below 60%.' : '沪北 3 家门店执行率连续两周低于 60%。'}
          <br />③ {en ? 'Variance closure improved mainly after R-002 went live.' : '差异闭环改善主要来自 R-002 生效后。'}
        </div>
        <Src en={en} extra={en ? 'not a BI report' : '非 BI 报表'} />
      </div>
    </>
  )
}

/* ================= 库存健康 ================= */
function Stock({ en }) {
  const factors = [
    { k: '断货率', v: 4.2, max: 20, target: 8, tone: C.green },
    { k: '安全库存偏离', v: 12, max: 40, target: 20, tone: C.amber },
    { k: '临期占比', v: 8.4, max: 20, target: 5, tone: C.red },
    { k: '在途未到', v: 3, max: 12, target: 6, tone: C.green },
    { k: '积压（周转天数）', v: 26, max: 45, target: 20, tone: C.amber },
    { k: '损耗率', v: 1.8, max: 6, target: 2, tone: C.green },
    { k: '盘点准确率', v: 96, max: 100, target: 98, tone: C.green },
  ]
  const risk = [
    { m: '燕麦奶', b: 'B241018-02', q: '12 箱', e: '剩 2 天', c: C.red },
    { m: '厚椰乳', b: 'B241016-11', q: '8 箱', e: '剩 3 天', c: C.amber },
    { m: '芋泥', b: 'B241014-07', q: '5 袋', e: '剩 4 天', c: C.amber },
  ]
  return (
    <>
      <Hero title={en ? 'Inventory health · today' : '库存健康 · 今日'} sub={en ? 'Tier: Watch · driven by worst factor (expiring share)' : '档位：关注 · 由最差因子决定（临期占比）'}
        value={74} unit={en ? 'score' : '分'} delta="-3" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <Kpi k={en ? 'Expiring share' : '临期占比'} v="8.4%" sub={en ? 'target ≤5%' : '目标 ≤5%'} tone={C.red} />
        <Kpi k={en ? 'Dwell days' : '周转天数'} v="26" sub={en ? 'target ≤20' : '目标 ≤20'} tone={C.amber} />
        <Kpi k={en ? 'Stocktake accuracy' : '盘点准确率'} v="96%" sub={en ? 'target 98%' : '目标 98%'} />
        <Kpi k={en ? 'Stockout rate' : '断货率'} v="4.2%" sub={en ? 'target ≤8%' : '目标 ≤8%'} tone={C.green} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Seven factors' : '七大因子'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'red line = target' : '红线=目标'}</span></div>
        {factors.map(f => (
          <div key={f.k} style={{ padding: '4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
              <span>{t(f.k)}</span>
              <span style={{ ...num, color: f.tone }}>{f.v}{f.k === '盘点准确率' ? '%' : f.k.includes('天数') ? ' d' : f.k === '在途未到' ? '' : '%'}</span>
            </div>
            <Bar v={f.v} max={f.max} color={f.tone} target={f.target} />
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Stock structure' : '库存结构'}</div>
        <Stack segs={[{ k: '可用', v: 62, c: C.accent, u: '%' }, { k: '在途', v: 18, c: '#7FA8C9', u: '%' },
          { k: '临期', v: 8, c: C.red, u: '%' }, { k: '锁定', v: 12, c: '#B0B6BD', u: '%' }]} />
        <div style={{ ...lbl, marginTop: 6 }}>{en ? 'Total SKU value is not shown here — it belongs to the Lakehouse BI.' : '库存金额不在本页展示——归湖仓 BI。'}</div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'At-risk batches' : '风险批次'}</div>
        {risk.map(r => (
          <div key={r.b} style={rowS}>
            <span><b>{t(r.m)}</b><span style={{ color: C.mut }}> · {r.b}</span></span>
            <span style={{ ...num }}>{r.q}<span style={{ color: r.c, marginLeft: 6 }}>{r.e}</span></span>
          </div>
        ))}
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <button className="pbtn" style={{ fontSize: 11 }}>{en ? 'Transfer' : '调拨邻店'}</button>
          <button className="pbtn" style={{ fontSize: 11 }}>{en ? 'Promote' : '促销消化'}</button>
          <button className="pbtn" style={{ fontSize: 11 }}>{en ? 'Write off' : '报损登记'}</button>
        </div>
        <Src en={en} />
      </div>
    </>
  )
}

/* ================= 万元用量 ================= */
function Usage({ en }) {
  const rows = [
    { m: '燕麦奶', now: 1.23, base: 1.00, dev: '+23%', bad: true },
    { m: '鲜奶', now: 1.02, base: 1.00, dev: '+2%' },
    { m: '厚椰乳', now: 0.98, base: 1.00, dev: '−2%' },
    { m: '珍珠', now: 0.91, base: 1.00, dev: '−9%' },
    { m: '芋泥', now: 1.06, base: 1.00, dev: '+6%' },
  ]
  const weeks = [0.98, 1.01, 1.08, 1.23].map(v => ({ v, max: 1.4 }))
  return (
    <>
      <Hero title={en ? 'Usage per ¥10k · oat milk' : '万元用量 · 燕麦奶'} sub={en ? 'Baseline 1.00 · same region / store type / menu version' : '基准 1.00 · 同区域 / 同店型 / 同菜单版本'}
        value="1.23" unit={en ? 'ctn per ¥10k' : '箱 / 万元'} delta="+23%" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <Kpi k={en ? 'Usage this week' : '本周用量'} v={en ? '147 ctn' : '147 箱'} sub={en ? 'vs 120 last week' : '上周 120 箱'} />
        <Kpi k={en ? 'Revenue (T-1)' : '营业额（T-1）'} v="¥119.5w" sub={en ? 'flat WoW' : '周环比持平'} />
        <Kpi k={en ? 'Cups' : '杯量'} v={en ? '8,420' : '8,420 杯'} sub={en ? '−1% WoW' : '周环比 −1%'} />
        <Kpi k={en ? 'Usage per cup' : '单杯用量'} v="17.5 ml" sub={en ? 'baseline 14.2' : '基准 14.2'} tone={C.red} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Trend · last 4 weeks' : '近 4 周趋势'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'baseline 1.00' : '基准 1.00'}</span></div>
        <Spark pts={weeks} color={C.red} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.mut }}>
          <span>W40</span><span>W41</span><span>W42</span><span>W43</span>
        </div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Materials vs baseline' : '物料对标'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'this week' : '本周'}</span></div>
        {rows.map(r => (
          <div key={r.m} style={rowS}>
            <span>{t(r.m)}</span>
            <span style={{ ...num }}><b>{r.now.toFixed(2)}</b>
              <span style={{ color: C.mut, marginLeft: 6 }}>{r.base.toFixed(2)}</span>
              <span style={{ color: r.bad ? C.red : C.mut, marginLeft: 6 }}>{r.dev}</span></span>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Attribution order' : '归因排查顺序'}</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.9, color: '#4A5158' }}>
          ① {en ? 'Check recipe / menu version first (most common cause).' : '先核对配方与菜单版本（最常见原因）。'}
          <br />② {en ? 'Then check waste log — over-pour is logged there.' : '再查损耗登记——超用通常记在这里。'}
          <br />③ {en ? 'Finally check data definition: gifts & staff drinks included?' : '最后查口径：赠送与员工饮是否计入。'}
        </div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Definition' : '口径说明'}</div>
        <div style={{ fontSize: 11, color: '#4A5158', lineHeight: 1.9 }}>
          {en ? 'Numerator: actual consumption (issued). Denominator: revenue in ¥10k (tax incl.). Period: weekly.'
            : '分子：实际领用（出库）；分母：营业额（万元，含税）；周期：周。'}
          <br />{en ? 'Baseline: same region · same store type · same menu version, own history.'
            : '基准：同区域 · 同店型 · 同菜单版本的门店自身历史。'}
          <br />{en ? 'Gifts / staff drinks: included (to be confirmed with business).' : '赠送与员工饮：计入（待业务确认）。'}
        </div>
        <Src en={en} />
      </div>
    </>
  )
}

/* ================= 外壳 ================= */
export default function PhonePage({ type, onBack, en }) {
  const title = {
    daily: en ? 'Daily report' : '今日健康日报',
    weekly: en ? 'Weekly summary' : '本周执行摘要',
    stock: en ? 'Inventory health' : '库存健康明细',
    usage: en ? 'Usage per ¥10k' : '万元用量明细',
  }[type] || ''
  return (
    <>
      <div style={{ background: '#fff', borderBottom: `1px solid ${'#E6E7EA'}`, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
        <button className="pbtn" style={{ padding: '2px 8px' }} onClick={onBack}>‹ {en ? 'Back' : '返回'}</button>
        <b style={{ fontSize: 13 }}>{title}</b>
        <span style={{ fontSize: 10, color: C.mut, marginLeft: 'auto' }}>2026-10-22</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: '#F2F3F5', padding: '10px 12px 24px' }}>
        {type === 'daily' && <Daily en={en} />}
        {type === 'weekly' && <Weekly en={en} />}
        {type === 'stock' && <Stock en={en} />}
        {type === 'usage' && <Usage en={en} />}
        <div style={{ fontSize: 9.5, color: '#A8AEB5', textAlign: 'center', marginTop: 4 }}>
          {en ? 'Demo data · definitions consistent with production' : '演示数据 · 指标口径与生产一致'}
        </div>
      </div>
    </>
  )
}
