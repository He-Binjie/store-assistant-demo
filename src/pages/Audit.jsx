import React, { useState } from 'react'
import { Table, Typography, Space, Select, Button, Input } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useStore } from '../useStore'

const { Text } = Typography

export default function Audit() {
  const s = useStore()
  const [user, setUser] = useState()
  const [kw, setKw] = useState('')
  const list = s.audit.filter(a => (!user || a.user === user) && (!kw || (a.action + a.target + a.store).includes(kw)))
  const cols = [
    { title: '时间', dataIndex: 'at', width: 150, render: v => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: '操作人', dataIndex: 'user', width: 90 },
    { title: t('角色'), dataIndex: 'role', width: 110, render: v => <Text type="secondary">{v}</Text> },
    { title: t('动作'), dataIndex: 'action', width: 160, render: v => t(v) },
    { title: t('对象'), dataIndex: 'target', width: 170, render: v => <Text code style={{ fontSize: 11.5 }}>{v}</Text> },
    { title: t('门店'), dataIndex: 'store', width: 130, render: v => <Text type="secondary">{t(v)}</Text> },
    { title: '来源 IP', dataIndex: 'ip', width: 120, render: v => <Text type="secondary">{v}</Text> },
  ]
  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select placeholder="全部操作人" allowClear style={{ width: 150 }} value={user} onChange={setUser}
          options={[...new Set(s.audit.map(a => a.user))].map(u => ({ value: u, label: u }))} />
        <Input.Search placeholder="动作 / 对象 / 门店" style={{ width: 220 }} allowClear onSearch={setKw} />
        <Button icon={<ReloadOutlined />} onClick={() => { setUser(); setKw('') }}>重置</Button>
        <Text type="secondary" style={{ fontSize: 12 }}>所有写操作留痕，可追溯到人、时间、对象</Text>
      </Space>
      <Table size="small" rowKey="id" columns={cols} dataSource={list}
        pagination={{ pageSize: 15, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} />
    </>
  )
}
