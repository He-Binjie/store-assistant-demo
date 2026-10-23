import React, { useState } from 'react'
import { Table, Input, Space, Typography, Button, Tooltip } from 'antd'
import { ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { t } from '../i18n'

const { Text } = Typography

export default function DataTable({ title, tip, columns, rows, searchKeys = [], extra, toolbar = [], pageSize = 10, scrollX }) {
  const [kw, setKw] = useState('')
  const list = kw ? rows.filter(r => searchKeys.some(k => String(r[k] ?? '').includes(kw))) : rows
  const cols = columns.map(c => ({ ...c, title: typeof c.title === 'string' ? t(c.title) : c.title }))
  return (
    <>
      <Space wrap style={{ marginBottom: 14 }}>
        {searchKeys.length > 0 && (
          <Input.Search placeholder={t('搜索')} allowClear style={{ width: 220 }} onSearch={setKw}
            onChange={e => { if (!e.target.value) setKw('') }} />
        )}
        {toolbar.map((b, i) => React.cloneElement(b, { key: i }))}
        <Button icon={<ReloadOutlined />} onClick={() => setKw('')}>{t('重置')}</Button>
        <Text type="secondary" style={{ fontSize: 12 }}>{t('共')} {list.length} {t('条')}</Text>
        {tip && <Tooltip title={tip}><QuestionCircleOutlined style={{ color: '#bfbfbf' }} /></Tooltip>}
      </Space>
      {extra}
      <Table size="small" rowKey="id" columns={cols} dataSource={list}
        scroll={scrollX ? { x: scrollX } : undefined}
        pagination={{ pageSize, showSizeChanger: true, showTotal: n => `${t('共')} ${n} ${t('条')}` }} />
    </>
  )
}
