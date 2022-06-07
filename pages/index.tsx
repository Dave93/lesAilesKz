import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Image from 'next/dist/client/image'
import { Menu, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo } from 'react'
import { useUI } from '@components/ui'
import { City } from '@commerce/types/cities'
import cookies from 'next-cookies'
import router, { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

export async function getServerSideProps({
  preview,
  locale,
  locales,
  ...context
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { categories, brands, topMenu, footerInfoMenu, socials, cities } =
    await siteInfoPromise
  const c = cookies(context)

  if (c['city_slug']) {
    return {
      redirect: {
        destination: `/${c['city_slug']}`,
      },
    }
  } else {
    return {
      redirect: {
        destination: `/${publicRuntimeConfig.citySlug}`,
      },
    }
  }

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

export default function DevPage({ cities }: { cities: any }) {
  const { t: tr } = useTranslation('common')
  const { locale } = useRouter()
  const { activeCity, setActiveCity, setCitiesData } = useUI()
  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const changeCity = (city: City) => {
    setActiveCity(city)
    router.push(`/${city.slug}`)
  }

  useEffect(() => {
    setCitiesData(cities)
  }, [])

  return (
    <div className="bg-secondary md:w-full h-screen">
      <div className="m-auto w-max">
        <Image src="/assets/footer_logo.svg " width={300} height={200} />
      </div>
      <div className="m-auto w-max mb-8 text-white md:text-5xl text-3xl">
        {tr('choose_your_city')}
      </div>
      <div className="m-auto md:w-96 bg-white rounded-2xl w-max">
        <Menu as="div" className="text-center">
          <>
            <Transition
              show={true}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items static>
                {cities?.map((item: City) => (
                  <Menu.Item key={item.id}>
                    <span
                      onClick={() => changeCity(item)}
                      className={`block px-4 py-2 cursor-pointer text-3xl text-secondary hover:text-white hover:bg-secondary`}
                    >
                      {locale == 'uz' ? item.name_uz : item.name}
                    </span>
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </>
        </Menu>
      </div>
    </div>
  )
}
