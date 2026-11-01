from playwright.sync_api import sync_playwright
import urllib.request
GS=urllib.request.urlopen('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js').read().decode()
OB=urllib.request.urlopen('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Observer.min.js').read().decode()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 for width,height,label in [(1440,900,'desktop'),(390,844,'mobile')]:
  page=b.new_page(viewport={'width':width,'height':height})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(status=200,content_type='text/javascript',body=GS if 'gsap.min' in r.request.url else OB))
  page.goto('http://127.0.0.1:5173/',wait_until='domcontentloaded')
  page.wait_for_timeout(1200)
  assert page.evaluate('!!window.gsap')
  page.locator('[aria-label="Next scene"]').click()
  page.wait_for_timeout(350)
  snap=page.evaluate("() => ({scene:document.querySelector('.stage').dataset.scene,clip:getComputedStyle(document.querySelector('[data-clip=hero-row]')).clipPath,opacity:getComputedStyle(document.querySelector('[data-clip=hero-row]')).opacity,seam:getComputedStyle(document.querySelector('.st-seam')).backgroundColor})")
  page.screenshot(path=f'.buildme/qa/landing/morph-{label}-mid.png')
  assert snap['clip']!='none' and snap['opacity']=='1',snap
  page.wait_for_timeout(650)
  assert page.locator('.stage').get_attribute('data-scene')=='1'
  assert not page.locator('.st-seam').is_visible()
  page.screenshot(path=f'.buildme/qa/landing/morph-{label}-final.png')
  page.locator('[aria-label="Previous scene"]').click()
  page.wait_for_timeout(850)
  assert page.locator('.stage').get_attribute('data-scene')=='0'
  print(label,'forward/reverse passed',snap,'page errors',errors)
  page.close()
 page=b.new_page(viewport={'width':390,'height':844})
 page.add_init_script("localStorage.setItem('elev-motion','off')")
 page.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(status=200,content_type='text/javascript',body=GS if 'gsap.min' in r.request.url else OB))
 page.goto('http://127.0.0.1:5173/',wait_until='domcontentloaded')
 page.wait_for_timeout(500)
 page.locator('[aria-label="Next scene"]').click()
 assert page.locator('.stage').get_attribute('data-scene')=='1'
 print('calm mode instant navigation passed')
 page.screenshot(path='.buildme/qa/landing/morph-mobile-calm.png')
 b.close()

