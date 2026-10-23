import React from 'react'
import { Tag, Typography, Switch, Button, Space, message, Drawer } from 'antd'
import DataTable from './DataTable'
import { DB } from '../data/mock'
import { t } from '../i18n'

const { Text, Paragraph } = Typography

export function FaqPage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '问题', dataIndex: 'q', width: 280 },
    { title: '答案摘要', dataIndex: 'a', render: v => <Text type="secondary">{v}</Text> },
    { title: '分类', dataIndex: 'tag', width: 100, render: v => <Tag color="blue">{v}</Tag> },
    { title: '命中', dataIndex: 'hit', width: 80, align: 'right' },
    { title: '最近更新', dataIndex: 'updated', width: 110, render: v => <Text type="secondary">{v}</Text> },
    { title: '启用', dataIndex: 'enabled', width: 74, render: v => <Switch size="small" defaultChecked={v} /> },
  ]
  return <DataTable title="FAQ知识库" tip="门店问得最多的问题与标准答法；命中率低的会进入优化清单"
    columns={cols} rows={DB.faqs} searchKeys={['q', 'a', 'tag']}
    toolbar={[<Button key="1" type="primary" onClick={() => message.success('已进入新建 FAQ（演示）')}>{t('新建 FAQ')}</Button>]} />
}

export function IntentPage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '关键词', dataIndex: 'keyword', width: 130, render: v => <Tag>{v}</Tag> },
    { title: '意图', dataIndex: 'intent', width: 160 },
    { title: '处理路径', dataIndex: 'route', width: 150, render: v => <Tag color="geekblue">{v}</Tag> },
    { title: '优先级', dataIndex: 'priority', width: 84, align: 'right' },
    { title: '命中', dataIndex: 'hit', width: 90, align: 'right' },
  ]
  return <DataTable title="意图关键词" tip="关键词 → 意图 → 处理路径；决定一句话该走查数、查规则还是转人工"
    columns={cols} rows={DB.intents} searchKeys={['keyword', 'intent', 'route']} />
}

export function PromptPage() {
  const [open, setOpen] = React.useState(null)
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '名称', dataIndex: 'name', width: 170 },
    { title: '场景', dataIndex: 'scene', width: 100, render: v => <Tag color="purple">{v}</Tag> },
    { title: '版本', dataIndex: 'ver', width: 70 },
    { title: '字数', dataIndex: 'chars', width: 80, align: 'right' },
    { title: '最近更新', dataIndex: 'updated', width: 110, render: v => <Text type="secondary">{v}</Text> },
    { title: '操作', width: 120, render: (_, r) => <Space size={4}>
      <Button size="small" type="link" onClick={() => setOpen(r)}>{t('查看')}</Button>
      <Button size="small" type="link" onClick={() => message.success('已复制为草稿')}>{t('复制')}</Button></Space> },
  ]
  return <>
    <DataTable title="提示词管理" tip="助手的人格、回答边界、卡片文案生成规则都在这"
      columns={cols} rows={DB.prompts} searchKeys={['name', 'scene']}
      toolbar={[<Button key="1" type="primary" onClick={() => message.success('已新建提示词草稿')}>{t('新建提示词')}</Button>]} />
    <Drawer open={!!open} onClose={() => setOpen(null)} width={520} mask={false} rootClassName="sideDrawer"
      title={open && open.name}>
      {open && <>
        <Paragraph type="secondary" style={{ fontSize: 12 }}>{open.scene} · {open.ver} · {open.chars} 字</Paragraph>
        <pre style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: 12,
          fontSize: 12, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
{open.preview}
{'\n\n'}【回答边界】
1. 只回答货、履约、执行相关；不评价门店经营结果。
2. 涉及金额、营业额、毛利，一律引导至湖仓 BI。
3. 任何建议必须带依据与数据来源，缺依据不下结论。
        </pre>
      </>}
    </Drawer>
  </>
}

export function BpRoutePage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '关键词', dataIndex: 'keyword', width: 120, render: v => <Tag>{v}</Tag> },
    { title: '对应 BP', dataIndex: 'bp', width: 180 },
    { title: '适用大区', dataIndex: 'region', width: 110, render: v => <Tag color="cyan">{v}</Tag> },
    { title: '优先级', dataIndex: 'priority', width: 84, align: 'right' },
    { title: '启用', dataIndex: 'enabled', width: 74, render: v => <Switch size="small" defaultChecked={v} /> },
  ]
  return <DataTable title="关键词-BP路由" tip="不同问题转给哪个业务伙伴；和通知路由是配套的两套路由"
    columns={cols} rows={DB.bproutes} searchKeys={['keyword', 'bp', 'region']} />
}

export function TemplatePage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 92, render: v => <Text code>{v}</Text> },
    { title: '名称', dataIndex: 'name', width: 160 },
    { title: '场景', dataIndex: 'scene', width: 90, render: v => <Tag color="orange">{v}</Tag> },
    { title: '正文模板', dataIndex: 'body', render: v => <Text type="secondary">{v}</Text> },
    { title: '版本', dataIndex: 'ver', width: 70 },
    { title: '发送量', dataIndex: 'used', width: 90, align: 'right' },
    { title: '最近更新', dataIndex: 'updated', width: 110, render: v => <Text type="secondary">{v}</Text> },
  ]
  return <DataTable title="回复文案" tip="卡片与话术模板；门店端看到的每一张卡都来自这里"
    columns={cols} rows={DB.templates} searchKeys={['name', 'body', 'scene']} scrollX={1120} />
}
