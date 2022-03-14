import { Router } from 'next/router'
import React from 'react'

function FacebookPixel() {
  React.useEffect(() => {
    import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init('326881462813145')
        ReactPixel.pageView()

        Router.events.on('routeChangeComplete', () => {
          ReactPixel.pageView()
        })
      })
  })
  return null
}

export default FacebookPixel
