import React from 'react'
import { DB } from '../data/mock'
import { t } from '../i18n'

const TAG = { wait: '#96742A', ship: '#1F4E79', onway: '#1F4E79', done: '#3E6B4F', cancel: '#8A9099' }
const F = { fontSize: 12 }

function Row({ k, v, strong, color }) {
  return <div className="kv2"><span className="k">{k}</span>
    <span className="v" style={{ fontWeight: strong === false ? 400 : 600, color }}>{v}</span></div>
}
function Head({ c, children }) {
  return <div className="ch" style={{ background: c }}>{children}</div>
}

export default function ExtraCard({ m, en }) {
  const multi = m.multi
  const c = m.card
  const o = DB.orders

  if (c === 'stock') return (
    <div className="fcard"><Head c="#1F4E79">{en ? 'Stock Snapshot' : '库存快照 · 实时'}</Head>
      <div className="cb">
        <Row k={en ? 'Fresh Milk L-1001' : '鲜奶 L-1001'} v={en ? '42 ctn' : '42 箱'} />
        <Row k={en ? 'Oat Milk L-1002' : '燕麦奶 L-1002'} v={en ? '12 ctn · 2 days left' : '12 箱 · 剩 2 天'} color="#B23A28" />
        <Row k={en ? 'Pearl S-3003' : '珍珠 S-3003'} v={en ? '8 bag' : '8 袋'} />
        <div className="fsrc">{t('来源')}：{t('仓储')} WMS　｜　{t('更新')} 07:55　·　T-1 快照，非实时</div>
      </div></div>
  )

  if (c === 'usage') return (
    <div className="fcard"><Head c="#96742A">{en ? 'Usage per ¥10k Revenue' : '万元用量 · 本周'}</Head>
      <div className="cb">
        <Row k={en ? 'Oat Milk' : '燕麦奶'} v={en ? '1.23 vs base 1.00 (+23%)' : '1.23 / 基准 1.00（+23%）'} color="#B23A28" />
        <Row k={en ? 'Fresh Milk' : '鲜奶'} v={en ? '1.02 (+2%)' : '1.02（+2%）'} />
        <div style={{ ...F, color: '#8c8c8c', marginTop: 6, lineHeight: 1.7 }}>
          {en ? 'Definition: usage ÷ revenue (¥10k). Basis: same region, same store type, same menu version.'
            : '口径：用量 ÷ 营业额（万元）。基准：同区域 · 同店型 · 同菜单版本门店自身历史。'}
        </div>
        <div className="fsrc">{t('来源')}：{t('仓储')} WMS · POS · Lakehouse　｜　T-1</div>
      </div></div>
  )

  if (c === 'health') return (
    <div className="fcard"><Head c={en ? '#96742A' : '#96742A'}>{en ? 'Inventory Health · Attention' : '库存健康 · 关注'}</Head>
      <div className="cb">
        <Row k={en ? 'Tier' : '档位'} v={en ? 'Attention (worst factor)' : '关注（由最差因子决定）'} color="#96742A" />
        <Row k={en ? 'Expiring share' : '临期占比'} v="8.4%" color="#B23A28" />
        <Row k={en ? 'Safety stock deviation' : '安全库存偏离'} v="-12%" />
        <Row k={en ? 'Dwell days' : '周转天数'} v={en ? '6.2 d' : '6.2 天'} />
        <div className="fsrc">{t('来源')}：{t('仓储')} WMS · POS　｜　{t('更新')} 07:55</div>
      </div></div>
  )

  if (c === 'store-select') return (
    <div className="fcard"><Head c="#1F4E79">{en ? 'Select stores (you manage 3)' : '选择门店（你管辖 3 家）'}</Head>
      <div className="cb">
        {['星汇里店', '云栖里店', '青柠广场店'].map((s, i) => (
          <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #F0F1F3' }}>
            <span style={F}>{i === 0 ? '● ' : '○ '}{t(s)}</span>
            <span style={{ ...F, color: '#8c8c8c' }}>{en ? 'SH201' + (4 + i) : 'SH201' + (4 + i)}</span>
          </div>
        ))}
        <div className="fsrc">{en ? 'Non-single-store managers pick first; single-store managers skip this step.' : '非店长先选门店；一人一店的店长直接跳过这一步。'}</div>
      </div></div>
  )

  if (c === 'order-list') return (
    <div className="fcard"><Head c="#1F4E79">{en ? 'Orders · last 7 days (unfinished)' : '近 7 天未完成订单'}</Head>
      <div className="cb">
        {o.slice(0, 4).map(x => (
          <div key={x.mainId} style={{ padding: '6px 0', borderBottom: '1px dashed #F0F1F3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...F }}>
              <b>{x.mainId}</b>
              <span style={{ color: TAG[x.statusKey] }}>{en ? x.statusKey : x.status}</span>
            </div>
            <div style={{ ...F, color: '#6E767E' }}>{t(x.store)} · {x.subCount} {en ? 'sub-orders' : '个子订单'} · ¥{x.amount}</div>
          </div>
        ))}
        <div className="fsrc">{t('来源')}：{en ? 'Ordering system' : '订货系统'}　｜　{t('更新')} 08:02</div>
      </div></div>
  )

  if (c === 'order-detail') {
    const x = o[0]
    return (
      <div className="fcard"><Head c="#1F4E79">{en ? 'Order detail' : '订单详情'} · {x.mainId}</Head>
        <div className="cb">
          <Row k={t('门店')} v={t(x.store)} />
          <Row k={t('状态')} v={en ? x.statusKey : x.status} color={TAG[x.statusKey]} />
          <Row k={en ? 'Amount' : '金额'} v={'¥' + x.amount} />
          <div style={{ ...F, fontWeight: 600, margin: '8px 0 4px' }}>{en ? 'Sub-orders' : '子订单'}（{x.subs.length}）</div>
          {x.subs.map(sb => (
            <div key={sb.subId} style={{ ...F, display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>{t(sb.name)} × {sb.qty}</span>
              <span style={{ color: '#8c8c8c' }}>{sb.subId.slice(-4)} · {en ? 'shipped' : '已发货'}</span>
            </div>
          ))}
          <div className="fsrc">{t('来源')}：{en ? 'Ordering system · WMS' : '订货系统 · 仓储 WMS'}　｜　{t('更新')} 08:02</div>
        </div></div>
    )
  }

  if (c === 'logistics') {
    const x = o[0]
    return (
      <div className="fcard"><Head c="#4A5B70">{en ? 'Logistics · in transit' : '物流查询 · 派送中'}</Head>
        <div className="cb">
          <Row k={t('预计到达')} v={x.eta} />
          <Row k={t('司机')} v={<span>{en ? 'Mr. Wang' : x.driver.name} <span style={{ color: '#1F4E79' }}>{x.driver.phone}</span></span>} strong={false} />
          <Row k={en ? 'Plate' : '车牌'} v={x.driver.plate} strong={false} />
          <div style={{ margin: '8px 0 2px' }}>
            {x.logistics.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, ...F, padding: '3px 0', color: l.done ? '#262626' : '#b0b6bd' }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, marginTop: 5, background: l.done ? '#1F4E79' : '#d9dde2', flex: '0 0 auto' }} />
                <span>{l.done ? (en ? l.node : l.node) : (en ? 'Pending' : l.node)}</span>
                <span style={{ marginLeft: 'auto', color: '#9AA0A7' }}>{l.at}</span>
              </div>
            ))}
          </div>
          <div className="cf" style={{ borderTop: 'none', padding: '4px 0 0' }}>
            <button className="pbtn" style={{ fontSize: 11 }}>{en ? 'Call driver' : '拨打电话'}</button>
          </div>
          <div className="fsrc">{t('来源')}：3PL　｜　{t('更新')} 10:32</div>
        </div></div>
    )
  }

  if (c === 'redirect-h5') return (
    <div className="fcard"><Head c="#4A5B70">{en ? 'Non single-store manager' : '非店长身份 · 多店查询'}</Head>
      <div className="cb">
        <div style={{ ...F, lineHeight: 1.8 }}>
          {en ? 'You manage multiple stores. Order queries open the H5 list page instead of inline cards — full filters and pagination.'
            : '你管辖多家门店，订单查询直接跳转 H5 列表页（带子公司 → 门店级联筛选与分页），不在会话里逐条展开。'}
        </div>
        <div className="cf" style={{ borderTop: 'none', padding: '6px 0 0' }}>
          <button className="pbtn pri" style={{ fontSize: 11 }}>{en ? 'Open order list' : '打开订单列表 H5'}</button>
        </div>
      </div></div>
  )

  if (c === 'faq') {
    const f = DB.faqReplies.hit[m.idx || 0]
    return (
      <div className="fcard"><Head c="#2F6B4F">{en ? 'FAQ · matched' : 'FAQ 命中 · 知识库'}</Head>
        <div className="cb">
          <div style={{ ...F, lineHeight: 1.8 }}>{en ? 'Answer returned from knowledge base (three-layer retrieval: vector → similar question → hybrid score).' : f.a}</div>
          <div className="fsrc">{en ? 'Source' : '来源'}：{f.src}　·　{en ? 'score' : '匹配度'} {f.score}　·　3 层检索</div>
        </div></div>
    )
  }

  if (c === 'faq-miss') {
    const f = DB.faqReplies.miss[0]
    return (
      <div className="fcard"><Head c="#96742A">{en ? 'FAQ · no match' : 'FAQ 未命中 · 已记录缺口'}</Head>
        <div className="cb">
          <div style={{ ...F, lineHeight: 1.8 }}>{f.a}</div>
          <div className="fsrc">{f.src}</div>
          <div className="cf" style={{ borderTop: 'none', padding: '6px 0 0' }}>
            <button className="pbtn" style={{ fontSize: 11 }}>{en ? 'Transfer to human' : '转人工'}</button>
            <button className="pbtn" style={{ fontSize: 11 }}>{en ? 'Submit ticket' : '转工单'}</button>
          </div>
        </div></div>
    )
  }

  if (c === 'transfer') return (
    <div className="fcard"><Head c="#1F4E79">{en ? 'Transfer to human · 4 steps' : '转人工 · 四步流程'}</Head>
      <div className="cb">
        {[
          [en ? 'Identify store' : '识别门店', multi
            ? (en ? 'You manage 3 → pick one' : '管辖 3 家 → 请选择门店')
            : (en ? 'Star Meet Store (SH2014)' : '星汇里店（SH2014）')],
          [en ? 'Classify intent' : '问题归类', en ? 'Order · Delivery variance' : '订单 · 到货差异'],
          [en ? 'Match BP' : '匹配业务伙伴', en ? 'Warehouse Group 1 · Li' : '仓配一组 · 李工'],
          [en ? 'Create group' : '自动建群', en ? 'Store + Supervisor + BP' : '店长 + 督导 + BP'],
        ].map(([a, b], i) => (
          <div key={i} style={{ ...F, display: 'flex', gap: 8, padding: '4px 0' }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: '#e6f4ff', color: '#1F4E79',
              fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>{i + 1}</span>
            <span style={{ color: '#6E767E' }}>{a}</span>
            <span style={{ marginLeft: 'auto' }}>{b}</span>
          </div>
        ))}
        <div className="fsrc">{en ? 'Group created, BP join request sent' : '已建群并发送入群邀请'}</div>
      </div></div>
  )

  if (c === 'complaint') return (
    <div className="fcard"><Head c="#B23A28">{en ? 'Complaint · classify' : '投诉 · 请选择类型'}</Head>
      <div className="cb">
        {[
          [en ? 'Product quality' : '产品质量', en ? 'Goes to QA work order' : '走食安/质量工单'],
          [en ? 'Delivery service' : '配送服务', en ? 'To 3PL BP' : '转 3PL 业务伙伴'],
          [en ? 'Order mismatch' : '订单不符', en ? 'To warehouse' : '转仓配核对'],
          [en ? 'Attitude' : '服务态度', en ? 'To supervisor' : '转督导'],
          [en ? 'Other' : '其他', en ? 'To duty desk' : '转值班台'],
        ].map(([a, b], i) => (
          <div key={i} style={{ ...F, display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #F0F1F3' }}>
            <span>{a}</span><span style={{ color: '#8c8c8c' }}>{b}</span>
          </div>
        ))}
        {multi && <div style={{ ...F, color: '#8c8c8c', marginTop: 4 }}>{en ? 'You manage 3 stores — pick the store first.' : '你管辖 3 家门店，先选门店再提交。'}</div>}
        <div className="fsrc">{en ? 'Classification decides the routing; food-safety types always open a ticket.' : '分型决定去向；食安类一律开工单，不走即时应答。'}</div>
      </div></div>
  )

  if (c === 'workorder') return (
    <div className="fcard"><Head c="#4A5B70">{en ? 'Ticket created' : '工单已创建'}</Head>
      <div className="cb">
        <Row k={en ? 'Ticket' : '工单号'} v="WO20261022031" />
        <Row k={en ? 'Type' : '类型'} v={en ? 'Delivery variance' : '到货差异'} />
        <Row k={en ? 'Owner' : '处理人'} v={en ? 'Warehouse Group 1 · Li' : '仓配一组 · 李工'} />
        <Row k={en ? 'SLA' : '时限'} v="2h" />
        <div className="fsrc">{en ? 'Visible in console → Service Ops → Conversations' : '可在控制台「服务运营 → 会话记录」追踪'}</div>
      </div></div>
  )

  return null
}
