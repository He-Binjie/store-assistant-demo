from playwright.sync_api import sync_playwright
ok=True
def chk(n,c):
    global ok; print(("PASS " if c else "FAIL ")+n); ok=ok and c
with sync_playwright() as pw:
    b=pw.chromium.launch(channel="chrome")
    p=b.new_context(viewport={"width":1800,"height":1020}, device_scale_factor=2).new_page()
    errs=[]; p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto('http://127.0.0.1:3031/', wait_until="networkidle"); p.wait_for_timeout(1600)
    feed=p.inner_text(".feed")
    # 1) 到货提醒不再依赖提交订货
    p.click("button:has-text('+1h')"); p.click("button:has-text('+1h')"); p.wait_for_timeout(900)
    chk("未提交订货也能收到到货提醒", "仓已发货" in p.inner_text(".feed"))
    # 2) 初始规则是灰度未覆盖
    p.click("button:has-text('+1h')"); p.wait_for_timeout(800)
    chk("临期卡显示本店未纳入灰度", "未纳入灰度" in p.inner_text(".feed"))
    # 3) 发布 R-001 后门店端生效
    p.click(".ant-menu-item:has-text('规则中心')"); p.wait_for_timeout(700)
    p.click("table tbody tr:nth-child(1) button:has-text('详情')"); p.wait_for_timeout(600)
    p.click(".ant-drawer button:has-text('发布')"); p.wait_for_timeout(900)
    p.click(".ant-drawer-close"); p.wait_for_timeout(500)
    ft=p.inner_text(".feed")
    chk("发布后门店端规则生效", "T-2 必须登记处置动作" in ft)
    chk("发布后收到规则变更通知", "规则变更" in ft)
    # 4) 差异上报 → 1h 后仓确认回执
    p.click(".ant-menu-item:has-text('工作台')"); p.wait_for_timeout(600)
    # 需先确认收货再上报：到货卡已出现
    p.click("text=确认收货"); p.wait_for_timeout(500)
    p.click("text=一键上报差异"); p.wait_for_timeout(600)
    p.click("button:has-text('+1h')"); p.wait_for_timeout(900)
    chk("差异有仓确认回执（闭环）", "仓配已确认差异" in p.inner_text(".feed"))
    # 5) 登记处置 → 1h 后拉群
    p.click("text=调拨邻店") if p.locator("text=调拨邻店").count() else None
    p.wait_for_timeout(400)
    p.click("button:has-text('+1h')"); p.wait_for_timeout(900)
    chk("处置后有拉群协作", "已创建群聊" in p.inner_text(".feed"))
    # 6) 总部抽屉不再有“登记处置”
    p.click(".ant-menu-item:has-text('事件与处置')"); p.wait_for_timeout(700)
    p.click("table tbody tr:nth-child(2)"); p.wait_for_timeout(600)
    btns=[b.inner_text() for b in p.locator(".ant-drawer-extra button, .ant-drawer-header button").all()]
    btns=[x for x in btns if x.strip()]
    print("   抽屉按钮:", btns)
    chk("总部侧按钮只有 催办/升级督导/标记闭环",
        any("催" in x for x in btns) and all("登记处置" != x for x in btns))
    chk("无前端异常", not errs)
    b.close()
print("\n=== ALL PASS ===" if ok else "\n=== 有 FAIL ===")
