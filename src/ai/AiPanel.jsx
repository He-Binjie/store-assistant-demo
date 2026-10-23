import React, { useRef, useState, useEffect } from 'react'
import { Button, Input, Tag, Table, Typography, Space, Card, Alert } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined, CloseOutlined, BulbOutlined } from '@ant-design/icons'
import { useStore } from '../useStore'
import { ACT, metrics, stayHours } from '../store'
import { DB } from '../data/mock'
import { t, getLang } from '../i18n'

const { Text } = Typography
const L = () => getLang()

const CHIPS_ZH = ['今天哪几家店临期没处置？', '华东大区执行率怎么样', '把临期规则扩到全部门店', '这个指标怎么算的']
const CHIPS_EN = ['Which stores have unhandled expiry today?', 'How is East China performing?',
  'Expand the expiry rule to all stores', 'How is this metric calculated?']

/* ---------- 意图识别（真接数据，不是随机回复） ---------- */
function answer(q, s) {
  const en = L() === 'en'
  const ql = q.toLowerCase()

  // 1) 临期未处置
  if ((q.includes('临期') || ql.includes('expiry')) && (q.includes('没处置') || q.includes('未处置') || ql.includes('unhandled'))) {
    const rows = s.events.filter(e => e.type === '临期预警' && (e.state === 'hit' || e.state === 'escalated'))
    return {
      text: en
        ? `There are ${rows.length} stores with unhandled expiry events right now, ${rows.filter(r => r.state === 'escalated').length} of them already escalated to supervisors.`
        : `现在有 ${rows.length} 家门店存在未处置的临期事件，其中 ${rows.filter(r => r.state === 'escalated').length} 条已升级督导。`,
      block: {
        type: 'table',
        columns: [
          { title: t('门店'), dataIndex: 'storeName' },
          { title: t('物料'), dataIndex: 'material' },
          
          { title: t('状态'), dataIndex: 'state' },
          { title: t('停留'), dataIndex: 'age', align: 'right' },
        ],
        rows: rows.slice(0, 6).map(r => ({
          key: r.id, storeName: t(r.storeName), material: t(r.material),
          state: r.state === 'escalated' ? t('已升级督导') : t('待处置'),
          age: stayHours(r, s.clockH) + ' h',
        })),
      },
      follow: en ? 'Want me to notify the supervisors in charge? (draft only)' : '要我把辖区督导拉进待办、生成一条提醒草稿吗？（只生成草稿，不自动发送）',
    }
  }

  // 2) 大区执行率
  if (q.includes('执行率') || q.includes('大区') || ql.includes('region') || ql.includes('performing')) {
    const isEast = q.includes('华东') || ql.includes('east')
    const scope = isEast ? 'A:华东' : 'all'
    const m = metrics({ ...s, scope })
    const stores = DB.stores.filter(x => !isEast || x.area === '华东')
    return {
      text: en
        ? `${isEast ? 'East China' : 'All stores'}: expiry handling ${m.expRate}%, variance closure ${m.difRate}%, supervisor follow-up ${m.followRate}%, avg response ${m.resp}h. ${m.open} events still open.`
        : `${isEast ? '华东大区' : '全部门店'}：临期处置率 ${m.expRate}%、差异闭环率 ${m.difRate}%、督导跟进率 ${m.followRate}%、平均响应 ${m.resp}h，当前未闭环 ${m.open} 条。`,
      block: {
        type: 'kv',
        rows: [
          [t('临期处置率'), m.expRate + '%', t('目标') + ' 85%'],
          [t('到货差异闭环率'), m.difRate + '%', t('目标') + ' 85%'],
          [t('预警平均响应'), m.resp + ' h', t('目标') + ' ≤4h'],
          [t('督导跟进率'), m.followRate + '%', t('目标') + ' 80%'],
        ],
        note: en
          ? `Scope: ${isEast ? 'East China' : 'all'} · ${stores.length} stores · derived from event stream`
          : `范围：${isEast ? '华东大区' : '全部门店'} · ${stores.length} 家门店 · 由事件流派生`,
      },
      follow: en ? 'Two metrics are below target — want the store-level ranking?' : '其中两项未达标，要按门店排名看是哪些店拖的？',
    }
  }

  // 3) 扩规则（写操作 → 只生成草稿）
  if ((q.includes('扩') || q.includes('全部门店') || ql.includes('expand')) && (q.includes('规则') || ql.includes('rule'))) {
    const r = s.rules.find(x => x.id === 'R-001')
    return {
      text: en
        ? 'I drafted the change below. Publishing affects 21 stores immediately — I will not publish without your confirmation.'
        : '我按你的意思拟了一版改动，下面是草稿。发布后 21 家门店立刻生效，需要你确认；我不会自动发布。',
      block: {
        type: 'draft',
        ruleId: 'R-001', name: en ? 'Expiry T-2 must log an action' : r.name,
        changes: [
          [t('生效范围'), en ? 'Pilot 20 stores' : r.scope, en ? 'All stores (21)' : '全部门店（21）'],
          [t('升级时限'), '4h', '4h'],
          [t('升级对象'), en ? 'Supervisor (region)' : '督导（辖区）', en ? 'Supervisor + Supply on-call' : '督导 + 供应链值班'],
        ],
      },
      follow: en ? 'Confirm to publish, or tell me to change the scope.' : '确认后我发布；要改范围直接说。',
    }
  }

  // 4) 口径解释
  if (q.includes('怎么算') || q.includes('口径') || ql.includes('calculated') || ql.includes('metric')) {
    return {
      text: en
        ? 'Metrics on this platform are all derived from the platform’s own event stream — no dependency on business-system KPI definitions.'
        : '这个平台的指标都由平台自身事件流派生，不依赖业务系统的 KPI 口径。',
      block: {
        type: 'spec',
        rows: [
          [t('临期处置率'), en ? 'logged ÷ total expiry events' : '已登记 ÷ 临期命中总数', en ? 'Warehouse WMS + Lakehouse' : '仓储 WMS · 湖仓'],
          [t('到货差异闭环率'), en ? 'closed ÷ reported variances' : '已闭环 ÷ 差异上报总数', en ? '3PL + Warehouse' : '3PL · 仓储'],
          [t('预警平均响应'), en ? 'avg time to first action' : '命中 → 首次动作的平均时长', en ? 'Event stream' : '平台事件流'],
          [t('督导跟进率'), en ? 'closed ÷ escalated' : '升级后闭环 ÷ 升级总数', en ? 'Event stream' : '平台事件流'],
        ],
        note: en
          ? 'Business facts (revenue, GMV, inventory value) are not calculated here — they belong to the Lakehouse BI.'
          : '业务事实类数据（营业额、GMV、库存金额）不在此处计算，归湖仓 BI。',
      },
      follow: null,
    }
  }

  // 5) 督导待办
  if (q.includes('督导') || ql.includes('supervisor')) {
    const rows = s.events.filter(e => e.state === 'escalated')
    return {
      text: en ? `${rows.length} events are waiting on supervisors.` : `有 ${rows.length} 条事件正在等督导处理。`,
      block: rows.length ? { type: 'table',
        columns: [{ title: t('门店'), dataIndex: 'storeName', width: 96 },
          { title: t('类型'), dataIndex: 'type', width: 84, render: v => <span style={{ fontSize: 11 }}>{v}</span> },
          { title: t('停留'), dataIndex: 'age', width: 48, align: 'right' }],
        rows: rows.slice(0, 5).map(r => ({ key: r.id, storeName: t(r.storeName), type: t(r.type), age: stayHours(r, s.clockH) + ' h' })),
      } : null,
      follow: null,
    }
  }

  // 兜底：把边界讲清楚
  return {
    text: en
      ? 'I can do three things here: query execution data, draft rule or routing changes, and explain metric definitions. I cannot modify the customer’s business systems, and I do not report revenue or GMV — those live in the Lakehouse BI.'
      : '我在这里只能做三件事：查执行数据、拟规则或路由改动（草稿，需你确认）、解释指标口径。我不能改客户业务系统的数据，也查不到营业额、GMV——那些在湖仓 BI。',
    block: { type: 'cap',
      items: en
        ? ['Query: unhandled events, regional execution rates, store rankings', 'Draft: rule changes, routing changes, reminders', 'Explain: metric definitions, data sources, boundaries']
        : ['能查：未处置事件、大区执行率、门店排名', '能拟：规则改动、路由改动、提醒草稿（需你确认才生效）', '能解释：指标口径、数据来源、能力边界'] },
    follow: null,
  }
}

/* ---------- 结构化结果渲染 ---------- */
function Block({ b }) {
  if (!b) return null
  if (b.type === 'table') {
    return <Table size="small" pagination={false} columns={b.columns} dataSource={b.rows}
        style={{ marginTop: 8, fontSize: 11.5 }} />
  }
  if (b.type === 'kv') {
    return (
      <div className="ai-kv">
        {b.rows.map(([k, v, tgt], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
            background: i % 2 ? '#fafafa' : '#fff', fontSize: 12 }}>
            <span style={{ color: '#8c8c8c' }}>{k}</span>
            <span><b>{v}</b><span style={{ color: '#bfbfbf', marginLeft: 8 }}>{tgt}</span></span>
          </div>
        ))}
        <div className="ai-kv-note">{b.note}</div>
      </div>
    )
  }
  if (b.type === 'draft') {
    return (
      <Card size="small" style={{ marginTop: 8 }} title={<Space><Tag color="orange">{getLang()==='en'?'Draft':'草稿'}</Tag>{b.name}</Space>}>
        {b.changes.map(([k, from, to], i) => (
          <div key={i} style={{ fontSize: 12, padding: '3px 0' }}>
            <span style={{ color: '#8c8c8c' }}>{k}：</span>
            <span style={{ textDecoration: 'line-through', color: '#bfbfbf' }}>{from}</span>
            <span style={{ margin: '0 6px' }}>→</span><b>{to}</b>
          </div>
        ))}
        <Space style={{ marginTop: 8 }}>
          <Button size="small" type="primary" onClick={() => { ACT.publishRule('R-001'); ACT.toast('规则已发布：生效范围 全部门店（21）') }}>
            {getLang() === 'en' ? 'Confirm & publish' : '确认并发布'}
          </Button>
          <Button size="small">{getLang() === 'en' ? 'Modify' : '再改改'}</Button>
        </Space>
      </Card>
    )
  }
  if (b.type === 'spec') {
    return (
      <div style={{ marginTop: 8 }}>
        {b.rows.map(([k, f, src], i) => (
          <div key={i} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px dashed #f0f0f0' }}>
            <b>{k}</b><span style={{ color: '#595959' }}> = {f}</span>
            <div style={{ color: '#bfbfbf', fontSize: 11 }}>来源：{src}</div>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: '#8c8c8c', marginTop: 8 }}>{b.note}</div>
      </div>
    )
  }
  if (b.type === 'cap') {
    return (
      <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, color: '#595959', lineHeight: 1.9 }}>
        {b.items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    )
  }
  return null
}

export default function AiPanel({ onClose }) {
  const s = useStore()
  const [msgs, setMsgs] = useState([{ role: 'ai', key: 'intro' }])
  const intro = getLang() === 'en'
    ? 'I’m the copilot for this console. Ask me about execution data, or tell me to draft a rule change.'
    : '我是这个控制台的助手。可以问我执行数据，也可以让我拟一条规则改动。'
  const [val, setVal] = useState('')
  const feed = useRef(null)

  const [thinking, setThinking] = useState(false)

  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight }, [msgs, thinking])

  const ask = (q) => {
    if (!q.trim()) return
    setMsgs(m => [...m, { role: 'user', text: q }])
    setVal('')
    setThinking(true)
    setTimeout(() => {
      const a = answer(q, s)
      setMsgs(m => [...m, { role: 'ai', ...a }])
      setThinking(false)
    }, 420)
  }

  const chips = getLang() === 'en' ? CHIPS_EN : CHIPS_ZH

  return (
    <div className="ai-panel">
      <div className="ai-head">
        <span className="ai-dot" />
        <Text strong style={{ fontSize: 13.5 }}>{t('AI 助手')}</Text>
        <span className="ai-model">store-copilot · v3</span>
        <div style={{ flex: 1 }} />
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
      </div>

      <div ref={feed} className="ai-feed">
        {msgs.map((m, i) => (
          m.role === 'user' ? (
            <div key={i} className="ai-q"><span>{m.text}</span></div>
          ) : (
            <div key={i} className="ai-a">
              <div className="ai-a-head">
                <span className="ai-spark">✦</span>
                <span>Copilot</span>
                {m.block && <span className="ai-a-tag">{m.block.type === 'table' ? 'QUERY' : m.block.type === 'draft' ? 'DRAFT' : m.block.type === 'spec' ? 'DEFINITION' : 'ANSWER'}</span>}
              </div>
              <div className="ai-a-text">{m.key === 'intro' ? intro : m.text}</div>
              {m.block && <Block b={m.block} />}
              {m.follow && <div className="ai-follow">{m.follow}</div>}
            </div>
          )
        ))}
        {thinking && (
          <div className="ai-a">
            <div className="ai-a-head"><span className="ai-spark">✦</span><span>Copilot</span></div>
            <div className="ai-typing"><i /><i /><i /></div>
          </div>
        )}
      </div>

      <div className="ai-foot">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {chips.map(c => (
            <button key={c} className="ai-chip" onClick={() => ask(c)}>{c}</button>
          ))}
        </div>
        <Space.Compact style={{ width: '100%', marginBottom: 10 }}>
          <Input placeholder={t('问点问题，或让我办件事')} value={val} onChange={e => setVal(e.target.value)}
            onPressEnter={() => ask(val)} />
          <Button type="primary" icon={<SendOutlined />} onClick={() => ask(val)} />
        </Space.Compact>
      </div>
    </div>
  )
}
