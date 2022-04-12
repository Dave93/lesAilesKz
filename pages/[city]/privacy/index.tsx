import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
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

  return {
    props: {
      categories,
      brands,
      topMenu,
      currentCity,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

export default function Privacy() {
  const { t: tr } = useTranslation('common')
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: tr('privacy_text') }} />
    </>
  )
}

Privacy.Layout = Layout
