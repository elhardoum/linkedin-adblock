(() =>
{
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('src/content/index.js')
  script.type = 'text/javascript'
  ;(document.body || document.head || document.documentElement).appendChild(script)
})()