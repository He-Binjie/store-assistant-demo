import React, { useState } from 'react'
import { Tag, Typography, Button, Space, message, Form, Input, Select, Alert, Card, Descriptions } from 'antd'
import DataTable from './DataTable'
import { DB } from '../data/mock'
import { t } from '../i18n'

const { Text } = Typography

export function ConvsPage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '门店', dataIndex: 'store', width: 130 },
    { title: '提问人', dataIndex: 'user', width: 90 },
    { title: '问题', dataIndex: 'q', width: 200 },
    { title: '助手处理', dataIndex: 'a', render: v => <Text type="secondary">{v}</Text> },
    { title: '意图', dataIndex: 'intent', width: 110, render: v => <Tag color="geekblue">{v}</Tag> },
    { title: '时间', dataIndex: 'at', width: 140, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: '结果', dataIndex: 'resolved', width: 90, render: v => <Tag color={v ? 'green' : 'orange'}>{v ? '已解决' : '已转人工'}</Tag> },
  ]
  return <DataTable title="会话记录" tip="门店与助手的每一轮对话，可追溯到人、门店、意图"
    columns={cols} rows={DB.convs} searchKeys={['store', 'q', 'intent']} pageSize={12} scrollX={1100}
    toolbar={[<Button key="1" onClick={() => message.success('已创建导出任务')}>{t('导出')}</Button>]} />
}

export function GroupsPage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '群名称', dataIndex: 'name', width: 260 },
    { title: '群主', dataIndex: 'owner', width: 130 },
    { title: '成员', dataIndex: 'members', width: 70, align: 'right' },
    { title: '类型', dataIndex: 'type', width: 100, render: v => <Tag color="purple">{v}</Tag> },
    { title: '建立时间', dataIndex: 'created', width: 110, render: v => <Text type="secondary">{v}</Text> },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color={v === '进行中' ? 'green' : 'default'}>{v}</Tag> },
  ]
  return <DataTable title="群聊管理" tip="跨角色协作靠群；这里能看到每一次差异处理、整改跟进建了哪个群"
    columns={cols} rows={DB.groups} searchKeys={['name', 'owner', 'type']} />
}

export function PushTaskPage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '任务名称', dataIndex: 'name', width: 180 },
    { title: '调度', dataIndex: 'cron', width: 130, render: v => <Tag color="blue">{v}</Tag> },
    { title: '范围', dataIndex: 'scope', width: 120 },
    { title: '通道', dataIndex: 'channels', width: 120 },
    { title: '最近执行', dataIndex: 'lastRun', width: 140, render: v => <Text type="secondary">{v}</Text> },
    { title: '启用', dataIndex: 'enabled', width: 80, render: v => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
  ]
  return <DataTable title="推送任务" tip="定时广播：早间日报、周度摘要、批量提醒"
    columns={cols} rows={DB.pushTasks} searchKeys={['name', 'cron']}
    toolbar={[<Button key="1" type="primary" onClick={() => message.success('已新建推送任务草稿')}>{t('新建推送')}</Button>]} />
}

export function PushLogPage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '任务', dataIndex: 'task', width: 170 },
    { title: '门店', dataIndex: 'store', width: 140 },
    { title: '发送时间', dataIndex: 'at', width: 140, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', width: 100, render: v => <Tag color={v === '失败' ? 'red' : v === '已读' ? 'blue' : 'green'}>{v}</Tag> },
  ]
  return <DataTable title="推送日志" tip="每条推送的送达结果，失败的会进重试队列"
    columns={cols} rows={DB.pushLogs} searchKeys={['task', 'store']} pageSize={12} />
}

export function LogisticsPage() {
  const [form] = Form.useForm()
  const [res, setRes] = useState(null)
  const onSearch = () => {
    const no = form.getFieldValue('no') || 'DN20261022004'
    setRes({
      no, store: DB.stores[0].name, carrier: '3PL · 华东仓配一组', status: '已签收 · 差异待确认',
      steps: [
        ['抓取运单', '06:12 成功', 'green'],
        ['匹配子订单', '06:13 成功 · 匹配 6 个', 'green'],
        ['温控校验', '08:40 通过（4.2°C）', 'green'],
        ['数量校验', '14:05 差异：应到 44 箱 / 实收 42 箱', 'orange'],
      ]
    })
  }
  return (
    <>
      <Card size="small" title="物流排障" style={{ marginBottom: 16 }}
        extra={<Text type="secondary" style={{ fontSize: 12 }}>输入运单号 / 子订单号，查看抓取链路与失败原因</Text>}>
        <Form form={form} layout="inline" onFinish={onSearch}>
          <Form.Item name="no" label={t('运单号')}><Input placeholder="DN20261022004" style={{ width: 220 }} /></Form.Item>
          <Form.Item label={t('承运')}><Select style={{ width: 160 }} placeholder="全部"
            options={[{ value: '3pl', label: '3PL' }, { value: 'self', label: '仓配自送' }]} /></Form.Item>
          <Button type="primary" htmlType="submit">{t('查询')}</Button>
        </Form>
      </Card>
      {res && (
        <Card size="small" title={t('查询结果')}>
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label={t('运单号')}><Text code>{res.no}</Text></Descriptions.Item>
            <Descriptions.Item label="门店">{res.store}</Descriptions.Item>
            <Descriptions.Item label="承运方">{res.carrier}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color="orange">{res.status}</Tag></Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 14 }}>
            {res.steps.map(([n, d, c]) => (
              <div key={n} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 12.5 }}>
                <Tag color={c} style={{ width: 62, textAlign: 'center' }}>{n}</Tag>
                <span style={{ color: '#595959' }}>{d}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
