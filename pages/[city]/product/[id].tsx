import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import currency from 'currency.js'
import { PlusIcon, XIcon } from '@heroicons/react/solid'
import { ChevronDownIcon, MinusIcon } from '@heroicons/react/outline'
import { Layout } from '@components/common'
import useTranslation from 'next-translate/useTranslation'
import { useMemo, useRef, useState } from 'react'
import { useUI } from '@components/ui/context'
import Cookies from 'js-cookie'
import axios from 'axios'
import getConfig from 'next/config'
import Hashids from 'hashids'
import { useCart } from '@framework/cart'
import { useRouter } from 'next/router'

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

  const res = await fetch('https://api.lesailes.uz/api/products/' + query.id)
  const data = await res.json()
  const product = data.data

  return {
    props: {
      product,
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

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

type Product = {
  product: Product
  channelName: string
}

export default function Product({
  product,
  channelName,
}: {
  product: any
  channelName: string
}) {
  const { t: tr } = useTranslation('common')
  const [store, updateStore] = useState(product)
  const [isLoadingBasket, setIsLoadingBasket] = useState(false)
  const [open, setOpen] = useState(false)
  const cancelButtonRef = useRef(null)
  const [quantity, setQuantity] = useState(1)
  const { stopProducts } = useUI()

  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }

  const hashids = new Hashids(
    'basket',
    15,
    'abcdefghijklmnopqrstuvwxyz1234567890'
  )
  const { mutate, data, isEmpty } = useCart({
    cartId,
  })
  const [activeModifiers, setActiveModifiers] = useState([] as number[])
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  const router = useRouter()
  const { locale } = router
  const [isCartLoading, setIsCartLoading] = useState(false)

  const isProductInStop = useMemo(() => {
    if (store.variants && store.variants.length) {
      let selectedVariant = store.variants.find((v: any) => v.active == true)
      let selectedProdId = selectedVariant.id
      if (stopProducts.includes(selectedProdId)) {
        return true
      }
    } else {
      let selectedProdId = +store.id
      if (stopProducts.includes(selectedProdId)) {
        return true
      }
    }
    return false
  }, [stopProducts, store])

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

  const addToBasket = async (mods: any = null) => {
    setIsLoadingBasket(true)
    await setCredentials()

    let selectedProdId = 0
    // if (store.variants && store.variants.length) {
    //   let selectedVariant = store.variants.find((v: any) => v.active == true)
    //   selectedProdId = selectedVariant.id
    //   selectedProdId = +store.id
    // } else {
    selectedProdId = +store.id
    // }

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
              quantity: quantity,
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
              quantity: quantity,
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
    setIsLoadingBasket(false)
    setQuantity(1)
  }

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    if (isProductInStop) {
      return
    }
    event.preventDefault() // prevent the page location from changing
    // setAddToCartInProgress(true) // disable the add to cart button until the request is finished

    addToBasket()
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
    }
  }

  const modalDecreaseQuantity = (q: number) => {
    if (q == 1) {
      return
    } else {
      q--
    }
    setQuantity(q)
  }
  const modalIncreaseQuantity = (q: number) => {
    q++
    setQuantity(q)
  }

  const popapAddToBasket = () => {
    addToBasket()
    setOpen(false)
  }

  const productLine = useMemo(() => {
    if (!isEmpty) {
      return data.lineItems.find(
        (lineItem: any) => lineItem?.variant?.product?.id == store.id
      )
    }
    return null
  }, [data])

  let mobWidthImg = 390
  let mobHeightImg = 390

  if (typeof window !== 'undefined') {
    if (window.innerWidth < 768) {
      mobWidthImg = 250
      mobHeightImg = 250
    }
  }

  console.log(store?.attribute_data?.name)
  return (
    <div>
      <div className="py-12">
        <div className="md:flex mx-auto overflow-y-auto md:w-max">
          <div>
            <img
              src={store.image}
              width={mobWidthImg}
              height={mobHeightImg}
              alt={store?.attribute_data?.name['chopar'][locale || 'ru']}
              className="m-auto transform motion-safe:group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="flex flex-col md:ml-8 mx-4 md:mx-0">
            <div className="font-bold text-2xl mt-10 md:mt-0">
              {store?.attribute_data?.name['chopar'][locale || 'ru']}
            </div>
            <div
              className="max-w-md mt-7 text-xs md:text-xl flex-grow"
              dangerouslySetInnerHTML={{
                __html: store?.attribute_data?.description
                  ? store?.attribute_data?.description['chopar'][locale || 'ru']
                  : '',
              }}
            ></div>
            <div className="flex items-center justify-between pt-5">
              <div className=" font-bold text-2xl md:text-3xl">
                {currency(store.price, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                  precision: 0,
                }).format()}
              </div>
              {productLine ? (
                <div className="w-36 ml-14 bg-gray-200 rounded-lg flex items-center p-1">
                  <div className="items-center flex justify-around bg-white text-gray-500 rounded-md p-1 ">
                    <MinusIcon
                      className="cursor-pointer w-4 unselectable"
                      onClick={() => decreaseQuantity(productLine)}
                    />
                  </div>
                  <div className="flex-grow text-center text-gray-500 font-medium unselectable">
                    {productLine.quantity}
                  </div>
                  <div className=" items-center flex justify-around bg-white text-gray-500 rounded-md p-1">
                    <PlusIcon
                      className="cursor-pointer w-4 unselectable "
                      onClick={() => increaseQuantity(productLine.id)}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-36 ml-14 bg-gray-200 rounded-lg flex items-center p-1">
                  <div className="items-center flex justify-around bg-white text-gray-500 rounded-md p-1 ">
                    <MinusIcon
                      className="cursor-pointer w-4 unselectable "
                      onClick={() => modalDecreaseQuantity(quantity)}
                    />
                  </div>
                  <div className="flex-grow text-center text-gray-500 font-medium unselectable">
                    {quantity}
                  </div>
                  <div className=" items-center flex justify-around bg-white text-gray-500 rounded-md p-1">
                    <PlusIcon
                      className="cursor-pointer w-4 unselectable"
                      onClick={() => modalIncreaseQuantity(quantity)}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="md:ml-auto md:w-96 hidden md:block">
              {productLine ? (
                <button className="text-lg font-medium md:bg-primary bg-green-500 rounded-lg py-5 px-32 text-white mt-8 outline-none w-full unselectable">
                  Добавлено
                </button>
              ) : (
                <button
                  className="text-lg font-medium md:bg-primary bg-green-500 rounded-lg py-5 px-32 text-white mt-8 outline-none w-full unselectable"
                  onClick={popapAddToBasket}
                >
                  В корзину
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="bottom-3 fixed left-0 md:hidden mx-3 right-0 w-auto">
          {productLine ? (
            <button className="text-lg font-medium md:bg-primary bg-green-500 rounded-lg py-5 px-32 text-white mt-8 outline-none w-full unselectable">
              Добавлено
            </button>
          ) : (
            <button
              className="text-lg font-medium md:bg-primary bg-green-500 rounded-lg py-5 px-32 text-white mt-8 outline-none w-full unselectable"
              onClick={popapAddToBasket}
            >
              В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

Product.Layout = Layout
