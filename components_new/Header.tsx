import React, {
  useState,
  useCallback,
  useContext,
  Fragment,
  FC,
  useEffect,
  useMemo,
} from 'react'
import SetLocation from '@components_new/header/SetLocation'
import Link from 'next/link'
import ChooseCityDropDown from './header/ChooseCityDropDown'
import {
  ChevronRightIcon,
  MenuIcon,
  UserCircleIcon,
  XIcon,
} from '@heroicons/react/outline'
import HeaderMenu from '@components_new/header/HeaderMenu'
import SignInButton from './header/SignInButton'
import LanguageDropDown from './header/LanguageDropDown'
import Image from 'next/image'
import type { APILinkItem, LinkItem } from '@commerce/types/headerMenu'
import MobHeaderMenu from './header/MobHeaderMenu'
import MobChooseCityDropDown from './header/MobChooseCityDropDown'
import MobLanguageDropDown from './header/MobLanguageDropDown'
import HeaderPhone from './header/HeaderPhone'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
import axios from 'axios'
import { useUI } from '@components/ui/context'
import parsePhoneNumber from 'libphonenumber-js'
import defaultChannel from '@lib/defaultChannel'
import { faTelegram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import MobSetLocation from './header/MobSetLocation'
import menuItems from '@commerce/data/profileMenu'

const { publicRuntimeConfig } = getConfig()

const CartWithNoSSR = dynamic(
  () => import('@components_new/common/SmallCart'),
  { ssr: false }
)

const Header: FC<{
  menu: Array<APILinkItem>
}> = ({ menu = [] }) => {
  const { locale = 'ru' } = useRouter()
  const {
    activeCity,
    cities,
    openSignInModal,
    closeSignInModal,
    user,
    hideOverlay,
  } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobMenuOpen, setMobMenuOpen] = useState(false)
  const { t: tr } = useTranslation('common')
  const [configData, setConfigData] = useState({} as any)
  const [channelName, setChannelName] = useState('chopar')
  const [popoverShow, setPopoverShow] = React.useState(false)
  const { showAddress, locationData } = useUI()

  const router = useRouter()

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

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
    getChannel()
    fetchConfig()
    return
  }, [])

  const openModal = () => {
    openSignInModal()
  }

  const closeModal = () => {
    closeSignInModal()
  }

  const closePopover = () => {
    hideOverlay()
    setPopoverShow(false)
  }

  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })

  const goTo = (link: string) => {
    setMobMenuOpen(false)
    router.push(link, undefined, {
      locale,
    })
  }

  return (
    <>
      <header
        className="py-[15px] items-center md:flex bg-white border-b px-4 md:px-0"
        id="header"
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="hidden md:block md:w-48 ml-4 md:ml-0">
              <Link href={`/${chosenCity.slug}`} prefetch={false}>
                <a className="flex">
                  <Image src="/assets/main_logo.svg" width="188" height="68" />
                </a>
              </Link>
            </div>
            <div className="md:hidden">
              <MobSetLocation />
            </div>
            <div className=" md:flex hidden">
              <button
                className="bg-primary truncate cursor-pointer flex items-center justify-center rounded-xl text-white w-64 h-12 md:h-[36px] outline-none focus:outline-none"
                onClick={() => {
                  showAddress()
                }}
              >
                <div className="flex items-center mr-3">
                  <Image src="/assets/location.svg" width="14" height="16" />
                </div>
                {locationData && locationData.address
                  ? locationData.address
                  : tr('chooseLocation')}
              </button>
            </div>
            <div className="hidden md:flex">
              <HeaderMenu menuItems={menu} />
            </div>
            <div className="md:flex items-center">
              <CartWithNoSSR channelName={channelName} />
              <div
                className="md:hidden flex p-2 bg-gray-100 rounded-lg border"
                onClick={() => setMobMenuOpen(true)}
              >
                <img src="/menu.svg" width="30" />
              </div>
            </div>
            <div className="hidden md:block">
              <SignInButton />
            </div>
          </div>
        </div>
        {mobMenuOpen && (
          <div className="w-full h-full fixed bg-white z-40 top-0 left-0 overflow-y-auto p-4">
            <div className="flex justify-between items-center pb-7 pt-2">
              <div className="">
                <Link href={`/${chosenCity.slug}`} prefetch={false}>
                  <a className="flex">
                    <Image
                      src="/assets/main_logo.svg"
                      width="197"
                      height="30"
                    />
                  </a>
                </Link>
              </div>
              <div>
                <XIcon
                  className="cursor-pointer w-6 text-black"
                  onClick={() => setMobMenuOpen(false)}
                />
              </div>
            </div>
            {!user ? (
              <div className="border-b border-t mb-3 py-5">
                <button
                  className="text-2xl px-4"
                  onClick={() => {
                    openModal()
                  }}
                >
                  Войти
                </button>
              </div>
            ) : (
              <div className="border-b mb-4">
                <div className="flex items-center border-b border-t py-2 px-3">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div className="text-2xl ml-5">{user.user.name}</div>
                </div>
                {items.map((item) => {
                  let href = `${item.href}`

                  if (href.indexOf('http') < 0) {
                    href = `/${activeCity.slug}${item.href}`
                  }

                  return (
                    <div
                      className="cursor-pointer flex items-center py-4 px-4 justify-between"
                      onClick={() => goTo(href)}
                    >
                      <div className="flex items-center">
                        <img src={item.icon} />
                        <div className="ml-3">{item.name}</div>
                      </div>
                      <div>
                        <ChevronRightIcon className=" w-5 text-blue-500" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="px-4 mb-3 pb-3">
              <HeaderMenu menuItems={menu} />
            </div>
            <LanguageDropDown />
          </div>
        )}
      </header>
    </>
  )
}
export default Header
