import React from 'react'
import { Tag, Typography, Button, Space, message, Card, Form, Input, Select, Switch } from 'antd'
import { t } from '../i18n'
import DataTable from './DataTable'
import { DB } from '../data/mock'

const { Text } = Typography

export function UsersPage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 80, render: v => <Text code>{v}</Text> },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '账号', dataIndex: 'account', width: 120, render: v => <Text type="secondary">{v}</Text> },
    { title: '角色', dataIndex: 'role', width: 120, render: v => <Tag color="blue">{v}</Tag> },
    { title: '数据范围', dataIndex: 'scope', width: 120 },
    { title: '认证方式', dataIndex: 'auth', width: 100, render: v => <Tag color={v === '双模' ? 'purple' : 'green'}>{v}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color="green">{v}</Tag> },
    { title: '操作', width: 150, render: () => <Space size={4}>
      <Button size="small" type="link" onClick={() => message.success('已打开编辑（演示）')}>编辑</Button>
      <Button size="small" type="link" danger onClick={() => message.warning('演示环境不做删除')}>删除</Button></Space> },
  ]
  return <DataTable title="用户管理" tip="谁能进控制台、看哪些门店的数据"
    columns={cols} rows={DB.users} searchKeys={['name', 'account', 'role']}
    toolbar={[<Button key="1" type="primary" onClick={() => message.success('已新建用户（演示）')}>{t('新建用户')}</Button>]} scrollX={1000} />
}

export function RolesPage() {
  const cols = [
    { title: 'ID', dataIndex: 'id', width: 90, render: v => <Text code>{v}</Text> },
    { title: '角色', dataIndex: 'name', width: 150, render: v => <Tag color="geekblue">{v}</Tag> },
    { title: '权限范围', dataIndex: 'desc' },
    { title: '权限项', dataIndex: 'perms', width: 90, align: 'right' },
    { title: '成员数', dataIndex: 'users', width: 90, align: 'right' },
    { title: '操作', width: 120, render: () => <Button size="small" type="link" onClick={() => message.success('已打开权限配置')}>{t('配置权限')}</Button> },
  ]
  return <DataTable title="角色管理" tip="角色决定能看到哪些页面、哪些门店、能不能配置规则"
    columns={cols} rows={DB.roles} searchKeys={['name', 'desc']} />
}

export function SysConfigPage() {
  return (
    <Card size="small" title="系统配置">
      <Form layout="vertical" style={{ maxWidth: 620 }} size="small">
        <Form.Item label={t('平台名称')}><Input defaultValue="沐野茶事 · 门店供应链协同平台" /></Form.Item>
        <Form.Item label={t('默认数据范围')}><Select defaultValue="all"
          options={[{ value: 'all', label: '全部门店' }, { value: 'region', label: '按大区' }]} /></Form.Item>
        <Form.Item label={t('事件超时提醒')}><Select defaultValue="4" options={[
          { value: '2', label: '2 小时' }, { value: '4', label: '4 小时' }, { value: '8', label: '8 小时' }]} /></Form.Item>
        <Form.Item label={t('允许写回客户订单系统')}>
          <Switch defaultChecked={false} disabled />
          <Text type="secondary" style={{ marginLeft: 10, fontSize: 12 }}>平台只读接入，该项固定关闭</Text>
        </Form.Item>
        <Button type="primary" onClick={() => message.success('配置已保存')}>{t('保存')}</Button>
      </Form>
    </Card>
  )
}
