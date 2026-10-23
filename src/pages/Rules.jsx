import React, { useState } from 'react'
import { Table, Button, Space, Tag, Drawer, Descriptions, Timeline, Typography, message, Modal, Form, Input, Select } from 'antd'
import { t } from '../i18n'
import { PlusOutlined } from '@ant-design/icons'
import { useStore } from '../useStore'
import { ACT, today } from '../store'
import { RULE_COLOR } from '../consts'

const { Text } = Typography

function hitTrend(r) {
  const base = { 'R-001': [9, 12, 8, 11, 7, 9, 7], 'R-002': [6, 5, 8, 7, 4, 6, 5], 'R-003': [4, 3, 5, 4, 4, 5, 3],
    'R-004': [1, 2, 1, 2, 1, 1, 1], 'R-005': [0, 0, 0, 0, 0, 0, 0], 'R-006': [0, 0, 0, 0, 0, 0, 0] }[r.id] || []
  return base.map((h, i) => ({ key: i, d: `10-${16 + i}`, hit: h,
    act: Math.max(0, Math.round(h * (r.state === '已生效' ? 0.86 : 0.72))), esc: Math.max(0, Math.round(h * 0.14)) }))
}
function verHistory(r) {
  const n = parseInt(String(r.ver).replace('v', ''), 10) || 1
  const notes = { 1: '规则创建', 2: '调整升级时限 6h → 4h', 3: '生效范围 全部门店 → 灰度 20 店' }
  return Array.from({ length: n }, (_, i) => ({ v: n - i, note: notes[n - i] || '规则修改',
    at: ['2026-10-18 16:20', '2026-10-06 10:32', '2026-09-22 15:08'][i] || '—', by: r.owner }))
}

export default function Rules() {
  const s = useStore()
  const [cur, setCur] = useState(null)
  const [modal, setModal] = useState(false)
  const live = cur ? s.rules.find(r => r.id === cur) : null

  const columns = [
    { title: t('规则号'), dataIndex: 'id', width: 76, render: v => <Text code>{v}</Text> },
    { title: '规则名称 / 触发条件', dataIndex: 'name', render: (v, r) => <div><b>{v}</b>
      <div style={{ color: '#8c8c8c', fontSize: 11.5 }}>{r.trigger}</div></div> },
    { title: t('生效范围'), dataIndex: 'scope', width: 112 },
    { title: t('状态'), dataIndex: 'state', width: 84, render: v => <Tag color={RULE_COLOR[v]}>{t(v)}</Tag> },
    { title: t('负责人'), dataIndex: 'owner', width: 80 },
    { title: t('命中'), dataIndex: 'hits', width: 62, align: 'right', render: v => <Text>{v}</Text> },
    {
      title: '操作', width: 136, render: (_, r) => (
        <Space size={4}>
          <Button size="small" type="link" onClick={e => { e.stopPropagation(); setCur(r.id) }}>{t('详情')}</Button>
          {r.state !== '已生效'
            ? <Button size="small" type="link" onClick={e => { e.stopPropagation(); ACT.publishRule(r.id); message.success('已发布：' + r.name) }}>{t('发布')}</Button>
            : <Button size="small" type="link" danger onClick={e => { e.stopPropagation(); ACT.toggleRule(r.id); message.success('已停用：' + r.name) }}>{t('停用')}</Button>}
        </Space>
      )
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}>{t('新建规则')}</Button>
        <Text type="secondary" style={{ fontSize: 12 }}>规则是控制台唯一的「写」能力：门店端的行为由它驱动</Text>
      </Space>
      <Table size="small" rowKey="id" columns={columns} dataSource={s.rules}
        onRow={r => ({ onClick: () => setCur(r.id), style: { cursor: 'pointer' } })}
        pagination={false} />

      <Drawer open={!!live} onClose={() => setCur(null)} width={540} mask={false} rootClassName="sideDrawer"
        title={live && <Space>{live.name}<Tag color={RULE_COLOR[live.state]}>{live.state}</Tag></Space>}>
        {live && <>
          <Descriptions size="small" column={1} bordered styles={{ label: { width: 100 } }}>
            <Descriptions.Item label="规则号"><Text code>{live.id}</Text></Descriptions.Item>
            <Descriptions.Item label="触发条件">{live.trigger}</Descriptions.Item>
            <Descriptions.Item label="执行动作">{live.action}</Descriptions.Item>
            <Descriptions.Item label="生效范围">{live.scope}</Descriptions.Item>
            <Descriptions.Item label="版本">{live.ver}</Descriptions.Item>
            <Descriptions.Item label="最近更新">{live.updated}</Descriptions.Item>
          </Descriptions>
          <Space style={{ marginTop: 12 }}>
            {live.state !== '已生效' && <Button type="primary" onClick={() => { ACT.publishRule(live.id); message.success('已发布，门店端立即生效') }}>{t('发布规则')}</Button>}
            {live.state === '已生效' && <Button danger onClick={() => { ACT.toggleRule(live.id); message.success('已停用') }}>{t('停用')}</Button>}
            {live.state === '已停用' && <Button onClick={() => { ACT.toggleRule(live.id); message.success('已启用') }}>{t('重新启用')}</Button>}
          </Space>

          <div style={{ fontWeight: 600, margin: '20px 0 8px' }}>{t('近 7 天命中')}</div>
          <Table size="small" rowKey="d" pagination={false} dataSource={hitTrend(live)}
            columns={[{ title: '日期', dataIndex: 'd', width: 90 }, { title: t('命中'), dataIndex: 'hit', align: 'right' },
              { title: '已登记', dataIndex: 'act', align: 'right' }, { title: '升级', dataIndex: 'esc', align: 'right' }]} />

          <div style={{ fontWeight: 600, margin: '20px 0 8px' }}>{t('版本历史')}</div>
          <Timeline items={verHistory(live).map(v => ({
            color: 'blue',
            children: <div><div style={{ fontWeight: 600 }}>v{v.v} · {v.note}</div>
              <div style={{ color: '#8c8c8c', fontSize: 12 }}>{v.at} · {v.by}</div></div>
          }))} />

          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '10px 12px', fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
            通知路由：临期未登记 → 督导（辖区）主责，供应链值班抄送；到货差异 → 仓配专员主责，督导超时兜底。
          </div>
        </>}
      </Drawer>

      <Modal open={modal} title={t('新建规则')} onCancel={() => setModal(false)} okText={t('保存草稿')}
        onOk={() => { setModal(false); message.success('已保存为草稿 R-007') }}>
        <Form layout="vertical" size="small">
          <Form.Item label="规则名称"><Input placeholder="例如：临期 T-2 必须登记处置动作" /></Form.Item>
          <Form.Item label="触发条件"><Input placeholder="例如：批次效期 − 今日 ≤ 2 天" /></Form.Item>
          <Form.Item label="执行动作"><Input placeholder="例如：推送店长 → 未登记满 4h 升级督导" /></Form.Item>
          <Form.Item label="生效范围"><Select placeholder="选择范围" options={[{ value: 'all', label: '全部门店' }, { value: 'gray', label: '灰度门店（自选）' }]} /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}
