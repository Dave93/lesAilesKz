import Document, { Head, Html, Main, NextScript } from 'next/document'
import { FB_PIXEL_ID } from '../lib/fpixel'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <body className="loading">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
