export type Page = { url: string }
export type GetAllPagesResult = { pages: Page[] }
import { OperationContext } from '@commerce/api/operations'
import type { LocalConfig } from '../index'
import getCities from '../utils/fetch-cities'

export default function getAllCitiesOperation({
  commerce,
}: OperationContext<any>) {
  async function getAllCities({
    config,
    preview,
  }: {
    url?: string
    config?: Partial<LocalConfig>
    preview?: boolean
  }): Promise<GetAllPagesResult> {
    const cfg = commerce.getConfig(config)
    const cities = await getCities(cfg)
    return cities
  }
  return getAllCities
}
