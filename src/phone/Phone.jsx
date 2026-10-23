import React, { useEffect, useRef, useState } from 'react'
import { get, sub, ACT, today } from '../store'
import { DB } from '../data/mock'
import { t, useLang } from '../i18n'
import ExtraCard from './cards2'
import PhonePage from './pages'

function useStore() {
  const [s, setS] = useState(get())
  useEffect(() => sub(setS), [])
  return s
}

const CH_COLOR = { daily: '#1F4E79', order: '#1F4E79', arrive: '#4A5B70', diff: '#B23A28', expiry: '#96742A' }
const CH_TITLE = { daily: '早间健康日报', order: '订货建议 · 每周', arrive: '到货提醒 · 仓已发货', diff: '验收异常 · 差异上报', expiry: '临期预警 · T-2' }

function SupplyCard({ m, s, en }) {
  const c = m.card
  const rule = s.rules.find(r => r.id === 'R-001')
  const ruleOn = rule && rule.state === '已生效'
  const ruleGray = rule && rule.state === '灰度中'
  const kv = (k, v, style) => (
    <div className="kv2"><span className="k">{k}</span><span className="v" style={style}>{v}</span></div>
  )
  const body = (
    <>
      <div className="ch" style={{ background: CH_COLOR[c] }}>{t(CH_TITLE[c])}</div>
      <div className="cb">
        {c === 'daily' && <>
          {kv(t('今日待办'), en ? '2 items' : '2 件')}
          {kv(t('燕麦奶 · 临期'), en ? '12 ctn · 2 days left' : '12 箱 · 剩 2 天', { color: '#B23A28' })}
          {kv(t('鲜奶 · 在途'), en ? '40 min delayed' : '延迟 40 分钟')}
          <div className="fsrc">{t('来源')}：{t('仓储')} WMS · POS　｜　{t('更新')} 08:00</div>
          <div className="cf" style={{ borderTop: 'none', padding: '6px 0 0' }}>
            <button className="pbtn" style={{ fontSize: 11 }} onClick={() => setPage('daily')}>
              {en ? 'Open full report ›' : '查看完整日报 ›'}</button>
          </div>
        </>}
        {c === 'order' && <>
          {kv(en ? 'Fresh Milk L-1001' : '鲜奶 L-1001', en ? 'Suggested 44 ctn' : '建议 44 箱')}
          {kv(t('依据'), en ? 'Target revenue × per-10k usage × factor' : '目标营业额 × 万元用量 × 修正', { fontWeight: 400, color: '#6E767E' })}
          {!s.phone.submitted && (
            <div className="kv2"><span className="k">{t('订货量')}</span>
              <span className="v"><input className="qty" id="qty" type="number" defaultValue={44} /> {en ? 'ctn' : '箱'}</span></div>
          )}
          {s.phone.submitted && kv(t('已提交'), `${s.phone.qty} ${en ? 'ctn' : '箱'} · ORD2026102200317`)}
          <div className="fsrc">{t('来源')}：{en ? 'Ordering system' : '订货系统'}　｜　{t('更新')} 08:02</div>
        </>}
        {c === 'arrive' && <>
          {kv(t('预计到达'), '14:00')}
          {kv(t('品项'), en ? '6 items / 31 ctn' : '6 项 / 共 31 箱')}
          {kv(t('司机'), en ? 'Mr. Wang 138****5678' : '王师傅 138****5678', { fontWeight: 400 })}
          <div className="fsrc">{t('来源')}：3PL · {t('仓储')} WMS　｜　{t('更新')} 10:32</div>
        </>}
        {c === 'diff' && <>
          {kv(en ? 'Fresh Milk · received' : '鲜奶 · 实收', en ? '42 / expected 44 ctn' : '42 箱 / 应到 44 箱')}
          {kv(t('差异'), en ? '2 ctn short' : '少 2 箱', { color: '#B23A28' })}
          <div className="fsrc">{t('来源')}：{en ? 'Receiving note' : '验收单'}　｜　{t('更新')} {today(s.clockH)}</div>
        </>}
        {c === 'expiry' && <>
          {kv(en ? 'Oat Milk L-1002' : '燕麦奶 L-1002', en ? '12 ctn · 2 days left' : '12 箱 · 剩 2 天')}
          {kv(t('口径'), en ? 'Batch expiry − today (T-1)' : '批次效期 − 今日（T-1 数据）', { fontWeight: 400, color: '#6E767E' })}
          {kv(t('规则'), ruleOn ? (en ? 'T-2 must log an action' : 'T-2 必须登记处置动作')
            : (ruleGray ? (en ? 'Pilot does not cover this store' : '本店未纳入灰度，暂不强制') : t('总部尚未发布该规则')),
            { fontWeight: 400, color: ruleOn ? '#96742A' : '#8A9099' })}
          <div className="fsrc">{t('来源')}：{t('仓储')} WMS · {en ? 'Lakehouse' : '湖仓'}　｜　{t('更新')} 07:55</div>
        </>}
      </div>
      <div className="cf">
        {c === 'order' && !s.phone.submitted && <>
          <button className="pbtn pri" onClick={() => ACT.phoneSubmit(parseInt(document.getElementById('qty').value, 10) || 44)}>{t('提交订货')}</button>
          <button className="pbtn" onClick={() => { document.getElementById('qty').value = 44 }}>{t('用建议量')}</button>
        </>}
        {c === 'order' && s.phone.submitted && <span style={{ color: '#8c8c8c', fontSize: 11 }}>{t('已提交')}</span>}
        {c === 'arrive' && !s.phone.accepted && <button className="pbtn" onClick={() => ACT.phoneAccept()}>{t('确认收货')}</button>}
        {c === 'arrive' && s.phone.accepted && <span style={{ color: '#8c8c8c', fontSize: 11 }}>{t('已确认收货')}</span>}
        {c === 'diff' && !s.phone.diffReported && <>
          <button className="pbtn warn" onClick={() => ACT.phoneReportDiff()}>{t('一键上报差异')}</button>
          <button className="pbtn">{t('拍照留证')}</button>
        </>}
        {c === 'diff' && s.phone.diffReported && <span style={{ color: '#8c8c8c', fontSize: 11 }}>{t('已上报')} · SLA 2h</span>}
        {c === 'expiry' && !s.phone.disposed && <>
          <button className="pbtn" onClick={() => ACT.phoneDispose('调拨邻店')}>{t('调拨邻店')}</button>
          <button className="pbtn" onClick={() => ACT.phoneDispose('促销消化')}>{t('促销消化')}</button>
          <button className="pbtn" onClick={() => ACT.phoneDispose('报损登记')}>{t('报损登记')}</button>
        </>}
        {c === 'expiry' && s.phone.disposed && <span style={{ color: '#3E6B4F', fontSize: 11 }}>{t('已登记')}：{t(s.phone.disposed)}</span>}
      </div>
    </>
  )
  return <div className="msg"><div className="mav">{en ? 'A' : '助'}</div><div className="fcard">{body}</div></div>
}

export default function Phone() {
  const s = useStore()
  const lang = useLang()
  const en = lang === 'en'
  const feedRef = useRef(null)
  const wrapRef = useRef(null)
  const inited = useRef(false)
    const [scale, setScale] = useState(1)
  const [page, setPage] = useState(null)

  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current
      if (!el) return
      const avail = el.clientHeight - 10
      setScale(Math.min(1, Math.max(0.6, avail / 812)))
    }
    fit()
    window.addEventListener('resize', fit)
    const id = setTimeout(fit, 150)
    return () => { window.removeEventListener('resize', fit); clearTimeout(id) }
  }, [])

  useEffect(() => {
    if (inited.current) return
    inited.current = true
    if (!get().phone.msgs.length) {
      ACT.phoneDaily()
      setTimeout(() => { if (!get().phone.msgs.some(m => m.card === 'order')) ACT.phoneOrder() }, 700)
    }
  }, [])

  useEffect(() => {
    const f = feedRef.current
    if (f) f.scrollTop = f.scrollHeight
  }, [s.phone.msgs.length, s.phone.submitted, s.phone.disposed])


  return (
    <div className="phoneFit" ref={wrapRef}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <div className="phone">
          <div className="notch" />
          <div className="pscreen">
            <div className="statusbar">
              <span>{today(s.clockH).slice(11)}</span>
              <span className="ic">●●●　WiFi　86%</span>
            </div>
            {!page && <div className="imtop">
              <span className="bk">‹</span>
              <div className="av">{en ? 'A' : '助'}</div>
              <div>
                <div className="nm">{t(DB.brand)} · {en ? 'Supply Copilot' : '供应链小助'}</div>
                <div className="st">{t('企业应用 · 在线')}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: '#9AA0A7', fontSize: 15 }}>···</span>
            </div>}
            {page ? <PhonePage type={page} en={en} onBack={() => setPage(null)} /> : <>
            <div className="feed" ref={feedRef}>
              <div className="sysm">{today(s.clockH).slice(0, 10)}</div>
              {s.phone.msgs.map((m, i) => {
                if (m.kind === 'sys') return <div className="sysm" key={i}>{t(m.text)}</div>
                if (m.kind === 'user') return (
                  <div className="msg user" key={i}><div className="ubub">{m.text}</div></div>
                )
                if (m.kind === 'bubble') return (
                  <div className="msg" key={i}><div className="mav">{en ? 'A' : '助'}</div><div className="bub">{t(m.text)}</div></div>
                )
                if (m.kind === 'card') {
                  const base = ['daily', 'order', 'arrive', 'diff', 'expiry']
                  return base.includes(m.card)
                    ? <SupplyCard key={i} m={m} s={s} en={en} />
                    : <div className="msg" key={i}><div className="mav">{en ? 'A' : '助'}</div><div><ExtraCard m={m} en={en} /></div></div>
                }
                return null
              })}
            </div>
            <div className="imbar">
              <div className="plus">＋</div>
              <div className="ipt">{t('输入消息…')}</div>
              <div className="mic">◍</div>
            </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  )
}
