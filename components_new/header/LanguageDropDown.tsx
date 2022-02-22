import { Fragment, FC, memo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Ru, Uz, Us } from 'react-flags-select'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'

const locales = {
  ru: Ru,
  uz: Uz,
  us: Us,
}

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
  us: 'En',
}

const LanguageDropDown: FC = () => {
  const router = useRouter()
  const { locale, pathname } = router
  const keyTyped = locale as keyof typeof locales
  const { activeCity } = useUI()

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    let path = pathname.replace('[city]', activeCity.slug)
    return router.push(path, path, {
      locale: loc,
    })
  }
  return (
    <div className="md:bg-white bg-gray-100 p-4 md:p-0  flex justify-around">
      <a
        className={`${
          locale == 'ru' ? 'bg-primary text-white border-none' : 'bg-white'
        } font-medium hover:bg-primary  hover:text-white inline-flex items-center mx-2 px-3 py-1 rounded-lg border border-gray-200 `}
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'ru')}
      >
        <Ru className="w-4 h-4 rounded-full" />
        <span className="ml-1.5">{localeLabel.ru}</span>
      </a>
      <a
        className={`${
          locale == 'uz' ? 'bg-primary text-white border-none' : 'bg-white'
        } font-medium hover:bg-primary hover:text-white inline-flex items-center mx-2 px-3 py-1 rounded-lg border border-gray-200 `}
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'uz')}
      >
        <div className="w-4 h-4 overflow-hidden rounded-full">
          <Uz className="w-6 p-0 block" />
        </div>
        <span className="ml-1.5">{localeLabel.uz}</span>
      </a>
      <a
        className={`${
          locale == 'en' ? 'bg-primary text-white border-none' : 'bg-white'
        } font-medium hover:bg-primary hover:text-white inline-flex items-center mx-2 px-3 py-1 rounded-lg border border-gray-200 `}
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'en')}
      >
        <div className="w-4 h-4 overflow-hidden rounded-full">
          <Us className="w-6 p-0 block" />
        </div>
        <span className="ml-1.5">{localeLabel.us}</span>
      </a>
    </div>
  )
}

export default memo(LanguageDropDown)
