from playwright.sync_api import sync_playwright
cases=[('早间健康日报','查看完整日报','daily'),('本周执行摘要','查看完整周报','weekly'),
       ('库存健康档位','查看健康明细','stock'),('万元用量（异常）','查看用量明细','usage')]
with sync_playwright() as pw:
    b=pw.chromium.launch(channel="chrome")
    p=b.new_context(viewport={"width":1600,"height":1000}, device_scale_factor=2).new_page()
    errs=[]; p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto('http://127.0.0.1:3031/', wait_until="networkidle"); p.wait_for_timeout(1600)
    for scen, link, name in cases:
        p.click(f".scen-btn:has-text('{scen}')"); p.wait_for_timeout(400)
        p.locator(f".pbtn:has-text('{link}')").first.click(); p.wait_for_timeout(600)
        # 滚动手机报表主体到底部
        p.evaluate("""() => {
          const el = document.querySelectorAll('.pscreen div');
          for (const d of el) { if (d.scrollHeight > d.clientHeight + 40 && getComputedStyle(d).overflowY === 'auto') {
            d.scrollTop = d.scrollHeight; break; } }
        }""")
        p.wait_for_timeout(500)
        p.locator(".phone").screenshot(path=f"shots/pb-{name}.png")
        p.locator("button:has-text('返回')").first.click(); p.wait_for_timeout(300)
    print("errors:", errs[:3] if errs else "none")
    b.close()
