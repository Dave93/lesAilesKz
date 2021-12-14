import React, { FC, Fragment } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

// create array of day number of month
const days = Array.from(Array(31).keys())
const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]
// years from 1900 to current year
const years = Array.from(Array(new Date().getFullYear() - 1900 + 1).keys())
console.log(days)

const PersonalData: FC = () => {
  const { t: tr } = useTranslation('common')
  const { user, setUserData } = useUI()
  const router = useRouter()

  type FormData = {
    name: string
    phone: string
    email: string
    birthDay: string
    birthMonth: string
    birthYear: string
  }
  const { register, handleSubmit, reset, watch, formState, getValues } =
    useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        name: user?.user?.name,
        phone: user?.user?.phone,
        email: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
      },
    })

  const onSubmit = (data: any) => console.log(JSON.stringify(data))

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

  const setSelectedDay = (day: string) => {
    console.log(day)
  }

  return (
    <div className="md:w-96 m-auto mt-8">
      <div className="m-auto mb-5  text-2xl w-max">Мои данные</div>
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
          <label className="text-sm text-gray-400 mb-2 block">
            {tr('personal_birth')}
          </label>
          <div className="flex justify-between">
            <Listbox value={'selected'} onChange={setSelectedDay}>
              <Listbox.Button className="inline-flex justify-center py-3 rounded-lg text-sm w-24 bg-gray-200 relative">
                День
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
                <Listbox.Options className="absolute w-24 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto h-20">
                  {days.map((day, index) => ( console.log(day),
                    <Listbox.Option
                      key={index}
                      className={({ active }) =>
                        `${
                          active
                            ? 'text-amber-900 bg-amber-100'
                            : 'text-gray-900'
                        }
                          cursor-default select-none relative py-2 pl-10 pr-4`
                      }
                      value={day}
                  >
                    { day}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </Listbox>
            {/* <Listbox value={selected} onChange={setSelected}>
              <Listbox.Button className="inline-flex justify-center py-3 rounded-lg text-sm bg-gray-200 w-full">
                Месяц
                <ChevronDownIcon
                  className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                  aria-hidden="true"
                />
              </Listbox.Button>
              <Listbox.Options className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"></Listbox.Options>
            </Listbox>
            <Listbox value={selected} onChange={setSelected}>
              <Listbox.Button className="inline-flex justify-center py-3 rounded-lg text-sm w-24 bg-gray-200">
                Год
                <ChevronDownIcon
                  className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                  aria-hidden="true"
                />
              </Listbox.Button>
              <Listbox.Options className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"></Listbox.Options>
            </Listbox> */}
          </div>
          {/* <div className="flex justify-between">
            <input
              type="text"
              pattern="\d*"
              maxLength={2}
              {...register('birthDay')}
              className="borde focus:outline-none outline-none px-10 py-3 rounded-lg text-sm w-24 bg-gray-200"
            />
            <input
              type="text"
              pattern="\d*"
              maxLength={2}
              {...register('birthMonth')}
              className="borde focus:outline-none outline-none px-10 py-3 rounded-lg text-sm w-24 bg-gray-200"
            />
            <input
              type="text"
              pattern="\d*"
              maxLength={4}
              {...register('birthYear')}
              className="borde focus:outline-none outline-none pl-8 py-3 rounded-lg text-sm w-24 bg-gray-200"
            />
          </div> */}
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
            Выйти
          </button>
        </div>
      </form>
    </div>
  )
}

export default PersonalData
