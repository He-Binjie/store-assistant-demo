import React from 'react'
import { Row, Col, Card, Table, Tag, Typography, Button, Space, Statistic, message, Steps } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { DB } from '../data/mock'
import { t, useLang } from '../i18n'

const { Text } = Typography

export function FlywheelOverview() {
  const en = useLang() === 'en'
  const f = DB.flywheel
  const last = f[f.length - 1]
  const first = f[0]
  const up = Math.round((last.hit - first.hit) * 100)

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title={en ? 'Hit rate today' : '今日命中率'}
          value={Math.round(last.hit * 100)} suffix="%" valueStyle={{ color: '#22d3ee' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title={en ? '7-day change' : '7 天变化'} value={`+${up}`} suffix="pp" /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title={en ? 'Open gaps' : '待补缺口'} value={last.gap} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title={en ? 'Fixed today' : '今日补齐'} value={last.fixed} /></Card></Col>
      </Row>

      <Card size="small" title={en ? 'The loop' : '飞轮四段'} style={{ marginBottom: 16 }}>
        <Steps size="small" current={3} items={[
          { title: en ? 'Miss' : '未命中', description: `${last.miss} ${en ? 'today' : '今日'}` },
          { title: en ? 'Cluster' : '缺口归集', description: `${last.gap} ${en ? 'open' : '待处理'}` },
          { title: en ? 'Fill' : '补知识', description: `${last.fixed} ${en ? 'done' : '已补齐'}` },
          { title: en ? 'Hit rate up' : '命中率回升', description: `${Math.round(last.hit * 100)}%` },
        ]} />
      </Card>

      <Card size="small" title={en ? 'Hit rate & miss trend' : '命中率与未命中趋势（近 7 天）'}>
        {f.map(x => (
          <div key={x.d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <span style={{ width: 48, fontSize: 12, color: '#8c8c8c' }}>{x.d}</span>
            <div style={{ flex: 1, height: 9, background: 'rgba(140,140,140,.12)', borderRadius: 5 }}>
              <div style={{ width: `${x.hit * 100}%`, height: '100%', borderRadius: 5, background: 'linear-gradient(90deg,#22d3ee,#6366f1)' }} />
            </div>
            <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{Math.round(x.hit * 100)}%</span>
            <span style={{ width: 88, textAlign: 'right', fontSize: 11.5, color: '#8c8c8c' }}>
              {en ? `miss ${x.miss}` : `未命中 ${x.miss}`}</span>
          </div>
        ))}
      </Card>
    </>
  )
}

export function GapPool() {
  const en = useLang() === 'en'
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 84, render: v => <Text code>{v}</Text> },
    { title: en ? 'Question' : '门店原话', dataIndex: 'q', width: 220 },
    { title: en ? 'Cluster' : '归集', dataIndex: 'cluster', width: 104, render: v => <Tag>{v}</Tag> },
    { title: en ? 'Hits' : '出现次数', dataIndex: 'count', width: 86, align: 'right' },
    { title: en ? 'Stores' : '涉及门店', dataIndex: 'stores', width: 86, align: 'right' },
    { title: en ? 'First seen' : '首次出现', dataIndex: 'firstSeen', width: 100, render: v => <Text type="secondary">{v}</Text> },
    { title: en ? 'Status' : '状态', dataIndex: 'status', width: 106,
      render: v => <Tag color={v === '已闭环' ? 'green' : v === '已生成草稿' ? 'blue' : 'orange'}>{v}</Tag> },
    { title: '', width: 130, render: (_, r) => r.status === '待补知识'
      ? <Button size="small" type="primary" ghost onClick={() => message.success(en ? 'Draft generated, pending review' : '已生成 FAQ 草稿，待审核')}>
          {en ? 'Draft FAQ' : '生成 FAQ 草稿'}</Button>
      : <Button size="small" type="link">{en ? 'View' : '查看'}</Button> },
  ]
  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Button icon={<SyncOutlined />} onClick={() => message.success(en ? 'Gaps re-clustered' : '已重新归集缺口')}>
          {en ? 'Re-cluster' : '重新归集'}</Button>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {en ? 'Sources: missed questions · transfer reasons · complaint types · event follow-ups'
            : '来源：未命中提问 · 转人工原因 · 投诉类型 · 事件处置追问'}</Text>
      </Space>
      <Table size="small" rowKey="id" columns={cols} dataSource={DB.gaps}
        pagination={{ pageSize: 10, showTotal: n => `${en ? 'Total' : '共'} ${n}` }} scroll={{ x: 1000 }} />
    </>
  )
}
