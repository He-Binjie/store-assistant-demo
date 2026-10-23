import React from 'react'
import { Table, Tag, Card, Alert, Typography, Space, Button, message } from 'antd'
import { t } from '../i18n'
import { DB } from '../data/mock'

const { Text } = Typography

export default function Sources() {
  const cols = [
    { title: '数据源', dataIndex: 'name', width: 130, render: (v, r) => <div><b>{v}</b>
      <div style={{ color: '#8c8c8c', fontSize: 11 }}>{r.id}</div></div> },
    { title: '接入方式', dataIndex: 'type', width: 150 },
    { title: '关键字段', dataIndex: 'fields', render: v => <Text type="secondary">{v}</Text> },
    { title: '同步频率', dataIndex: 'sync', width: 110 },
    { title: '最近同步', dataIndex: 'last', width: 150, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: '状态', dataIndex: 'state', width: 110, render: v => <Tag color={v === '正常' ? 'green' : 'orange'}>{v}</Tag> },
  ]
  return (
    <>
      <Card size="small" title={t('数据源与接入')} style={{ marginBottom: 16 }}
        extra={<Space>
          <Text type="secondary" style={{ fontSize: 12 }}>全部只读接入，不改动客户主系统</Text>
          <Button size="small" onClick={() => message.success('已触发全量校验任务，预计 2 分钟')}>{t('校验连接')}</Button>
        </Space>}>
        <Table size="small" rowKey="id" columns={cols} dataSource={DB.sources} pagination={false} />
      </Card>

      <Card size="small" title={t('边界声明')}>
        <Alert type="warning" showIcon
          message="明确不做，划不清这条线，「全链路」会膨胀成假后台"
          description={<div style={{ fontSize: 12.5, lineHeight: 1.9 }}>
            BI 取数 / 图表下钻 · 门店经营看板（营业额、排名、毛利）· 商品 / 供应商 / BOM 主数据维护 ·
            写回客户订单系统 · 万元用量与区域对标 · 报表导出与订阅周报。<br />
            <b>判据：</b>把本平台下线，这个数字还在不在？还在 → 不做（那是客户系统 / 湖仓 / 客户 BI 的活）；随本平台一起消失 → 做。
          </div>} />
      </Card>
    </>
  )
}
