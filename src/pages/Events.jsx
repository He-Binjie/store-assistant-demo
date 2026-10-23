import React, { useMemo, useState } from 'react'
import { Table, Select, Input, Space, Tag, Button, Drawer, Descriptions, Timeline, Typography, message } from 'antd'
import { t } from '../i18n'
import { ReloadOutlined } from '@ant-design/icons'
import { useStore } from '../useStore'
import { ACT, stayHours, inScope } from '../store'
import { DB } from '../data/mock'
import { STATE_TXT, STATE_COLOR, SEV_TXT, SEV_COLOR } from '../consts'

const { Text } = Typography

export default function Events() {
  const s = useStore()
  const [type, setType] = useState()
  const [state, setState] = useState()
  const [area, setArea] = useState()
  const [kw, setKw] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [cur, setCur] = useState(null)

  const list = useMemo(() => s.events.filter(e => inScope(e, s.scope))
    .filter(e => !type || e.type === type)
    .filter(e => !state || e.state === state)
    .filter(e => !area || e.area === area)
    .filter(e => !kw || (e.id + e.storeName + e.material + e.type).includes(kw))
    .sort((a, b) => (a.hitAt < b.hitAt ? 1 : -1)), [s.events, s.scope, type, state, area, kw])

  const live = cur ? s.events.find(x => x.id === cur) : null

  const columns = [
    { title: '事件号', dataIndex: 'id', width: 142, render: v => <Text code style={{ fontSize: 11.5 }}>{v}</Text> },
    { title: '门店', dataIndex: 'storeName', width: 126, render: (v, r) => <div>{v}<div style={{ color: '#8c8c8c', fontSize: 11 }}>{r.area} · {r.regionName}</div></div> },
    { title: '类型', dataIndex: 'type', width: 118 },
    { title: '物料', dataIndex: 'material', width: 136, render: (v, r) => <div>{v}<div style={{ color: '#8c8c8c', fontSize: 11 }}>{r.sku} · {r.qty}</div></div> },
    { title: '严重度', dataIndex: 'severity', width: 66, render: v => <Tag color={SEV_COLOR[v]}>{SEV_TXT[v]}</Tag> },
    { title: '命中时间', dataIndex: 'hitAt', width: 144, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: '状态', dataIndex: 'state', width: 96, render: v => <Tag color={STATE_COLOR[v]}>{STATE_TXT[v]}</Tag> },
    { title: '责任人', dataIndex: 'owner', width: 106, render: v => <Text type="secondary">{v ? t(v) : '—'}</Text> },
    { title: '停留', width: 64, align: 'right', render: (_, r) => { const h = stayHours(r, s.clockH); return <Text type={h > 8 ? 'danger' : undefined}>{h} h</Text> } },
  ]

  const steps = live ? [
    { t: '命中规则', at: live.hitAt, done: true, who: '系统' },
    { t: '通知责任人', at: live.notifiedAt || '—', done: !!live.notifiedAt, who: live.owner || '店长' },
    { t: '登记处置动作', at: live.actedAt || '—', done: !!live.actedAt, who: live.actedAt ? (live.action || '已登记') : '' },
    { t: '升级督导', at: live.escalatedAt || '—', done: !!live.escalatedAt, who: live.escalatedAt ? '督导' : '' },
    { t: '闭环', at: live.closedAt || '—', done: live.state === 'closed', who: live.resolution || '' },
  ] : inArray()

  function inArray() { return [] }
  const curIdx = steps.findIndex(x => !x.done)

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select placeholder="全部类型" allowClear style={{ width: 150 }} value={type} onChange={v => { setType(v); setPage(1) }}
          options={[...new Set(DB.events.map(e => e.type))].map(t => ({ value: t, label: t }))} />
        <Select placeholder="全部状态" allowClear style={{ width: 140 }} value={state} onChange={v => { setState(v); setPage(1) }}
          options={Object.entries(STATE_TXT).map(([v, l]) => ({ value: v, label: l }))} />
        <Select placeholder="全部大区" allowClear style={{ width: 140 }} value={area} onChange={v => { setArea(v); setPage(1) }}
          options={DB.areas.map(a => ({ value: a.name, label: a.name }))} />
        <Input.Search placeholder="事件号 / 门店 / 物料" style={{ width: 230 }} allowClear
          onSearch={v => { setKw(v); setPage(1) }} onChange={e => { if (!e.target.value) { setKw(''); setPage(1) } }} />
        <Button icon={<ReloadOutlined />} onClick={() => { setType(); setState(); setArea(); setKw(''); setPage(1) }}>{t('重置')}</Button>
        <Text type="secondary" style={{ fontSize: 12 }}>共 {list.length} 条</Text>
      </Space>

      <Table size="small" rowKey="id" columns={columns} dataSource={list} scroll={{ x: 1000 }}
        onRow={r => ({ onClick: () => setCur(r.id), style: { cursor: 'pointer' } })}
        pagination={{ current: page, pageSize: size, total: list.length, showSizeChanger: true,
          pageSizeOptions: [10, 20, 50], onChange: (p, ps) => { setPage(p); setSize(ps) }, showTotal: t => `共 ${t} 条` }} />

      <Drawer open={!!live} onClose={() => setCur(null)} width={520} mask={false} rootClassName="sideDrawer"
        title={<Space>{live && live.type}<Tag color={live && STATE_COLOR[live.state]}>{live && STATE_TXT[live.state]}</Tag></Space>}
        extra={live && live.state !== 'closed' && (
          <Space>
            <Button size="small" onClick={() => { ACT.remindEvent(live.id); message.success('已催办责任人') }}>{t('催办')}</Button>
            <Button size="small" onClick={() => { ACT.escalateEvent(live.id); message.success('已升级督导') }}>{t('升级督导')}</Button>
            <Button size="small" type="primary" onClick={() => { ACT.closeEvent(live.id); message.success('已标记闭环') }}>{t('标记闭环')}</Button>
          </Space>
        )}>
        {live && <>
          <Descriptions size="small" column={1} bordered styles={{ label: { width: 110 } }}>
            <Descriptions.Item label="事件号"><Text code>{live.id}</Text></Descriptions.Item>
            <Descriptions.Item label="门店">{live.storeName}（{live.storeCode}）</Descriptions.Item>
            <Descriptions.Item label="组织">{live.area} · {live.regionName}</Descriptions.Item>
            <Descriptions.Item label="物料">{live.material} · {live.sku} · {live.qty}</Descriptions.Item>
            <Descriptions.Item label="说明">{live.note}</Descriptions.Item>
            <Descriptions.Item label="严重度">{SEV_TXT[live.severity]}　SLA {live.slaH}h</Descriptions.Item>
            <Descriptions.Item label="责任人">{live.owner || '—'}</Descriptions.Item>
            <Descriptions.Item label="数据来源">{live.source}</Descriptions.Item>
            {live.deviation && <Descriptions.Item label="订货偏离">{live.deviation}</Descriptions.Item>}
          </Descriptions>
          <div style={{ margin: '18px 0 10px', fontWeight: 600 }}>{t('处置时间线')}</div>
          <Timeline items={steps.map((x, i) => ({
            color: x.done ? 'blue' : (i === curIdx ? 'orange' : 'gray'),
            children: <div>
              <div style={{ fontWeight: x.done ? 600 : 400 }}>{x.t}{x.who ? ' · ' + x.who : ''}</div>
              <div style={{ color: '#8c8c8c', fontSize: 12 }}>{x.at}</div>
            </div>
          }))} />
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '10px 12px', fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
            时间线由平台事件流生成，每一步都留痕：谁、何时、做了什么。业务系统侧的数据（库存数量、金额）不在此处展示。
          </div>
        </>}
      </Drawer>
    </>
  )
}
