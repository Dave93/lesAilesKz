import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, { memo, FC, useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import OrdersItems from '@commerce/data/orders'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import currency from 'currency.js'
import Image from 'next/image'
import getConfig from 'next/config'
import defaultChannel from '@lib/defaultChannel'
import { DateTime } from 'luxon'
import Cookies from 'js-cookie'
import axios from 'axios'
import { log } from 'console'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTengeSign, faTenge } from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

axios.defaults.withCredentials = true

type OrderDetailProps = {
  order: any
  orderStatuses: any
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const OrderAccept: FC<OrderDetailProps> = ({ order, orderStatuses }) => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewsData, setReviewsData] = useState([])
  const { user, activeCity } = useUI()
  const { locale } = router
  const orderId = router.query.id
  type FormData = {
    review: string
  }
  const { register, handleSubmit, reset, watch, formState, getValues } =
    useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        review: '',
      },
    })
  const [channelName, setChannelName] = useState('chopar')

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const fetchReviews = async () => {
    const { data } = await axios.get(
      `${webAddress}/api/reviews?order_id=${order.id}`
    )
    setReviewsData(data.data)
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    await setCredentials()
    let values = { ...getValues() }
    const { data: reviewData } = await axios.post(`${webAddress}/api/reviews`, {
      name: user?.user?.name,
      phone: user?.user?.phone,
      user_id: user?.user?.id,
      order_id: order.id,
      text: values.review,
    })
    if (reviewData.success) {
      reset()

      await fetchReviews()
    }
    setIsSubmitting(false)
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

  const currentStatusIndex = Object.keys(orderStatuses).findIndex(
    (status: string) => status == order.status
  )

  useEffect(() => {
    getChannel()
    fetchReviews()
  }, [])

  return (
    <div>
      <div className="text-3xl mx-5 my-12">Спасибо за ваш заказ !</div>
      <div className="md:p-10 rounded-2xl text-xl mt-5 md:shadow-2xl bg-gray-100 md:bg-white mx-4 md:mx-0 px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="md:text-3xl text-2xl font-bold md:flex items-center">
            <div className="flex">
              <div>{tr('order')}</div>
              <div className="ml-2"> № {order.id}</div>
            </div>
            <div className="text-base text-gray-400 md:ml-5">
              {DateTime.fromISO(order?.created_at)
                .setLocale(`${locale == 'uz' ? 'uz' : 'ru'}`)
                .setZone('Asia/Tashkent')
                .toLocaleString(DateTime.DATETIME_MED)}
            </div>
          </div>
          <div className="bg-green-500 text-sm rounded-lg py-2 px-7 text-white">
            {Object.keys(orderStatuses).map(
              (status: any, key) =>
                key === currentStatusIndex && (
                  <div className="">{tr(`order_status_${status}`)}</div>
                )
            )}
          </div>
        </div>
        <div className="text-xl my-10 md:mx-12">
          {order?.basket?.lines.length} {tr('product')}
        </div>
        {order?.basket?.lines.map((item: any) => (
          <div
            className="flex items-center justify-between border-b border-gray-300 mt-4 md:pb-4 md:mx-12"
            key={item.id}
          >
            <div className="flex items-center">
              {item.child &&
                item.child.length &&
                item.child[0].variant?.product?.id !=
                item?.variant?.product?.box_id ? (
                <div className="h-24 w-24 flex relative">
                  <div className="w-12 relative overflow-hidden">
                    <div>
                      <Image
                        src={
                          item?.variant?.product?.assets?.length
                            ? `${webAddress}/storage/${item?.variant?.product?.assets[0]?.location}/${item?.variant?.product?.assets[0]?.filename}`
                            : '/no_photo.svg'
                        }
                        width="95"
                        height="95"
                        layout="fixed"
                        className="absolute rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="w-12 relative overflow-hidden">
                    <div className="absolute right-0">
                      <Image
                        src={
                          item?.child[0].variant?.product?.assets?.length
                            ? `${webAddress}/storage/${item?.child[0].variant?.product?.assets[0]?.location}/${item?.child[0].variant?.product?.assets[0]?.filename}`
                            : '/no_photo.svg'
                        }
                        width="95"
                        height="95"
                        layout="fixed"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Image
                    src={
                      item?.variant?.product?.assets?.length
                        ? `${webAddress}/storage/${item?.variant?.product?.assets[0]?.location}/${item?.variant?.product?.assets[0]?.filename}`
                        : '/no_photo.svg'
                    }
                    width={95}
                    height={95}
                    className="rounded-lg md:w-24 w-12"
                  />
                </div>
              )}
              <div className="ml-5">
                <div className="md:text-xl text-sm font-bold">
                  {item.child && item.child.length > 1
                    ? `${item?.variant?.product?.attribute_data?.name[
                    channelName
                    ][locale || 'ru']
                    } + ${item?.child[0].variant?.product?.attribute_data?.name[
                    channelName
                    ][locale || 'ru']
                    }`
                    : item?.variant?.product?.attribute_data?.name[channelName][
                    locale || 'ru'
                    ]}
                </div>
              </div>
            </div>
            <div className="md:flex items-center justify-between md:w-64">
              <div className="text-green-500 mr-10">{item.quantity} шт</div>
              <div className="flex items-center">
                {item.child &&
                  currency(item.total * item.quantity, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: '',
                    precision: 0,
                  }).format()}
                <FontAwesomeIcon
                  icon={faTengeSign as IconDefinition}
                  size={'xs'}
                  className="ml-1 w-4 h-4"
                />
              </div>
            </div>
          </div>
        ))}
        <div className="md:flex justify-between mt-14">
          {order.type == 'ioka' && order.status == 'awaiting-payment' && (
            <div className="md:p-10 p-5 rounded-2xl text-xl mt-5 bg-white">
              <div className="text-4xl mb-7 font-bold text-center">
                {tr('order_pay')}
              </div>
              <div className="text-center items-center flex justify-around">
                <a
                  className="bg-primary rounded-full flex items-center md:w-40 w-full justify-evenly py-2 mt-10 text-white"
                  href={order.transaction.payment_link}
                >
                  {tr('pay')}
                </a>
              </div>
            </div>
          )}
          <div className="md:p-5 pb-5 md:rounded-2xl text-xl mt-5 md:bg-white md:border md:border-gray-200 md:w-3/4 border-b border-gray-300">
            <div className="text-lg mb-7 font-bold">
              {tr('delivery_address')}
            </div>
            <div>
              {order?.billing_address}
              {order.house
                ? ', ' + tr('house').toLocaleLowerCase() + ': ' + order.house
                : ''}
              {order.flat
                ? ', ' + tr('flat').toLocaleLowerCase() + ': ' + order.flat
                : ''}
              {order.entrance
                ? ', ' +
                tr('entrance').toLocaleLowerCase() +
                ': ' +
                order.entrance
                : ''}
              {order.door_code
                ? ', ' +
                tr('code_on_doors').toLocaleLowerCase() +
                ': ' +
                order.door_code
                : ''}
            </div>
          </div>
          <div className="md:p-5 md:rounded-2xl text-xl mt-5 md:bg-white md:border border-gray-200 md:w-1/4 md:ml-2">
            <div className="text-xl mb-8">Сумма заказа</div>
            <div>
              <div className="text-base">Оплата картой </div>
              <div className="flex items-center">
                {currency(order?.order_total / 100, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: ``,
                  precision: 0,
                }).format()}
                <FontAwesomeIcon
                  icon={faTengeSign as IconDefinition}
                  size={'xs'}
                  className="ml-1 w-4 h-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="text-xl text-white bg-green-500 rounded-2xl mt-20 md:w-max m-auto py-5 px-16 cursor-pointer text-center mx-5 md:mx-auto"
        onClick={() => router.push(`/${activeCity.slug}`)}
      >
        <div>{tr('to_main')}</div>
      </div>
    </div>
  )
}

export default memo(OrderAccept)
