import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import cookies from 'next-cookies'
import axios from 'axios'
import menuItems from '@commerce/data/newsMenu'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NewsItem from '@components_new/news/NewsItem'
import useTranslation from 'next-translate/useTranslation'

export async function getServerSideProps({
  preview,
  locale,
  locales,
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
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  const { data } = await axios.get(
    `${process.env.API_URL}/api/news/public?city_id=${currentCity.id}`
  )

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      currentCity,
      cleanBackground: true,
      cities,
      news: data.data,
    },
  }
}

export default function News({ news }: { news: any }) {
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
      <div className="flex items-center justify-center md:my-10 space-x-6 py-6 md:py-0">
        {items.map((item, id) => (
          <div key={id} className="flex items-center md:ml-10 ">
            {/* <img
              src={`${
                pathname.indexOf(item.href) >= 0 ? item.activeIcon : item.icon
              }`}
            /> */}
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
      <div className="md:grid grid-cols-3 gap-10 mx-5 md:mx-0">
        {!news.length && (
          <div className="col-span-3 text-2xl text-center">
            {tr('yet_no_news')}
          </div>
        )}
        <NewsItem newsItems={news} />
      </div>
    </>
  )
}

News.Layout = Layout
