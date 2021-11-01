import 'tailwindcss/tailwind.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'

import 'react-toastify/dist/ReactToastify.css'
import '@egjs/flicking-plugins/dist/arrow.css'
import 'simplebar/dist/simplebar.min.css'
import '@assets/simplebar.css'

import { FC, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import { ToastContainer } from 'react-toastify'
import { pwaTrackingListeners } from '../scripts/pwaEventlisteners'

const isBrowser = typeof window !== 'undefined'

if (isBrowser) {
  pwaTrackingListeners()
}

const Noop: FC = ({ children }) => <>{children}</>

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  return (
    <>
      <Head />
      <ManagedUIContext pageProps={pageProps}>
        <Layout pageProps={pageProps}>
          <Component {...pageProps} />
        </Layout>
      </ManagedUIContext>
      <ToastContainer />
    </>
  )
}
