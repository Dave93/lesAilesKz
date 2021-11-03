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
import { MenuIcon, XIcon } from '@heroicons/react/outline'
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
const { publicRuntimeConfig } = getConfig()

const CartWithNoSSR = dynamic(
  () => import('@components_new/common/SmallCart'),
  { ssr: false }
)

const Header: FC<{
  menu: Array<APILinkItem>
}> = ({ menu = [] }) => {
  const { locale = 'ru' } = useRouter()
  const { activeCity, cities } = useUI()

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
  const { showAddress, locationData } = useUI()

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

  return (
    <>
      <header
        className="py-[15px] items-center md:flex bg-white mb-3"
        id="header"
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="w-32 md:w-48 ml-4 md:ml-0">
              <Link href={`/${chosenCity.slug}`} prefetch={false}>
                <a className="flex">
                  <Image src="/assets/main_logo.svg" width="188" height="68" />
                </a>
              </Link>
            </div>
            <div className=" md:flex hidden">
              <button
                className="bg-primary truncate cursor-pointer flex items-center justify-center rounded-xl text-white w-64 h-[40px] md:h-[36px] outline-none focus:outline-none"
                onClick={() => {
                  showAddress()
                }}
              >
                <div className="flex items-center mr-3">
                  <Image src="/assets/location.png" width="14" height="16" />
                </div>
                {locationData && locationData.address
                  ? locationData.address
                  : tr('chooseLocation')}
              </button>
            </div>

            <HeaderMenu menuItems={menu} />
            <div className="flex items-center">
              <CartWithNoSSR channelName={channelName} />
              <div className="md:hidden flex">
                <MenuIcon
                  className="cursor-pointer h-5 text-secondary w-5 mr-[21px] md:mr-0"
                  onClick={() => setMobMenuOpen(true)}
                />
              </div>
            </div>
            <SignInButton />

            {/* <div className="flex items-center">
              <LanguageDropDown />
              <XIcon
                className="cursor-pointer h-5 text-secondary w-5"
                onClick={() => setMenuOpen(false)}
              />
            </div> */}
          </div>
        </div>
        {mobMenuOpen && (
          <div className="w-screen h-screen fixed bg-secondary z-40 top-0 overflow-y-auto p-4 pt-12">
            <div className="flex justify-between items-center border-b pb-2 border-blue">
              <div className="w-32 md:w-48 md:ml-0">
                <Link href={`/${chosenCity.slug}`} prefetch={false}>
                  <a className="flex">
                    <Image
                      src="/assets/footer_logo.svg"
                      width="188"
                      height="68"
                    />
                  </a>
                </Link>
              </div>
              <div>
                <XIcon
                  className="cursor-pointer h-5 w-5 text-white"
                  onClick={() => setMobMenuOpen(false)}
                />
              </div>
            </div>
            <div className="border-blue border-b py-5 md:mb-7">
              <MobChooseCityDropDown />
            </div>
            <div className="border-b border-blue py-8">
              <SignInButton />
              <MobHeaderMenu menuItems={menu} setMobMenuOpen={setMobMenuOpen} />
            </div>
            <div className="ml-9 text-white pt-8">
              {chosenCity?.phone && (
                <>
                  <div className="text-xs mb-1">{tr('delivery_phone')}</div>
                  <div className="text-2xl mb-5">
                    <a href={parsePhoneNumber(chosenCity?.phone)?.getURI()}>
                      {parsePhoneNumber(chosenCity?.phone)
                        ?.formatNational()
                        .substring(2)}
                    </a>
                  </div>
                </>
              )}
              <a className="flex mb-5" href="#">
                <Image src="/assets/appstore.png" width="151" height="49" />
              </a>
              <MobLanguageDropDown />
            </div>
          </div>
        )}
      </header>
    </>
  )
}
export default Header
