import React, {
  memo,
  useState,
  useContext,
  Fragment,
  FC,
  useMemo,
  useRef,
  useEffect,
} from 'react'
import Image from 'next/image'
import ProductOptionSelector from './ProductOptionSelector'
import currency from 'currency.js'
import { Dialog, Transition } from '@headlessui/react'
import {
  Product,
  ProductOptionValues,
  ProductPrice,
} from '@commerce/types/product'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import { useCart } from '@framework/cart'
import { PlusIcon, XIcon } from '@heroicons/react/solid'
import styles from './ProductItemNew.module.css'
import { ChevronDownIcon, MinusIcon } from '@heroicons/react/outline'
import Hashids from 'hashids'
import { useUI } from '@components/ui/context'
// import SessionContext from 'react-storefront/session/SessionContext'

type ProductItem = {
  product: Product
  channelName: string
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const ProductItemNew: FC<ProductItem> = ({ product, channelName }) => {
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

  function closeModal() {
    setIsOpen(false)
  }

  const updateOptionSelection = (valueId: string) => {
    const prod = store
    if (prod.variants) {
      prod.variants = prod.variants.map((v) => {
        if (v.id == valueId) {
          v.active = true
        } else {
          v.active = false
        }
        return v
      })
    }
    setActiveModifiers([])
    // console.log(prod)
    updateStore({ ...prod })
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
    if (window.innerWidth < 768) {
      closeModal()
    }
  }

  const totalPrice = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    return price
  }, [store.price, store.variants, activeModifiers])

  const prodPriceDesktop = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    return price
  }, [store.price, store.variants])

  const prodPriceMobile = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants[0]
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    return price
  }, [store.price, store.variants])

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
  return (
    <>
      <div
        className={` ${
          isProductInStop ? 'opacity-25' : ''
        } py-3  md:py-3 overflow-hidden bg-white rounded-[15px] hover:shadow-xl group items-center justify-between flex flex-col shadow-lg`}
        id={`prod-${store.id}`}
      >
        <div>
          <div className="text-center overflow-hidden">
            {store.image ? (
              <img
                src={store.image}
                width={275}
                height={275}
                alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                className="transform motion-safe:group-hover:scale-105 transition duration-500 cursor-pointer"
                onClick={() => {
                  if (isProductInStop) {
                    return
                  }
                  setOpen(true)
                }}
              />
            ) : (
              <img
                src="/no_photo.svg"
                width={250}
                height={250}
                alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                className="rounded-full transform motion-safe:group-hover:scale-105 transition duration-500"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow w-full md:px-3 px-3">
          <div
            className="mt-4 font-bold md:text-xl flex-grow cursor-pointer break-normal"
            onClick={() => {
              if (isProductInStop) {
                return
              }
              setOpen(true)
            }}
          >
            {store?.attribute_data?.name[channelName][locale || 'ru']}
          </div>
          {/* <div
              className="mt-1 text-xs flex-grow"
              dangerouslySetInnerHTML={{
                __html: store?.attribute_data?.description
                  ? store?.attribute_data?.description[channelName][
                      locale || 'ru'
                    ]
                  : '',
              }}
            ></div> */}
          {/* <div className="hidden md:block">
              {store.variants && store.variants.length > 0 && (
                <div className="flex mt-5 space-x-1">
                  {store.variants.map((v) => (
                    <div
                      className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
                        v.active
                          ? 'bg-yellow text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                      onClick={() => updateOptionSelection(v.id)}
                      key={v.id}
                    >
                      <button className="outline-none focus:outline-none text-xs py-2">
                        {locale == 'ru' ? v?.custom_name : v?.custom_name_uz}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
          <div className=" mt-2 justify-between items-center">
            <span className="md:text-xl md:w-auto text-primary md:px-0 md:py-0 font-medium">
              {currency(prodPriceDesktop, {
                pattern: '# !',
                separator: ' ',
                decimal: '.',
                symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                precision: 0,
              }).format()}
            </span>
          </div>

          {productLine ? (
            <div className="rounded-lg flex items-center p-1 w-full mt-2 bg-primary text-white ">
              <div className="items-center flex justify-around  p-1 ">
                <MinusIcon
                  className="cursor-pointer w-7 text-white"
                  onClick={() => decreaseQuantity(productLine)}
                />
              </div>
              <div className="flex-grow text-center font-medium text-2xl">
                {productLine.quantity}
              </div>
              <div className=" items-center flex justify-around p-1">
                <PlusIcon
                  className="cursor-pointer w-7 text-white"
                  onClick={() => increaseQuantity(productLine.id)}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-3">
              {store.weight && store.weight > 0 ? (
                <div>
                  {store.weight} {tr('weight')}
                </div>
              ) : (
                <div></div>
              )}
              <button
                className="bg-primary focus:outline-none outline-none rounded-xl md:w-10 w-8 text-white uppercase md:inline-flex items-center"
                onClick={handleSubmit}
                disabled={isLoadingBasket}
              >
                {isLoadingBasket ? (
                  <svg
                    className="animate-spin text-white flex-grow text-center"
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
                ) : (
                  <PlusIcon className="md:w-10 w-8 rounded-full" />
                )}
              </button>
            </div>
          )}
        </div>
        <Transition.Root show={open} as={Fragment}>
          <Dialog
            as="div"
            static
            className="fixed z-50 inset-0"
            initialFocus={cancelButtonRef}
            open={open}
            onClose={setOpen}
          >
            <div className="flex items-end justify-center h-full md:pt-4 md:px-4 md:pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white md:pt-12 pb-8 md:px-8 px-3 md:rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle h-full md:h-auto">
                  <div
                    className="md:hidden bg-gray-100 rounded-lg p-3 w-max my-5"
                    onClick={() => setOpen(false)}
                  >
                    <ChevronDownIcon className="w-5" />
                  </div>
                  <div
                    className="absolute cursor-pointer text-gray-400 hidden md:block p-3 right-4 rounded-lg top-5 w-max"
                    onClick={() => setOpen(false)}
                  >
                    <XIcon className="w-5" />
                  </div>
                  <div className="md:flex md:w-max overflow-y-auto md:h-auto h-[calc(90vh-24px)]">
                    <div>
                      <img
                        src={store.image}
                        width={mobWidthImg}
                        height={mobHeightImg}
                        alt={
                          store?.attribute_data?.name[channelName][
                            locale || 'ru'
                          ]
                        }
                        className="m-auto transform motion-safe:group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="flex flex-col md:ml-8 ">
                      <div className="font-bold text-2xl mt-10 md:mt-0">
                        {
                          store?.attribute_data?.name[channelName][
                            locale || 'ru'
                          ]
                        }
                      </div>
                      <div
                        className="max-w-md mt-7 text-xs md:text-xl flex-grow"
                        dangerouslySetInnerHTML={{
                          __html: store?.attribute_data?.description
                            ? store?.attribute_data?.description[channelName][
                                locale || 'ru'
                              ]
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
                                className="cursor-pointer w-4 "
                                onClick={() => decreaseQuantity(productLine)}
                              />
                            </div>
                            <div className="flex-grow text-center text-gray-500 font-medium">
                              {productLine.quantity}
                            </div>
                            <div className=" items-center flex justify-around bg-white text-gray-500 rounded-md p-1">
                              <PlusIcon
                                className="cursor-pointer w-4 "
                                onClick={() => increaseQuantity(productLine.id)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-36 ml-14 bg-gray-200 rounded-lg flex items-center p-1">
                            <div className="items-center flex justify-around bg-white text-gray-500 rounded-md p-1 ">
                              <MinusIcon
                                className="cursor-pointer w-4 "
                                onClick={() => modalDecreaseQuantity(quantity)}
                              />
                            </div>
                            <div className="flex-grow text-center text-gray-500 font-medium">
                              {quantity}
                            </div>
                            <div className=" items-center flex justify-around bg-white text-gray-500 rounded-md p-1">
                              <PlusIcon
                                className="cursor-pointer w-4 "
                                onClick={() => modalIncreaseQuantity(quantity)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="md:ml-auto md:w-96 hidden md:block">
                        {productLine ? (
                          <button className="text-lg font-medium md:bg-primary bg-green-500 rounded-lg py-5 px-32 text-white mt-8 outline-none w-full">
                            Добавлено
                          </button>
                        ) : (
                          <button
                            className="text-lg font-medium md:bg-primary bg-green-500 rounded-lg py-5 px-32 text-white mt-8 outline-none w-full"
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
                      <button className="text-lg font-medium md:bg-primary bg-green-500 rounded-lg py-5 px-32 text-white mt-8 outline-none w-full">
                        Добавлено
                      </button>
                    ) : (
                      <button
                        className="text-lg font-medium md:bg-primary bg-green-500 rounded-lg py-5 px-32 text-white mt-8 outline-none w-full"
                        onClick={popapAddToBasket}
                      >
                        В корзину
                      </button>
                    )}
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </>
  )
}

export default memo(ProductItemNew)
