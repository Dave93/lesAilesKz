import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import NewsDetail from '@components_new/news/NewsDetail'
import cookies from 'next-cookies'
import axios from 'axios'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { ClockIcon, CalendarIcon } from '@heroicons/react/solid'
import { ParsedUrlQuery } from 'querystring'

interface IParams extends ParsedUrlQuery {
  id: string
}

import menuItems from '@commerce/data/newsMenu'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  params,
  query,
  ...context
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise
  const { id } = params as IParams
  const c = cookies(context)
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  const { data } = await axios.get(
    `${process.env.API_URL}/api/news/public/${id}/?city_id=${currentCity.id}`
  )

  if (!data.data.length) {
    return {
      notFound: true,
    }
  }

  const { data: relatedData } = await axios.get(
    `${process.env.API_URL}/api/news/related/${id}/?city_id=${currentCity.id}`
  )

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      cleanBackground: true,
      cities,
      currentCity,
      newsItem: data.data[0],
      relatedNews: relatedData.data,
    },
  }
}

export default function NewsId({
  newsItem,
  relatedNews,
}: {
  newsItem: any
  relatedNews: any
}) {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router
  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })
  return (
    <>
      <div>
        <div className="flex items-center justify-center my-10">
          {items.map((item, id) => (
            <div key={id} className="flex items-center ml-10">
              <img
                src={`${
                  pathname.indexOf(item.href) >= 0 ? item.activeIcon : item.icon
                }`}
              />
              <Link href={item.href} locale={locale} prefetch={false}>
                <a
                  className={`${
                    pathname.indexOf(item.href) >= 0
                      ? 'text-primary'
                      : 'text-gray-400'
                  } ml-1 text-sm`}
                >
                  {item.name}
                </a>
              </Link>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-3xl flex p-5">
          <div className="">
            {newsItem.asset && newsItem.asset.length ? (
              <Link href={`${'/news/' + newsItem.id}`} prefetch={false}>
                <a>
                  <Image
                    src={newsItem.asset[0].link}
                    width="450"
                    height="450"
                    alt={locale == 'ru' ? newsItem.name : newsItem.name_uz}
                  />
                </a>
              </Link>
            ) : (
              <Link href={`${'/news/' + newsItem.id}`} prefetch={false}>
                <a>
                  <Image
                    src="/no_photo.svg"
                    width="450"
                    height="450"
                    alt={locale == 'ru' ? newsItem.name : newsItem.name_uz}
                  />
                </a>
              </Link>
            )}
          </div>
          <div className="ml-16 w-[430px]">
            <div className="text-2xl">
              {locale == 'ru' ? newsItem.name : newsItem.name_uz}
            </div>
            {/* <div className="text-sm text-gray-400 mb-8">{newsItem.}</div> */}
            <div
              dangerouslySetInnerHTML={{
                __html:
                  locale == 'ru'
                    ? newsItem.description
                    : newsItem.description_uz,
              }}
            ></div>
          </div>
        </div>
      </div>
      {relatedNews.length && (
        <>
          <div className="text-2xl mb-4 mt-10">{tr('recommended_news')}</div>
          <div className="bg-white rounded-3xl flex justify-between p-4">
            {relatedNews.map((item: any) => (
              <div key={item.id}>
                <div className="relative rounded-t-lg overflow-hidden">
                  {item.asset && item.asset.length ? (
                    <Link href={`${'/news/' + item.id}`} prefetch={false}>
                      <a>
                        <Image
                          src={item.asset[0].link}
                          width="350"
                          height="350"
                          alt={locale == 'ru' ? item.name : item.name_uz}
                        />
                      </a>
                    </Link>
                  ) : (
                    <Link href={`${'/news/' + item.id}`} prefetch={false}>
                      <a>
                        <Image
                          src="/no_photo.svg"
                          width="350"
                          height="350"
                          alt={locale == 'ru' ? item.name : item.name_uz}
                        />
                      </a>
                    </Link>
                  )}
                  {/* <div className="absolute bottom-5 flex justify-between px-4 text-white w-full">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <div>22:00-03:00</div>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <div>01.07-31.07</div>
                    </div>
                  </div> */}
                </div>
                <div className="flex flex-col justify-between p-5 flex-grow">
                  <div className="text-lg mb-3">
                    <Link href={`${'/news/' + item.id}`} prefetch={false}>
                      {locale == 'ru' ? item.name : item.name_uz}
                    </Link>
                  </div>
                  <Link href={`${'/news/' + item.id}`} prefetch={false}>
                    <a className="text-xs text-gray-400 hover:underline">
                      {tr('more')}
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

NewsId.Layout = Layout
