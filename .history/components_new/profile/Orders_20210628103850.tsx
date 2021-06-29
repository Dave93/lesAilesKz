import { FC, memo } from 'react'
import OrdersItems from '@commerce/data/orders'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

const Orders: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router

  const { user } = useUI()
  let items = OrdersItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })

  console.log(items)

  return (
    <div>
      <div className="w-full px-4 pt-16">
        <div className="w-full max-w-md p-2 mx-auto bg-white rounded-2xl">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                  <span>What is your refund policy?</span>
                  <ChevronDownIcon
                    className={`${
                      open ? 'transform rotate-180' : ''
                    } w-5 h-5 text-purple-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                  If you're unhappy with your purchase for any reason, email us
                  within 90 days and we'll refund you in full, no questions
                  asked.
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <Disclosure as="div" className="mt-2">
            {({ open }) => (
              <>
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                  <span>Do you offer technical support?</span>
                  <ChevronDownIcon
                    className={`${
                      open ? 'transform rotate-180' : ''
                    } w-5 h-5 text-purple-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                  No.
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      </div>

      <div className="text-2xl mt-8 mb-5">Мои заказы</div>
      <div className="border h-56  p-10 rounded-2xl text-xl">
        <div className="flex  text-base justify-between border-b pb-8">
          <div>№ 433</div>
          <div>26 май 2021 г. 19:11</div>
          <div className="w-40">ул., Буюк Ипак Йули, Дом 95а, кв 31</div>
          <div>3 товара</div>
          <div>108 000 сум</div>
          <div className="ml-56 text-green-600">Доставлено</div>
        </div>
        <div className="flex justify-between mt-8">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="border flex focus:outline-none items-center justify-end px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-gray-100 text-gray-400">
                  <span className="mr-12">Детали заказа</span>
                  <ChevronDownIcon
                    className={`${
                      open ? 'transform rotate-180' : ''
                    } w-6 h-6 text-purple-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="">
                  If you're unhappy with your purchase for any reason, email us
                  within 90 days and we'll refund you in full, no questions
                  asked.
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <Disclosure>
            <Disclosure.Button className="border flex focus:outline-none items-center justify-end px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-yellow text-white">
              <span className="mr-12">Повторить заказ</span>
            </Disclosure.Button>
          </Disclosure>
        </div>
      </div>
    </div>
  )
}

export default memo(Orders)