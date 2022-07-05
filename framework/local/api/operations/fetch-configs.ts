import { CommerceAPIConfig } from '@commerce/api'

const getConfigs = async ({ fetch }: CommerceAPIConfig) => {
  const { data } = await fetch(
    '',
    {
      variables: {
        apiUrl: 'configs/public',
      },
    },
    {
      method: 'GET',
    }
  )
  return data
}
export default getConfigs
