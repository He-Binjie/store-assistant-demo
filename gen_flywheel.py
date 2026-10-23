# -*- coding: utf-8 -*-
"""追加：知识缺口池 / 功能使用 / 痛点标签 / 触达执行数据"""
import json, random
random.seed(20261026)
src=open('src/data/mock.js',encoding='utf-8').read()
DB=json.loads(src[src.index('export const DB = ')+len('export const DB = '):].rstrip().rstrip(';'))
STORES=DB['stores']

GAPS=[]
raw=[("下午订货什么时候能到","订货时效",3),("少件了怎么补","到货差异",2),("临期能不能退货","效期处置",4),
     ("盘点差异谁负责","库存盘点",2),("调拨怎么申请","调拨协作",3),("加单要提前多久","紧急加单",2),
     ("报损流程要走几步","报损流程",3),("你们公司年会什么时候开","非业务",1),("新人怎么入职系统","非业务",1),
     ("司机电话在哪看","物流查询",2),("签收后还能改吗","到货验收",2),("效期怎么算天数","效期处置",3)]
for i,(q,cluster,cnt) in enumerate(raw):
    GAPS.append({"id":f"GAP-{100+i}","q":q,"cluster":cluster,"count":cnt*random.randint(2,9),
        "stores":random.randint(1,9),"firstSeen":f"2026-10-{random.randint(12,20):02d}",
        "status":random.choice(["待补知识","待补知识","已生成草稿","已闭环"]),
        "hit":random.randint(0,12)})

FEATURES=[("查订单",1840),("物流查询",1420),("FAQ 问答",960),("订订货建议",780),("临期处置",520),
          ("到货验收",630),("库存快照",410),("万元用量",180),("转人工",240),("投诉",90)]
PAINS=[("临期焦虑，怕报损担责",88),("到货不准确，验收靠猜",74),("订货量没依据，凭经验",69),
       ("盘点差异说不清",52),("追物流要打电话",41)]

BROADCAST={"today":{"sent":142,"delivered":138,"read":86,"dv":3},"week":{"sent":986,"delivered":962,"read":598,"dv":24},
  "byTask":[{"task":"早间健康日报","sent":21,"read":18,"ctr":"86%"},
            {"task":"临期批量提醒","sent":34,"read":22,"ctr":"65%"},
            {"task":"周度执行摘要","sent":8,"read":6,"ctr":"75%"},
            {"task":"订货截止提醒","sent":79,"read":40,"ctr":"51%"}]}
FLY=[{"d":"10-16","miss":34,"gap":22,"fixed":14,"hit":0.61},{"d":"10-17","miss":31,"gap":20,"fixed":16,"hit":0.63},
     {"d":"10-18","miss":29,"gap":18,"fixed":15,"hit":0.65},{"d":"10-19","miss":26,"gap":16,"fixed":17,"hit":0.68},
     {"d":"10-20","miss":24,"gap":15,"fixed":18,"hit":0.72},{"d":"10-21","miss":22,"gap":13,"fixed":16,"hit":0.75},
     {"d":"10-22","miss":19,"gap":11,"fixed":12,"hit":0.78}]
DB.update({"gaps":GAPS,"features":[{"name":n,"count":c} for n,c in FEATURES],
           "pains":[{"name":n,"score":s} for n,s in PAINS],"broadcast":BROADCAST,"flywheel":FLY})
open('src/data/mock.js','w',encoding='utf-8').write(
 "// 自动生成，勿手改：python3 gen_mock.py + gen_extra.py + gen_orders.py + gen_flywheel.py\nexport const DB = "+json.dumps(DB,ensure_ascii=False,indent=1)+";\n")
print("gaps",len(GAPS),"features",len(FEATURES),"flywheel",len(FLY))
