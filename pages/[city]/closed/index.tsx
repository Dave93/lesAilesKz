import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import {
  GetServerSidePropsContext,
  GetStaticPathsContext,
  GetStaticPropsContext,
} from 'next'
import cookies from 'next-cookies'
import axios from 'axios'
import menuItems from '@commerce/data/newsMenu'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NewsItem from '@components_new/news/NewsItem'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React from 'react'
import Head from 'next/head'

export async function getStaticProps({
  preview,
  locale,
  locales,
  params,
}: GetStaticPropsContext) {
  const config = { locale, locales, queryParams: params }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      currentCity,
      cleanBackground: true,
      cities,
    },
  }
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const config = { locales }
  const cities = await commerce.getAllCities(config)
  const paths = cities.map((city: any) => ({ params: { city: city.slug } }))
  return {
    paths,
    fallback: false,
  }
}

export default function ClosedPage() {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { activeCity } = useUI()
  const { locale, pathname } = router
  return (
    <>
      <div className="flex items-center justify-center">
        <div className="font-semibold mb-10 mt-12 text-4xl text-center">
          По техническим причинам временно наши онлайн сервисы недоступны.{' '}
          <br />
          Приносим свои извинения за доставленные неудобства.
        </div>
      </div>
    </>
  )
}

ClosedPage.Layout = Layout
