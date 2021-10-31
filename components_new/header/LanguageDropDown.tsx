import { Fragment, FC, memo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Ru, Uz } from 'react-flags-select'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'

const locales = {
  ru: Ru,
  uz: Uz,
}

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
}

const LanguageDropDown: FC = () => {
  const router = useRouter()
  const { locale, pathname } = router
  const keyTyped = locale as keyof typeof locales
  const keyTypedLabel = locale as keyof typeof locales
  const localeComponent = locales[keyTyped]({})
  const { activeCity } = useUI()

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    let path = pathname.replace('[city]', activeCity.slug)
    return router.push(path, path, {
      locale: loc,
    })
  }
  return (
    <div>
      <a
        className={`${
          locale == 'ru' ? 'bg-primary text-white' : ''
        } font-medium hover:bg-primary  hover:text-white inline-flex items-center mx-8 px-3 py-1 rounded-full`}
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'ru')}
      >
        <Ru className="w-4 h-4 rounded-full" />
        <span className="ml-1.5">{localeLabel.ru}</span>
      </a>
      <a
        className={`${
          locale == 'uz' ? 'bg-primary text-white' : ''
        } font-medium hover:bg-primary hover:text-white inline-flex items-center mx-8 px-3 py-1 rounded-full`}
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'uz')}
      >
        <div className="w-4 h-4 overflow-hidden rounded-full">
          <Uz className="w-6 p-0 block" />
        </div>
        <span className="ml-1.5">{localeLabel.uz}</span>
      </a>
    </div>
  )
}

export default memo(LanguageDropDown)
