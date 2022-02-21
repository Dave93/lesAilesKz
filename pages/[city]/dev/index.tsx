import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import React, { useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Ru, Uz } from 'react-flags-select'
import { useUI } from '@components/ui/context'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebook,
  faInstagram,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products } = await productsPromise
  const { pages } = await pagesPromise
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
      products,
      categories,
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

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
}

export default function Dev() {
  const router = useRouter()
  const { locale, pathname, asPath } = router
  const { activeCity, cities } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    let path = pathname.replace('[city]', activeCity.slug)
    return router.push(path, path, {
      locale: loc,
    })
  }
  return (
    <div
      className="w-screen bg-secondary md:px-36 px-2 py-4 h-screen fixed overflow-auto"
      style={{
        backgroundImage: `url("/Union.png")`,
        backgroundSize: 'cover',
        position: 'fixed',
      }}
    >
      <div className="flex justify-between items-center">
        <Link href={`/${chosenCity.slug}`} prefetch={false}>
          <Image src="/assets/footer_logo.svg" width={200} height={72} />
        </Link>

        <div className="w-44 h-10 bg-blue rounded-full flex justify-between">
          <a
            className={`${
              locale == 'ru' ? 'bg-white text-secondary ' : 'text-white'
            } font-medium inline-flex items-center px-4 mx-1 my-1 rounded-full w-20`}
            href={`/${locale}${pathname}`}
            onClick={(e) => changeLang(e, 'ru')}
          >
            <Ru className="w-5" />
            <span className="ml-1.5">{localeLabel.ru}</span>
          </a>
          <a
            className={`${
              locale == 'uz' ? 'bg-white text-secondary ' : 'text-white'
            } font-medium inline-flex items-center px-4 mx-1 my-1 rounded-full w-20`}
            href={`/${locale}${pathname}`}
            onClick={(e) => changeLang(e, 'uz')}
          >
            <Uz className="w-5" />
            <span className="ml-1.5">{localeLabel.uz}</span>
          </a>
        </div>
      </div>
      <div className="xl:flex">
        <div>
          <div className="md:mt-20 text-5xl">
            <span className="text-primary">CHOPAR</span> ДАРИТ
          </div>
          <div className="md:text-8xl text-2xl font-black text-white mt-2">
            ПОДАРКИ
          </div>
          <div className="text-white md:w-[400px] mt-10">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            pulvinar ullamcorper lorem tristique suscipit. Vestibulum ut tortor
            tincidunt, dictum risus non, pellentesque erat. Vestibulum efficitur
            sapien odio, at sagittis nulla
          </div>
          <button
            onClick={() => {
              router.push(asPath + '/' + 'start')
            }}
            className="h-32 md:w-[500px] w-full"
            style={{
              backgroundImage: `url("/surpriseButton.png")`,
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="text-white md:text-3xl font-bold">
              ПОЛУЧИТЬ ПОДАРОК
            </div>
          </button>
        </div>

        <div className="ml-auto">
          <img src="/surpriseMainLogo.png" alt="" width="550" />
        </div>
      </div>

      <div className="text-white flex justify-between w-32 items-center h-14">
        <a
          target="_blank"
          href="https://www.instagram.com/choparpizza"
          className="border border-white rounded-full px-2 py-1"
        >
          <FontAwesomeIcon icon={faInstagram} size="lg" />
        </a>
        <a
          target="_blank"
          href="https://www.facebook.com/choparpizza"
          className="border border-white rounded-full px-2 py-1"
        >
          <FontAwesomeIcon icon={faFacebook} size="lg" />
        </a>
        <a
          target="_blank"
          href="#"
          className="border border-white rounded-full px-2 py-1"
        >
          <FontAwesomeIcon icon={faYoutube} size="lg" />
        </a>
      </div>
      <div className="text-white">ПОДПИСЫВАЙТЕСЬ НА НАС</div>
    </div>
  )
}
