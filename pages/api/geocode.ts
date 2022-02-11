import axios from 'axios'
import { withSentry } from '@sentry/nextjs'

const handler = async function handler(req: any, res: any) {
  const {
    query: { text, bounds },
  } = req

  if (!text) {
    return res.status(200).json([])
  }
  let { data: configData } = await axios.get(
    `${process.env.API_URL}/api/configs/public`
  )

  try {
    configData = Buffer.from(configData.data, 'base64')
    configData = configData.toString('ascii')
    configData = JSON.parse(configData)
  } catch (e) {}

  let yandexKey = configData.yandexGeoKey
  yandexKey = yandexKey.split(',')
  yandexKey = yandexKey[Math.floor(Math.random() * yandexKey.length)]

  let boundsArray = bounds.split(',')

  const { data: getCodeData } = await axios.get(
    `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexKey}&geocode=${encodeURI(
      text
    )}&bbox=${boundsArray[0]},${boundsArray[1]}~${boundsArray[2]},${
      boundsArray[3]
    }&format=json`
  )

  let result = [] as any[]

  getCodeData.response.GeoObjectCollection.featureMember.map((item: any) => {
    let formattedArray: any[] = []
    item.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components.map(
      (comp: any) => {
        if (['country', 'province', 'district', 'street'].includes(comp.kind)) {
          formattedArray.push(comp.name)
        }
      }
    )
    result.push({
      title: item.GeoObject.name,
      description: item.GeoObject.description,
      addressItems:
        item.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components,
      formatted: formattedArray.join(', '),
      coordinates: {
        long: item.GeoObject.Point.pos.split(' ')[0],
        lat: item.GeoObject.Point.pos.split(' ')[1],
      },
    })
  })

  res.status(200).json(result)
}

export default withSentry(handler)
