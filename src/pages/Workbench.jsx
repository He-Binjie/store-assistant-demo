import React from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Typography, Space, Alert, Tooltip } from 'antd'
import { t } from '../i18n'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useStore } from '../useStore'
import { ACT, metrics, stayHours, inScope, today, SCOPE_LABEL } from '../store'
import { STATE_TXT, STATE_COLOR, SEV_TXT, SEV_COLOR } from '../consts'

const { Text } = Typography

function Kpi({ title, value, suffix, target, ok, sub, tag }) {
  return (
    <Card size="small" styles={{ body: { padding: '12px 14px' } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</Text>
        {tag && <Tag color={tag === '货' ? 'blue' : 'cyan'} style={{ marginInlineEnd: 0, fontSize: 11 }}>{t(tag === '货' ? '货的切面' : '人的切面')}</Tag>}
      </div>
      <Statistic value={value} suffix={suffix} valueStyle={{ fontSize: 26, fontWeight: 600, color: ok ? undefined : '#cf1322' }} />
      <div style={{ marginTop: 4, fontSize: 12, color: '#8c8c8c' }}>
        {t('目标')} {target}{'　'}{sub}
      </div>
    </Card>
  )
}

export default function Workbench() {
  const s = useStore()
  const m = metrics(s)
  const todo = s.events.filter(e => inScope(e, s.scope) && (e.state === 'hit' || e.state === 'escalated'))
    .sort((a, b) => stayHours(b, s.clockH) - stayHours(a, s.clockH)).slice(0, 10)

  const todoCols = [
    { title: t('事件号'), dataIndex: 'id', width: 142, render: v => <Text code style={{ fontSize: 11.5 }}>{v}</Text> },
    {
      title: '门店', dataIndex: 'storeName', width: 126,
      render: (v, r) => <div>{t(v)}<div style={{ color: '#8c8c8c', fontSize: 11 }}>{t(r.area)} · {t(r.regionName)}</div></div>
    },
    { title: t('类型'), dataIndex: 'type', width: 118, render: v => t(v) },
    { title: t('物料'), dataIndex: 'material', width: 120, render: (v, r) => <div>{t(v)}<div style={{ color: '#8c8c8c', fontSize: 11 }}>{r.sku} · {r.qty}</div></div> },
    { title: t('严重度'), dataIndex: 'severity', width: 62, render: v => <Tag color={SEV_COLOR[v]}>{t(SEV_TXT[v])}</Tag> },
    { title: t('命中时间'), dataIndex: 'hitAt', width: 144, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: t('状态'), dataIndex: 'state', width: 92, render: v => <Tag color={STATE_COLOR[v]}>{t(STATE_TXT[v])}</Tag> },
    { title: t('责任人'), dataIndex: 'owner', width: 96, render: v => <Text type="secondary">{v ? t(v) : '—'}</Text> },
    {
      title: '停留', dataIndex: 'stay', width: 64, align: 'right',
      render: (_, r) => { const h = stayHours(r, s.clockH); return <Text type={h > 8 ? 'danger' : undefined}>{h} h</Text> }
    },
  ]

  const auditCols = [
    { title: t('时间'), dataIndex: 'at', width: 140 },
    { title: t('操作人'), dataIndex: 'user', width: 80 },
    { title: t('执行动作'), dataIndex: 'action' },
    { title: t('对象'), dataIndex: 'target', width: 160, render: v => <Text code style={{ fontSize: 11.5 }}>{v}</Text> },
  ]

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={12} xxl={6}><Kpi title={t('临期处置率')} value={m.expRate} suffix="%" target="85%" ok={m.expRate >= 85}
          sub={`${t('已登记')} ${m.expDone} / ${t('命中')} ${m.expTotal}`} tag="货" /></Col>
        <Col xs={24} sm={12} xl={12} xxl={6}><Kpi title={t('到货差异闭环率')} value={m.difRate} suffix="%" target="85%" ok={m.difRate >= 85}
          sub={`${t('已闭环')} ${m.difClosed} / ${t('上报')} ${m.difTotal}`} tag="货" /></Col>
        <Col xs={24} sm={12} xl={12} xxl={6}><Kpi title={t('预警平均响应')} value={m.resp} suffix="h" target="≤4h" ok={m.resp <= 4}
          sub={t('按首次动作时间计')} tag="人" /></Col>
        <Col xs={24} sm={12} xl={12} xxl={6}><Kpi title={t('督导跟进率')} value={m.followRate} suffix="%" target="80%" ok={m.followRate >= 80}
          sub={`${t('已闭环')} ${m.followDone} / ${t('升级')} ${m.followTotal}`} tag="人" /></Col>
      </Row>

      <Card size="small" title={t('今日待办')} style={{ marginBottom: 16 }}
        extra={<Space size={16}>
          <Text type="secondary" style={{ fontSize: 12 }}>{t('数据范围')}：{SCOPE_LABEL(s.scope)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{t('数据来源')} · {today(s.clockH)}</Text>
        </Space>}>
        <Table size="small" rowKey="id" columns={todoCols} dataSource={todo} scroll={{ x: 1010 }}
          pagination={{ pageSize: 8, size: 'small', showTotal: t => `共 ${t} 条` }}
          onRow={r => ({ style: { cursor: 'pointer' } })} />
      </Card>

      <Row gutter={16}>
        <Col xs={24} xl={24} xxl={14}>
          <Card size="small" title={t('最近操作')} extra={<Text type="secondary" style={{ fontSize: 12 }}>审计留痕，可追溯到人</Text>}>
            <Table size="small" rowKey="id" columns={auditCols} dataSource={s.audit.slice(0, 7)}
              pagination={false} />
          </Card>
        </Col>
        <Col xs={24} xl={24} xxl={10}>
          <Card size="small" title={t('口径与边界')}>
            <Alert
              type="info" showIcon
              message="本平台只出「动作元数据」"
              description={<div style={{ fontSize: 12.5, lineHeight: 1.85 }}>
                临期处置率、到货差异闭环率、督导跟进率、预警响应时长，全部由平台自身事件流自产，
                口径由平台定义，不依赖业务系统口径。<br />
                <b>不出业务事实：</b>库存量、销量、损耗额、营业额、毛利、周转，请至湖仓 BI 查看。
              </div>}
              style={{ marginBottom: 10 }}
            />
            <div style={{ fontSize: 12.5, color: '#8c8c8c', lineHeight: 1.8 }}>
              判据：把本平台下线，这个数字还在不在？还在 → 不做；随本平台一起消失 → 做。
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}
