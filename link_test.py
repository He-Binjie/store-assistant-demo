import re
from playwright.sync_api import sync_playwright
base='http://127.0.0.1:3031/'
ok=True
def chk(n,c):
    global ok; print(("PASS " if c else "FAIL ")+n); ok=ok and c

def txt(p): return p.inner_text("body")

with sync_playwright() as pw:
    b=pw.chromium.launch(channel="chrome")
    ctx=b.new_context(viewport={"width":1680,"height":1000})
    p=ctx.new_page()
    errs=[]
    p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto(base, wait_until="networkidle"); p.wait_for_timeout(1600)

    m0=re.search(r"临期处置率\s*目标\s*85%.*?(\d+)%", txt(p), re.S)
    m0 = re.search(r"(\d+)\s*%", p.inner_text(".ant-card").split("到货差异")[0]) or None
    rate0 = p.locator(".ant-card").first.inner_text()
    v0 = re.search(r"(\d+)%", rate0).group(1)
    print("   初始临期处置率", v0+"%")

    chk("单页同时有两个面", p.locator(".ant-layout-sider").count()>0 and p.locator(".phone").count()>0)

    # 规则中心 → 详情 → 发布
    p.click("text=规则中心"); p.wait_for_timeout(700)
    p.click("table tbody tr:nth-child(4) button:has-text('详情')"); p.wait_for_timeout(600)
    p.click(".ant-drawer button:has-text('发布')"); p.wait_for_timeout(800)
    chk("手机端收到规则变更", "规则变更" in p.inner_text(".feed"))
    p.click(".ant-drawer-close"); p.wait_for_timeout(500)

    # 手机端提交订货（改量）
    p.fill("#qty","42"); p.click("text=提交订货"); p.wait_for_timeout(600)
    chk("提交后显示已提交", "已提交" in p.inner_text(".feed"))

    # 演示时钟 +2h → 到货
    p.click("button:has-text('+1h')"); p.wait_for_timeout(300)
    p.click("button:has-text('+1h')"); p.wait_for_timeout(800)
    chk("到货提醒出现", "仓已发货" in p.inner_text(".feed"))
    p.click("text=确认收货"); p.wait_for_timeout(500)
    chk("差异卡出现", "少 2 箱" in p.inner_text(".feed"))
    p.click("text=一键上报差异"); p.wait_for_timeout(700)

    # +1h → 临期 → 处置
    p.click("button:has-text('+1h')"); p.wait_for_timeout(900)
    chk("临期预警出现", "临期预警" in p.inner_text(".feed"))
    p.click("text=调拨邻店"); p.wait_for_timeout(900)

    # 回工作台看指标
    p.click("text=工作台"); p.wait_for_timeout(1100)
    v1 = re.search(r"(\d+)%", p.locator(".ant-card").first.inner_text()).group(1)
    print("   操作后临期处置率", v1+"%")
    chk("指标随手机动作变化", v0!=v1)

    p.click("text=事件与处置"); p.wait_for_timeout(800)
    chk("到货差异进入事件表", "到货差异" in txt(p))
    p.click("text=审计日志"); p.wait_for_timeout(800)
    a=txt(p)
    chk("审计记录了门店端动作", "登记处置动作" in a and "上报到货差异" in a)
    chk("无前端异常", not errs)
    if errs: print("   errs:", errs[:3])
    b.close()
print("\n=== ALL PASS ===" if ok else "\n=== 有 FAIL ===")
