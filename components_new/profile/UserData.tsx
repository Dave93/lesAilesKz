import { FC, memo } from 'react'
import menuItems from '@commerce/data/profileMenu'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import Link from 'next/link'
import { useRouter } from 'next/router'

const UserData: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router

  const { user, setUserData, activeCity } = useUI()

  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })

  console.log(router.asPath)

  return (
    <div className="px-20 py-3 bg-gray-200 my-5 rounded-2xl">
      <div className="flex justify-around">
        {items.map((item, id) => (
          <div
            className={`${
              router.asPath == '/' + activeCity.slug + item.href
                ? 'bg-primary'
                : 'bg-white'
            } flex rounded-lg p-4 items-center`}
            key={id}
          >
            <img
              src={`${
                router.asPath == '/' + activeCity.slug + item.href
                  ? item.activeIcon
                  : item.icon
              }`}
              className={`${
                router.asPath == '/' + activeCity.slug + item.href
                  ? 'text-white'
                  : 'fill-current text-black'
              }`}
            />
            <Link
              href={'/' + activeCity.slug + item.href}
              locale={locale}
              prefetch={false}
            >
              <a
                className={`${
                  router.asPath == '/' + activeCity.slug + item.href
                    ? 'text-white'
                    : ''
                } ml-1 text-sm`}
              >
                {item.name}
              </a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(UserData)
