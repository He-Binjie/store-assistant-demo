import React from 'react'
import { t } from '../i18n'

/* ============ 深色报表主题 ============ */
const D = {
  bg: '#0B1220', card: 'rgba(18,26,40,.92)', cardSolid: '#121A28',
  line: 'rgba(120,160,190,.16)', ink: '#E6EDF5', mut: '#7C8B9C', dim: '#546070',
  cyan: '#22D3EE', green: '#34D399', amber: '#FBBF24', red: '#F87171', violet: '#A78BFA',
}
const card = { background: D.card, borderRadius: 12, padding: '13px 14px', marginBottom: 10,
  border: `1px solid ${D.line}`, boxShadow: '0 2px 10px rgba(0,0,0,.25)' }
const h4 = { fontSize: 12.5, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: D.ink }
const lbl = { fontSize: 10.5, color: D.mut }
const num = { fontVariantNumeric: 'tabular-nums' }

/* ============ 环图（三段） ============ */
function Ring({ value, segs, size = 132, unit = '' }) {
  const r = size / 2 - 11, C = 2 * Math.PI * r
  let offset = 0
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" />
        {segs.map(s => {
          const len = C * s.v / 100
          const el = <circle key={s.k} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.c}
            strokeWidth="10" strokeLinecap="round" strokeDasharray={`${len - 3} ${C - len + 3}`}
            strokeDashoffset={-offset} />
          offset += len
          return el
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 27, fontWeight: 700, color: D.ink, ...num }}>{value}{unit}</div>
      </div>
    </div>
  )
}

/* ============ 面积趋势图 ============ */
function Area({ pts, labels, color = D.cyan, h = 96, prefix = '', suffix = '' }) {
  const w = 300, vals = pts.map(p => p.v)
  const lo = Math.min(...vals) * 0.86, hi = Math.max(...vals) * 1.06 || 1
  const x = i => i / (pts.length - 1) * w
  const y = v => h - ((v - lo) / (hi - lo)) * (h - 14) - 8
  const line = pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)).join(' ')
  const area = line + ` L${w} ${h} L0 ${h} Z`
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".42" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(k => <line key={k} x1="0" y1={h * k} x2={w} y2={h * k} stroke="rgba(255,255,255,.05)" />)}
        <path d={area} fill="url(#ar)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.v)} r={i === pts.length - 1 ? 3.4 : 2}
          fill={D.bg} stroke={color} strokeWidth="1.8" />)}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: D.dim, marginTop: 2 }}>
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  )
}

/* ============ 三指标卡 ============ */
function Metrics({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
      {items.map(m => (
        <div key={m.k} style={{ background: D.cardSolid, borderRadius: 10, padding: '9px 10px', border: `1px solid ${D.line}` }}>
          <div style={{ ...lbl, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.k}</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3, color: m.c || D.ink, ...num }}>{m.v}</div>
          {m.t && <div style={{ fontSize: 9.5, color: m.tc || D.mut, marginTop: 1 }}>{m.t}</div>}
        </div>
      ))}
    </div>
  )
}

/* ============ 归因堆叠条 ============ */
function Attribution({ segs }) {
  const total = segs.reduce((a, b) => a + b.v, 0)
  return (
    <>
      <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', marginBottom: 9 }}>
        {segs.map(s => <div key={s.k} style={{ width: `${s.v / total * 100}%`, background: s.c }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' }}>
        {segs.map(s => (
          <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <i style={{ width: 6, height: 6, borderRadius: 3, background: s.c, flex: '0 0 auto' }} />
            <span style={{ color: D.mut }}>{t(s.k)}</span>
            <span style={{ marginLeft: 'auto', color: D.ink, ...num }}>{Math.round(s.v / total * 100)}%</span>
          </div>
        ))}
      </div>
    </>
  )
}

/* ============ 多段进度（7/15/30 天） ============ */
function SegProgress({ items }) {
  return (
    <>
      <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,.07)', borderRadius: 4, margin: '10px 0 8px' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 3 }}>
          {items.map((it, i) => <div key={i} style={{ flex: it.v, background: it.c, borderRadius: 4 }} />)}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {items.map((it, i) => (
          <div key={i} style={{ textAlign: i === 0 ? 'left' : i === items.length - 1 ? 'right' : 'center', flex: 1 }}>
            <div style={{ fontSize: 10, color: D.mut }}>{it.k}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: it.c, ...num }}>{it.v2}</div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ============ SKU 行 ============ */
function SkuRow({ icon, name, meta, right, action, actionLabel, tone = D.cyan }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 0', borderBottom: `1px dashed ${D.line}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(34,211,238,.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flex: '0 0 auto' }}>{icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12.5, color: D.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 10, color: D.dim, marginTop: 1 }}>{meta}</div>
      </div>
      {right && <div style={{ fontSize: 12, color: D.ink, ...num, textAlign: 'right' }}>{right}</div>}
      {action && (
        <button style={{ background: 'transparent', border: `1px solid ${tone}66`, color: tone, borderRadius: 14,
          padding: '4px 10px', fontSize: 10.5, whiteSpace: 'nowrap', cursor: 'pointer' }}>{actionLabel}</button>
      )}
    </div>
  )
}

const Note = ({ en, txt }) => (
  <div style={{ fontSize: 10, color: D.dim, marginTop: 9, lineHeight: 1.7 }}>
    {en ? 'Source: platform event stream · Updated 08:00' : '数据来源：平台事件流 · 更新 08:00'}
    {txt ? `　·　${txt}` : ''}
  </div>
)


/* ============ 我 vs 区域 对比 ============ */
function Compare({ rows, en }) {
  return (
    <>
      {rows.map(r => (
        <div key={r.k} style={{ padding: '6px 0', borderBottom: `1px dashed ${D.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
            <span style={{ color: D.ink }}>{t(r.k)}</span>
            <span style={{ ...num, color: r.better ? D.green : D.red }}>
              {r.mine}{r.u}<span style={{ color: D.dim, fontSize: 10 }}>　区域 {r.avg}{r.u}</span>
            </span>
          </div>
          <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,.07)', borderRadius: 3, marginTop: 4 }}>
            <div style={{ width: `${Math.min(100, r.mine / r.max * 100)}%`, height: '100%', borderRadius: 3,
              background: r.better ? D.cyan : D.red }} />
            <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${r.avg / r.max * 100}%`,
              width: 2, background: D.amber, opacity: .85 }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: 9.5, color: D.dim, marginTop: 7 }}>
        {en ? 'Bar = my store · amber line = regional average' : '实心=本店 · 黄线=区域均值'}
      </div>
    </>
  )
}

/* ============ PDCA 四段 ============ */
function Pdc({ items, en }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {items.map(it => (
        <div key={it.k} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${D.line}`,
          borderRadius: 9, padding: '9px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <span style={{ width: 16, height: 16, borderRadius: 5, fontSize: 9.5, display: 'flex',
              alignItems: 'center', justifyContent: 'center', background: `${it.c}22`, color: it.c }}>{it.k[0]}</span>
            <span style={{ fontSize: 11, color: it.c, fontWeight: 600 }}>{t(it.k)}</span>
          </div>
          <div style={{ fontSize: 11, color: '#B9C6D4', lineHeight: 1.7 }}>{it.v}</div>
        </div>
      ))}
    </div>
  )
}

/* ============ 门店原话 ============ */
function Voices({ items, en }) {
  return (
    <>
      {items.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: i < items.length - 1 ? `1px dashed ${D.line}` : 'none' }}>
          <span style={{ color: D.cyan, fontSize: 12, lineHeight: 1.4 }}>“</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: '#C9D6E3', lineHeight: 1.65 }}>{v.q}</div>
            <div style={{ fontSize: 9.5, color: D.dim, marginTop: 3 }}>{v.who} · {v.at}</div>
          </div>
        </div>
      ))}
    </>
  )
}

/* ============ 今日在途物流（仓配/直配） ============ */
function Transit({ en }) {
  const rows = [
    { n: en ? 'Fresh Milk · ORD…317' : '鲜奶 · ORD…317', type: en ? 'Warehouse' : '仓配', who: '王师傅 138****5678', eta: '14:00', c: D.cyan },
    { n: en ? 'Pearl · DN…009' : '珍珠 · DN…009', type: en ? 'Direct' : '直配', who: 'SF 快递 SF1390****', eta: en ? 'tomorrow' : '明日', c: D.violet },
  ]
  return (
    <>
      {rows.map(r => (
        <div key={r.n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px dashed ${D.line}` }}>
          <span style={{ fontSize: 9.5, color: r.c, border: `1px solid ${r.c}55`, borderRadius: 4, padding: '1px 5px' }}>{r.type}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: D.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.n}</div>
            <div style={{ fontSize: 10, color: D.mut }}>{r.who}</div>
          </div>
          <span style={{ fontSize: 11, color: D.ink, ...num }}>{r.eta}</span>
        </div>
      ))}
      <div style={{ fontSize: 9.5, color: D.dim, marginTop: 7 }}>
        {en ? 'Warehouse delivery shows driver phone; direct delivery shows courier tracking no.'
          : '仓配展示司机电话，直配展示快递单号（含 Gelato 特殊物料）'}
      </div>
    </>
  )
}

/* ================= 概览（日报） ================= */
function Daily({ en }) {
  return (
    <>
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Ring value={78} segs={[{ k: 'a', v: 62, c: D.green }, { k: 'b', v: 26, c: D.amber }, { k: 'c', v: 12, c: D.red }]} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: D.mut }}>{en ? 'Store health · today' : '门店健康 · 今日'}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 13, color: D.ink }}>{en ? 'Watch' : '关注'}</span>
            <span style={{ fontSize: 10.5, color: D.green }}>▲ +2</span>
          </div>
          {[{ k: en ? 'Healthy' : '健康', v: '62%', c: D.green }, { k: en ? 'Watch' : '关注', v: '26%', c: D.amber },
            { k: en ? 'Risk' : '风险', v: '12%', c: D.red }].map(x => (
            <div key={x.k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginTop: 6 }}>
              <i style={{ width: 6, height: 6, borderRadius: 3, background: x.c }} />
              <span style={{ color: D.mut }}>{x.k}</span>
              <span style={{ marginLeft: 'auto', color: D.ink, ...num }}>{x.v}</span>
            </div>
          ))}
        </div>
      </div>

      <Metrics items={[
        { k: en ? 'Open' : '待办', v: 2, t: en ? '1 high' : '高优 1', c: D.red, tc: D.red },
        { k: en ? 'Done' : '已完成', v: 5, t: en ? 'avg 1.2h' : '均 1.2h', c: D.green, tc: D.mut },
        { k: en ? 'Overdue' : '已超时', v: 1, t: en ? 'escalated' : '已升级', c: D.amber, tc: D.mut },
      ]} />

      <div style={card}>
        <div style={h4}>{en ? 'Handling rate · 7 days' : '临期处置率 · 近 7 天'}
          <span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'today 69%' : '今日 69%'}</span></div>
        <Area pts={[{ v: 61 }, { v: 63 }, { v: 65 }, { v: 68 }, { v: 72 }, { v: 75 }, { v: 69 }]}
          labels={['10-16', '10-18', '10-20', '10-22']} color={D.cyan} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Me vs region' : '本店 vs 区域'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'today' : '今日'}</span></div>
        <Compare en={en} rows={[
          { k: '临期处置率', mine: 69, avg: 78, u: '%', max: 100, better: false },
          { k: '到货差异闭环率', mine: 80, avg: 74, u: '%', max: 100, better: true },
          { k: '预警平均响应', mine: 3.4, avg: 4.1, u: 'h', max: 8, better: true },
        ]} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'In transit today' : '今日在途'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? '2 orders' : '2 单'}</span></div>
        <Transit en={en} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'What drives today’s issues' : '今日异常归因'}</div>
        <Attribution segs={[{ k: '临期', v: 42, c: D.red }, { k: '到货差异', v: 28, c: D.amber },
          { k: '断货', v: 18, c: D.cyan }, { k: '其他', v: 12, c: '#64748B' }]} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Top risks' : '待处理 Top'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'by aging' : '按停留'}</span></div>
        <SkuRow icon="⏳" name={en ? 'Oat Milk · 12 ctn' : '燕麦奶 · 12 箱'} meta={en ? '2 days left · 0.9h' : '剩 2 天 · 停留 0.9h'}
          right="T-2" action actionLabel={en ? 'Handle' : '去处理'} tone={D.red} />
        <SkuRow icon="📦" name={en ? 'Fresh Milk · short 2' : '鲜奶 · 少 2 箱'} meta={en ? 'variance · 2.1h' : '到货差异 · 停留 2.1h'}
          right="SLA 2h" action actionLabel={en ? 'Confirm' : '确认'} tone={D.amber} />
        <SkuRow icon="⚠️" name={en ? 'Coconut Milk · 58%' : '厚椰乳 · 库存 58%'} meta={en ? 'below safety · 3.4h' : '低于安全库存 · 停留 3.4h'}
          right={en ? '3.4h' : '3.4h'} action actionLabel={en ? 'Order' : '加单'} />
        <Note en={en} txt={en ? 'excludes revenue / GMV' : '不含营业额与毛利'} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'PDCA · today' : 'PDCA · 今日'}</div>
        <Pdc en={en} items={[
          { k: 'Plan', c: D.cyan, v: en ? '2 items planned, 1 high priority' : '今日计划 2 项，高优 1 项' },
          { k: 'Do', c: D.green, v: en ? '5 done, avg 1.2h each' : '已完成 5 项，平均 1.2h' },
          { k: 'Check', c: D.amber, v: en ? 'expiry rate 10pp below region' : '临期处置率低于区域 10pp' },
          { k: 'Act', c: D.violet, v: en ? 'log action before 12:00 tomorrow' : '明日 12:00 前补登记处置' },
        ]} />
      </div>
    </>
  )
}

/* ================= 周报 ================= */
function Weekly({ en }) {
  return (
    <>
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Ring value={79} unit="%" segs={[{ k: 'a', v: 79, c: D.cyan }, { k: 'b', v: 21, c: 'rgba(255,255,255,.10)' }]} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: D.mut }}>{en ? 'Weekly execution · W43' : '本周执行 · 第 43 周'}</div>
          <div style={{ fontSize: 13, color: D.ink, marginTop: 2 }}>{en ? '12 stores in region' : '辖区 12 家门店'}</div>
          <div style={{ fontSize: 11, color: D.green, marginTop: 6 }}>▲ {en ? '+6pp WoW' : '较上周 +6pp'}</div>
          <div style={{ fontSize: 10.5, color: D.mut, marginTop: 6 }}>{en ? 'target 85%' : '目标 85%'}</div>
        </div>
      </div>

      <Metrics items={[
        { k: en ? 'Adoption' : '采纳率', v: '76%', t: '+3pp', c: D.ink, tc: D.green },
        { k: en ? 'Closure' : '闭环率', v: '80%', t: en ? 'target 85%' : '目标 85%' },
        { k: en ? 'Expiry loss' : '临期损失', v: '¥2.1k', t: en ? '12 stores' : '12 店', c: D.red, tc: D.mut },
      ]} />

      <div style={card}>
        <div style={h4}>{en ? 'Demand next 7 days' : '未来 7 天需求趋势'}
          <span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'forecast' : '预测'}</span></div>
        <Area pts={[{ v: 62 }, { v: 58 }, { v: 71 }, { v: 66 }, { v: 84 }, { v: 91 }, { v: 103 }]}
          labels={['D1', 'D3', 'D5', 'D7']} color={D.violet} />
        <div style={{ marginTop: 8, fontSize: 11, color: D.mut }}>
          {en ? 'Weather +22% → raise order suggestion' : '高温影响，需求上浮 '}
          <b style={{ color: D.amber }}>{en ? '+22%' : '22%'}</b>
          {en ? '' : '，建议上调订货量'}
        </div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Store ranking' : '门店执行排名'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'vs last week' : '较上周'}</span></div>
        {[{ n: '星汇里店', v: 86, d: '+4' }, { n: '云栖里店', v: 79, d: '+1' }, { n: '青柠广场店', v: 71, d: '-2' },
          { n: '拾光里店', v: 64, d: '-5' }].map((s, i) => (
          <div key={s.n} style={{ padding: '5px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: D.ink }}>
              <span><b style={{ color: D.dim, marginRight: 5 }}>{i + 1}</b>{t(s.n)}</span>
              <span style={num}>{s.v}%<span style={{ marginLeft: 6, fontSize: 10, color: s.d.startsWith('-') ? D.red : D.green }}>{s.d}</span></span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 3, marginTop: 3 }}>
              <div style={{ width: `${s.v}%`, height: '100%', borderRadius: 3,
                background: s.v < 60 ? D.red : s.v < 75 ? D.amber : D.cyan }} />
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'My position in region' : '本店在区域的位置'}
          <span style={{ ...lbl, marginLeft: 'auto' }}>{en ? '3rd of 12 · ▲1' : '第 3 / 12 名 · ↑1'}</span></div>
        <Compare en={en} rows={[
          { k: '执行率', mine: 86, avg: 72, u: '%', max: 100, better: true },
          { k: '订货采纳率', mine: 81, avg: 76, u: '%', max: 100, better: true },
          { k: '临期损失', mine: 180, avg: 178, u: ' 元', max: 400, better: false },
        ]} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'What the store is saying' : '门店原话'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'this week' : '本周'}</span></div>
        <Voices en={en} items={[
          { q: en ? 'Order suggestions are always higher than what we can sell.' : '订货建议总是比我们卖得动的多，改小了又怕断货。', who: en ? 'Manager · Lin Xiao' : '店长 · 林晓', at: '10-21' },
          { q: en ? 'Who do I call when the driver says the goods are short?' : '司机说少件，我到底找谁确认，仓里还是督导？', who: en ? 'Manager · Lin Xiao' : '店长 · 林晓', at: '10-20' },
          { q: en ? 'Expiry alert came at 8am, but my shift starts at 10.' : '临期提醒 8 点就推了，我 10 点才上班。', who: en ? 'Manager · Lin Xiao' : '店长 · 林晓', at: '10-19' },
        ]} />
        <div style={{ fontSize: 9.5, color: D.dim, marginTop: 7 }}>
          {en ? 'Collected from conversations; feeds the admin Insights board.' : '来自会话原话，汇总后进入后台「洞察」页。'}
        </div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'PDCA · this week' : 'PDCA · 本周'}</div>
        <Pdc en={en} items={[
          { k: 'Plan', c: D.cyan, v: en ? 'raise order adoption to 80%' : '目标：订货采纳率提到 80%' },
          { k: 'Do', c: D.green, v: en ? '14 actions logged, 3 unclosed' : '完成 14 个动作，3 个未闭环' },
          { k: 'Check', c: D.amber, v: en ? 'expiry loss +¥120 vs last week' : '临期损失较上周 +120 元' },
          { k: 'Act', c: D.violet, v: en ? 'cut oat milk order 10% next week' : '下周燕麦奶订货下调 10%' },
        ]} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Three things this week' : '本周三件事'}</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.95, color: '#B9C6D4' }}>
          ① {en ? 'Expiry losses concentrate on oat milk (58%).' : '临期损失集中在燕麦奶，占 58%。'}
          <br />② {en ? '3 stores in Shanghai North below 60% for 2 weeks.' : '沪北 3 店连续两周低于 60%。'}
          <br />③ {en ? 'Closure gain mainly from R-002 going live.' : '闭环改善主要来自 R-002 生效。'}
        </div>
        <Note en={en} txt={en ? 'not a BI report' : '非 BI 报表'} />
      </div>
    </>
  )
}

/* ================= 库存健康 ================= */
function Stock({ en }) {
  return (
    <>
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Ring value={82} segs={[{ k: 'a', v: 76, c: D.cyan }, { k: 'b', v: 14, c: D.amber }, { k: 'c', v: 10, c: D.red }]} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: D.mut }}>{en ? 'Inventory health' : '库存健康'}</div>
          {[{ k: en ? 'Healthy stock' : '合理库存', v: '76%', c: D.cyan }, { k: en ? 'Overstock' : '超储', v: '14%', c: D.amber },
            { k: en ? 'Understock' : '低储', v: '10%', c: D.red }].map(x => (
            <div key={x.k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginTop: 7 }}>
              <i style={{ width: 6, height: 6, borderRadius: 3, background: x.c }} />
              <span style={{ color: D.mut }}>{x.k}</span>
              <span style={{ marginLeft: 'auto', color: D.ink, ...num }}>{x.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Expiry window' : '临期预警'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'by value' : '按货值'}</span></div>
        <SegProgress items={[
          { k: en ? '≤7 days' : '7 天内', v: 12, v2: '¥1.2万', c: D.red },
          { k: en ? '≤15 days' : '15 天内', v: 26, v2: '¥2.6万', c: D.amber },
          { k: en ? '≤30 days' : '30 天内', v: 41, v2: '¥4.1万', c: D.cyan },
        ]} />
        <div style={{ height: 1, background: D.line, margin: '12px 0 2px' }} />
        <SkuRow icon="🥛" name={en ? 'Oat Milk' : '燕麦奶'} meta={en ? '8 days left · 18 ctn' : '剩余 8 天 · 库存 18 箱'}
          right="¥486" action actionLabel={en ? 'Transfer' : '调拨建议'} tone={D.cyan} />
        <SkuRow icon="🍵" name={en ? 'Jasmine tea base' : '茉莉茶底'} meta={en ? '12 days · 24 pack' : '剩余 12 天 · 库存 24 包'}
          right="¥320" action actionLabel={en ? 'Promote' : '促销消化'} tone={D.amber} />
        <SkuRow icon="🧋" name={en ? 'Pearl' : '珍珠'} meta={en ? '19 days · 8 bag' : '剩余 19 天 · 库存 8 袋'} right="¥96" />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Me vs region' : '本店 vs 区域'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'inventory' : '库存'}</span></div>
        <Compare en={en} rows={[
          { k: '临期占比', mine: 8.4, avg: 5.1, u: '%', max: 20, better: false },
          { k: '周转天数', mine: 26, avg: 21, u: ' d', max: 45, better: false },
          { k: '盘点准确率', mine: 96, avg: 97, u: '%', max: 100, better: false },
        ]} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Expiry PDCA' : '效期处置 PDCA'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'last 2 weeks' : '近两周'}</span></div>
        <Pdc en={en} items={[
          { k: 'Plan', c: D.cyan, v: en ? '12 batches to clear in 14 days' : '计划处置 12 个临期批次' },
          { k: 'Do', c: D.green, v: en ? '9 done (transfer 5 / promote 3 / write-off 1)' : '已处置 9 个（调拨 5 / 促销 3 / 报损 1）' },
          { k: 'Check', c: D.amber, v: en ? '3 remain, all within 7 days' : '剩 3 个未处置，均在 7 天内到期' },
          { k: 'Act', c: D.violet, v: en ? 'transfer 2 to nearby store today' : '今日调拨 2 个到邻店' },
        ]} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Key factors' : '关键因子'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'red = target' : '红线=目标'}</span></div>
        {[{ k: en ? 'Expiring share' : '临期占比', v: 8.4, max: 20, tg: 5, c: D.red },
          { k: en ? 'Safety deviation' : '安全库存偏离', v: 12, max: 40, tg: 20, c: D.amber },
          { k: en ? 'Dwell days' : '周转天数', v: 26, max: 45, tg: 20, c: D.amber },
          { k: en ? 'Stockout rate' : '断货率', v: 4.2, max: 20, tg: 8, c: D.green }].map(f => (
          <div key={f.k} style={{ padding: '4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: D.ink }}>
              <span>{f.k}</span><span style={{ ...num, color: f.c }}>{f.v}{f.k.includes('天数') ? ' d' : '%'}</span>
            </div>
            <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,.07)', borderRadius: 3, marginTop: 3 }}>
              <div style={{ width: `${f.v / f.max * 100}%`, height: '100%', borderRadius: 3, background: f.c }} />
              <div style={{ position: 'absolute', top: -1, bottom: -1, left: `${f.tg / f.max * 100}%`, width: 1.5, background: D.red, opacity: .7 }} />
            </div>
          </div>
        ))}
        <Note en={en} txt={en ? 'stock value in Lakehouse BI' : '库存金额归湖仓 BI'} />
      </div>
    </>
  )
}

/* ================= 万元用量 ================= */
function Usage({ en }) {
  return (
    <>
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Ring value="+23%" segs={[{ k: 'a', v: 100, c: D.red }]} size={118} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: D.mut }}>{en ? 'Usage per ¥10k · oat milk' : '万元用量 · 燕麦奶'}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: D.ink, marginTop: 3, ...num }}>1.23</div>
          <div style={{ fontSize: 10.5, color: D.red, marginTop: 2 }}>▲ {en ? 'vs baseline 1.00' : '高于基准 1.00'}</div>
          <div style={{ fontSize: 10, color: D.dim, marginTop: 6 }}>{en ? 'unit: ctn per ¥10k · week' : '单位：箱 / 万元 · 周'}</div>
        </div>
      </div>

      <Metrics items={[
        { k: en ? 'Usage' : '本周用量', v: en ? '147 ctn' : '147 箱', t: en ? 'vs 120' : '上周 120' },
        { k: en ? 'Revenue' : '营业额', v: '¥119w', t: 'T-1' },
        { k: en ? 'Per cup' : '单杯用量', v: '17.5ml', t: en ? 'base 14.2' : '基准 14.2', c: D.red, tc: D.red },
      ]} />

      <div style={card}>
        <div style={h4}>{en ? 'Trend · 4 weeks' : '近 4 周趋势'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'vs baseline' : '对比基准'}</span></div>
        <Area pts={[{ v: 0.98 }, { v: 1.01 }, { v: 1.08 }, { v: 1.23 }]}
          labels={['W40', 'W41', 'W42', 'W43']} color={D.red} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Attribution' : '偏差归因'}</div>
        <Attribution segs={[{ k: '配方版本', v: 42, c: D.red }, { k: '损耗', v: 28, c: D.amber },
          { k: '赠送试饮', v: 18, c: D.cyan }, { k: '数据口径', v: 12, c: '#64748B' }]} />
        <div style={{ fontSize: 10.5, color: D.mut, marginTop: 9, lineHeight: 1.8 }}>
          {en ? 'Check recipe version first, then waste log, then gifts inclusion.'
            : '排查顺序：先核配方版本 → 再查损耗登记 → 最后确认赠送是否计入。'}
        </div>
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Me vs same store type' : '本店 vs 同店型'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'per ¥10k' : '每万元'}</span></div>
        <Compare en={en} rows={[
          { k: '燕麦奶', mine: 1.23, avg: 1.05, u: '', max: 1.4, better: false },
          { k: '鲜奶', mine: 1.02, avg: 1.01, u: '', max: 1.4, better: true },
          { k: '珍珠', mine: 0.91, avg: 0.96, u: '', max: 1.4, better: true },
        ]} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'PDCA · usage' : '用量 PDCA'}</div>
        <Pdc en={en} items={[
          { k: 'Plan', c: D.cyan, v: en ? 'verify recipe version first' : '先核对配方与菜单版本' },
          { k: 'Do', c: D.green, v: en ? 'log daily waste for 3 days' : '连续 3 天登记损耗' },
          { k: 'Check', c: D.amber, v: en ? 'compare usage after logging' : '登记后复盘用量是否回落' },
          { k: 'Act', c: D.violet, v: en ? 'if still high, cut order 10%' : '若仍偏高，订货下调 10%' },
        ]} />
      </div>

      <div style={card}>
        <div style={h4}>{en ? 'Materials vs baseline' : '物料对标'}<span style={{ ...lbl, marginLeft: 'auto' }}>{en ? 'this week' : '本周'}</span></div>
        {[{ m: '燕麦奶', v: 1.23, d: '+23%', bad: true }, { m: '鲜奶', v: 1.02, d: '+2%' },
          { m: '厚椰乳', v: 0.98, d: '−2%' }, { m: '珍珠', v: 0.91, d: '−9%' }, { m: '芋泥', v: 1.06, d: '+6%' }].map(r => (
          <div key={r.m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px dashed ${D.line}` }}>
            <span style={{ fontSize: 11.5, color: D.ink, width: 54 }}>{t(r.m)}</span>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.07)', borderRadius: 3 }}>
              <div style={{ width: `${Math.min(100, r.v / 1.4 * 100)}%`, height: '100%', borderRadius: 3,
                background: r.bad ? D.red : D.cyan }} />
            </div>
            <span style={{ fontSize: 11.5, color: D.ink, width: 34, textAlign: 'right', ...num }}>{r.v.toFixed(2)}</span>
            <span style={{ fontSize: 10.5, color: r.bad ? D.red : D.mut, width: 40, textAlign: 'right' }}>{r.d}</span>
          </div>
        ))}
        <Note en={en} txt={en ? 'gifts included (to confirm)' : '赠送计入（待业务确认）'} />
      </div>
    </>
  )
}

/* ================= 外壳 ================= */
const TABS = [
  { k: 'daily', zh: '概览', en: 'Overview' },
  { k: 'stock', zh: '库存', en: 'Stock' },
  { k: 'usage', zh: '用量', en: 'Usage' },
  { k: 'weekly', zh: '周报', en: 'Weekly' },
]

export default function PhonePage({ type, onBack, en, onSwitch }) {
  const title = {
    daily: en ? 'Daily report' : '今日健康日报',
    weekly: en ? 'Weekly summary' : '本周执行摘要',
    stock: en ? 'Inventory health' : '库存健康明细',
    usage: en ? 'Usage per ¥10k' : '万元用量明细',
  }[type] || ''
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: D.bg }}>
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto',
        borderBottom: `1px solid ${D.line}`, background: 'rgba(11,18,32,.96)' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${D.line}`, color: D.mut,
          borderRadius: 12, padding: '2px 9px', fontSize: 11.5, cursor: 'pointer' }}>‹ {en ? 'Back' : '返回'}</button>
        <b style={{ fontSize: 13, color: D.ink }}>{title}</b>
        <span style={{ fontSize: 10, color: D.dim, marginLeft: 'auto' }}>2026-10-22</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 16px',
        background: 'radial-gradient(600px 260px at 80% -8%, rgba(34,211,238,.10), transparent 62%), ' + D.bg }}>
        {type === 'daily' && <Daily en={en} />}
        {type === 'weekly' && <Weekly en={en} />}
        {type === 'stock' && <Stock en={en} />}
        {type === 'usage' && <Usage en={en} />}
        <div style={{ fontSize: 9.5, color: D.dim, textAlign: 'center', marginTop: 6 }}>
          {en ? 'Demo data · definitions consistent with production' : '演示数据 · 指标口径与生产一致'}
        </div>
      </div>
      <div style={{ flex: '0 0 auto', display: 'flex', borderTop: `1px solid ${D.line}`, background: 'rgba(11,18,32,.96)' }}>
        {TABS.map(tb => (
          <button key={tb.k} onClick={() => onSwitch && onSwitch(tb.k)}
            style={{ flex: 1, background: 'transparent', border: 'none', padding: '8px 0 9px', cursor: 'pointer',
              color: tb.k === type ? D.cyan : D.dim, fontSize: 10.5,
              boxShadow: tb.k === type ? `inset 0 2px 0 ${D.cyan}` : 'none' }}>
            {en ? tb.en : tb.zh}
          </button>
        ))}
      </div>
    </div>
  )
}
