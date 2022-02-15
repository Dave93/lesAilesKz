import useTranslation from 'next-translate/useTranslation'
import { FC, memo, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { XIcon } from '@heroicons/react/outline'
import Input from 'react-phone-number-input/input'
import { useUI } from '@components/ui/context'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import axios from 'axios'
import { useRouter } from 'next/router'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const Contacts: FC = () => {
  const { locale } = useRouter()
  const { t: tr } = useTranslation('common')
  const { user } = useUI()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [configData, setConfigData] = useState({} as any)
  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(
        `${publicRuntimeConfig.apiUrl}/api/configs/public`
      )
      configData = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      configData = sessionStorage.getItem('configData')
    }

    try {
      configData = Buffer.from(configData, 'base64')
      configData = configData.toString()
      configData = JSON.parse(configData)
      setConfigData(configData)
    } catch (e) {}
  }

  useEffect(() => {
    fetchConfig()
    return
  }, [])

  type FormData = {
    name: string
    phone: string
    email: string
    order_id: string
    text: string
  }
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: user?.user?.name,
      phone: user?.user?.phone,
      email: '',
      order_id: '',
      text: '',
    },
  })
  const name = watch('name')
  const phone = watch('phone')
  const email = watch('email')
  const order_id = watch('order_id')
  const text = watch('text')

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    setSuccessMessage('')
    await setCredentials()
    const { data: reviewData } = await axios.post(`${webAddress}/api/reviews`, {
      ...getValues(),
    })
    if (reviewData.success) {
      reset()
      setSuccessMessage(tr('review_add_success'))
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

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }

  return (
    <div className="mx-5 md:mx-0">
      <div>
        <div className="text-3xl mb-1">{tr('contacts')}</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
      </div>
      <div className="md:grid grid-cols-2 gap-24 mb-16">
        <div>
          <div className="mb-3">ООО « Havoqand People »</div>
          <div className="w-60">
            <div className="flex justify-between">
              <div>{tr('toshkent')}:</div>{' '}
              <a href="tel:+998712004242">+998 (71) 200-42-42</a>
            </div>
            <div className="flex justify-between">
              <div>{tr('andijon')}:</div>
              <a href="tel:+998952004242">+998 (95) 200-42-42</a>
            </div>
            <div className="flex justify-between">
              <div>{tr('fargona')}:</div>
              <a href="tel:+998999114242">+998 (99) 911-42-42</a>
            </div>
            <div className="flex justify-between">
              <div>{tr('samarqand')}:</div>{' '}
              <a href="tel:+998973994242">+998 (97) 399-42-42</a>
            </div>
            <div className="flex justify-between">
              <div>{tr('qoqon')}:</div>{' '}
              <a href="tel:+998907034040">+998 (90) 703-40-40</a>
            </div>
            <div className="flex justify-between">
              <div>{tr('bukhara')}:</div>{' '}
              <a href="tel:+998917984242">+998 (91) 798-42-42</a>
            </div>
          </div>
          <div className="mt-3">
            {tr('work_time')}
            {': '}
            {locale == 'uz' ? configData.workTimeUz : configData.workTimeRu}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border border-gray-400 rounded-2xl p-8 md:w-[724px] md:mb-96 mb-8">
          <div className="text-2xl mb-7">{tr('your_review')}</div>
          <div className="md:flex justify-between">
            <div className="md:w-80">
              <label className="text-sm text-gray-400">{tr('name')}</label>
              <div className="flex items-center justify-end">
                <input
                  type="text"
                  {...register('name', {
                    required: true,
                  })}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {name && (
                  <button
                    className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                    onClick={() => resetField('name')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
              {errors.name && (
                <div className="text-sm text-center text-red-600">
                  {tr('required')}
                </div>
              )}
            </div>
            <div className="md:w-80">
              <label className="text-sm text-gray-400">
                {tr('phone_number')}
              </label>
              <div className="md:flex items-center justify-end">
                <Controller
                  render={({ field: { onChange, value } }) => (
                    <Input
                      defaultCountry="UZ"
                      country="UZ"
                      international
                      withCountryCallingCode
                      value={value}
                      className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                      onChange={(e: any) => onChange(e)}
                    />
                  )}
                  rules={{
                    required: true,
                  }}
                  key="phone"
                  name="phone"
                  control={control}
                />
                {phone && (
                  <button
                    className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                    onClick={() => resetField('phone')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>

              {errors.phone && (
                <div className="text-sm text-center text-red-600">
                  {tr('required')}
                </div>
              )}
            </div>
          </div>
          <div className="md:flex md:mt-7 justify-between">
            <div className="md:w-80">
              <label className="text-sm text-gray-400">{tr('email')}</label>
              <div className="flex items-center justify-end">
                <input
                  type="text"
                  {...register('email')}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {email && (
                  <button
                    className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                    onClick={() => resetField('email')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="md:w-80">
              <label className="text-sm text-gray-400">
                {tr('order_number')}
              </label>
              <div className="md:flex items-center justify-end">
                <input
                  type="text"
                  {...register('order_id')}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {order_id && (
                  <button
                    className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                    onClick={() => resetField('order_id')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="md:mt-7">
            <label className="text-sm text-gray-400">{tr('review')}</label>
            <div className="flex items-center justify-end">
              <textarea
                {...register('text', { required: true })}
                rows={5}
                className="bg-gray-100 px-8 py-2 rounded-lg outline-none focus:outline-none w-full"
              />
              {text && (
                <button
                  className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                  onClick={() => resetField('text')}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>

            {errors.text && (
              <div className="text-sm text-center text-red-600">
                {tr('required')}
              </div>
            )}
          </div>
          {successMessage && (
            <div
              className="bg-teal-100 border-t-4 border-teal-500 rounded-b mt-4 text-teal-900 px-4 py-3 shadow-md"
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <svg
                    className="fill-current h-6 w-6 text-teal-500 mr-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          <div className="ml-auto md:w-80">
            <button className="bg-yellow rounded-full flex items-center md:w-80 w-full justify-evenly py-2 mt-10 text-white">
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
          </div>
        </div>
      </form>
    </div>
  )
}

export default memo(Contacts)
