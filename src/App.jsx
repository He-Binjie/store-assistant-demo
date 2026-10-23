import React, { useEffect, useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Breadcrumb, Button, Tooltip, Tag, Segmented, Space, ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import {
  DashboardOutlined, AlertOutlined, FileTextOutlined, NodeIndexOutlined, ApiOutlined, MessageOutlined,
  SettingOutlined, UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MobileOutlined,
  ShopOutlined, RobotOutlined, ReadOutlined, TagsOutlined, QuestionCircleOutlined, FundOutlined,
  NotificationOutlined, TeamOutlined, ClockCircleOutlined, BugOutlined, UsergroupAddOutlined,
  SafetyCertificateOutlined, FileProtectOutlined, SunOutlined, MoonOutlined, SendOutlined,
  BulbOutlined, SyncOutlined, PartitionOutlined,
} from '@ant-design/icons'
import { ACT, get, reset } from './store'
import { DB } from './data/mock'
import { t, useLang, setLang } from './i18n'
import Workbench from './pages/Workbench'
import Events from './pages/Events'
import Rules from './pages/Rules'
import Routing from './pages/Routing'
import Sources from './pages/Sources'
import AuditPage from './pages/Audit'
import { FaqPage, IntentPage, PromptPage, BpRoutePage, TemplatePage } from './pages/knowledge'
import { ConvsPage, GroupsPage, PushTaskPage, PushLogPage, LogisticsPage } from './pages/ops'
import { UsersPage, RolesPage, SysConfigPage } from './pages/system'
import { OutreachCenter } from './pages/outreach'
import { InsightsPage } from './pages/insights'
import { FlywheelOverview, GapPool } from './pages/flywheel'
import Phone from './phone/Phone'
import AiPanel from './ai/AiPanel'
import { SCEN_GROUPS } from './phone/scenarios'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const TOP = { key: '/supply/workbench', icon: <DashboardOutlined />, label: '工作台' }

const GROUPS = [
  {
    key: 'outreach', icon: <NotificationOutlined />, label: '触达',
    children: [
      { key: '/outreach/center', icon: <SendOutlined />, label: '触达中心' },
      { key: '/outreach/rules', icon: <FileTextOutlined />, label: '规则中心' },
      { key: '/outreach/routing', icon: <NodeIndexOutlined />, label: '通知路由' },
      { key: '/outreach/push', icon: <ClockCircleOutlined />, label: '推送任务' },
      { key: '/outreach/pushlog', icon: <FileTextOutlined />, label: '推送日志' },
      { key: '/outreach/tpl', icon: <FileProtectOutlined />, label: '回复文案' },
    ],
  },
  {
    key: 'insight', icon: <FundOutlined />, label: '洞察',
    children: [
      { key: '/insight/board', icon: <BulbOutlined />, label: '洞察工作台' },
      { key: '/insight/conv', icon: <MessageOutlined />, label: '会话记录' },
      { key: '/insight/group', icon: <TeamOutlined />, label: '群聊管理' },
    ],
  },
  {
    key: 'flywheel', icon: <SyncOutlined />, label: 'FAQ 飞轮',
    children: [
      { key: '/fly/overview', icon: <SyncOutlined />, label: '飞轮概览' },
      { key: '/fly/faq', icon: <QuestionCircleOutlined />, label: 'FAQ 知识库' },
      { key: '/fly/gap', icon: <AlertOutlined />, label: '知识缺口池' },
    ],
  },
  {
    key: 'agent', icon: <RobotOutlined />, label: 'Agent 配置',
    children: [
      { key: '/agent/prompt', icon: <FileTextOutlined />, label: '提示词管理' },
      { key: '/agent/intent', icon: <TagsOutlined />, label: '意图关键词' },
      { key: '/agent/bp', icon: <PartitionOutlined />, label: '关键词-BP路由' },
    ],
  },
  {
    key: 'iam', icon: <SafetyCertificateOutlined />, label: '身份与权限',
    children: [
      { key: '/iam/user', icon: <UsergroupAddOutlined />, label: '用户管理' },
      { key: '/iam/role', icon: <SafetyCertificateOutlined />, label: '角色管理' },
      { key: '/iam/audit', icon: <FileTextOutlined />, label: '审计日志' },
      { key: '/iam/source', icon: <ApiOutlined />, label: '数据源接入' },
      { key: '/iam/config', icon: <SettingOutlined />, label: '系统配置' },
    ],
  },
]

const PAGES = {
  '/supply/workbench': [Workbench, ['工作台']],
  '/outreach/center': [OutreachCenter, ['触达', '触达中心']],
  '/outreach/rules': [Rules, ['触达', '规则中心']],
  '/outreach/routing': [Routing, ['触达', '通知路由']],
  '/outreach/push': [PushTaskPage, ['触达', '推送任务']],
  '/outreach/pushlog': [PushLogPage, ['触达', '推送日志']],
  '/outreach/tpl': [TemplatePage, ['触达', '回复文案']],
  '/insight/board': [InsightsPage, ['洞察', '洞察工作台']],
  '/insight/conv': [ConvsPage, ['洞察', '会话记录']],
  '/insight/group': [GroupsPage, ['洞察', '群聊管理']],
  '/fly/overview': [FlywheelOverview, ['FAQ 飞轮', '飞轮概览']],
  '/fly/faq': [FaqPage, ['FAQ 飞轮', 'FAQ 知识库']],
  '/fly/gap': [GapPool, ['FAQ 飞轮', '知识缺口池']],
  '/agent/prompt': [PromptPage, ['Agent 配置', '提示词管理']],
  '/agent/intent': [IntentPage, ['Agent 配置', '意图关键词']],
  '/agent/bp': [BpRoutePage, ['Agent 配置', '关键词-BP路由']],
  '/iam/user': [UsersPage, ['身份与权限', '用户管理']],
  '/iam/role': [RolesPage, ['身份与权限', '角色管理']],
  '/iam/audit': [AuditPage, ['身份与权限', '审计日志']],
  '/iam/source': [Sources, ['身份与权限', '数据源接入']],
  '/iam/config': [SysConfigPage, ['身份与权限', '系统配置']],
}

function ClockBar() {
  const [tm, setTm] = useState(get().clockH)
  useEffect(() => {
    const id = setInterval(() => setTm(get().clockH), 300)
    const k = e => { if (e.key === ']') ACT.advance(1); if (e.key === '[') reset() }
    window.addEventListener('keydown', k)
    return () => { clearInterval(id); window.removeEventListener('keydown', k) }
  }, [])
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Tag color="blue" style={{ marginInlineEnd: 0 }}>{t('演示时钟')} T+{tm}h</Tag>
      <Button size="small" onClick={() => ACT.advance(1)}>+1h</Button>
      <Button size="small" onClick={() => ACT.advance(4)}>+4h</Button>
      <Button size="small" onClick={() => reset()}>{t('重置')}</Button>
    </span>
  )
}

export default function App() {
  const lang = useLang()
  const [mode, setMode] = useState(() => localStorage.getItem('ssd_theme_v2') || 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = mode
    localStorage.setItem('ssd_theme_v2', mode)
  }, [mode])
  const [collapsed, setCollapsed] = useState(false)
  const [aiOpen, setAiOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1560 : true))
  const [preview, setPreview] = useState(true)
  const [scenOpen, setScenOpen] = useState(true)
  const [key, setKey] = useState('/supply/workbench')
  const [Page, crumb] = PAGES[key] || PAGES['/supply/workbench']

  useEffect(() => {
    document.documentElement.style.setProperty('--pv-offset', preview ? '430px' : '0px')
  }, [preview])

  const leftOffset = (collapsed ? 80 : 208) + (aiOpen ? 312 : 0)

  const userMenu = {
    items: [
      { key: 'u', icon: <UserOutlined />, label: lang === 'en' ? 'Wang Min · Store Inventory' : '王敏 · 门店进销存' },
      { key: 'l', label: <Segmented size="small" value={lang} onChange={v => setLang(v)}
        options={[{ value: 'zh', label: '中' }, { value: 'en', label: 'EN' }]} /> },
      { type: 'divider' },
      { key: 'out', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
  }

  const themeCfg = {
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: mode === 'dark' ? '#22d3ee' : '#3b6ef5',
      borderRadius: 6,
      ...(mode === 'dark' ? {
        colorBgBase: '#070b12', colorBgContainer: '#0d131c', colorBgElevated: '#111a24',
        colorBorder: 'rgba(34,211,238,.18)', colorBorderSecondary: 'rgba(34,211,238,.12)',
        colorText: '#dbe7f3', colorTextSecondary: '#8ea3b8',
      } : {}),
    },
  }
  return (
    <ConfigProvider locale={lang === 'en' ? enUS : zhCN} theme={themeCfg}>
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light"
        style={{ borderRight: '1px solid #f0f0f0', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 30, overflow: 'auto' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Text strong style={{ fontSize: collapsed ? 13 : 15 }}>
            {collapsed ? '沐野' : (lang === 'en' ? 'Store Assistant Admin' : '门店助手管理平台')}
          </Text>
        </div>
        <Menu mode="inline" selectedKeys={[key]}
          defaultOpenKeys={['outreach', 'insight', 'flywheel', 'agent', 'iam']}
          items={[
            { ...TOP, label: t(TOP.label) },
            ...GROUPS.map(g => ({ ...g, label: t(g.label), children: g.children.map(c => ({ ...c, label: t(c.label) })) })),
          ]}
          onClick={({ key: k }) => setKey(k)} style={{ borderInlineEnd: 'none' }} />
      </Sider>

      {aiOpen && (
        <div className="ai-dock" style={{ left: collapsed ? 80 : 208, width: 312 }}>
          <AiPanel onClose={() => setAiOpen(false)} />
        </div>
      )}

      <Layout style={{ marginLeft: leftOffset, marginRight: preview ? 416 : 0, transition: 'margin .2s' }}>
        <Header style={{ padding: '0 18px', background: '#fff', display: 'flex', alignItems: 'center',
          gap: 12, borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ cursor: 'pointer', fontSize: 17 }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Breadcrumb items={crumb.map(x => ({ title: t(x) }))} />
          <div style={{ flex: 1 }} />
          <Tooltip title={mode === 'dark' ? t('亮色') : t('深色')}>
            <Button icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
          </Tooltip>
          {!aiOpen && <Button icon={<RobotOutlined />} onClick={() => setAiOpen(true)}>{t('AI 助手')}</Button>}
          <Tooltip title={t('门店端预览')}>
            <Button icon={<MobileOutlined />} type={preview ? 'primary' : 'default'} ghost={preview}
              onClick={() => setPreview(!preview)}>{t('门店端')}</Button>
          </Tooltip>
          <Dropdown menu={userMenu}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#1677ff' }} icon={<UserOutlined />} size={28} />
              <Text>{lang === 'en' ? 'Wang Min' : '王敏'}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{lang === 'en' ? 'Store Inventory' : '门店进销存'}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 18, padding: 18, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          <Page />
        </Content>
      </Layout>

      {preview && (
        <div className="preview-panel">
          <div className="preview-head">
            <MobileOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ fontSize: 13 }}>{t('门店端预览')}</Text>
            <Text type="secondary" style={{ fontSize: 11 }} ellipsis>{t('星汇里店')} · SH2014</Text>
            <div style={{ flex: 1 }} />
            <Button size="small" type="text" onClick={() => setScenOpen(!scenOpen)}>
              {scenOpen ? (lang === 'en' ? 'Hide scenarios' : '收起场景') : (lang === 'en' ? 'Scenarios' : '演示场景')}
            </Button>
            <Button size="small" type="text" onClick={() => setPreview(false)}>{t('收起')}</Button>
          </div>
          <div className="preview-clock"><ClockBar /></div>
          <div className="preview-body">
            <div className="preview-phone"><Phone /></div>
            {scenOpen && <div className="scen">
              {SCEN_GROUPS.map(g => (
                <div key={g.code} className="scen-grp">
                  <div className="scen-head">
                    <span className={'scen-dot ' + g.tone} />
                    <b>{g.name}</b>
                    <span className="scen-hint">{g.hint}</span>
                  </div>
                  <div className="scen-items">
                    {g.items.map(it => (
                      <button key={it.id} className={'scen-btn ' + g.tone} onClick={() => ACT.phoneInject(it.msgs)}>
                        {Array.isArray(it.label) ? (lang === 'en' ? it.label[1] : it.label[0]) : it.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>}
          </div>
        </div>
      )}
    </Layout>
    </ConfigProvider>
  )
}
