import React, { FC, Fragment } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import Cookies from 'js-cookie'
import axios from 'axios'
import getConfig from 'next/config'
import { DateTime } from 'luxon'
import { toast } from 'react-toastify'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
const days = Array.from(Array(31).keys())
const months: any[] = [
  {
    ru: { text: 'Январь', value: '01' },
    uz: { text: 'Yanvar', value: '01' },
    en: { text: 'January', value: '01' },
  },
  {
    ru: { text: 'Февраль', value: '02' },
    uz: { text: 'Fevral', value: '02' },
    en: { text: 'February', value: '02' },
  },
  {
    ru: { text: 'Март', value: '03' },
    uz: { text: 'Mart', value: '03' },
    en: { text: 'March', value: '03' },
  },
  {
    ru: { text: 'Апрель', value: '04' },
    uz: { text: 'Aprel', value: '04' },
    en: { text: 'April', value: '04' },
  },
  {
    ru: { text: 'Май', value: '05' },
    uz: { text: 'May', value: '05' },
    en: { text: 'May', value: '05' },
  },
  {
    ru: { text: 'Июнь', value: '06' },
    uz: { text: 'Iyun', value: '06' },
    en: { text: 'June', value: '06' },
  },
  {
    ru: { text: 'Июль', value: '07' },
    uz: { text: 'Iyul', value: '07' },
    en: { text: 'July', value: '07' },
  },
  {
    ru: { text: 'Август', value: '08' },
    uz: { text: 'Avqust', value: '08' },
    en: { text: 'August', value: '08' },
  },
  {
    ru: { text: 'Сентябрь', value: '09' },
    uz: { text: 'Sentabr', value: '09' },
    en: { text: 'September', value: '09' },
  },
  {
    ru: { text: 'Октябрь', value: '10' },
    uz: { text: 'Oktabr', value: '10' },
    en: { text: 'October', value: '10' },
  },
  {
    ru: { text: 'Ноябрь', value: '11' },
    uz: { text: 'Noyabr', value: '11' },
    en: { text: 'November', value: '11' },
  },
  {
    ru: { text: 'Декабрь', value: '12' },
    uz: { text: 'Dekabr', value: '12' },
    en: { text: 'December', value: '12' },
  },
]

const max = new Date().getFullYear()
const min = max - 100
const years: number[] = []
for (let i = max; i >= min; i--) {
  years.push(i)
}

const PersonalData: FC = () => {
  const { t: tr } = useTranslation('common')
  const { user, setUserData } = useUI()
  const router = useRouter()
  const { locale } = useRouter()

  let birth = user?.user?.birth

  // birthDay, birthMonth, birthYear from date string of format YYYY-MM-DD

  let birthDay = birth?.split('-')[2]
  let birthMonth = birth?.split('-')[1]
  let birthYear = birth?.split('-')[0]

  type FormData = {
    name: string
    phone: string
    email: string
    birthDay: string
    birthMonth: string
    birthYear: string
  }
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState,
    getValues,
    setValue,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: user?.user?.name,
      phone: user?.user?.phone,
      email: '',
      birthDay,
      birthMonth,
      birthYear,
    },
  })

  const [selectedDay, setSelectedDay] = React.useState(birthDay)
  const [selectedMonth, setSelectedMonth] = React.useState(birthMonth)
  const [selectedYear, setSelectedYear] = React.useState(birthYear)
  setValue('birthDay', selectedDay)
  setValue('birthMonth', selectedMonth)
  setValue('birthYear', selectedYear)

  const authName = watch('name')
  const authPhone = watch('phone')
  const authEmail = watch('email')

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }

  const logout = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.removeItem('mijoz')
    setUserData(null)
    router.push('/')
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

  const onSubmit = async (data: any) => {
    let birth = null
    if (data.birthDay && data.birthMonth && data.birthYear) {
      // init current date
      let currentTime = DateTime.local()

      // Change month, day and year of current date
      currentTime = currentTime.set({
        day: data.birthDay,
        month: data.birthMonth,
        year: data.birthYear,
      })
      // Convert date to format YYYY-MM-DD
      birth = currentTime.toFormat('yyyy-MM-dd')
    }

    const { name, phone, email } = data

    await setCredentials()

    const otpToken = Cookies.get('opt_token')
    try {
      const { data } = await axios.post(
        `${webAddress}/api/me`,
        {
          name,
          phone,
          email,
          birth,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      setUserData({
        user: {
          ...user?.user,
          name,
          phone,
          email,
          birth,
        },
      })
    } catch (e: any) {
      toast.error(e.response.data.error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
    }
  }

  return (
    <div className="md:w-96 m-auto mt-8">
      {!user && (
        <div className="text-red-500 text-center">{tr('user_must_login')}</div>
      )}
      {user && (
        <>
          <div className="m-auto mb-5  text-2xl w-max">{tr('my_details')}</div>
          <form onSubmit={handleSubmit(onSubmit)} className="px-4">
            <div className="mt-10 rounded-lg text-sm w-full bg-gray-200 py-2 px-4">
              <label className="text-sm text-gray-400 block">
                {tr('personal_data_name')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('name')}
                  className="border focus:outline-none outline-none rounded-lg text-sm w-full bg-gray-200"
                />
                {authName && (
                  <button
                    className="absolute focus:outline-none inset-y-0 outline-none right-0 text-gray-400"
                    onClick={() => resetField('name')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 rounded-lg text-sm w-full bg-gray-200 py-2 px-4">
              <label className="text-sm text-gray-400 mb-2 block">
                {tr('personal_phone')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('phone', {
                    required: true,
                    pattern: /^\+998\d\d\d\d\d\d\d\d\d$/i,
                  })}
                  className="border focus:outline-none outline-none rounded-lg text-sm w-full bg-gray-200"
                />
                {authPhone && (
                  <button
                    className="absolute focus:outline-none inset-y-0 outline-none right-0 text-gray-400"
                    onClick={() => resetField('phone')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 rounded-lg text-sm w-full bg-gray-200 py-2 px-4">
              <label className="text-sm text-gray-400 mb-2 block">
                {tr('personal_email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className="border focus:outline-none outline-none rounded-lg text-sm w-full bg-gray-200"
                />
                {authEmail && (
                  <button
                    className="absolute focus:outline-none inset-y-0 outline-none right-0 text-gray-400"
                    onClick={() => resetField('email')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm w-full">
              <div className="flex justify-between">
                <div className="relative">
                  <Listbox value={selectedDay} onChange={setSelectedDay}>
                    <Listbox.Button className="inline-flex justify-center py-3 rounded-lg text-sm w-24 bg-gray-200 relative">
                      {!selectedDay ? tr('day') : selectedDay}
                      <ChevronDownIcon
                        className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                        aria-hidden="true"
                      />
                    </Listbox.Button>

                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute w-24 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto h-52">
                        {days.map((day, index) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              `${active ? 'text-primary' : 'text-gray-900'}
                          cursor-default select-none relative py-2 m-auto w-max`
                            }
                            value={day + 1}
                          >
                            {day + 1}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </Listbox>
                </div>
                <div className="relative">
                  <Listbox value={selectedMonth} onChange={setSelectedMonth}>
                    <Listbox.Button className="inline-flex justify-center py-3 rounded-lg text-sm w-24 bg-gray-200 relative">
                      {!selectedMonth
                        ? tr('month')
                        : months[+selectedMonth - 1][locale ?? 'ru'].text}
                      <ChevronDownIcon
                        className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                        aria-hidden="true"
                      />
                    </Listbox.Button>

                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute w-32 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto h-52">
                        {months.map((month, index) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              `${active ? 'text-primary' : 'text-gray-900'}
                              cursor-default select-none relative py-2 m-auto w-max`
                            }
                            value={month[`${locale ?? 'ru'}`].value}
                          >
                            {month[`${locale ?? 'ru'}`].text}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </Listbox>
                </div>
                <div className="relative">
                  <Listbox value={selectedYear} onChange={setSelectedYear}>
                    <Listbox.Button className="inline-flex justify-center py-3 rounded-lg text-sm w-24 bg-gray-200 relative">
                      {!selectedYear ? tr('year') : selectedYear}
                      <ChevronDownIcon
                        className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                        aria-hidden="true"
                      />
                    </Listbox.Button>

                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute w-24 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto h-52">
                        {years.map((year, index) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              `${active ? 'text-primary' : 'text-gray-900'}
                              cursor-default select-none relative py-2 m-auto w-max`
                            }
                            value={year}
                          >
                            {year}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </Listbox>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <button className="text-white font-bold text-xl rounded-xl bg-green-500 w-full py-5 px-32">
                {tr('personal_save_button')}
              </button>
            </div>
            <div className="mt-5">
              <button
                className="bg-gray-200 rounded-xl w-full text-gray-400 py-5"
                onClick={logout}
              >
                {tr('exit')}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default PersonalData
