import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { Product } from '@commerce/types/product'
import '@egjs/react-flicking/dist/flicking.css'
// import HomeAllProductsGrid from '@components/common/HomeAllProductsGrid'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import { useRouter } from 'next/router'
import MainSlider from '@components_new/main/MainSlider'
import React, { useEffect, useMemo, useState } from 'react'
import ProductListSectionTitle from '@components_new/product/ProductListSectionTitle'
import ProductItemNew from '@components_new/product/ProductItemNew'
import CategoriesMenu from '@components_new/main/CategoriesMenu'
import SetLocation from '@components_new/header/SetLocation'
import MobSetLocation from '@components_new/header/MobSetLocation'
import defaultChannel from '@lib/defaultChannel'
import { useCart } from '@framework/cart'
import dynamic from 'next/dynamic'
import CreateYourPizza from '@components_new/product/CreateYourPizza'
import { useUI } from '@components/ui/context'
import getConfig from 'next/config'
import axios from 'axios'
import Head from 'next/head'
import { DateTime } from 'luxon'

const { publicRuntimeConfig } = getConfig()

let webAddress = publicRuntimeConfig.apiUrl

const HalfPizzaNoSSR = dynamic(
  () => import('@components_new/product/CreateYourPizzaCommon'),
  { ssr: false }
)

const CartWithNoSSR = dynamic(
  () => import('@components_new/common/SmallCart'),
  { ssr: false }
)
const MobileCartWithNoSSR = dynamic(
  () => import('@components_new/common/SmallCartMobile'),
  { ssr: false }
)

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
  const { products }: { products: any[] } = await productsPromise
  const { pages } = await pagesPromise
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
    configs,
  } = await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  if (
    typeof configs.site_is_closed != 'undefined' &&
    configs.site_is_closed == 1 &&
    currentCity != null &&
    currentCity.slug
  ) {
    return {
      redirect: {
        destination: `/${currentCity.slug}/closed`,
        permanent: false,
      },
      // props: {},
      // revalidate: 10,
    }
  }
  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
      cities,
      currentCity,
    },
  }
}

interface Category {
  id: string
  name: string
  items: Product[]
}

interface CategoriesType {
  [key: string]: Category
}

export default function Home({
  products,
  categories,
}: {
  products: any[]
  categories: any[]
}) {
  const router = useRouter()
  const { locale } = router
  const [channelName, setChannelName] = useState('chopar')
  const [isStickySmall, setIsStickySmall] = useState(false)
  const {
    setCitiesData,
    activeCity,
    setActiveCity,
    openLocationTabs,
    openMobileLocationTabs,
    setStopProducts,
    locationData,
  } = useUI()

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const hideCreatePizza = (e: any) => {
    if (window.scrollY > 500) {
      setIsStickySmall(true)
    } else {
      setIsStickySmall(false)
    }
  }

  const showLocationTabsController = async () => {
    if (locationData?.terminalData) {
      const { data: terminalStock } = await axios.get(
        `${webAddress}/api/terminals/get_stock?terminal_id=${locationData?.terminalData.id}`
      )

      if (!terminalStock.success) {
        return
      } else {
        setStopProducts(terminalStock.data)
      }
      return
    }

    // setTimeout(() => {
    //   if (window.innerWidth < 768) {
    //     openMobileLocationTabs()
    //   } else {
    //     openLocationTabs()
    //   }
    // }, 400)
  }

  const loadPickupItems = async () => {
    const { data } = await axios.get(
      `${webAddress}/api/terminals/pickup?city_id=${activeCity.id}`
    )
    let res: any[] = []
    let currentTime = DateTime.now()
    // currentTime = currentTime.set({ hour: 23 }) // TODO: remove this line
    let weekDay = currentTime.weekday
    data.data.map((item: any) => {
      if (item.latitude) {
        item.isWorking = false
        if (weekDay >= 1 && weekDay < 6) {
          let openWork = DateTime.fromISO(item.open_work)
          openWork = openWork.set({ day: currentTime.day })
          openWork = openWork.set({ year: currentTime.year })
          openWork = openWork.set({ month: currentTime.month })
          let closeWork = DateTime.fromISO(item.close_work)
          closeWork = closeWork.set({ day: currentTime.day })
          closeWork = closeWork.set({ year: currentTime.year })
          closeWork = closeWork.set({ month: currentTime.month })
          if (closeWork.hour < openWork.hour) {
            closeWork = closeWork.set({ day: currentTime.day + 1 })
          }

          if (currentTime >= openWork && currentTime < closeWork) {
            item.isWorking = true
          }
          item.workTimeStart = openWork.toFormat('HH:mm')
          item.workTimeEnd = closeWork.toFormat('HH:mm')
        } else {
          let openWork = DateTime.fromISO(item.open_weekend)
          openWork = openWork.set({ day: currentTime.day })
          openWork = openWork.set({ year: currentTime.year })
          openWork = openWork.set({ month: currentTime.month })
          let closeWork = DateTime.fromISO(item.close_weekend)
          closeWork = closeWork.set({ day: currentTime.day })
          closeWork = closeWork.set({ year: currentTime.year })
          closeWork = closeWork.set({ month: currentTime.month })
          if (closeWork.hour < openWork.hour) {
            closeWork = closeWork.set({ day: currentTime.day + 1 })
          }

          if (currentTime >= openWork && currentTime < closeWork) {
            item.isWorking = true
          }
          item.workTimeStart = openWork.toFormat('HH:mm')
          item.workTimeEnd = closeWork.toFormat('HH:mm')
        }

        res.push(item)
      }
    })
    if (res.length == 1) {

      const { data: terminalStock } = await axios.get(
        `${webAddress}/api/terminals/get_stock?terminal_id=${res[0].id}`
      )

      setStopProducts(terminalStock.data)
    }
  }

  useEffect(() => {
    getChannel()

    window.addEventListener('scroll', hideCreatePizza)
    showLocationTabsController()

    loadPickupItems()
    return () => {
      window.removeEventListener('scroll', hideCreatePizza)
    }
    // return () => document.removeEventListener('sticky-change', handleKeyUp)
  }, [])

  const readyProducts = useMemo(() => {
    return products
      ? products
          .map((prod: any) => {
            if (prod.half_mode) {
              return null
            }
            if (prod.variants && prod.variants.length) {
              prod.variants = prod.variants.map((v: any, index: number) => {
                if (index === 1) {
                  v.active = true
                } else {
                  v.active = false
                }

                return v
              })
            } else if (prod.items && prod.items.length) {
              prod.items = prod.items.map((item: any) => {
                item.variants = item.variants.map((v: any, index: number) => {
                  if (index === 1) {
                    v.active = true
                  } else {
                    v.active = false
                  }

                  return v
                })

                return item
              })
            }
            return prod
          })
          .filter((prod: any) => prod != null)
      : []
  }, [products])

  const halfModeProds = useMemo(() => {
    return products
      ? products
          .map((prod: any) => {
            if (!prod.half_mode) {
              return null
            }
            if (prod.variants && prod.variants.length) {
              prod.variants = prod.variants.map((v: any, index: number) => {
                if (index === 1) {
                  v.active = true
                } else {
                  v.active = false
                }

                return v
              })
            } else if (prod.items && prod.items.length) {
              prod.items = prod.items.map((item: any) => {
                item.variants = item.variants.map((v: any, index: number) => {
                  if (index === 1) {
                    v.active = true
                  } else {
                    v.active = false
                  }

                  return v
                })

                return item
              })
            }
            return prod
          })
          .filter((prod: any) => prod != null)
      : []
  }, [products])

  return (
    <>
      <div className="container mx-auto">
        <MainSlider />
      </div>
      <CategoriesMenu categories={categories} channelName={channelName} />
      <div className="container mx-auto">
        <div className="">
          <div className="col-span-3 md:hidden">
            {halfModeProds.map((sec: any) => (
              <div
                key={sec.id}
                className="border border-primary mt-4 p-3 mx-4 relative rounded-[15px] bg-white shadow-sm hover:shadow-xl"
              >
                <HalfPizzaNoSSR sec={sec} channelName={channelName} />
              </div>
            ))}
          </div>
          <div className="">
            {readyProducts.map((sec: any) =>
              sec.half_mode ? (
                <div
                  key={`productSectionList_${sec.id}`}
                  className="grid grid-cols-4 md:gap-10 divide-y md:divide-y-0 px-4 md:px-0"
                >
                  <HalfPizzaNoSSR sec={sec} channelName={channelName} />
                </div>
              ) : (
                <div
                  key={`productSectionList_${sec.id}`}
                  id={`productSection_${sec.id}`}
                >
                  <ProductListSectionTitle
                    title={
                      sec?.attribute_data?.name[channelName][locale || 'ru']
                    }
                  />
                  <div className="grid md:grid-cols-4 grid-cols-2  gap-3 px-4 md:px-0 md:space-y-0">
                    {sec.items.map((prod: any) => (
                      <ProductItemNew
                        product={prod}
                        key={prod.id}
                        channelName={channelName}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <MobileCartWithNoSSR />
    </>
  )
}

Home.Layout = Layout
