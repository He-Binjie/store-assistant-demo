// 演示场景库：原封不动保留 smart-cs-demo 的私聊/群聊场景，另加本次新增的供应链场景
export const SCEN_GROUPS = [
  {
    code: 'supply', name: '供应链入口', hint: '本次新增：订货 / 到货 / 库存 / 效期 / 用量', tone: 'cyan',
    items: [
      { id: 's-daily', label: ['早间健康日报','Morning brief'], msgs: [{ kind: 'card', card: 'daily' }] },
      { id: 's-order', label: ['订货建议（改量）','Order suggestion'], msgs: [{ kind: 'card', card: 'order' }] },
      { id: 's-arrive', label: ['到货提醒 + 验收','Arrival + receiving'], msgs: [{ kind: 'card', card: 'arrive' }] },
      { id: 's-diff', label: ['到货差异上报','Report variance'], msgs: [{ kind: 'card', card: 'diff' }] },
      { id: 's-expiry', label: ['临期预警 + 处置','Expiry + action'], msgs: [{ kind: 'card', card: 'expiry' }] },
      { id: 's-stock', label: ['库存快照问询','Stock snapshot'], msgs: [{ kind: 'user', text: '我还有多少鲜奶和燕麦奶' }, { kind: 'card', card: 'stock' }] },
      { id: 's-usage', label: ['万元用量（异常）','Usage per ¥10k'], msgs: [{ kind: 'user', text: '我这周燕麦奶用量正常吗' }, { kind: 'card', card: 'usage' }] },
      { id: 's-weekly', label: ['本周执行摘要','Weekly summary'], msgs: [{ kind: 'card', card: 'weekly' }] },
      { id: 's-health', label: ['库存健康档位','Inventory health'], msgs: [{ kind: 'user', text: '我店库存健康吗' }, { kind: 'card', card: 'health' }] },
    ],
  },
  {
    code: 'group', name: '群聊入口', hint: '@机器人 → 引导卡片 → 点击跳转私聊', tone: 'amber',
    items: [
      { id: 'g-logistics', label: ['🚚 群里问物流','🚚 Logistics in group'], msgs: [{ kind: 'sys', text: '星汇里店 · 到货差异处理群' }, { kind: 'user', text: '今天的货什么时候到 司机电话多少' }, { kind: 'card', card: 'logistics' }] },
      { id: 'g-orders', label: ['📦 群里查订单','📦 Orders in group'], msgs: [{ kind: 'sys', text: '星汇里店 · 到货差异处理群' }, { kind: 'user', text: '查一下我的订单' }, { kind: 'card', card: 'order-list' }] },
      { id: 'g-faq', label: ['❓ 群里问FAQ','❓ FAQ in group'], msgs: [{ kind: 'sys', text: '星汇里店 · 到货差异处理群' }, { kind: 'user', text: '下午四点以后下单今天能到吗' }, { kind: 'card', card: 'faq', idx: 0 }] },
      { id: 'g-transfer', label: ['👤 群里要转人工','👤 Transfer in group'], msgs: [{ kind: 'sys', text: '星汇里店 · 到货差异处理群' }, { kind: 'user', text: '这个问题你解决不了，帮我找个人处理' }, { kind: 'card', card: 'transfer' }] },
    ],
  },
  {
    code: 'private', name: '私聊入口', hint: '直接发送 → 机器人即时回复', tone: 'blue',
    items: [
      { id: 'p-logistics', label: ['🚚 货到哪了','🚚 Where is my delivery'], msgs: [{ kind: 'user', text: '今天的货什么时候到 司机电话多少' }, { kind: 'card', card: 'logistics' }] },
      { id: 'p-order-multi', label: ['📦 查订单（多店）','📦 Orders (multi-store)'], msgs: [{ kind: 'user', text: '查一下我的订单' }, { kind: 'card', card: 'store-select' }] },
      { id: 'p-order-single', label: ['📦 查订单（单店）','📦 Orders (single store)'], msgs: [{ kind: 'user', text: '查一下我的订单' }, { kind: 'card', card: 'order-list' }] },
      { id: 'p-order-nonmgr', label: ['🔎 查订单（非店长→直跳H5）','🔎 Orders (non-manager → H5)'], msgs: [{ kind: 'user', text: '帮我看下这几个门店的订单' }, { kind: 'card', card: 'redirect-h5' }] },
      { id: 'p-logistics-nonmgr', label: ['🚚 查物流（非店长→锁定已发货）','🚚 Logistics (locked to shipped)'], msgs: [{ kind: 'user', text: '查物流' }, { kind: 'card', card: 'logistics' }] },
      { id: 'p-faq', label: ['❓ 问FAQ','❓ Ask FAQ'], msgs: [{ kind: 'user', text: '下午四点以后下单今天能到吗' }, { kind: 'card', card: 'faq', idx: 0 }] },
      { id: 'p-faq-miss', label: ['🤷 FAQ未命中','🤷 FAQ miss'], msgs: [{ kind: 'user', text: '你们公司年会什么时候开' }, { kind: 'card', card: 'faq-miss' }] },
      { id: 'p-chitchat', label: ['👋 闲聊','👋 Chit-chat'], msgs: [{ kind: 'user', text: '你好' }, { kind: 'bubble', text: '你好，我是星汇里店的供应链小助。可以帮你查订单、看物流、处理临期和到货差异。' }] },
      { id: 'p-transfer-1', label: ['👤 转人工（一人一店）','👤 Transfer (1 store)'], msgs: [{ kind: 'user', text: '转人工' }, { kind: 'card', card: 'transfer' }] },
      { id: 'p-transfer-n', label: ['👤 转人工（一人多店）','👤 Transfer (multi-store)'], msgs: [{ kind: 'user', text: '转人工' }, { kind: 'card', card: 'transfer', multi: true }] },
      { id: 'p-complaint-1', label: ['📝 投诉（一人一店）','📝 Complaint (1 store)'], msgs: [{ kind: 'user', text: '我要投诉' }, { kind: 'card', card: 'complaint' }] },
      { id: 'p-complaint-n', label: ['📝 投诉（一人多店）','📝 Complaint (multi-store)'], msgs: [{ kind: 'user', text: '我要投诉' }, { kind: 'card', card: 'complaint', multi: true }] },
      { id: 'p-ticket', label: ['🎫 转工单','🎫 Ticket'], msgs: [{ kind: 'user', text: '帮我提交工单' }, { kind: 'card', card: 'workorder' }] },
    ],
  },
]
