import React, { FC, memo, useEffect, useState } from 'react'
import OrdersItems from '@commerce/data/orders'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { ShoppingCartIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import Hashids from 'hashids'
import { DateTime } from 'luxon'
import currency from 'currency.js'
import defaultChannel from '@lib/defaultChannel'
import Image from 'next/image'
import getConfig from 'next/config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTengeSign, faTenge } from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

type OrdersListProps = {
  orders: any[]
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const Orders: FC<OrdersListProps> = ({ orders }) => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale } = router
  const { user } = useUI()

  const hashids = new Hashids(
    'order',
    15,
    'abcdefghijklmnopqrstuvwxyz1234567890'
  )
  const [channelName, setChannelName] = useState('chopar')

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }
  useEffect(() => {
    getChannel()
  }, [])
  return (
    <div>
      <div className="text-3xl my-12 m-auto w-max">{tr('order_myOrders')}</div>
      {orders.length === 0 && (
        <div className="flex justify-around">
          <div className="space-y-4 text-center">
            <ShoppingCartIcon className="h-48 w-48 text-primary mx-auto" />
            <span className="font-bold uppercase text-5xl">
              {tr('no_orders')}
            </span>
          </div>
        </div>
      )}

      {orders?.length && (
        <div>
          <div className="bg-gray-200 flex items-center md:w-max m-auto md:p-1 p-[2px] rounded-full mb-12 mx-4 md:mx-auto justify-center">
            <div className="rounded-full md:py-4 py-2 md:px-12 px-5 cursor-pointer w-full md:w-auto text-center">
              {tr('current_orders')}
            </div>
            <div className="bg-white rounded-full md:py-4 py-2 md:px-12 px-5 cursor-pointer w-full md:w-auto text-center">
              {tr('purchase_history')}
            </div>
          </div>
          {orders.map((order: any) => (
            <div>
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
                  <div
                    className={`${order.status == 'cancelled'
                        ? 'bg-red-600'
                        : 'bg-green-500'
                      } text-sm md:rounded-lg rounded-full py-2 px-7 text-white`}
                  >
                    <div className="">{tr(`order_status_${order.status}`)}</div>
                  </div>
                </div>
                <div className="text-xl my-10 md:mx-12">
                  {order?.basket?.lines?.length} {tr('product')}
                </div>
                {order?.basket?.lines?.map((item: any) => (
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
                                  item?.child[0].variant?.product?.assets
                                    ?.length
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
                            } + ${item?.child[0].variant?.product?.attribute_data
                              ?.name[channelName][locale || 'ru']
                            }`
                            : item?.variant?.product?.attribute_data?.name[
                            channelName
                            ][locale || 'ru']}
                        </div>
                      </div>
                    </div>
                    <div className="md:flex items-center justify-between md:w-64">
                      <div className="text-green-500 mr-10">
                        {item.quantity} шт
                      </div>
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
                        ? ', ' +
                        tr('house').toLocaleLowerCase() +
                        ': ' +
                        order.house
                        : ''}
                      {order.flat
                        ? ', ' +
                        tr('flat').toLocaleLowerCase() +
                        ': ' +
                        order.flat
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
                    <div className="text-xl mb-8">
                      {tr('basket_order_price')}
                    </div>
                    <div>
                      <div className="text-base">{tr('payment_by_card')} </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(Orders)
