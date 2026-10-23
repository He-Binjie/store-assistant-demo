from playwright.sync_api import sync_playwright
cases=[('早间健康日报','查看完整日报','daily'),('本周执行摘要','查看完整周报','weekly'),
       ('库存健康档位','查看健康明细','stock'),('万元用量（异常）','查看用量明细','usage')]
errs=[]
with sync_playwright() as pw:
    b=pw.chromium.launch(channel="chrome")
    p=b.new_context(viewport={"width":1600,"height":1000}, device_scale_factor=2).new_page()
    p.on("pageerror", lambda e: errs.append(str(e)))
    p.on("console", lambda m: errs.append("C:"+m.text[:90]) if m.type=="error" else None)
    p.goto('http://127.0.0.1:3031/', wait_until="networkidle"); p.wait_for_timeout(1700)
    for scen, link, name in cases:
        p.click(f".scen-btn:has-text('{scen}')"); p.wait_for_timeout(450)
        p.locator(f".pbtn:has-text('{link}')").first.click(); p.wait_for_timeout(700)
        # 只截手机区域
        el = p.locator(".phone")
        el.screenshot(path=f"shots/pg-{name}.png")
        p.locator(".pbtn:has-text('返回')").first.click(); p.wait_for_timeout(350)
    print("errors:", errs[:4] if errs else "none")
    b.close()
