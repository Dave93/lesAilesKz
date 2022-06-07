import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import defaultChannel from '@lib/defaultChannel'
import { GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { brands, topMenu, footerInfoMenu, socials, cities, currentCity } =
    await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      brands,
      pages,
      topMenu,
      currentCity,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

const OrderWithNoSSR = dynamic(() => import('@components_new/order/Orders'), {
  ssr: false,
})

export default function Order() {
  const [channelName, setChannelName] = useState('chopar')

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  useEffect(() => {
    getChannel()
  }, [])

  return (
    <div>
      <OrderWithNoSSR channelName={channelName} />
    </div>
  )
}

Order.Layout = Layout
