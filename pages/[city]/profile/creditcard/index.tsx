import type { GetServerSidePropsContext } from 'next'
import useCustomer from '@framework/customer/use-customer'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import React from 'react'
import UserData from '@components_new/profile/UserData'
import PersonalData from '@components_new/profile/PersonalData'
import Address from '@components_new/profile/Address'
import CreditCardComponent from '@components_new/profile/CreditCardComponent'

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

export default function CreditCard() {
  const { data } = useCustomer()
  return (
    <>
      <UserData />
      <CreditCardComponent />
    </>
  )
}

CreditCard.Layout = Layout
