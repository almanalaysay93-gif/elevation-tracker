from playwright.sync_api import sync_playwright
import urllib.request
GS=urllib.request.urlopen('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js').read().decode()
OB=urllib.request.urlopen('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Observer.min.js').read().decode()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 page=b.new_page(viewport={'width':390,'height':844})
 page.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(status=200,content_type='text/javascript',body=GS if 'gsap.min' in r.request.url else OB))
 page.goto('http://127.0.0.1:5174/',wait_until='domcontentloaded')
 page.wait_for_timeout(900)
 for expected in [1,2,3,4,3,2,1,0]:
  button='Next scene' if expected>int(page.locator('.stage').get_attribute('data-scene')) else 'Previous scene'
  page.locator(f'[aria-label="{button}"]').click()
  page.wait_for_timeout(900)
  actual=int(page.locator('.stage').get_attribute('data-scene'))
  assert actual==expected,(expected,actual)
  assert not page.locator('.st-seam').is_visible()
 print('all five scenes and reverse path passed; bench-to-sign-in same-video swap passed')
 b.close()
