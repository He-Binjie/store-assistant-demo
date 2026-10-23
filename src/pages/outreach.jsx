import React from 'react'
import { Row, Col, Card, Table, Tag, Typography, Button, Statistic, Space, message, Progress } from 'antd'
import { SendOutlined, ThunderboltOutlined, PartitionOutlined } from '@ant-design/icons'
import { useStore } from '../useStore'
import { DB } from '../data/mock'
import { t, useLang } from '../i18n'

const { Text } = Typography

export function OutreachCenter() {
  const s = useStore()
  const en = useLang() === 'en'
  const b = DB.broadcast

  const ruleCols = [
    { title: en ? 'Rule' : '规则', dataIndex: 'name',
      render: (v, r) => <div style={{ fontSize: 12.5 }}>{v}
        <div style={{ color: '#8c8c8c', fontSize: 11 }}>{r.scope}</div></div> },
    { title: en ? 'Status' : '状态', dataIndex: 'state', width: 76,
      render: v => <Tag color={v === '已生效' ? 'green' : 'default'}>{v}</Tag> },
  ]
  const taskCols = [
    { title: en ? 'Task' : '任务', dataIndex: 'task' },
    { title: en ? 'Sent' : '发送', dataIndex: 'sent', width: 70, align: 'right' },
    { title: en ? 'Read' : '阅读', dataIndex: 'read', width: 70, align: 'right' },
    { title: en ? 'CTR' : '阅读率', dataIndex: 'ctr', width: 80, align: 'right' },
    { title: '', width: 90, render: () => <Button size="small" type="link">{en ? 'Tune' : '调整'}</Button> },
  ]

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title={en ? 'Sent today' : '今日触达'} value={b.today.sent} suffix={en ? '' : '条'} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title={en ? 'Delivered' : '送达'} value={b.today.delivered} suffix={`/ ${b.today.sent}`} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title={en ? 'Read' : '阅读'} value={b.today.read} suffix={`(${Math.round(b.today.read / b.today.sent * 100)}%)`} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title={en ? 'Failed' : '失败'} value={b.today.dv} valueStyle={{ color: '#cf1322' }} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card size="small" title={<Space><SendOutlined />{en ? 'What to push' : '推什么'}</Space>}
            style={{ height: '100%' }}
            extra={<Button size="small" type="link" onClick={() => message.success(en ? 'Draft created' : '已创建内容草稿')}>{en ? 'New' : '新建'}</Button>}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {en ? 'Content templates that define every card the store sees.' : '内容模板：门店端看到的每一张卡片都来自这里。'}</Text>
            <div style={{ marginTop: 10 }}>
              {DB.templates.slice(0, 5).map(x => (
                <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f0f0f0', fontSize: 12.5 }}>
                  <span>{x.name}</span><Tag>{x.scene}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small" title={<Space><ThunderboltOutlined />{en ? 'When & how' : '怎么推'}</Space>} style={{ height: '100%' }}
            extra={<Button size="small" type="link" onClick={() => message.info(en ? 'Schedule editor' : '调度编辑（演示）')}>{en ? 'Schedule' : '调度'}</Button>}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {en ? 'Rules decide when an event becomes a push, with frequency guard.' : '规则决定「什么事件在什么时机推到哪」，带频次保护。'}</Text>
            <Table size="small" rowKey="id" style={{ marginTop: 8 }} pagination={false}
              columns={ruleCols} dataSource={s.rules.filter(r => r.state !== '草稿').slice(0, 4)} />
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small" title={<Space><PartitionOutlined />{en ? 'Who gets it' : '推给谁'}</Space>} style={{ height: '100%' }}
            extra={<Button size="small" type="link" onClick={() => message.success(en ? 'Routing updated' : '已更新路由')}>{en ? 'Edit' : '编辑'}</Button>}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {en ? 'Org routing: store → supervisor → supply chain, by event type.' : '组织路由：按事件类型定主责与兜底，门店 → 督导 → 供应链。'}</Text>
            <div style={{ marginTop: 8 }}>
              {s.route.list.slice(0, 5).map(r => (
                <div key={r.ev} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #f0f0f0', fontSize: 12 }}>
                  <span style={{ color: '#8c8c8c' }}>{r.ev}</span><span>{r.to}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card size="small" title={en ? 'Delivery by task' : '按任务的送达与阅读'} style={{ marginTop: 16 }}>
        <Table size="small" rowKey="task" columns={taskCols} dataSource={b.byTask} pagination={false} />
      </Card>
    </>
  )
}
