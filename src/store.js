import { DB } from './data/mock'

const LS = 'ssd_v2'
const CH = 'ssd_sync'

/* ---------------- 初始状态 ---------------- */
function seed() {
  const events = DB.events.map(e => ({ ...e }))
  const rules = DB.rules.map(r => ({ ...r }))
  // R-001 初始为灰度中且不含预览门店：门店端会显示“本店未纳入灰度”，
  // 演示第一步“发布规则”后门店端才真正生效——这是全案核心联动，必须是真的。
  const r1 = rules.find(r => r.id === 'R-001')
  if (r1) { r1.state = '灰度中'; r1.scope = '灰度 20 店（不含星汇里店）' }
  // 焦点事件：让“今天这一刻”从命中态开始，便于现场演一遍完整链路
  const focus = events.find(e => e.isFocus)
  if (focus) { focus.state = 'hit'; focus.notifiedAt = focus.hitAt; focus.actedAt = null; focus.escalatedAt = null; focus.closedAt = null; focus.action = null; focus.owner = null; focus.respH = null }
  return {
    v: 1,
    clockH: 0,
    events,
    rules,
    audit: DB.audit.map(a => ({ ...a })),
    route: {
      adopted: false,
      list: [
        { ev: '临期预警 · 未登记', to: '督导（辖区）', cc: '供应链值班', on: true },
        { ev: '到货差异', to: '仓配专员', cc: '督导（超时兜底）', on: true },
        { ev: '断货预警', to: '督导（辖区）', cc: '供应链计划', on: true },
        { ev: '订货建议偏离', to: '区域运营（周度汇总）', cc: '—', on: true },
        { ev: '温控异常', to: '供应链质量', cc: '督导', on: true },
      ],
    },
    scope: 'all',              // all | A:华东 | R: 区域 id | S: 门店 id
    phone: {
      submitted: false, qty: 44, accepted: false, diffReported: false,
      disposed: null, escalated: false, seenRule: null,
      msgs: [], lastClock: 0,
    },
    toasts: [],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(LS)
    if (raw) {
      const s = JSON.parse(raw)
      // 形状校验：缺字段（旧版本残留）直接重建，避免半损坏状态
      if (s && s.v === 1 && s.rules && s.events && s.audit && s.phone && s.route) return s
    }
  } catch (e) { /* ignore */ }
  return seed()
}

let state = load()
const subs = new Set()
const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CH) : null

if (bc) bc.onmessage = (m) => {
  if (m.data && m.data.type === 'sync') { state = m.data.state; subs.forEach(f => f(state)) }
}

function emit() { subs.forEach(f => f(state)) }

export function get() { return state }

export function sub(fn) { subs.add(fn); return () => subs.delete(fn) }

export function set(patch, { broadcast = true } = {}) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  try { localStorage.setItem(LS, JSON.stringify(state)) } catch (e) { /* ignore */ }
  if (broadcast && bc) bc.postMessage({ type: 'sync', state })
  emit()
}

export function reset() {
  state = seed()
  try { localStorage.setItem(LS, JSON.stringify(state)) } catch (e) { /* ignore */ }
  if (bc) bc.postMessage({ type: 'sync', state })
  emit()
}

/* ---------------- 时间工具 ---------------- */
const pad = n => String(n).padStart(2, '0')
export function today(clockH = 0) {
  const t = 8 + Math.floor(clockH)          // 演示从 08:00 起
  return `2026-10-22 ${pad(Math.min(t, 23))}:${pad(Math.round((clockH % 1) * 60))}`
}
export const nowLabel = (s) => today(s.clockH)

export function stayHours(e, clockH) {
  const day = +e.hitAt.slice(8, 10), hh = +e.hitAt.slice(11, 13), mm = +e.hitAt.slice(14, 16)
  const hit = day * 24 + hh + mm / 60
  const now = 22 * 24 + 8 + clockH
  const d = +(now - hit).toFixed(1)
  return d < 0 ? 0 : d
}

/* ---------------- 作用域 ---------------- */
export function inScope(ev, scope) {
  if (!scope || scope === 'all') return true
  if (scope.startsWith('A:')) return ev.area === scope.slice(2)
  if (scope.startsWith('R:')) return ev.regionId === scope.slice(2)
  if (scope.startsWith('S:')) return ev.storeId === scope.slice(2)
  return true
}

import { t as tr } from './i18n'
export const SCOPE_LABEL = (scope) => {
  if (!scope || scope === 'all') return tr('全部门店') + '（21）'
  if (scope.startsWith('A:')) return tr(scope.slice(2)) + tr('大区')
  if (scope.startsWith('R:')) { const r = DB.regions.find(x => x.id === scope.slice(2)); return r ? `${r.area} · ${r.name}` : scope }
  if (scope.startsWith('S:')) { const s = DB.stores.find(x => x.id === scope.slice(2)); return s ? s.name : scope }
  return scope
}

/* ---------------- 指标（全部由事件派生，不写死数字） ---------------- */
export function metrics(s) {
  const evs = s.events.filter(e => inScope(e, s.scope))
  const count = (fn) => evs.filter(fn).length
  const done = st => st === 'acted' || st === 'closed'
  const expTotal = count(e => e.type === '临期预警')
  const expDone = count(e => e.type === '临期预警' && done(e.state))
  const difTotal = count(e => e.type === '到货差异')
  const difClosed = count(e => e.type === '到货差异' && e.state === 'closed')
  const respList = evs.filter(e => e.respH != null).map(e => e.respH)
  const resp = respList.length ? respList.reduce((a, b) => a + b, 0) / respList.length : 0
  const escTotal = count(e => e.escalatedAt)
  const escClosed = count(e => e.escalatedAt && e.state === 'closed')
  return {
    expRate: expTotal ? Math.round(expDone / expTotal * 100) : 0, expDone, expTotal,
    difRate: difTotal ? Math.round(difClosed / difTotal * 100) : 0, difClosed, difTotal,
    resp: +resp.toFixed(1),
    followRate: escTotal ? Math.round(escClosed / escTotal * 100) : 0, followDone: escClosed, followTotal: escTotal,
    open: count(e => e.state === 'hit' || e.state === 'escalated'),
    total: evs.length,
  }
}

/* ---------------- 动作 ---------------- */
function logAudit(s, action, target, extra = {}) {
  const row = {
    id: 'AU-' + (2000 + s.audit.length), at: today(s.clockH), user: extra.user || '王敏',
    role: extra.role || '供应链计划', action, target, store: extra.store || '—', ip: '10.18.*.*',
  }
  return { audit: [row, ...s.audit] }
}

let toastSeq = 0
export function toast(text) {
  const id = ++toastSeq
  set(s => ({ toasts: [...s.toasts, { id, text }] }))
  setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 2800)
}

export const ACT = {
  toast,

  setRoute(idx, to) {
    set(s => ({ route: { ...s.route, list: s.route.list.map((r, i) => i === idx ? { ...r, to } : r) },
      ...logAudit(s, '修改通知路由', s.route.list[idx].ev) }))
  },

  setScope(scope) { set(s => ({ scope })) },

  advance(h) {
    set(s => {
      const clockH = +(s.clockH + h).toFixed(1)
      let p = { ...s.phone, lastClock: clockH }
      let escalated = s.phone.escalated
      // 到货提醒（T+2h）
      if (clockH >= 2 && !s.phone.arrived) {
        p.arrived = true
        p.msgs = [...p.msgs, { kind: 'sys', text: '10:30', at: clockH }, { kind: 'card', card: 'arrive', at: clockH }]
      }
      // 差异上报 1h 后：仓确认 + 补发（闭环回执）
      if (s.phone.diffReported && s.phone.diffAt != null && clockH >= s.phone.diffAt + 1 && !s.phone.diffConfirmed) {
        p.diffConfirmed = true
        p.msgs = [...p.msgs,
          { kind: 'sys', text: '仓配已确认差异 · 补发 2 箱，明日随车到店', at: clockH },
          { kind: 'bubble', text: '差异已闭环：仓配确认少发 2 箱，补发单 DN20261022009 已生成。这条记录已进总部「差异闭环率」。', at: clockH }]
      }
      // 登记处置 1h 后：拉群协作
      if (s.phone.disposed && s.phone.disposeAt != null && clockH >= s.phone.disposeAt + 1 && !s.phone.groupMade) {
        p.groupMade = true
        p.msgs = [...p.msgs, { kind: 'sys', text: '已创建群聊：星汇里店 · 临期处置（督导 + 供应链值班已入群）', at: clockH }]
      }

      // 临期预警（T+3h，规则已发布才带处置要求）
      if (clockH >= 3 && !s.phone.expiryShown) {
        p.expiryShown = true
        p.msgs = [...p.msgs, { kind: 'card', card: 'expiry', at: clockH }]
      }
      // 未处置满 4h → 升级督导
      if (clockH >= 4 && s.phone.expiryShown && !s.phone.disposed && !escalated) {
        escalated = true
        p.escalated = true
        p.msgs = [...p.msgs, { kind: 'sys', text: '未处置满 4 小时 · 已自动升级督导', at: clockH }]
        const focus = s.events.find(e => e.isFocus)
        const events = s.events.map(e => e.isFocus
          ? { ...e, state: 'escalated', escalatedAt: today(clockH), owner: '督导 · ' + (DB.stores.find(x => x.id === e.storeId) || {}).supervisor }
          : e)
        return { clockH, phone: p, events }
      }
      return { clockH, phone: p }
    })
  },

  /* —— 手机端动作 —— */
  phoneInject(msgs) {
    set(s => ({ phone: { ...s.phone, msgs: [...s.phone.msgs, ...msgs.map(m => ({ ...m, at: s.clockH }))] } }))
  },

  phoneDaily() { set(s => ({ phone: { ...s.phone, msgs: [...s.phone.msgs, { kind: 'sys', text: '07:55', at: s.clockH }, { kind: 'card', card: 'daily', at: s.clockH }] } })) },

  phoneOrder() { set(s => ({ phone: { ...s.phone, orderOpen: true, msgs: [...s.phone.msgs, { kind: 'card', card: 'order', at: s.clockH }] } })) },

  phoneSubmit(qty) {
    set(s => {
      const focus = s.events.find(e => e.isFocus)
      const deviated = qty !== 44
      const events = s.events.map(e => e.isFocus
        ? { ...e, state: 'notified', notifiedAt: today(s.clockH), deviation: deviated ? `${44} → ${qty} 箱` : null }
        : e)
      const msgs = [...s.phone.msgs,
        { kind: 'sys', text: `订货已提交 · 鲜奶 ${qty} 箱`, at: s.clockH },
        { kind: 'bubble', text: deviated ? `已记录：建议 44 箱，你调整为 ${qty} 箱。该偏离会计入总部的「建议采纳率」与偏差榜。` : '已按建议量提交，订单号 ORD2026102200317。', at: s.clockH }]
      return { phone: { ...s.phone, submitted: true, qty, orderOpen: false, msgs }, events }
    })
  },

  phoneAccept() {
    set(s => ({ phone: { ...s.phone, accepted: true, msgs: [...s.phone.msgs, { kind: 'card', card: 'diff', at: s.clockH }] } }))
  },

  phoneReportDiff() {
    set(s => {
      const sid = (DB.stores.find(x => x.name === '星汇里店') || DB.stores[0]).id
      const ev = {
        id: 'EV20261022' + String(s.events.length + 101).slice(-4),
        type: '到货差异', severity: 'mid', source: '3PL · 仓储', slaH: 2,
        storeId: sid, storeCode: (DB.stores.find(x => x.id === sid) || {}).code,
        storeName: (DB.stores.find(x => x.id === sid) || {}).name,
        regionId: (DB.stores.find(x => x.id === sid) || {}).regionId,
        regionName: (DB.stores.find(x => x.id === sid) || {}).regionName,
        area: (DB.stores.find(x => x.id === sid) || {}).area,
        material: '鲜奶', sku: 'L-1001', qty: '2 箱', note: '实收少 2 件',
        hitAt: today(s.clockH), notifiedAt: today(s.clockH), state: 'notified',
        owner: '仓配专员 · 李工', action: null, resolution: null,
        actedAt: null, escalatedAt: null, closedAt: null, respH: null,
      }
      return {
        events: [ev, ...s.events],
        phone: { ...s.phone, diffReported: true, diffAt: s.clockH, msgs: [...s.phone.msgs, { kind: 'sys', text: '差异已上报 · 等待仓确认（SLA 2 小时）', at: s.clockH }] },
        ...logAudit(s, '上报到货差异', ev.id, { user: '店长 · 林晓', role: '门店店长', store: ev.storeName }),
      }
    })
  },

  phoneDispose(action) {
    set(s => {
      const focus = s.events.find(e => e.isFocus)
      const events = s.events.map(e => e.isFocus
        ? { ...e, state: 'acted', action, actedAt: today(s.clockH), owner: '店长 · 林晓', respH: +(0.6 + s.clockH * 0.2).toFixed(1) }
        : e)
      return {
        events,
        phone: { ...s.phone, disposed: action, disposeAt: s.clockH, msgs: [...s.phone.msgs, { kind: 'sys', text: `处置动作已登记：${action}（已同步督导）`, at: s.clockH }] },
        ...logAudit(s, '登记处置动作', focus ? focus.id : '—', { user: '店长 · 林晓', role: '门店店长', store: focus ? focus.storeName : '—' }),
      }
    })
  },

  /* —— 控制台动作 —— */
  publishRule(id) {
    set(s => {
      const rules = s.rules.map(r => r.id === id ? { ...r, state: '已生效', updated: today(s.clockH) } : r)
      const r = s.rules.find(x => x.id === id)
      const msgs = [...s.phone.msgs,
        { kind: 'sys', text: '规则变更 · 新规则已生效（生效范围 ' + (r ? r.scope : '全部') + '）', at: s.clockH },
        { kind: 'bubble', text: `总部发布规则：${r ? r.name : ''}。${r ? r.action : ''}`, at: s.clockH }]
      return { rules, phone: { ...s.phone, msgs }, ...logAudit(s, '发布规则', id) }
    })
  },

  toggleRule(id) {
    set(s => ({ rules: s.rules.map(r => r.id === id ? { ...r, state: r.state === '已生效' ? '已停用' : '已生效' } : r), ...logAudit(s, '切换规则状态', id) }))
  },

  adoptRoute() { set(s => ({ route: { ...s.route, adopted: true }, ...logAudit(s, '采纳 AI 推荐路由', 'ROUTE-ALL') })) },

  // 总部不能替门店登记处置，只能催办：给责任人推一条提醒（动作仍由门店侧完成）
  remindEvent(id) {
    set(s => ({
      events: s.events.map(e => e.id === id ? { ...e, remindedAt: today(s.clockH), remindCount: (e.remindCount || 0) + 1 } : e),
      ...logAudit(s, '催办责任人', id, { user: '王敏', role: '供应链计划' }),
    }))
  },

  disposeEvent(id, action) {
    set(s => ({
      events: s.events.map(e => e.id === id ? { ...e, state: 'acted', action, actedAt: today(s.clockH), owner: e.owner || '督导' } : e),
      ...logAudit(s, '登记处置动作', id, { user: '陈立', role: '督导' }),
    }))
  },

  escalateEvent(id) {
    set(s => ({
      events: s.events.map(e => e.id === id ? { ...e, state: 'escalated', escalatedAt: today(s.clockH), owner: '督导 · 陈立' } : e),
      ...logAudit(s, '升级督导', id, { user: '系统', role: '系统' }),
    }))
  },

  closeEvent(id, resolution) {
    set(s => ({
      events: s.events.map(e => e.id === id ? { ...e, state: 'closed', closedAt: today(s.clockH), resolution: resolution || '已完成' } : e),
      ...logAudit(s, '关闭事件', id, { user: '陈立', role: '督导' }),
    }))
  },
}
