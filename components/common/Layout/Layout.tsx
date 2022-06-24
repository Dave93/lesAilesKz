import cn from 'classnames'
import React, {
  FC,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { CommerceProvider } from '@framework'
import type { Page } from '@commerce/types/page'
import type {
  APILinkItem,
  LinkItem,
  LinkLabel,
} from '@commerce/types/headerMenu'
import { useAcceptCookies } from '@lib/hooks/useAcceptCookies'
import styles from './Layout.module.css'
import Header from '@components_new/Header'
import Image from 'next/image'
import Link from 'next/link'
import { Link as LinkScroll } from 'react-scroll'
import { useUI } from '@components/ui'
import {
  faInstagram,
  faFacebook,
  faTelegram,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SocialIcons } from '@commerce/types/socialIcons'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
import axios from 'axios'
import { City } from '@commerce/types/cities'
import { parsePhoneNumber } from 'libphonenumber-js'
import { Dialog, Transition } from '@headlessui/react'
import Cookies from 'js-cookie'
import CityModal from './CityModal'
import Overlay from './Overlay'
import { chunk, sortBy } from 'lodash'
import SetLocation from '@components_new/header/SetLocation'
const { publicRuntimeConfig } = getConfig()

interface Props {
  pageProps: {
    pages?: Page[]
    categories: any[]
    topMenu: APILinkItem[]
    footerInfoMenu: APILinkItem[]
    socials: SocialIcons[]
    cleanBackground?: boolean
    cities: City[]
    currentCity?: City
    geo: any
  }
}

interface SocIconsProps {
  [key: string]: IconDefinition
}

const socIcons: SocIconsProps = {
  inst: faInstagram,
  fb: faFacebook,
  tg: faTelegram,
}

const Layout: FC<Props> = ({
  children,
  pageProps: {
    categories = [],
    topMenu = [],
    footerInfoMenu = [],
    socials = [],
    cities = [],
    currentCity,
    cleanBackground = false,
    ...pageProps
  },
}) => {
  const { locale = 'ru', pathname, query } = useRouter()
  const { t: tr } = useTranslation('common')

  const [configData, setConfigData] = useState({} as any)

  const { setCitiesData, activeCity, setActiveCity, addressModal } = useUI()

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
    } catch (e) { }
  }

  // const fetchGeo = async () => {
  //   const res = await fetch('/api/geo')
  //   const json = await res.json()
  // }

  useEffect(() => {
    fetchConfig()
    setCitiesData(cities)
    document.body.className = cleanBackground ? 'bg-gray-100' : ''
    return
  }, [cleanBackground, currentCity])

  let newFooterMenu = chunk(footerInfoMenu, 4)
  return (
    <CommerceProvider locale={locale}>
      <div className="font-sans">
        <div className="md:flex md:flex-col h-screen">
          <Header menu={topMenu} />
          <main
            className={`${cleanBackground == true ? 'bg-gray-100' : ''
              } flex-grow pb-14 relative`}
          >
            {addressModal ? (
              <SetLocation />
            ) : pathname == '/[city]' ? (
              children
            ) : (
              <div className="container mx-auto">{children}</div>
            )}
            <Overlay />
          </main>
          <footer className="md:flex flex-col flex border border-t bg-white">
            <div className="w-full pt-5">
              <div className="md:border-b  px-4">
                <div className="container mx-auto md:my-6">
                  <div className="md:flex justify-between mb-1 md:py-10">
                    {/* <div className="">
                      <div className="pb-10">
                        <div>{tr('call_center')}</div>
                        <div className="text-[18px] font-bold">
                          {currentCity?.phone && (
                            <a
                              href={parsePhoneNumber(
                                currentCity?.phone ?? ''
                              )?.getURI()}
                            >
                              {parsePhoneNumber(currentCity?.phone ?? '')
                                ?.formatNational()
                                .substring(2)}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="">
                        <div className="">
                          <div>{tr('telegram_bot')}</div>
                          <a
                            href="https://t.me/lesailesbestbot"
                            className="font-medium"
                          >
                            https://t.me/lesailesbestbot
                          </a>
                        </div>
                      </div>
                    </div> */}
                    <div className="flex-grow md:border-0 mt-5 md:mt-0 pb-5 md:pb-0">
                      <div className="">
                        <div>
                          {newFooterMenu && newFooterMenu.length > 0 && (
                            <>
                              <div className="md:grid grid-cols-2 gap-3 space-y-5 md:space-y-0">
                                {newFooterMenu.map((item, i) => (
                                  <ul className="space-y-5" key={`footer_${i}`}>
                                    {item.map((link: any, i) => {
                                      const keyTyped =
                                        `name_${locale}` as keyof typeof link
                                      let href = link.href
                                      if (href.indexOf('http') < 0) {
                                        href = `/${currentCity?.slug}${link.href}`
                                      }
                                      return (
                                        <li key={`${href}${i}`}>
                                          <Link href={href} prefetch={false}>
                                            <a>{link[keyTyped]}</a>
                                          </Link>
                                        </li>
                                      )
                                    })}
                                  </ul>
                                ))}
                              </div>
                            </>
                          )}
                          {/* {footerInfoMenu && footerInfoMenu.length > 0 && (
                          <>
                            <ul className="ml-3">
                              {footerInfoMenu.map((item) => {
                                const keyTyped =
                                  `name_${locale}` as keyof typeof item
                                let href = item.href
                                if (href.indexOf('http') < 0) {
                                  href = `/${currentCity?.slug}${item.href}`
                                }
                                return (
                                  <li key={item.href}>
                                    <Link href={href} prefetch={false}>
                                      <a>{item[keyTyped]}</a>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          </>
                        )} */}
                        </div>
                      </div>
                    </div>
                    <div className="mb-10 mt-5 md:mt-0 md:mb-0">
                      <ul className="flex  items-center text-2xl">
                        {socials.map((soc) => {
                          return (
                            <li
                              key={soc.code}
                              className="mx-1 bg-gray-700 rounded-xl p-3"
                            >
                              <a
                                target="_blank"
                                className="no-underline "
                                href={soc.link}
                              >
                                <FontAwesomeIcon
                                  icon={socIcons[soc.code]}
                                  className="text-white w-10 h-10"
                                />
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                      <div className="flex">
                        <a
                          href="https://play.google.com/store/apps/details?id=com.havoqandpeople.les.kz"
                          className="flex"
                        >
                          <div className=" bg-gray-700 flex items-center mt-11 p-2 rounded-lg">
                            <img
                              src="/google-play.png"
                              alt=""
                              className="w-5"
                            />
                            <div className="text-white ml-2">
                              <div className="text-sm">Google Play</div>
                            </div>
                          </div>
                        </a>
                        <a href="">
                          <div className=" bg-gray-700 flex items-center ml-1 mt-11 p-2 px-2 rounded-lg">
                            <img src="/apple.png" alt="" />
                            <div className="text-white ml-2">
                              <div className="text-[8px]">Available on the</div>
                              <div className="text-sm leading-3">App Store</div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-4 container mx-auto md:py-5 flex border-t md:border-t-0  px-4 flex-wrap">
                <div className="order-2 md:order-1">
                  {new Date().getFullYear()} {tr('all_rights_reserved')}
                </div>
                <img
                  src="/assets/main_logo.svg"
                  className="flex md:m-auto mt-2 order-1"
                />
              </div>
            </div>
          </footer>
        </div>
        {/* <CityModal cities={cities} /> */}
      </div>
      <div className={cn(styles.root)}>
        {/* <Navbar links={navBarlinks} />
        <main className="fit">{children}</main>
        <Footer pages={pageProps.pages} />
        <ModalUI />
        <SidebarUI />
        <FeatureBar
          title="This site uses cookies to improve your experience. By clicking, you agree to our Privacy Policy."
          hide={acceptedCookies}
          action={
            <Button className="mx-5" onClick={() => onAcceptCookies()}>
              Accept cookies
            </Button>
          }
        /> */}
      </div>
    </CommerceProvider>
  )
}

export default Layout
