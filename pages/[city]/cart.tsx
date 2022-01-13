import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import useCart from '@framework/cart/use-cart'
import Image from 'next/image'
import { XIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/solid'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Hashids from 'hashids'
import axios from 'axios'
import Cookies from 'js-cookie'
import defaultChannel from '@lib/defaultChannel'
import currency from 'currency.js'
import { useUI } from '@components/ui/context'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

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

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

export default function Cart() {
  const [channelName, setChannelName] = useState('chopar')
  const [recomendedItems, setRecomendedItems] = useState([])
  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const { activeCity } = useUI()
  useEffect(() => {
    getChannel()
  }, [])

  const { t: tr } = useTranslation('common')
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  })

  const [isCartLoading, setIsCartLoading] = useState(false)

  const { register, handleSubmit } = useForm()
  const onSubmit = (data: Object) => console.log(JSON.stringify(data))

  const router = useRouter()
  const { locale } = router

  const hashids = new Hashids(
    'basket',
    15,
    'abcdefghijklmnopqrstuvwxyz1234567890'
  )

  const fetchRecomendedItems = async () => {
    if (cartId) {
      const { data } = await axios.get(
        `${webAddress}/api/baskets/related/${cartId}`
      )
      if (data.data && data.data.length) {
        setRecomendedItems(data.data)
      }
    }
  }

  const [configData, setConfigData] = useState({} as any)
  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(`${webAddress}/api/configs/public`)
      configData = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      configData = sessionStorage.getItem('configData')
    }

    try {
      configData = Buffer.from(configData, 'base64')
      configData = configData.toString('ascii')
      configData = JSON.parse(configData)
      setConfigData(configData)
    } catch (e) { }
  }

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const destroyLine = async (lineId: string) => {
    setIsCartLoading(true)
    await setCredentials()
    const { data } = await axios.delete(
      `${webAddress}/api/basket-lines/${hashids.encode(lineId)}`
    )
    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      }

      await mutate(basketResult, false)
      setIsCartLoading(false)
    }
  }

  const decreaseQuantity = async (line: any) => {
    if (line.quantity == 1) {
      return
    }
    setIsCartLoading(true)
    await setCredentials()
    const { data: basket } = await axios.put(
      `${webAddress}/api/v1/basket-lines/${hashids.encode(line.id)}/remove`,
      {
        quantity: 1,
      }
    )

    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      }

      await mutate(basketResult, false)
      setIsCartLoading(false)
    }
  }

  const increaseQuantity = async (lineId: string) => {
    setIsCartLoading(true)
    await setCredentials()
    const { data: basket } = await axios.post(
      `${webAddress}/api/v1/basket-lines/${hashids.encode(lineId)}/add`,
      {
        quantity: 1,
      }
    )

    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      }

      await mutate(basketResult, false)
      setIsCartLoading(false)

      console.log(basket)
    }
  }

  const addToBasket = async (selectedProdId: number) => {
    let modifierProduct: any = null
    let selectedModifiers: any = null
    await setCredentials()

    let basketId = localStorage.getItem('basketId')
    const otpToken = Cookies.get('opt_token')

    let basketResult = {}

    if (basketId) {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines`,
        {
          basket_id: basketId,
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: null,
              additionalSale: true,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      basketResult = {
        id: basketData.data.id,
        createdAt: '',
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
      }
    } else {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets`,
        {
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: null,
              additionalSale: true,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      localStorage.setItem('basketId', basketData.data.encoded_id)
      basketResult = {
        id: basketData.data.id,
        createdAt: '',
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
      }
    }

    await mutate(basketResult, false)
    fetchRecomendedItems()
  }

  const goToCheckout = (e: any) => {
    e.preventDefault()
    router.push(`/${activeCity.slug}/order/`)
  }

  const clearBasket = async () => {
    if (cartId) {
      const { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}/clear`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      }

      await mutate(basketResult, false)
    }
  }

  useEffect(() => {
    fetchConfig()
    // fetchRecomendedItems()
    return
  }, [])

  const isWorkTime = useMemo(() => {
    let currentHour = new Date().getHours()
    if (
      configData.workTimeStart <= currentHour ||
      configData.workTimeEnd > currentHour
    )
      return true
    return false
  }, [configData])

  if (!isWorkTime) {
    return (
      <div className="bg-white flex py-20 text-xl text-yellow font-bold px-10">
        <div>
          {tr('isNotWorkTime')}{' '}
          {locale == 'uz' ? configData.workTimeUz : configData.workTimeRu}
        </div>
      </div>
    )
  }

  const settings = {
    infinite: false,
    centerPadding: '20px',
    arrows: true,
    slidesToShow: 6,
    swipeToSlide: true,
    speed: 500,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  }

  return (
    <>
      {isCartLoading && (
        <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
          <svg
            className="animate-spin text-yellow h-14"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      {isEmpty && (
        <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm pb-4">
          {/* <img src="/cart_empty.png" width={130} height={119} /> */}
          <div className="text-2xl">{tr('basket_empty')}</div>
          <button
            className="bg-primary text-white p-3 mt-4 rounded-xl"
            onClick={() => router.push(`/${activeCity.slug}`)}
          >
            {tr('back_to_menu')}
          </button>
        </div>
      )}
      {!isEmpty && (
        <>
          <div className="md:p-0 p-5 md:rounded-2xl text-xl mt-5 bg-white md:mb-10">
            <div className="flex justify-between items-center">
              <div className="text-3xl">{tr('basket')} </div>
              {/* <div className="text-gray-400 text-sm flex cursor-pointer">
            Очистить всё <TrashIcon className=" w-5 h-5 ml-1" />
          </div> */}
            </div>
            <div className="mt-10 space-y-3">
              {data &&
                data?.lineItems.map((lineItem: any) => (
                  <div
                    className="flex md:justify-between md:items-center border-b pb-3"
                    key={lineItem.id}
                  >
                    <div className="flex  md:items-center text-center">
                      {lineItem.child &&
                        lineItem.child.length &&
                        lineItem.child[0].variant?.product?.id !=
                        lineItem?.variant?.product?.box_id ? (
                        <div className="h-28 w-28 flex relative">
                          <div className="w-12 relative overflow-hidden">
                            <div>
                              <Image
                                src={
                                  lineItem?.variant?.product?.assets?.length
                                    ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                    : '/no_photo.svg'
                                }
                                width="100"
                                height="100"
                                layout="fixed"
                                className="absolute rounded-xl w-max"
                              />
                            </div>
                          </div>
                          <div className="w-12 relative overflow-hidden">
                            <div className="absolute right-0">
                              <Image
                                src={
                                  lineItem?.child[0].variant?.product?.assets
                                    ?.length
                                    ? `${webAddress}/storage/${lineItem?.child[0].variant?.product?.assets[0]?.location}/${lineItem?.child[0].variant?.product?.assets[0]?.filename}`
                                    : '/no_photo.svg'
                                }
                                width="100"
                                height="100"
                                layout="fixed"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="md:w-24 md:h-24 flex relative mr-4 w-max">
                          <Image
                            src={
                              lineItem?.variant?.product?.assets?.length
                                ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                : '/no_photo.svg'
                            }
                            width={120}
                            height={120}
                            className="rounded-xl"
                          />
                        </div>
                      )}
                      <div className="md:ml-7 ml-1 space-y-2 md:w-72 md:text-left md:block hidden">
                        <div className="md:text-xl font-medium text-base">
                          {lineItem.child && lineItem.child.length > 1
                            ? `${lineItem?.variant?.product?.attribute_data
                              ?.name[channelName][locale || 'ru']
                            } + ${lineItem?.child
                              .filter(
                                (v: any) =>
                                  lineItem?.variant?.product?.box_id !=
                                  v?.variant?.product?.id
                              )
                              .map(
                                (v: any) =>
                                  v?.variant?.product?.attribute_data?.name[
                                  channelName
                                  ][locale || 'ru']
                              )
                              .join(' + ')}`
                            : lineItem?.variant?.product?.attribute_data?.name[
                            channelName
                            ][locale || 'ru']}
                        </div>
                      </div>
                    </div>
                    <div className="md:flex md:space-x-20 items-center hidden">
                      <div className="md:text-xl text-base md:font-medium text-center w-max mx-auto">
                        {currency(lineItem.total, {
                          pattern: '# !',
                          separator: ' ',
                          decimal: '.',
                          symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                          precision: 0,
                        }).format()}
                        <div className="text-xs">Цена за 1 шт</div>
                      </div>
                      <div className="md:w-32 w-24 md:ml-14 bg-gray-200 rounded-lg flex items-center p-1">
                        <div className="items-center flex justify-around bg-white text-gray-500 rounded-md p-1 ">
                          <MinusIcon
                            className="cursor-pointer w-4 "
                            onClick={() => decreaseQuantity(lineItem)}
                          />
                        </div>
                        <div className="flex-grow text-center text-gray-500 font-medium">
                          {lineItem.quantity}
                        </div>
                        <div className=" items-center flex justify-around bg-white text-gray-500 rounded-md p-1">
                          <PlusIcon
                            className="cursor-pointer w-4 "
                            onClick={() => increaseQuantity(lineItem.id)}
                          />
                        </div>
                      </div>
                      <div className="m-auto md:font-medium md:text-xl text-base w-max">
                        {lineItem.child && lineItem.child.length
                          ? currency(
                            (+lineItem.total + +lineItem.child[0].total) *
                            lineItem.quantity,
                            {
                              pattern: '# !',
                              separator: ' ',
                              decimal: '.',
                              symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                              precision: 0,
                            }
                          ).format()
                          : currency(lineItem.total * lineItem.quantity, {
                            pattern: '# !',
                            separator: ' ',
                            decimal: '.',
                            symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                            precision: 0,
                          }).format()}
                      </div>
                      <div className="bg-gray-200 p-2 rounded-md w-max md:block hidden">
                        <XIcon
                          className="cursor-pointer text-gray-400 w-5 "
                          onClick={() => destroyLine(lineItem.id)}
                        />
                      </div>
                    </div>
                    <div className="md:hidden w-full space-y-3">
                      <div className="flex justify-between">
                        <div className="md:text-xl font-medium text-base">
                          {lineItem.child && lineItem.child.length > 1
                            ? `${lineItem?.variant?.product?.attribute_data
                              ?.name[channelName][locale || 'ru']
                            } + ${lineItem?.child
                              .filter(
                                (v: any) =>
                                  lineItem?.variant?.product?.box_id !=
                                  v?.variant?.product?.id
                              )
                              .map(
                                (v: any) =>
                                  v?.variant?.product?.attribute_data?.name[
                                  channelName
                                  ][locale || 'ru']
                              )
                              .join(' + ')}`
                            : lineItem?.variant?.product?.attribute_data?.name[
                            channelName
                            ][locale || 'ru']}
                        </div>
                        <div className="bg-gray-200 p-1 rounded-md w-max md:hidden">
                          <XIcon
                            className="cursor-pointer text-gray-400 w-5 "
                            onClick={() => destroyLine(lineItem.id)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="md:text-xl text-base md:font-medium">
                          {currency(lineItem.total, {
                            pattern: '# !',
                            separator: ' ',
                            decimal: '.',
                            symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                            precision: 0,
                          }).format()}
                          <div className="text-xs">Цена за 1 шт</div>
                        </div>
                        <div className="md:w-32 w-24 md:ml-14 bg-gray-200 rounded-lg flex items-center p-1">
                          <div className="items-center flex justify-around bg-white text-gray-500 rounded-md p-1 ">
                            <MinusIcon
                              className="cursor-pointer w-4 "
                              onClick={() => decreaseQuantity(lineItem)}
                            />
                          </div>
                          <div className="flex-grow text-center text-gray-500 font-medium">
                            {lineItem.quantity}
                          </div>
                          <div className=" items-center flex justify-around bg-white text-gray-500 rounded-md p-1">
                            <PlusIcon
                              className="cursor-pointer w-4 "
                              onClick={() => increaseQuantity(lineItem.id)}
                            />
                          </div>
                        </div>
                      </div>
                      <div></div>

                      <div className="ml-auto md:font-medium md:text-xl text-base w-max">
                        {lineItem.child && lineItem.child.length
                          ? currency(
                            (+lineItem.total + +lineItem.child[0].total) *
                            lineItem.quantity,
                            {
                              pattern: '# !',
                              separator: ' ',
                              decimal: '.',
                              symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                              precision: 0,
                            }
                          ).format()
                          : currency(lineItem.total * lineItem.quantity, {
                            pattern: '# !',
                            separator: ' ',
                            decimal: '.',
                            symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                            precision: 0,
                          }).format()}
                      </div>
                      <div className="bg-gray-200 p-2 rounded-md w-max md:block hidden">
                        <XIcon
                          className="cursor-pointer text-gray-400 w-5 "
                          onClick={() => destroyLine(lineItem.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {recomendedItems.length > 0 && (
            <div className="md:rounded-2x my-14 p-5 md:p-0">
              <div className="text-3xl mb-5">
                {tr('recomended_to_your_order')}
              </div>
              <div className="mt-5 shadow-md rounded-2xl">
                <Slider {...settings}>
                  {recomendedItems.map((item: any) => (
                    <div className="rounded-2xl px-5 py-2 text-center m-2">
                      <div className="flex-grow flex items-center flex-col justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            width={250}
                            height={250}
                            alt={
                              item?.attribute_data?.name[channelName][
                              locale || 'ru'
                              ]
                            }
                            className="transform motion-safe:group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <img
                            src="/no_photo.svg"
                            width={250}
                            height={250}
                            alt={
                              item?.attribute_data?.name[channelName][
                              locale || 'ru'
                              ]
                            }
                            className="rounded-full transform motion-safe:group-hover:scale-105 transition duration-500"
                          />
                        )}
                        <div className="text-lg md:px-7 leading-5 font-bold mb-3">
                          {
                            item?.attribute_data?.name[channelName][
                            locale || 'ru'
                            ]
                          }
                        </div>
                      </div>
                      <div className="md:text-lg md:px-7 leading-5 font-bold mb-3">
                        Крылышки в соусе
                      </div>
                      <div
                        className="rounded-xl bg-primary text-white font-normal py-1"
                        onClick={() => addToBasket(item.id)}
                      >
                        {currency(parseInt(item.price, 0) || 0, {
                          pattern: '# !',
                          separator: ' ',
                          decimal: '.',
                          symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                          precision: 0,
                        }).format()}
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}
          <div className="rounded-2xl md:bg-gray-200 md:flex items-center justify-between md:px-10 px-5 md:py-16">
            {/* <div className="md:w-72">
                <form onSubmit={handleSubmit(onSubmit)} className="relative">
                  <input
                    type="text"
                    placeholder={tr('promocode')}
                    {...register('discount_code')}
                    className="bg-gray-100 focus:outline-none outline-none px-5 py-2 rounded-full text-lg w-full"
                  />
                  <button className="absolute focus:outline-none outline-none right-1 top-1">
                    <Image src="/discount_arrow.png" width={37} height={37} />
                  </button>
                </form>
              </div> */}
            <div className="flex font-bold items-center justify-between bg-gray-200 rounded-xl p-4 md:p-0">
              <div className="text-lg">{tr('basket_order_price')}</div>
              <div className="ml-7 md:text-3xl text-xl text-medium">
                {currency(data.totalPrice, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                  precision: 0,
                }).format()}
              </div>
            </div>
            <button
              className={`bg-green-600 md:text-xl rounded-2xl text-white md:w-64 w-full py-5 px-12 font-medium md:mt-0 mt-5 `}
              onClick={goToCheckout}
            >
              {tr('checkout')}
            </button>
          </div>
          <style global jsx>{`
        .slick-prev:before,
        .slick-next:before {
          color: #fc004a;
        }
        .slick-prev:before {
          font-size: 33px;
          margin-left: -48px;
        }
        .slick-next:before {
          font-size: 33px;
          margin-left: 24px;
        }
        .slick-track {
          display: flex;
        }
        .slick-track .slick-slide {
          display: flex;
          height: auto;
          align-items: center;
          justify-content: center;
        }
        .slick-track .slick-slide > div {
          height: 100%;
        }

        /* the slides */
        .slick-slide {
            margin: 0 5px;
        }
        /* the parent */
        .slick-list {
            margin: 0 -10px;
        }
      `}</style>
        </>
      )
      }
    </>
  )
}

Cart.Layout = Layout
