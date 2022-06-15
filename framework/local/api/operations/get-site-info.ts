import { OperationContext } from '@commerce/api/operations'
import { Category } from '@commerce/types/site'
import { LinkItem, APILinkItem } from '@commerce/types/headerMenu'
import { SocialIcons } from '@commerce/types/socialIcons'
import { LocalConfig } from '../index'
import getMenus from '../utils/fetch-menus'
import getCategories from '../utils/fetch-categories'
import getCities from '../utils/fetch-cities'
import { City } from '@commerce/types/cities'
import useSWR from 'swr'
import fetch from 'isomorphic-unfetch'

export type GetSiteInfoResult<
  T extends { categories: any[]; brands: any[] } = {
    categories: LinkItem[]
    brands: any[]
    topMenu: APILinkItem[]
    footerInfoMenu: APILinkItem[]
    socials: SocialIcons[]
    cities: City[]
  }
> = T

export default function getSiteInfoOperation({
  commerce,
}: OperationContext<any>) {
  async function getSiteInfo({
    query,
    variables,
    config,
  }: {
    query?: string
    variables?: any
    config?: Partial<LocalConfig>
    preview?: boolean
  } = {}): Promise<GetSiteInfoResult> {
    const cfg = commerce.getConfig(config)
    const { footer_info: footerInfoMenu, header: topMenu } = await getMenus(cfg)

    const cities = await getCities(cfg)

    const currentCity = cities.find(
      (city: City) => city.slug == config?.queryParams?.city
    )

    const categories = await getCategories(cfg)

    return Promise.resolve({
      categories: categories.filter((cat: any) => !cat.half_mode),
      brands: [],
      topMenu,
      footerInfoMenu: footerInfoMenu || [],
      cities,
      currentCity,
      socials: [
        {
          code: 'fb',
          link: '',
        },
        {
          code: 'inst',
          link: 'https://www.instagram.com/lesaileskz/',
        },
        {
          code: 'tg',
          link: '',
        },
      ],
    })
  }

  return getSiteInfo
}
