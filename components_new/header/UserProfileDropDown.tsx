import React, { Fragment, FC, memo, ReactEventHandler, useRef } from 'react'
import { Menu, Transition } from '@headlessui/react'
import menuItems from '@commerce/data/profileMenu'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import Link from 'next/link'
import { useRouter } from 'next/router'
import LanguageDropDown from './LanguageDropDown'
import { createPopper } from '@popperjs/core'
import { ChevronRightIcon } from '@heroicons/react/solid'
import { UserCircleIcon } from '@heroicons/react/outline'

const UserProfileDropDown: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router
  const [popoverShow, setPopoverShow] = React.useState(false)
  const btnRef = useRef<any>(null)
  const popoverRef = useRef<any>(null)
  console.log(router)

  const { user, setUserData, activeCity, showOverlay, hideOverlay, overlay } =
    useUI()
  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })

  const openPopover = () => {
    showOverlay()
    createPopper(btnRef.current, popoverRef.current, {
      placement: 'bottom',
    })
    setPopoverShow(true)
  }
  const closePopover = () => {
    hideOverlay()
    setPopoverShow(false)
  }

  const logout = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.removeItem('mijoz')
    setUserData(null)
  }

  const goTo = (link: string) => {
    closePopover()
    router.push(link, undefined, {
      locale
    })
  }

  return (
    <>
      <div>
        <button
          onClick={() => {
            popoverShow ? closePopover() : openPopover()
          }}
          className="bg-gray-200 px-8 outline-none focus:outline-none mb-5 md:mb-0 py-2 rounded-xl"
        >
          {user.user.name}
        </button>
      </div>
      <div
        className={
          popoverShow
            ? 'z-20 rounded-2xl p-3 mt-8 bg-white absolute'
            : 'hidden '
        }
      >
        <div className="flex items-center ml-5">
          <UserCircleIcon className="h-10 w-10 text-gray-400" />
          <div className="text-lg ml-5">{user.user.name}</div>
        </div>
        {items.map((item) => {
          let href = `${item.href}`

          if (href.indexOf('http') < 0) {
            href = `/${activeCity.slug}${item.href}`
          }

          return (
            <a onClick={() => goTo(href)}>
              <div className="cursor-pointer flex items-center py-4 px-5 justify-between">
                <div className="flex items-center">
                  <img src={item.icon} />
                  <div className="ml-3">{item.name}</div>
                </div>
                <div>
                  <ChevronRightIcon className=" w-5 text-blue-500" />
                </div>
              </div>
            </a>
          )
        })}

        <div className="bg-white mt-8 overflow-hidden rounded-2xl text-center w-max">
          <LanguageDropDown />
          <button
            className="bg-gray-200 rounded-xl w-full text-gray-400 py-4 mt-5"
            onClick={logout}
          >
            Выйти
          </button>
        </div>
      </div>
    </>
  )
}

export default memo(UserProfileDropDown)
