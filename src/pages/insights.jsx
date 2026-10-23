import React from 'react'
import { Row, Col, Card, Table, Tag, Typography, Button, Space, message, Progress } from 'antd'
import { BulbOutlined, LineChartOutlined, FireOutlined } from '@ant-design/icons'
import { DB } from '../data/mock'
import { t, useLang } from '../i18n'

const { Text } = Typography

export function InsightsPage() {
  const en = useLang() === 'en'
  const maxF = Math.max(...DB.features.map(f => f.count))
  const maxP = Math.max(...DB.pains.map(p => p.score))

  const gapCols = [
    { title: en ? 'Question' : '门店原话', dataIndex: 'q', width: 210 },
    { title: en ? 'Cluster' : '归集', dataIndex: 'cluster', width: 100, render: v => <Tag>{v}</Tag> },
    { title: en ? 'Hits' : '出现', dataIndex: 'count', width: 66, align: 'right' },
    { title: en ? 'Stores' : '涉及门店', dataIndex: 'stores', width: 84, align: 'right' },
    { title: '', width: 120, render: () => (
      <Button size="small" type="link" onClick={() => message.success(en ? 'FAQ draft generated' : '已生成 FAQ 草稿（待审核）')}>
        {en ? 'Draft FAQ' : '生成草稿'}</Button>) },
  ]

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={24} xxl={15}>
          <Card size="small" title={<Space><BulbOutlined />{en ? 'Knowledge gaps from real questions' : '知识缺口 · 来自真实提问'}</Space>}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>{en ? 'export to actions, not to a report' : '出口是配置动作，不是报表'}</Text>}>
            <Table size="small" rowKey="id" columns={gapCols} dataSource={DB.gaps.filter(g => g.status === '待补知识').slice(0, 6)}
              pagination={false} />
          </Card>
        </Col>
        <Col xs={24} xl={24} xxl={9}>
          <Card size="small" title={<Space><FireOutlined />{en ? 'Store pain points' : '门店痛点标签'}</Space>} style={{ height: '100%' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {en ? 'Clustered from questions and escalation reasons.' : '由提问与转人工原因聚类，用于决定下一轮推什么。'}</Text>
            <div style={{ marginTop: 10 }}>
              {DB.pains.map(p => (
                <div key={p.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span>{p.name}</span><span style={{ color: '#8c8c8c' }}>{p.score}</span>
                  </div>
                  <Progress percent={Math.round(p.score / maxP * 100)} showInfo={false} size="small"
                    strokeColor={{ from: '#22d3ee', to: '#6366f1' }} />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card size="small" title={<Space><LineChartOutlined />{en ? 'Feature usage (7 days)' : '功能使用分布（近 7 天）'}</Space>}
        extra={<Text type="secondary" style={{ fontSize: 12 }}>{en ? 'low usage = candidate for guidance push' : '用得少的功能 = 下一轮引导推送的候选'}</Text>}>
        {DB.features.map(f => (
          <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '3px 0' }}>
            <span style={{ width: 96, fontSize: 12.5 }}>{f.name}</span>
            <div style={{ flex: 1, height: 10, background: 'rgba(140,140,140,.12)', borderRadius: 5 }}>
              <div style={{ width: `${f.count / maxF * 100}%`, height: '100%', borderRadius: 5,
                background: 'linear-gradient(90deg,#22d3ee,#6366f1)' }} />
            </div>
            <span style={{ width: 52, textAlign: 'right', fontSize: 12, color: '#8c8c8c' }}>{f.count}</span>
            {f.count / maxF < 0.25 && <Button size="small" type="link"
              onClick={() => message.success(en ? 'Guidance push drafted' : '已生成引导推送草稿')}>{en ? 'Nudge' : '引导'}</Button>}
          </div>
        ))}
      </Card>
    </>
  )
}
