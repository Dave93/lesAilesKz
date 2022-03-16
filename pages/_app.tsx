import 'tailwindcss/tailwind.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'

import 'react-toastify/dist/ReactToastify.css'
import '@egjs/flicking-plugins/dist/arrow.css'
import 'simplebar/dist/simplebar.min.css'
import '@assets/simplebar.css'
import '@assets/fonts.css'

import '@assets/flicking.css'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import '@assets/slick.css'

import { FC, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import { ToastContainer } from 'react-toastify'
import { pwaTrackingListeners } from '../scripts/pwaEventlisteners'
import FacebookPixel from '@components/common/FacebookPixel'
import { useRouter } from 'next/router'

import Script from 'next/script'
import * as fbq from '../lib/fpixel'

const isBrowser = typeof window !== 'undefined'

if (isBrowser) {
  pwaTrackingListeners()
}

const Noop: FC = ({ children }) => <>{children}</>

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop
  const router = useRouter()

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  useEffect(() => {
    // This pageview only triggers the first time (it's important for Pixel to have real information)
    fbq.pageview()

    const handleRouteChange = () => {
      fbq.pageview()
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head />
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', ${fbq.FB_PIXEL_ID});
          `,
        }}
      />
      {/* <FacebookPixel /> */}
      <ManagedUIContext pageProps={pageProps}>
        <Layout pageProps={pageProps}>
          <Component {...pageProps} />
        </Layout>
      </ManagedUIContext>
      <ToastContainer />
    </>
  )
}
