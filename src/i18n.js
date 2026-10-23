import { useEffect, useState } from 'react'

const EN = {
  // 品牌 / 门店
  '沐野茶事': 'Muye Tea', '店': ' Store',
  '云栖里':'Cloudrest','星汇里':'Star Meet','星汇里':'Star Meet','拾光里':'Gleam','听风广场':'Windlist','青柠广场':'Lime Plaza',
  '汇金里':'Goldgate','锦鲤广场':'Koi Plaza','风铃广场':'Bell Plaza','沐光里':'Dawnlight','拾贝广场':'Shell Plaza',
  '初雪里':'First Snow','木棉广场':'Kapok Plaza','流云里':'Driftcloud','叠翠广场':'Verdant Plaza',
  '清欢里':'Pure Joy','长夏广场':'Long Summer',
  // 组织
  '华东':'East China','华南':'South China','华北':'North China',
  '沪北':'Shanghai North','沪南':'Shanghai South','苏南':'Jiangsu South',
  '粤东':'Guangdong East','粤西':'Guangdong West','京津':'Beijing-Tianjin','冀中':'Hebei Central',
  '大区':'Region','全部门店':'All stores',
  // 物料
  '仓储':'Warehouse','鲜奶':'Fresh Milk','燕麦奶':'Oat Milk','厚椰乳':'Coconut Milk','茉莉茶底':'Jasmine Tea Base',
  '四季春茶底':'Four Seasons Tea Base','芋泥':'Taro Paste','蛋糕酱':'Cake Sauce','珍珠':'Tapioca',
  '杯盖（大）':'Lid (L)','杯身（大）':'Cup (L)','吸管':'Straw','外箱贴':'Carton Label','箱':'ctn','包':'pack','袋':'bag','件':'pcs','卷':'roll',
  // 事件类型 / 状态
  '临期预警':'Expiry Alert','到货差异':'Delivery Variance','断货预警':'Stockout Alert',
  '订货建议偏离':'Order Deviation','温控异常':'Temperature Alert','盘点差异':'Stocktake Variance',
  '待处置':'Pending','已通知':'Notified','已登记':'Logged','已升级督导':'Escalated','已闭环':'Closed',
  // 导航
  '门店供应链':'Store Supply','触达':'Outreach','洞察':'Insights','FAQ 飞轮':'FAQ Flywheel','Agent 配置':'Agent Config','身份与权限':'IAM',
  '触达中心':'Outreach Center','通知路由':'Event Routing','洞察工作台':'Insights Board','飞轮概览':'Flywheel Overview','知识缺口池':'Gap Pool','助手运营':'Assistant Ops','亮色':'Light mode','深色':'Dark mode','预览门店':'Preview store','催办':'Nudge','本店未纳入灰度，暂不强制':'Pilot doesn’t cover this store','门店助手管理平台':'Store Assistant Admin','供应链管控':'Supply Control','知识与应答':'Knowledge & Reply',
  '服务运营':'Service Ops','系统配置':'System','工作台':'Workbench','事件与处置':'Events',
  '规则中心':'Rules','组织与通知路由':'Org & Routing','数据源接入':'Data Sources','审计日志':'Audit Log',
  '提示词管理':'Prompts','意图关键词':'Intent Keywords','FAQ知识库':'FAQ Base','关键词-BP路由':'Keyword→BP Routing',
  '回复文案':'Reply Templates','会话记录':'Conversations','群聊管理':'Chat Groups','推送任务':'Scheduled Pushes',
  '推送日志':'Push Logs','物流排障':'Logistics Triage','用户管理':'Users','角色管理':'Roles',
  // 通用
  '门店供应链协同平台':'Store Supply Platform','门店端预览':'Store App Preview','飞书 IM · 店长视角':'Feishu IM · Store Manager',
  '收起':'Collapse','展开':'Expand','门店端':'Store App','搜索':'Search','重置':'Reset','详情':'Detail',
  '发布':'Publish','停用':'Disable','启用':'Enable','新建规则':'New Rule','导出':'Export','操作':'Actions',
  '状态':'Status','门店':'Store','类型':'Type','物料':'Material','严重度':'Severity','命中时间':'Triggered',
  '责任人':'Owner','停留':'Aging','事件号':'Event ID','数据来源':'Source','数据范围':'Data scope','保存':'Save',
  '共':'Total','条':'items','日期':'Date','版本':'Version','负责人':'Owner','规则号':'Rule ID','生效范围':'Scope',
  '命中':'Hits','最近更新':'Updated','执行动作':'Action','触发条件':'Trigger','名称':'Name','优先级':'Priority',
  // 指标
  '临期处置率':'Expiry Handling Rate','到货差异闭环率':'Variance Closure Rate',
  '预警平均响应':'Avg. Alert Response','督导跟进率':'Supervisor Follow-up Rate',
  '货的切面':'Goods view','人的切面':'People view','目标':'Target','今日待办':'Today’s Queue','最近操作':'Recent Activity',
  '口径与边界':'Metric Scope & Boundary',


  // ---- 角色 / 人名 ----
  '门店进销存':'Store Inventory','品牌供应链':'Brand Supply Chain','供应链计划':'Supply Planning',
  '供应链运营':'Supply Ops','仓配专员':'Warehouse BP','质量组':'QA','系统':'System','店长':'Manager','督导':'Supervisor',
  '林晓':'Lin Xiao','周雯':'Zhou Wen','吴杭':'Wu Hang','赵宁':'Zhao Ning','许铭':'Xu Ming','郑樱':'Zheng Ying',
  '陈嘉':'Chen Jia','顾然':'Gu Ran','陈立':'Chen Li','唐婧':'Tang Jing','何昱':'He Yu','苏晴':'Su Qing','范宇':'Fan Yu',
  '王敏':'Wang Min','刘晓':'Liu Xiao','李工':'Li','周工':'Zhou',
  // ---- 事件动作 ----
  '登记处置动作':'Log an action','发布规则':'Publish rule','修改生效范围':'Change scope','采纳 AI 推荐路由':'Adopt AI routing',
  '停用规则':'Disable rule','关闭事件':'Close event','导出事件列表':'Export events','升级督导':'Escalate to supervisor',
  '催办责任人':'Nudge owner','上报到货差异':'Report variance','修改通知路由':'Edit routing','切换规则状态':'Toggle rule',
  '已生成草稿':'Drafted','待补知识':'To fill','已解决':'Resolved','已转人工':'Escalated to human',
  // ---- 来源 ----
  '仓储 WMS · 湖仓':'WMS · Lakehouse','3PL · 仓储 WMS':'3PL · WMS','POS · 湖仓':'POS · Lakehouse',
  '门店盘点':'Store stocktake','3PL 温控':'3PL temp control','订货系统':'Ordering system','湖仓':'Lakehouse',
  // ---- 规则/范围 ----
  '灰度 20 店':'Pilot 20 stores','灰度 8 店':'Pilot 8 stores','全部门店':'All stores','草稿':'Draft',
  '已生效':'Active','灰度中':'Piloting','已停用':'Disabled','已闭环':'Closed','已登记':'Logged','未登记':'Not logged',
  // ---- 表头/常用 ----
  '触发条件':'Trigger','执行动作':'Action','生效范围':'Scope','规则号':'Rule ID','版本':'Version','命中':'Hits',
  '最近更新':'Updated','状态':'Status','启用':'Enabled','停用':'Disabled','类型':'Type','角色':'Role','操作':'Actions',
  '时间':'Time','对象':'Target','动作':'Action','操作人':'Actor','门店':'Store','物料':'Material','严重度':'Severity',
  '命中时间':'Triggered','责任人':'Owner','停留':'Aging','事件号':'Event ID','数据来源':'Source',
  // 手机端
  '早间健康日报':'Morning Brief','订货建议 · 每周':'Order Suggestion · Weekly','到货提醒 · 仓已发货':'Delivery Notice · Shipped',
  '验收异常 · 差异上报':'Receiving Exception · Report Variance','临期预警 · T-2':'Expiry Alert · T-2',
  '今日待办':'Today’s Queue','燕麦奶 · 临期':'Oat Milk · Expiring','鲜奶 · 在途':'Fresh Milk · In transit',
  '延迟 40 分钟':'40 min delayed','建议':'Suggested','依据':'Basis','订货量':'Order qty','已提交':'Submitted',
  '预计到达':'ETA','品项':'Items','司机':'Driver','实收':'Received','差异':'Variance','少':'Short',
  '口径':'Definition','规则':'Rule','总部尚未发布该规则':'Rule not published yet',
  '提交订货':'Submit order','用建议量':'Use suggestion','确认收货':'Confirm receiving','已确认收货':'Received',
  '一键上报差异':'Report variance','拍照留证':'Attach photo','已上报':'Reported','调拨邻店':'Transfer to nearby',
  '促销消化':'Promotion','报损登记':'Write-off','已登记':'Logged','来源':'Source','更新':'updated',
  '输入消息…':'Type a message…','企业应用 · 在线':'Enterprise app · Online',
  // 表单 / 页面文案
  '平台名称':'Platform name','默认数据范围':'Default data scope','事件超时提醒':'Event timeout reminder',
  '允许写回客户订单系统':'Allow writing back to customer order system','保存':'Save',
  '平台只读接入，该项固定关闭':'Read-only integration — this option is locked',
  '运单号':'Tracking no.','承运':'Carrier','查询':'Query','查询结果':'Result','门店管理':'Stores',
  '任务名称':'Task name','调度':'Schedule','范围':'Scope','通道':'Channel','最近执行':'Last run',
  '群名称':'Group name','群主':'Owner','成员':'Members','建立时间':'Created','提问人':'Asked by',
  '问题':'Question','助手处理':'Handled by assistant','意图':'Intent','结果':'Result','时间':'Time',
  '正文模板':'Template body','发送量':'Sent','分类':'Category','答案摘要':'Answer','账号':'Account',
  '认证方式':'Auth','权限范围':'Scope','权限项':'Permissions','成员数':'Members','场景':'Scenario',
  '关键词':'Keyword','对应 BP':'BP owner','适用大区':'Region','命中':'Hits','启用':'Enabled',
  '新建 FAQ':'New FAQ','新建提示词':'New prompt','新建推送':'New push','新建用户':'New user',
  '配置权限':'Permissions','查看':'View','复制':'Duplicate','编辑':'Edit','删除':'Delete','主人':'Owner',
  // AI 面板
  'AI 助手':'AI Assistant','问点问题，或让我办件事':'Ask, or tell me to do something',
  '今天哪几家店临期没处置？':'Which stores have unhandled expiry today?',
  '华东大区执行率怎么样':'How is East China performing?',
  '把临期规则扩到全部门店':'Expand the expiry rule to all stores',
  '这个指标怎么算的':'How is this metric calculated?',
  '发送':'Send','我能做什么':'What I can do',
}

let lang = 'zh'
const subs = new Set()
export function getLang() { return lang }
export function setLang(l) { lang = l; subs.forEach(f => f(l)) }
export function useLang() {
  const [l, set] = useState(lang)
  useEffect(() => { subs.add(set); return () => subs.delete(set) }, [])
  return l
}
export function t(s) {
  if (lang !== 'en' || !s) return s
  if (EN[s]) return EN[s]
  // "A · B" 组合：分别翻译
  if (typeof s === 'string' && s.includes(' · ')) {
    const parts = s.split(' · ')
    if (parts.every(p => EN[p] || /^[A-Za-z0-9 .%*]+$/.test(p))) {
      return parts.map(p => EN[p] || p).join(' · ')
    }
  }
  // 门店名：XX里店
  if (s.endsWith('店')) {
    const base = s.slice(0, -1)
    if (EN[base]) return EN[base] + ' Store'
  }
  return s
}
