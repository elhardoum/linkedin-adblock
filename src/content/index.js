(() =>
{
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
})()