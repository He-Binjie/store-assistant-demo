import React from 'react'
import { DB } from '../data/mock'
import { t } from '../i18n'

const HEAD = { background: '#fff', borderBottom: '1px solid #E6E7EA', padding: '10px 12px',
  display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }
const BODY = { flex: 1, overflowY: 'auto', background: '#F2F3F5', padding: '10px 12px 20px' }
const CARD = { background: '#fff', borderRadius: 10, padding: '12px 13px', marginBottom: 10, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }
const TITLE = { fontSize: 12.5, fontWeight: 600, marginBottom: 8 }
const KPIROW = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
const KPI = { background: '#fff', borderRadius: 10, padding: '10px 12px' }
const SMALL = { fontSize: 10.5, color: '#9AA0A7' }
const ROW = { display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px dashed #F0F1F3' }

const TREND = [61, 63, 65, 68, 72, 75, 78]

function Bar({ v, max = 100, color = '#1F4E79' }) {
  return <div style={{ height: 6, background: '#EEF1F4', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
    <div style={{ width: `${Math.min(100, v / max * 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
  </div>
}

export default function PhonePage({ type, onBack, en }) {
  const title = {
    daily: en ? 'Daily report' : '今日健康日报',
    weekly: en ? 'Weekly summary' : '本周执行摘要',
    stock: en ? 'Inventory health' : '库存健康明细',
    usage: en ? 'Usage per ¥10k' : '万元用量明细',
  }[type] || ''

  return (
    <>
      <div style={HEAD}>
        <button className="pbtn" style={{ padding: '2px 8px' }} onClick={onBack}>‹ {en ? 'Back' : '返回'}</button>
        <b style={{ fontSize: 13 }}>{title}</b>
        <span style={{ ...SMALL, marginLeft: 'auto' }}>2026-10-22</span>
      </div>
      <div style={BODY}>
        {type === 'daily' && <>
          <div style={KPIROW}>
            {[[en ? 'Open' : '待办', 2], [en ? 'Done today' : '今日完成', 5],
              [en ? 'Expiry handled' : '临期处置率', '69%'], [en ? 'Health' : '库存健康', en ? 'Watch' : '关注']].map(([k, v]) => (
              <div key={k} style={KPI}><div style={SMALL}>{k}</div>
                <div style={{ fontSize: 19, fontWeight: 600, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ ...CARD, marginTop: 10 }}>
            <div style={TITLE}>{en ? 'Expiry handling · last 7 days' : '临期处置率 · 近 7 天'}</div>
            {TREND.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, padding: '2px 0' }}>
                <span style={{ width: 40, color: '#9AA0A7' }}>10-{16 + i}</span>
                <div style={{ flex: 1 }}><Bar v={v} color="#1F4E79" /></div>
                <span style={{ width: 34, textAlign: 'right' }}>{v}%</span>
              </div>
            ))}
          </div>
          <div style={CARD}>
            <div style={TITLE}>{en ? 'My events this week' : '本店本周事件'}</div>
            {[[t('临期预警'), en?'Oat Milk 12 ctn':'燕麦奶 12 箱', '待处置'], [t('到货差异'), en?'Fresh Milk short 2':'鲜奶 少 2 箱', '已闭环'],
              [t('断货预警'), en?'Coconut Milk':'厚椰乳', '已登记'], [t('盘点差异'), en?'Lid':'杯盖', '已闭环']].map(([a, b, c]) => (
              <div key={a} style={ROW}><span>{t(a)}<span style={{ color: '#9AA0A7' }}> · {t(b)}</span></span>
                <span style={{ color: c === '待处置' ? '#B23A28' : '#3E6B4F' }}>{t(c)}</span></div>
            ))}
            <div style={{ ...SMALL, marginTop: 8 }}>{en ? 'Source: event stream · updated 08:00' : '数据来源：事件流　｜　更新 08:00'}</div>
          </div>
        </>}

        {type === 'weekly' && <>
          <div style={CARD}>
            <div style={TITLE}>{en ? 'Store ranking (execution)' : '门店执行排名（辖区）'}</div>
            {[[t('星汇里店'), 86], [t('云栖里店'), 79], [t('青柠广场店'), 71], [t('拾光里店'), 64]].map(([n, v]) => (
              <div key={n} style={{ padding: '5px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>{t(n)}</span><span>{v}%</span></div>
                <Bar v={v} color={v < 70 ? '#B23A28' : '#1F4E79'} />
              </div>
            ))}
          </div>
          <div style={CARD}>
            <div style={TITLE}>{en ? 'Key numbers' : '关键数字'}</div>
            {[[en ? 'Expiry loss (est.)' : '临期损失（估）', '¥ 2,140'],
              [en ? 'Order adoption' : '订货建议采纳率', '76%'],
              [en ? 'Variance closure' : '到货差异闭环率', '80%'],
              [en ? 'Avg response' : '预警平均响应', '3.4 h']].map(([k, v]) => (
              <div key={k} style={ROW}><span style={{ color: '#6E767E' }}>{k}</span><b>{v}</b></div>
            ))}
            <div style={{ ...SMALL, marginTop: 8 }}>{en ? 'Definition: platform event stream · not a BI report' : '口径：平台事件流自产，非 BI 报表'}</div>
          </div>
        </>}

        {type === 'stock' && <>
          <div style={CARD}>
            <div style={TITLE}>{en ? 'Health: Watch (worst factor)' : '健康档位：关注（由最差因子决定）'}</div>
            {[[t('临期占比'), 8.4, 10, '#B23A28'], [t('安全库存偏离'), 12, 30, '#96742A'],
              [t('周转天数'), 62, 100, '#1F4E79'], [t('盘点准确率'), 96, 100, '#3E6B4F']].map(([k, v, max, c]) => (
              <div key={k} style={{ padding: '5px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>{k}</span><span>{v}{k === '周转天数' ? ' 天' : '%'}</span></div>
                <Bar v={v} max={max} color={c} />
              </div>
            ))}
          </div>
          <div style={CARD}>
            <div style={TITLE}>{en ? 'Suggested actions' : '建议动作'}</div>
            {[[en?'Oat Milk 12 ctn T-2':'燕麦奶 12 箱 T-2', '调拨邻店'], [en?'Coconut Milk 8 ctn T-3':'厚椰乳 8 箱 T-3', '促销消化'], [en?'Lid 26 days idle':'杯盖 积压 26 天', '暂停订货']].map(([a, b]) => (
              <div key={a} style={ROW}><span>{t(a)}</span><span style={{ color: '#1F4E79' }}>{t(b)} ›</span></div>
            ))}
          </div>
        </>}

        {type === 'usage' && <>
          <div style={CARD}>
            <div style={TITLE}>{en ? 'Usage per ¥10k vs baseline' : '万元用量 vs 基准（本周）'}</div>
            {[[t('燕麦奶'), 1.23, '+23%', true], [t('鲜奶'), 1.02, '+2%', false],
              [t('厚椰乳'), 0.98, '−2%', false], [t('珍珠'), 0.91, '−9%', false]].map(([n, v, d, bad]) => (
              <div key={n} style={ROW}>
                <span>{t(n)}</span>
                <span><b>{v}</b> <span style={{ color: bad ? '#B23A28' : '#8c8c8c' }}>{d}</span></span>
              </div>
            ))}
            <div style={{ ...SMALL, marginTop: 8, lineHeight: 1.7 }}>
              {en ? 'Definition: usage ÷ revenue(¥10k). Baseline: same region, same store type, same menu version.'
                : '口径：用量 ÷ 营业额（万元）；基准取同区域 · 同店型 · 同菜单版本门店自身历史。区域均值仅作参考。'}
            </div>
          </div>
          <div style={CARD}>
            <div style={TITLE}>{en ? 'What this means' : '这意味着什么'}</div>
            <div style={{ fontSize: 12, lineHeight: 1.8, color: '#4A5158' }}>
              {en ? 'Oat milk usage is 23% above baseline while revenue is flat — likely over-pour, waste, or a data error. Check recipe version first.'
                : '燕麦奶用量高于基准 23%，而营业额持平——可能是出品超用、损耗、或数据口径错。建议先核对配方版本，再排查损耗登记。'}
            </div>
          </div>
        </>}

        <div style={{ ...SMALL, textAlign: 'center', marginTop: 6 }}>
          {en ? 'Demo data · metric definition consistent with production' : '演示数据 · 指标口径与生产一致'}
        </div>
      </div>
    </>
  )
}
