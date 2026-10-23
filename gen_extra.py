# -*- coding: utf-8 -*-
"""在 mock.js 基础上追加：知识库 / 提示词 / 意图 / BP路由 / 回复文案 / 会话 / 群聊 / 推送 / 用户 / 角色"""
import json, random
random.seed(20261024)
src=open('src/data/mock.js',encoding='utf-8').read()
DB=json.loads(src[src.index('export const DB = ')+len('export const DB = '):].rstrip().rstrip(';'))

BR="沐野茶事"
MATS=[m['name'] for m in DB['materials']]
STORES=DB['stores']

FAQS=[]
qa=[
 ("临期物料怎么处理？","批次效期剩 2 天内，需在飞书登记处置动作：调拨邻店 / 促销消化 / 报损登记。未登记满 4 小时自动升级督导。","效期管理"),
 ("订货建议能改吗？","可以。建议值由「目标营业额 × 万元用量 × 修正因子」生成，店长可改量；改量偏离超过 15% 需选原因，并计入总部采纳率统计。","订货"),
 ("到货少件怎么办？","在到货卡片点「确认收货」→「一键上报差异」，选择差异类型并拍照留证，仓配专员 2 小时内确认，超时升级供应链值班。","到货验收"),
 ("盘点差异超过 2% 会怎样？","生成复核任务给辖区督导，督导需在 24 小时内确认差异归属（收货差异 / 损耗 / 记录错误）。","库存盘点"),
 ("哪个仓配专员负责我？","按门店所属区域路由：华东沪北 / 沪南、华南粤东 / 粤西由仓配一组负责；华北京津、冀中由仓配二组负责。","组织与路由"),
 ("临时加单怎么申请？","断货预警卡片里点「紧急加单」，选择缺口数量与期望到货时间，系统按仓库存量自动分配并通知仓配。","订货"),
 ("效期超期的货还能用吗？","不能。效期超期即锁定出库并生成报损单（R-006 规则），需督导确认后完成报损。","效期管理"),
 ("巡店时怎么看门店执行率？","督导在工作台切换数据范围为辖区，即可看到门店执行率、超时未处置清单；飞书会推送升级待办。","运营协作"),
 ("物流信息对不上怎么办？","使用「物流排障」输入运单号或子订单号，可查看抓取链路、匹配结果与失败原因。","物流"),
 ("万元的用量基准是怎么定的？","按同区域、同店型、同菜单版本的门店自身历史计算；区域均值仅作对标参考（演示口径）。","指标口径"),
]
for i,(q,a,t) in enumerate(qa):
    FAQS.append({"id":f"FAQ-{100+i}","q":q,"a":a,"tag":t,"hit":random.randint(12,260),"updated":f"2026-10-{random.randint(10,21):02d}",
                 "enabled":random.random()>0.1})
INTENTS=[]
for i,(k,label) in enumerate([("临期","效期风险"),("到货","到货验收"),("少件","差异上报"),("订货","订货补货"),
        ("盘点","库存盘点"),("加单","紧急加单"),("超期","效期超期"),("执行率","运营协作"),
        ("物流","物流查询"),("用量","指标口径"),("报损","报损流程"),("调拨","调拨协作")]):
    INTENTS.append({"id":f"INT-{200+i}","keyword":k,"intent":label,"route":random.choice(["FAQ 检索","规则查询","人工转接","卡片查询"]),
                    "priority":random.randint(1,5),"hit":random.randint(30,900)})
PROMPTS=[]
for i,(n,scene) in enumerate([("主对话人格","默认"),("卡片文案生成","卡片"),("异常解释","诊断"),("订货建议说明","订货"),("升级通知","通知")]):
    PROMPTS.append({"id":f"PM-{300+i}","name":n,"scene":scene,"ver":f"v{random.randint(1,5)}",
        "updated":f"2026-10-{random.randint(10,21):02d}","chars":random.randint(600,3200),
        "preview":"你是"+BR+"门店供应链助手。回答只谈货与履约，不评价门店经营…"})
BPROUTES=[]
for i in range(14):
    BPROUTES.append({"id":f"BP-{400+i}","keyword":random.choice(["少件","破损","温控","拒收","补发","对账","退仓","加急"]),
        "bp":random.choice(["仓配一组 · 李工","仓配二组 · 周工","供应链值班","质量组 · 苏晴"]),
        "region":random.choice(["华东","华南","华北"]),"priority":random.randint(1,3),
        "enabled":random.random()>0.15})
TPL=[]
for i,(n,scene) in enumerate([("早间健康日报","日报"),("订货建议卡","订货"),("到货提醒卡","到货"),("差异上报卡","差异"),
        ("临期预警卡","预警"),("升级通知卡","升级"),("整改任务卡","整改"),("周度执行摘要","周报")]):
    TPL.append({"id":f"TPL-{500+i}","name":n,"scene":scene,"ver":f"v{random.randint(1,4)}",
        "updated":f"2026-10-{random.randint(10,21):02d}","used":random.randint(200,6000),
        "body":"{{门店}} 你好，{{事项}} 待处理，请在 {{时限}} 内完成。"})
CONVS=[]
for i in range(42):
    st=random.choice(STORES)
    CONVS.append({"id":f"CV-{600+i}","store":st["name"],"user":st["manager"],
        "q":random.choice([random.choice(MATS)+"还剩多少？","我的订货到哪了？","临期怎么处理","今天有几件事","帮我查少件"]),
        "a":random.choice(["已在卡片中返回","已转人工（仓配一组）","已命中 FAQ","已生成待办"]),
        "intent":random.choice(["库存查询","物流查询","知识问答","待办汇总","差异处理"]),
        "at":f"2026-10-{random.randint(20,22):02d} {random.randint(6,19):02d}:{random.randint(0,59):02d}",
        "resolved":random.random()>0.2})
GROUPS=[]
for i in range(12):
    st=random.choice(STORES)
    GROUPS.append({"id":f"GP-{700+i}","name":f"{st['name']} · 到货差异处理群","owner":f"督导 · {st['supervisor']}",
        "members":random.randint(3,8),"type":random.choice(["差异处理","临期处置","整改跟进","断货协调"]),
        "created":f"2026-10-{random.randint(15,22):02d}","status":random.choice(["进行中","已关闭"])})
PUSH_T=[]
for i,(n,c) in enumerate([("早间健康日报","每日 08:00"),("周度执行摘要","每周一 09:00"),("临期批量提醒","每日 10:00"),("订货截止提醒","每周三 16:00")]):
    PUSH_T.append({"id":f"PT-{800+i}","name":n,"cron":c,"scope":random.choice(["全部门店","灰度 20 店"]),
        "channels":"飞书私聊","enabled":i<3,"lastRun":f"2026-10-22 0{8 if i==0 else 9}:{random.randint(0,59):02d}"})
PUSH_L=[]
for i in range(34):
    st=random.choice(STORES)
    PUSH_L.append({"id":f"PL-{900+i}","task":random.choice(["早间健康日报","临期批量提醒","周度执行摘要","订货截止提醒"]),
        "store":st["name"],"at":f"2026-10-{random.randint(20,22):02d} {random.choice(['08:00','09:00','10:00','16:00'])}",
        "status":random.choice(["已送达","已送达","已送达","已读","失败"]),"cost":random.randint(1,3)})
USERS=[]
for i,(n,r) in enumerate([("王敏","门店进销存"),("刘晓","品牌供应链"),("陈立","督导"),("唐婧","督导"),
        ("何昱","督导"),("苏晴","质量组"),("李工","仓配专员"),("系统","系统")]):
    USERS.append({"id":f"U-{1000+i}","name":n,"role":r,"account":f"{'wangmin liuxiao chenli tangjing heyu suqing ligong system'.split()[i]}",
        "scope":random.choice(["全部门店","华东大区","华南大区","华北大区","辖区"]),"status":"启用",
        "auth":"双模" if i%3==0 else "飞书"})
ROLES=[]
for i,(n,d) in enumerate([("门店进销存","规则配置、执行看板、全量门店数据"),("品牌供应链","触达配置、洞察、全量数据"),
        ("督导","辖区数据、升级待办"),("仓配专员","差异处理、物流排障"),("系统管理员","全部权限")]):
    ROLES.append({"id":f"RL-{1100+i}","name":n,"desc":d,"perms":random.randint(6,26),"users":random.randint(1,6)})

DB.update({"faqs":FAQS,"intents":INTENTS,"prompts":PROMPTS,"bproutes":BPROUTES,"templates":TPL,
           "convs":CONVS,"groups":GROUPS,"pushTasks":PUSH_T,"pushLogs":PUSH_L,"users":USERS,"roles":ROLES})
open('src/data/mock.js','w',encoding='utf-8').write(
 "// 自动生成，勿手改：python3 gen_mock.py + gen_extra.py\nexport const DB = "+json.dumps(DB,ensure_ascii=False,indent=1)+";\n")
print("faqs",len(FAQS),"intents",len(INTENTS),"prompts",len(PROMPTS),"bp",len(BPROUTES),
      "tpl",len(TPL),"convs",len(CONVS),"groups",len(GROUPS),"pushT",len(PUSH_T),"pushL",len(PUSH_L),
      "users",len(USERS),"roles",len(ROLES))
