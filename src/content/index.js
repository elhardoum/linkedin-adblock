(() =>
{
  // please add more to support more locales
  const PROMOTED_NOTICES = [
    'Promoted',
    'Promocionado',
    'Post sponsorisé',
    'प्रमोट किया गया',
    'الترويج',
    'Post sponsorizzato',
    'プロモーション',
    '프로모션',
  ]

  const xhrOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function()
  {
    const filterActivies = ({included=[]}) =>
    {
      const style = document.createElement('style')
          , hideUrns = []

      style.type = 'text/css'

      included.forEach(entity =>
      {
        if ( ! (entity.updateMetadata || {}).urn )
          return

        if ( ! (entity.updateMetadata.trackingData || {}).sponsoredTracking )
          return

        hideUrns.push(`[data-id="${entity.updateMetadata.urn}"]`)
      })

      if ( hideUrns.length ) {
        style.textContent = hideUrns.join(',') + '{display:none!important}'
        document.head.appendChild(style)
      }
    }

    this.addEventListener('load', function()
    {
      if ( -1 != this.responseURL.indexOf('api/feed/updatesV2') ) {
        if ( this.response instanceof Blob ) {
          const reader = new FileReader()
          reader.onload = () => filterActivies(JSON.parse(reader.result))
          reader.readAsText(this.response)
        } else {
          filterActivies(JSON.parse(this.response))
        }
      }
    })

    return xhrOpen.apply(this, arguments)
  }

  const xquery = (query) =>
  {
    const elems = [], nodesSnapshot = document.evaluate(query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null )

    for ( let i=0 ; i < nodesSnapshot.snapshotLength; i++ ) {
      elems.push( nodesSnapshot.snapshotItem(i) )
    }

    return elems
  }

  // server-rendered
  new MutationObserver(() =>
  {
    PROMOTED_NOTICES.map(message =>
    {
      xquery(`//div[@data-id]//span[contains(@class, 'feed-shared-actor__sub-description')][text()='${message}']`)
        .concat(xquery(`//div[@data-id]//span[contains(@class, 'feed-shared-actor__description')][text()='${message}']`))
        .map(elem =>
        {
          const parent = elem.closest('[data-id]')
          parent && parent.remove()
        })
    })
  }).observe(document, {
    subtree: true,
    childList: true,
  })
})()