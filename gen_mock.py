# -*- coding: utf-8 -*-
"""生成对外 demo 的 mock 数据。目标：语义自洽、量级像在跑、可复现。"""
import json, random
random.seed(20261023)

BRAND = "沐野茶事"
PLAZA = ["云栖里","星汇里","拾光里","听风广场","青柠广场","汇金里","锦鲤广场","风铃广场",
         "沐光里","拾贝广场","初雪里","木棉广场","流云里","叠翠广场","清欢里","长夏广场"]
AREAS = [("华东", ["沪北","沪南","苏南"]), ("华南", ["粤东","粤西"]), ("华北", ["京津","冀中"])]

COLD  = [("鲜奶","L-1001","箱"),("燕麦奶","L-1002","箱"),("厚椰乳","L-1003","箱")]
DRY   = [("茉莉茶底","T-2001","包"),("四季春茶底","T-2002","包"),("芋泥","S-3001","袋"),
         ("蛋糕酱","S-3002","袋"),("珍珠","S-3003","袋")]
PACK  = [("杯盖（大）","P-4001","件"),("杯身（大）","P-4002","件"),("吸管","P-4003","件"),("外箱贴","P-4004","卷")]
ALL_M = COLD + DRY + PACK

# 事件类型 → (严重度, 来源, SLA 小时, 可选物料池, 说明模板)
TYPES = {
 "临期预警":      ("high","仓储 WMS · 湖仓",4, COLD+DRY, lambda m:f"批次效期剩 {random.randint(1,2)} 天"),
 "到货差异":      ("mid", "3PL · 仓储 WMS",2, ALL_M,    lambda m:f"实收少 {random.randint(1,4)} {m[2]}"),
 "断货预警":      ("high","POS · 湖仓",3,      ALL_M,    lambda m:f"可售库存为安全库存的 {random.randint(30,58)}%"),
 "订货建议偏离":  ("low", "订货系统",24,       COLD+DRY, lambda m:f"改量偏离建议值 {random.randint(16,38)}%"),
 "温控异常":      ("high","3PL 温控",1,        COLD,     lambda m:f"到货温度 {random.uniform(7.2,9.4):.1f}°C（阈值 6°C）"),
 "盘点差异":      ("mid", "门店盘点",24,       ALL_M,    lambda m:f"盘点差异率 {random.uniform(2.1,5.4):.1f}%"),
}
ACTIONS = {"临期预警":["调拨邻店","促销消化","报损登记"],"断货预警":["紧急加单","内部调拨"],
           "温控异常":["拒收","让步接收"],"到货差异":["仓已补发","差异核销"],
           "盘点差异":["差异核销"],"订货建议偏离":["已说明原因"]}

# ---------- 组织 ----------
stores=[]; regions=[]
sidx=0
for ai,(area,regs) in enumerate(AREAS):
    for rname in regs:
        rid=f"R{ai+1}{regs.index(rname)+1}"
        regions.append({"id":rid,"name":rname,"area":area})
        for k in range(3):
            sidx+=1
            stores.append({"id":f"{['SH','GZ','BJ'][ai]}{2000+sidx*7}",
                           "code":f"{['SH','GZ','BJ'][ai]}{2000+sidx*7}",
                           "name":f"{PLAZA[sidx%len(PLAZA)]}店",
                           "regionId":rid,"regionName":rname,"area":area,
                           "manager":["林晓","周雯","吴杭","赵宁","许铭","郑樱","陈嘉","顾然"][sidx%8],
                           "supervisor":["陈立","唐婧","何昱","苏晴","范宇"][sidx%5]})
S={x["id"]:x for x in stores}

RULES=[
 {"id":"R-001","name":"临期 T-2 必须登记处置动作","trigger":"批次效期 − 今日 ≤ 2 天","action":"推送店长 → 未登记满 4h 升级督导","scope":"灰度 20 店","state":"已生效","owner":"王敏","ver":"v3","updated":"2026-10-18 16:20","hits":63},
 {"id":"R-002","name":"到货差异 2h 内仓确认","trigger":"验收差异上报","action":"通知仓配专员 → 超时升级供应链值班","scope":"全部门店","state":"已生效","owner":"王敏","ver":"v2","updated":"2026-10-11 09:12","hits":41},
 {"id":"R-003","name":"断货预警提前 1 天推送","trigger":"可售库存 < 安全库存 × 0.6","action":"推送店长 + 辖区督导","scope":"全部门店","state":"已生效","owner":"刘晓","ver":"v4","updated":"2026-10-09 14:03","hits":28},
 {"id":"R-004","name":"订货建议偏离 >15% 需填理由","trigger":"店长改量偏离建议值 > 15%","action":"要求选择偏离原因，进入采纳率统计","scope":"灰度 8 店","state":"灰度中","owner":"王敏","ver":"v1","updated":"2026-10-20 11:40","hits":9},
 {"id":"R-005","name":"盘点差异 >2% 触发复核","trigger":"盘点差异率 > 2%","action":"生成复核任务给督导","scope":"全部门店","state":"已停用","owner":"刘晓","ver":"v2","updated":"2026-09-28 17:22","hits":0},
 {"id":"R-006","name":"效期超期即报损锁定","trigger":"批次效期 < 今日","action":"锁定出库并生成报损单","scope":"草稿","state":"草稿","owner":"王敏","ver":"—","updated":"2026-10-22 06:40","hits":0},
]

# ---------- 事件 ----------
events=[]; eid=0
def stamp(day,h,m): return f"2026-10-{day:02d} {h:02d}:{m:02d}"
def pick_mat(t):
    pool=TYPES[t][3]; return random.choice(pool)

def make(day,h,m,t,state,store=None):
    global eid; eid+=1
    st=store or random.choice(stores); mp=pick_mat(t)
    sev,src,sla,_,note_t = TYPES[t]
    e={"id":f"EV202610{day:02d}{eid:04d}","type":t,"severity":sev,"source":src,"slaH":sla,
       "storeId":st["id"],"storeCode":st["code"],"storeName":st["name"],
       "regionId":st["regionId"],"regionName":st["regionName"],"area":st["area"],
       "material":mp[0],"sku":mp[1],"qty":f"{random.randint(2,36)} {mp[2]}",
       "note":note_t(mp),"hitAt":stamp(day,h,m),"state":state,"owner":None,"action":None,
       "resolution":None,"notifiedAt":None,"actedAt":None,"escalatedAt":None,"closedAt":None,"respH":None}
    return e

def do_notify(e):
    e["notifiedAt"]=e["hitAt"]; e["owner"]=f"店长 · {S[e['storeId']]['manager']}"
def do_act(e,day):
    e["actedAt"]=stamp(day,random.randint(9,17),random.randint(0,59))
    e["action"]=random.choice(ACTIONS[e["type"]])
    e["respH"]=round(random.uniform(1.2,5.4),1)
def do_esc(e,day):
    e["escalatedAt"]=stamp(day,random.randint(13,19),random.randint(0,59))
    e["owner"]=f"督导 · {S[e['storeId']]['supervisor']}"
def do_close(e,day):
    e["closedAt"]=stamp(day,random.randint(15,20),random.randint(0,59))
    e["state"]="closed"
    e["resolution"]=random.choice(["仓已补发","已调拨邻店","已报损","差异核销","已完成"])

# 历史两天：以闭环为主，掺少量滞留
for day in (20,21):
    for _ in range(46):
        t=random.choices(list(TYPES),weights=[8,7,5,4,2,3])[0]
        r=random.random()
        e=make(day,random.randint(7,17),random.randint(0,59),t,"notified")
        do_notify(e)
        if r<0.18:                      # 升级后仍闭环
            do_esc(e,day); do_act(e,day); do_close(e,day)
        elif r<0.26:                    # 升级未闭环
            e["state"]="escalated"; do_esc(e,day)
        elif r<0.34:                    # 已登记未闭环
            e["state"]="acted"; do_act(e,day)
        else:
            do_act(e,day); do_close(e,day)
        events.append(e)

# 今天 06:00-11:00：一部分已完成，一部分还没动（这是“正在跑”的证据）
for _ in range(12):
    t=random.choices(list(TYPES),weights=[8,6,4,3,2,2])[0]
    e=make(22,random.randint(6,7),random.randint(0,50),t,"notified"); do_notify(e)
    if random.random()<0.55: do_act(e,22); do_close(e,22)
    else: e["state"]="acted"; do_act(e,22)
    events.append(e)
for _ in range(14):   # 待处置
    t=random.choices(list(TYPES),weights=[10,4,5,3,2,2])[0]
    e=make(22,random.randint(6,7),random.randint(0,50),t,"hit"); do_notify(e)
    e["state"]="hit"; events.append(e)
for _ in range(2):   # 已升级未闭环
    t=random.choice(["临期预警","断货预警","温控异常"])
    e=make(22,random.randint(6,7),random.randint(0,50),t,"escalated"); do_notify(e); do_esc(e,22)
    events.append(e)

# 焦点事件：这一场要演的“临期未登记”
focus=make(22,7,55,"临期预警","hit",store=stores[1]); do_notify(focus)
focus["state"]="hit"; focus["material"]="燕麦奶"; focus["sku"]="L-1002"; focus["qty"]="12 箱"
focus["note"]="批次效期剩 2 天"; focus["isFocus"]=True
events.append(focus)

# 后处理：模拟“灰度推广中”——部分已闭环的临期/差异退回未闭环，形成真实的落差
for e in events:
    if e["type"]=="临期预警" and e["state"] in ("closed","acted") and random.random()<0.22:
        e["state"]="escalated"
        e["escalatedAt"]=e["hitAt"][:11]+f"{random.randint(13,19):02d}:{random.randint(0,59):02d}"
        e["closedAt"]=None; e["resolution"]=None
        e["owner"]="督导 · "+S[e["storeId"]]["supervisor"]
    if e["type"]=="到货差异" and e["state"]=="closed" and random.random()<0.12:
        e["state"]="notified"; e["closedAt"]=None; e["resolution"]=None
events.sort(key=lambda e:(e["hitAt"]),reverse=True)

# ---------- 审计：时间不得晚于当前演示时刻 ----------
AUD=[("发布规则","王敏","供应链计划"),("修改生效范围","王敏","供应链计划"),
     ("采纳 AI 推荐路由","刘晓","供应链运营"),("停用规则","刘晓","供应链运营"),
     ("登记处置动作","陈立","督导"),("升级督导","系统","系统"),
     ("关闭事件","唐婧","督导"),("导出事件列表","王敏","供应链计划")]
audit=[]
mins=[(20,10,0),(20,18,59),(21,8,0),(21,19,59),(22,6,59)]
for i in range(36):
    a,user,role=random.choice(AUD)
    day=random.choice([20,20,21,21,22])
    hh=random.randint(8,19) if day<22 else random.randint(6,6)
    mm=random.randint(0,59) if day<22 else random.randint(0,55)
    st=random.choice(stores)
    audit.append({"id":f"AU-{1000+i}","at":f"2026-10-{day:02d} {hh:02d}:{mm:02d}","user":user,"role":role,
                  "action":a,"target":random.choice(["R-001","R-002","R-003","R-004",random.choice(events)["id"]]),
                  "store":st["name"] if random.random()<0.5 else "—","ip":"10.18.*.*"})
audit.sort(key=lambda x:x["at"],reverse=True)

SOURCES=[
 {"id":"SRC-01","name":"订货系统","type":"只读 · OpenAPI","fields":"订单号 / 门店 / SKU / 数量 / 状态","sync":"每 10 分钟","last":"2026-10-22 07:40","state":"正常"},
 {"id":"SRC-02","name":"仓储 WMS","type":"只读 · OpenAPI","fields":"批次 / 效期 / 库存 / 出入库","sync":"每 15 分钟","last":"2026-10-22 07:45","state":"正常"},
 {"id":"SRC-03","name":"3PL 物流","type":"只读 · 文件对账","fields":"运单 / 司机 / 温控 / 到货时间","sync":"每 30 分钟","last":"2026-10-22 07:32","state":"延迟 6 分钟"},
 {"id":"SRC-04","name":"POS","type":"只读 · 数仓视图","fields":"门店 / 日期 / 营业额 / 杯量","sync":"T+1","last":"2026-10-22 06:00","state":"正常"},
 {"id":"SRC-05","name":"湖仓","type":"只读 · 视图","fields":"万元用量 / 用量偏差（演示口径）","sync":"T+1","last":"2026-10-22 06:20","state":"正常"},
]

out={"brand":BRAND,"areas":[{"name":a,"regions":[r["name"] for r in regions if r["area"]==a]} for a,_ in AREAS],
     "regions":regions,"stores":stores,"rules":RULES,"events":events,"audit":audit,"sources":SOURCES,
     "materials":[{"name":m[0],"sku":m[1],"unit":m[2]} for m in ALL_M]}
open('src/data/mock.js','w',encoding='utf-8').write(
 "// 自动生成，勿手改：python3 gen_mock.py\nexport const DB = "+json.dumps(out,ensure_ascii=False,indent=1)+";\n")

# ---------- 自检：指标是否落在真实区间 ----------
evs=events; done=lambda s: s in ("acted","closed")
exp=[e for e in evs if e["type"]=="临期预警"]; dif=[e for e in evs if e["type"]=="到货差异"]
esc=[e for e in evs if e["escalatedAt"]]
resp=[e["respH"] for e in evs if e["respH"]]
print(f"stores={len(stores)} events={len(evs)} audit={len(audit)}")
print(f"临期处置率 {sum(1 for e in exp if done(e['state']))/len(exp)*100:.0f}%  ({sum(1 for e in exp if done(e['state']))}/{len(exp)})")
print(f"到货闭环率 {sum(1 for e in dif if e['state']=='closed')/len(dif)*100:.0f}%  ({sum(1 for e in dif if e['state']=='closed')}/{len(dif)})")
print(f"预警响应均值 {sum(resp)/len(resp):.1f}h")
print(f"督导跟进率 {sum(1 for e in esc if e['state']=='closed')/len(esc)*100:.0f}%  ({sum(1 for e in esc if e['state']=='closed')}/{len(esc)})")
print(f"待处置 {sum(1 for e in evs if e['state']=='hit')} / 已升级 {sum(1 for e in evs if e['state']=='escalated')}")
