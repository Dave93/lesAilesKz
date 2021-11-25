import React, { memo, FC, Fragment } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { TrashIcon } from '@heroicons/react/outline'
import { PlusIcon } from '@heroicons/react/solid'
import { Dialog, Transition } from '@headlessui/react'
import { useForm, SubmitHandler } from 'react-hook-form'
import NumberFormat from 'react-number-format'
import Cookies from 'js-cookie'
import axios from 'axios'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const CreditCardComponent: FC = () => {
  const { t: tr } = useTranslation('common')

  const [isOpen, setIsOpen] = React.useState(false)
  const [cardNumber, setCardNumber] = React.useState('')
  const [validity, setValidity] = React.useState('')

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)


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

  const saveNewCard = async () => {
    console.log(cardNumber)
    console.log(validity)
  //  let otpToken: any = Cookies.get('opt_token')
  //  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
  //   try {
  //    await setCredentials()
  //    const { data } = await axios.post(
  //      `${webAddress}/api/payment_card/new`,
  //      {},
  //      {
  //        headers: {
  //          Authorization: `Bearer ${otpToken}`,
  //        },
  //      }
  //    )
  //    console.log(data)
  //    if (!data.success) {
  //      setErrorMessage(data.message)
  //    } else {
  //      setAddressList(data.data)
  //    }
  //    // orderData = data.data
  //  } catch (e) {} 
  }

  return (
    <>
      <div className="m-auto my-12 text-2xl w-max md:mt-0">
        {tr('profile_mycreditcard')}
      </div>
      <div className="grid grid-cols-4 gap-3 font-sans">
        <div className=" m-auto bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-3xl text-white bg-red-400 w-72 h-44 p-5">
          <div className="text-2xl mt-10">8600 53** **** 0036</div>
          <div className="flex items-center justify-between">
            <div className="flex items-end mt-8">
              <div className="text-sm">Срок действия</div>
              <div className="ml-2 text-2xl">05/25</div>
            </div>
            <div className="border border-primary p-2 rounded-xl mt-5 cursor-pointer">
              <TrashIcon className="w-5" />
            </div>
          </div>
        </div>
        <div
          className="w-72 h-44 p-5 border border-gray-400 bg-gray-200 rounded-3xl flex items-center m-auto justify-center cursor-pointer"
          onClick={openModal}
        >
          <PlusIcon className="w-10 text-gray-400" />
        </div>

        <Transition appear show={isOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={closeModal}
          >
            <div className="min-h-screen px-4 text-center">
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
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-max p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <div className="flex space-x-2">
                    <form className="flex space-x-2">
                      <NumberFormat
                        format="#### #### #### ####"
                        className="rounded-lg bg-gray-200 p-1 outline-none"
                        placeholder="Номер карты"
                        onValueChange={(values: any) => {
                          setCardNumber(values.value)
                        }}
                      />
                      <NumberFormat
                        format="##/##"
                        className="rounded-lg bg-gray-200 p-1 outline-none"
                        placeholder="Срок действия"
                        onValueChange={(values: any) => {
                          setValidity(values.value)
                        }}
                      />
                    </form>
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      className="bg-green-500 p-2 rounded-xl"
                      onClick={saveNewCard}
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  )
}

export default memo(CreditCardComponent)
