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
      {/* <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className=" flex justify-between">
          <div>
            <div className="text-base text-gray-500 mb-2">
              {tr('order_is_accepted')}
            </div>
            <div className="text-3xl mb-7 font-bold">№ {order.id}</div>
          </div>
          <div>
            <div className="text-base text-gray-500 mb-2 text-right">
              {tr('order_time')}
            </div>
            <div className="text-base font-bold">
              {DateTime.fromISO(order?.created_at)
                .setLocale(`${locale == 'uz' ? 'uz' : 'ru'}`)
                .setZone('Asia/Tashkent')
                .toLocaleString(DateTime.DATETIME_MED)}
            </div>
          </div>
        </div>
        <div className="md:flex items-center justify-between md:mb-10 ">
          {Object.keys(orderStatuses).map((status: any, key) => (
            <div key={status} className="md:flex items-center">
              <div className="md:h-24 md:relative flex md:flex-col items-center top-5 md:w-12">
                {key <= currentStatusIndex ? (
                  <img src="/assets/status.png" />
                ) : (
                  <div className="border-2 h-12 rounded-full w-12"></div>
                )}
                <div
                  className={`bottom-0 leading-4 md:mt-2 md:text-base text-center ml-4 md:ml-0 ${
                    key <= currentStatusIndex ? 'text-yellow' : 'text-gray-400'
                  }`}
                >
                  {tr(`order_status_${status}`)}
                </div>
              </div>
              {key != Object.keys(orderStatuses).length - 1 && (
                <div
                  className={`transform rotate-90 md:rotate-0 border rounded-full md:w-24 w-12 md:pr-24 md:ml-0 my-7 ${
                    key < currentStatusIndex ? 'border-yellow' : ''
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div> */}

      <div className="p-10 rounded-2xl text-xl mt-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold flex items-center">
            <div>{tr('order_is_accepted')}</div>
            <div className="md:ml-2"> № {order.id}</div>
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
        <div className="text-xl my-10 mx-12">
          {order?.basket?.lines.length} {tr('product')}
        </div>
        {order?.basket?.lines.map((item: any) => (
          <div
            className="flex items-center justify-between border-b mt-4 pb-4 mx-12"
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
                        className="absolute rounded-full"
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
                        className="rounded-full"
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
                    className="rounded-full w-24"
                  />
                </div>
              )}
              <div className="ml-5">
                <div className="text-xl font-bold">
                  {item.child && item.child.length > 1
                    ? `${
                        item?.variant?.product?.attribute_data?.name[
                          channelName
                        ][locale || 'ru']
                      } + ${
                        item?.child[0].variant?.product?.attribute_data?.name[
                          channelName
                        ][locale || 'ru']
                      }`
                    : item?.variant?.product?.attribute_data?.name[channelName][
                        locale || 'ru'
                      ]}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between w-64">
              <div className="text-green-500 mr-10">{item.quantity} шт</div>
              <div>
                {item.child &&
                  currency(item.total * item.quantity, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: 'сум',
                    precision: 0,
                  }).format()}
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-14">
          <div className="p-5 rounded-2xl text-xl mt-5 bg-white border border-gray-200 w-3/4">
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
          <div className="p-5 rounded-2xl text-xl mt-5 bg-white border border-gray-200 w-1/4 ml-2">
            <div className="text-xl mb-8">Сумма заказа</div>
            <div>
              <div className="text-base">Оплата картой </div>
              {currency(order?.order_total / 100, {
                pattern: '# !',
                separator: ' ',
                decimal: '.',
                symbol: `${tr('sum')}`,
                precision: 0,
              }).format()}
            </div>
          </div>
        </div>
      </div>

      <div
        className="text-xl text-white bg-green-500 rounded-2xl mt-20 w-max m-auto py-5 px-16 cursor-pointer"
        onClick={() => router.push(`/${activeCity}`)}
      >
        <div>{tr('to_main')}</div>
      </div>
      {/* <div className="p-10 rounded-2xl text-xl mt-5 bg-white mb-3 border border-gray-400">
        {reviewsData && reviewsData.length > 0 && (
          <div className="mt-2 mb-4">
            <div className="text-lg mb-4 font-bold">{tr('your_reviews')}</div>
            <div className="flex space-y-3 flex-col">
              {reviewsData.map((review: any) => (
                <div className="relative md:w-1/3 text-sm px-8 py-10 shadow-lg rounded-2xl border">
                  <div className="absolute top-2 left-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-indigo-200 fill-current w-7 h-7 md:w-7 md:h-7"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144C8.97 4.222 8.737 4.278 8.472 4.345c-.271.05-.56.187-.882.312C7.272 4.799 6.904 4.895 6.562 5.123c-.344.218-.741.4-1.091.692C5.132 6.116 4.723 6.377 4.421 6.76c-.33.358-.656.734-.909 1.162C3.219 8.33 3.02 8.778 2.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C2.535 17.474 4.338 19 6.5 19c2.485 0 4.5-2.015 4.5-4.5S8.985 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L20.758 4.03c0 0-.218.052-.597.144-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.317.143-.686.238-1.028.467-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162C14.219 8.33 14.02 8.778 13.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C13.535 17.474 15.338 19 17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10z" />
                    </svg>
                  </div>
                  <div>{review.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="text-lg mb-7 font-bold">
            {tr('waiting_your_feedback')}
          </div>
          <div className="flex mt-3 md:w-96 h-28">
            <div className="w-full">
              <textarea
                {...register('review')}
                className="md:w-96 w-full h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none text-xs"
                placeholder={tr('order_review_placeholder')}
              ></textarea>
            </div>
          </div>
          <button className="bg-yellow rounded-full flex items-center md:w-40 w-full justify-evenly py-2 mt-10 text-white">
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 mx-auto text-center text-white w-5"
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
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>{tr('send')}</>
            )}
          </button>
        </form>
        <div className="flex justify-end mt-8">
          <button
            className="text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full md:w-80 w-full"
            onClick={() => router.push(`/${activeCity}`)}
          >
            <div>{tr('to_main')}</div>
            <img src="/right.png" />
          </button>
        </div>
      </div> */}
    </div>
  )
}

export default memo(OrderAccept)
