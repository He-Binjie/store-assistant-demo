import React, { useState } from 'react'
import { Row, Col, Card, Tree, Table, Select, Button, Space, Tag, Alert, Typography, message } from 'antd'
import { t } from '../i18n'
import { useStore } from '../useStore'
import { ACT } from '../store'
import { DB } from '../data/mock'

const { Text } = Typography
const OWNERS = ['督导（辖区）', '仓配专员', '供应链值班', '供应链计划', '供应链质量', '区域运营（周度汇总）']

function treeData() {
  return DB.areas.map(a => ({
    title: `${a.name}大区`, key: `A-${a.name}`,
    children: a.regions.map(rn => {
      const reg = DB.regions.find(x => x.name === rn && x.area === a.name)
      const sts = DB.stores.filter(x => x.regionId === reg.id)
      return {
        title: `${rn}（${sts.length} 店）`, key: reg.id,
        children: sts.map(st => ({ title: `${st.name} · ${st.code} · 督导 ${st.supervisor}`, key: st.id, isLeaf: true })),
      }
    }),
  }))
}

export default function Routing() {
  const s = useStore()
  const [edit, setEdit] = useState(false)

  const cols = [
    { title: t('事件'), dataIndex: 'ev', width: 190 },
    {
      title: '主责', dataIndex: 'to', render: (v, r, i) => edit
        ? <Select size="small" defaultValue={v} style={{ width: 168 }} options={OWNERS.map(o => ({ value: o, label: o }))}
            onChange={val => { ACT.setRoute(i, val); message.success(`路由已更新：${r.ev} → ${val}`) }} />
        : v
    },
    { title: t('抄送 / 兜底'), dataIndex: 'cc', render: v => <Text type="secondary">{v}</Text> },
    { title: t('状态'), dataIndex: 'on', width: 80, render: v => <Tag color={v ? 'green' : 'default'}>{v ? t('启用') : t('停用')}</Tag> },
  ]

  return (
    <Row gutter={16}>
      <Col span={9}>
        <Card size="small" title={t('组织与数据范围')}
          extra={<Text type="secondary" style={{ fontSize: 12 }}>按角色裁剪</Text>}>
          <Tree treeData={treeData()} defaultExpandAll selectable={false} style={{ fontSize: 12.5 }} />
        </Card>
      </Col>
      <Col span={15}>
        <Card size="small" title={t('通知路由')} style={{ marginBottom: 16 }}
          extra={<Space>
            <Text type="secondary" style={{ fontSize: 12 }}>决定「事件推给谁、超时找谁兜底」</Text>
            <Button size="small" onClick={() => { setEdit(!edit); message.info(edit ? '已退出编辑' : '已进入手工编辑，可直接改主责人') }}>
              {edit ? '完成' : '手工调整'}
            </Button>
          </Space>}>
          <Table size="small" rowKey="ev" columns={cols} dataSource={s.route.list} pagination={false} />
        </Card>

        <Card size="small" title={t('AI 推荐路由')}
          extra={<Text type="secondary" style={{ fontSize: 12 }}>依据近 30 天事件处理人分布 + 事件类型</Text>}>
          <Alert type="success" showIcon style={{ marginBottom: 12 }}
            message="基于历史处理数据生成的初版路由建议"
            description={<div style={{ fontSize: 12.5, lineHeight: 1.9 }}>
              · 临期预警 · 未登记 → <b>督导（辖区）</b> 主责，供应链值班 抄送（历史 62% 由督导闭环）<br />
              · 到货差异 → <b>仓配专员</b> 主责，督导 超时兜底（平均 1.4h 完成）<br />
              · 断货预警 → <b>督导（辖区）</b> 主责，供应链计划 抄送<br />
              · 订货建议偏离 → <b>区域运营（周度汇总）</b>，不即时推送（频次保护）<br />
              · 温控异常 → <b>供应链质量</b> 主责，督导 抄送
            </div>} />
          <Space>
            <Button type="primary" disabled={s.route.adopted}
              onClick={() => { ACT.adoptRoute(); message.success('已采纳 AI 推荐路由，5 条规则已更新') }}>
              {s.route.adopted ? '已采纳' : '采纳建议'}
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>采纳后可继续手工修改，AI 只给初版</Text>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}
