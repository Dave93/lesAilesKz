import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next'
import useCustomer from '@framework/customer/use-customer'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import React from 'react'
import UserData from '@components_new/profile/UserData'
import Bonuses from '@components_new/profile/Bonuses'

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

export default function Profile() {
  const { data } = useCustomer()
  return (
    <>
      <UserData />
      {/* <Bonuses /> */}
    </>
  )
}

Profile.Layout = Layout
