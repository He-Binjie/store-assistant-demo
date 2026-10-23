# -*- coding: utf-8 -*-
import json, random
random.seed(20261025)
src=open('src/data/mock.js',encoding='utf-8').read()
DB=json.loads(src[src.index('export const DB = ')+len('export const DB = '):].rstrip().rstrip(';'))
STORES=DB['stores']; MATS=DB['materials']
SKUS=[("鲜奶","L-1001"),("燕麦奶","L-1002"),("厚椰乳","L-1003"),("珍珠","S-3003"),("杯盖（大）","P-4001"),("杯身（大）","P-4002")]
STATUS=[("待发货","wait"),("已发货","ship"),("派送中","onway"),("已签收","done"),("已取消","cancel")]
orders=[]
for i in range(9):
    st=STORES[i%len(STORES)]
    stt=STATUS[i%5]
    subs=[]
    for k in range(random.randint(1,3)):
        sk=random.choice(SKUS)
        subs.append({"subId":f"DN20261022{(i*10+k):04d}","sku":sk[1],"name":sk[0],
                     "qty":random.randint(2,40),"unit":"箱","amount":round(random.uniform(120,3200),2),
                     "status":random.choice(STATUS)[0]})
    orders.append({"mainId":f"ORD20261022{(1000+i*13):04d}","store":st["name"],"storeCode":st["code"],
        "created":f"2026-10-{random.randint(18,22):02d} {random.randint(8,18):02d}:{random.randint(0,59):02d}",
        "status":stt[0],"statusKey":stt[1],"subCount":len(subs),"amount":round(sum(s["amount"] for s in subs),2),
        "subs":subs,
        "driver":{"name":random.choice(["王师傅","李师傅","赵师傅"]),"phone":"138****"+str(random.randint(1000,9999)),
                  "plate":"沪A·"+str(random.randint(10000,99999))},
        "logistics":[{"at":"10-21 18:20","node":"已出库 · 华东仓配一组","done":True},
                     {"at":"10-22 06:40","node":"到达转运中心（沪北）","done":True},
                     {"at":"10-22 13:05","node":"派送中 · 距门店 6.2 公里","done":i%5>=2},
                     {"at":"—","node":"已签收","done":stt[1]=="done"}],
        "eta":"14:00"})
# 补一条“非店长管辖”订单（用于多店场景）
faqs={
 "hit":[{"q":"下午四点以后下单今天能到吗","a":"不能。当日截单时间为 15:30，15:30 后下单顺延至次日配送。急单可走「紧急加单」并联系督导确认运力。","src":"FAQ-103 · 订货时效","score":"0.91"},
        {"q":"临期物料怎么处理","a":"批次效期剩 2 天内，需在飞书登记处置动作：调拨邻店 / 促销消化 / 报损登记。未登记满 4 小时自动升级督导。","src":"FAQ-100 · 效期管理","score":"0.88"}],
 "miss":[{"q":"你们公司年会什么时候开","a":"这个问题我暂时没有可依据的标准答案，已记录为待补充知识（编号 KB-20261022-03）。要我帮你转人工吗？","src":"未命中 · 已进入知识缺口清单","score":"—"}],
}
DB.update({"orders":orders,"faqReplies":faqs})
open('src/data/mock.js','w',encoding='utf-8').write(
 "// 自动生成，勿手改：python3 gen_mock.py + gen_extra.py + gen_orders.py\nexport const DB = "+json.dumps(DB,ensure_ascii=False,indent=1)+";\n")
print("orders",len(orders),"subs",sum(len(o['subs']) for o in orders))
