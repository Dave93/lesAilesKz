import React, {
  memo,
  Fragment,
  useEffect,
  useRef,
  useState,
  useMemo,
  FC,
  createRef,
  useCallback,
  SetStateAction,
} from 'react'
import { Menu, Transition, Disclosure } from '@headlessui/react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
  XIcon,
} from '@heroicons/react/solid'
import {
  YMaps,
  withYMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
  GeolocationControl,
  ZoomControl,
  PlacemarkGeometry,
} from 'react-yandex-maps'
import { useForm, SubmitHandler } from 'react-hook-form'
import Autosuggest from 'react-autosuggest'
import useSWR from 'swr'
import getConfig from 'next/config'
import axios from 'axios'
import Downshift from 'downshift'
import debounce from 'lodash.debounce'
import { useUI } from '@components/ui/context'
import { toast } from 'react-toastify'
import useTranslation from 'next-translate/useTranslation'
import { City } from '@commerce/types/cities'
import router, { useRouter } from 'next/router'
import SimpleBar from 'simplebar-react'
import { chunk, sortBy } from 'lodash'
import { DateTime } from 'luxon'
import Cookies from 'js-cookie'

const { publicRuntimeConfig } = getConfig()

let webAddress = publicRuntimeConfig.apiUrl
interface AnyObject {
  [key: string]: any
}

const LocationTabs: FC = () => {
  const { locale, pathname, query } = useRouter()
  const {
    locationData,
    setLocationData,
    cities,
    activeCity,
    setActiveCity,
    hideAddress,
    addressId,
    setAddressId,
    setStopProducts,
  } = useUI()
  const [tabIndex, setTabIndex] = useState(
    locationData?.deliveryType || 'deliver'
  )
  const [pickupIndex, setPickupIndex] = useState(1)
  const [pickupPoints, setPickupPoint] = useState([] as any[])
  const map = useRef<any>(null)
  const [ymaps, setYmaps] = useState<any>(null)
  const objects = useRef<any>(null)

  const [geoSuggestions, setGeoSuggestions] = useState([])
  const [isSearchingTerminals, setIsSearchingTerminals] = useState(false)

  const downshiftControl = useRef<any>(null)

  const [selectedCoordinates, setSelectedCoordinates] = useState(
    locationData && locationData.location
      ? [
          {
            coordinates: {
              lat: locationData.location[0],
              long: locationData.location[1],
            },
            key: `${locationData.location[0]}${locationData.location[1]}`,
          },
        ]
      : ([] as any)
  )
  const [mapCenter, setMapCenter] = useState(
    (locationData?.location && locationData.location.length
      ? locationData?.location
      : [activeCity?.lat, activeCity?.lon]) as number[]
  )
  const [mapZoom, setMapZoom] = useState(
    ((locationData?.location && locationData.location.length ? 17 : 10) ||
      activeCity?.map_zoom) as number
  )

  const [activePoint, setActivePoint] = useState(
    (locationData ? locationData.terminal_id : null) as number | null
  )

  const [configData, setConfigData] = useState({} as any)

  // console.log(activeCity)

  let currentAddress = ''
  if (activeCity.active) {
    if (locale == 'ru') {
      currentAddress = 'Узбекистан, ' + activeCity.name + ','
    } else {
      currentAddress = "O'zbekiston, " + activeCity.name_uz + ','
    }
  }

  const { register, handleSubmit, getValues, setValue, watch, reset } =
    useForm<AnyObject>({
      defaultValues: {
        address: locationData?.address || currentAddress,
        flat: locationData?.flat || '',
        house: locationData?.house || '',
        entrance: locationData?.entrance || '',
        door_code: locationData?.door_code || '',
        floor: locationData?.floor || '',
        label: locationData?.label || '',
        comments: locationData?.comments || '',
      },
    })

  const changeTabIndex = async (index: string) => {
    setLocationData({ ...locationData, deliveryType: index })

    if (index == 'pickup') {
      // await loadPickupItems()
    }

    setTabIndex(index)
  }

  const loadPickupItems = async () => {
    setPickupPoint([])
    const { data } = await axios.get(
      `${webAddress}/api/terminals/pickup?city_id=${activeCity.id}`
    )
    let res: any[] = []
    let currentTime = DateTime.local()
    let weekDay = currentTime.weekday
    data.data.map((item: any) => {
      if (item.latitude) {
        item.isWorking = false
        if (weekDay >= 1 && weekDay < 6) {
          let openWork = DateTime.fromISO(item.open_work)
          openWork = openWork.set({ day: currentTime.day })
          openWork = openWork.set({ year: currentTime.year })
          openWork = openWork.set({ month: currentTime.month })
          let closeWork = DateTime.fromISO(item.close_work)
          closeWork = closeWork.set({ day: currentTime.day })
          closeWork = closeWork.set({ year: currentTime.year })
          closeWork = closeWork.set({ month: currentTime.month })
          if (closeWork.hour < openWork.hour) {
            closeWork = closeWork.set({ day: currentTime.day + 1 })
          }

          if (currentTime >= openWork && currentTime < closeWork) {
            item.isWorking = true
          }
          item.workTimeStart = openWork.toFormat('HH:mm')
          item.workTimeEnd = closeWork.toFormat('HH:mm')
        } else {
          let openWork = DateTime.fromISO(item.open_weekend)
          openWork = openWork.set({ day: currentTime.day })
          openWork = openWork.set({ year: currentTime.year })
          openWork = openWork.set({ month: currentTime.month })
          let closeWork = DateTime.fromISO(item.close_weekend)
          closeWork = closeWork.set({ day: currentTime.day })
          closeWork = closeWork.set({ year: currentTime.year })
          closeWork = closeWork.set({ month: currentTime.month })
          if (closeWork.hour < openWork.hour) {
            closeWork = closeWork.set({ day: currentTime.day + 1 })
          }

          if (currentTime >= openWork && currentTime < closeWork) {
            item.isWorking = true
          }
          item.workTimeStart = openWork.toFormat('HH:mm')
          item.workTimeEnd = closeWork.toFormat('HH:mm')
        }

        res.push(item)
      }
    })
    setPickupPoint(res)
  }

  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(`${webAddress}/api/configs/public`)
      configData = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      configData = sessionStorage.getItem('configData')
    }

    try {
      configData = Buffer.from(configData, 'base64')
      configData = configData.toString('ascii')
      configData = JSON.parse(configData)
      setConfigData(configData)
    } catch (e) {}
  }

  useEffect(() => {
    fetchConfig()
    if (locationData && locationData.deliveryType == 'pickup') {
      loadPickupItems()
    }
    return
  }, [locationData])

  const addressInputChangeHandler = async (event: any) => {
    if (!configData) {
      return []
    }

    if (!configData.yandexGeoKey) {
      return []
    }
    const { data: getCodeData } = await axios.get(
      `/api/geocode?text=${encodeURI(event.target.value)}`
    )

    setGeoSuggestions(getCodeData)
  }

  const debouncedAddressInputChangeHandler = useCallback(
    debounce(addressInputChangeHandler, 300),
    [configData]
  )

  const setActive = (city: City) => {
    if (locale == 'uz') {
      setValue('address', "O'zbekiston, " + city.name_uz)
      downshiftControl?.current?.reset({
        inputValue: "O'zbekiston, " + city.name_uz + ',',
      })
    } else {
      setValue('address', 'Узбекистан, ' + city.name)
      downshiftControl?.current?.reset({
        inputValue: 'Узбекистан, ' + city.name + ',',
      })
    }
    let link = pathname
    Object.keys(query).map((k: string) => {
      if (k == 'city') {
        link = link.replace('[city]', city.slug)
      } else {
        link = link.replace(`[${k}]`, query[k]!.toString())
      }
    })
    router.push(link)
    setActiveCity(city)
    if (city) setMapCenter([+city.lat, +city.lon])
  }

  const setSelectedAddress = (selection: any) => {
    setMapCenter([selection.coordinates.lat, selection.coordinates.long])
    setSelectedCoordinates([
      {
        ...selection,
        key: `${selection.coordinates.lat}${selection.coordinates.long}`,
      },
    ])
    setMapZoom(17)
    setLocationData({
      ...locationData,
      location: [selection.coordinates.lat, selection.coordinates.long],
    })
    setValue('address', selection.formatted)
    downshiftControl?.current?.reset({
      inputValue: selection.formatted,
    })
    selection.addressItems.map((address: any) => {
      if (address.kind == 'house') {
        setValue('house', address.name)
      }
    })
  }

  const clickOnMap = async (event: any) => {
    const coords = event.get('coords')
    setMapCenter(coords)
    setSelectedCoordinates([
      {
        key: `${coords[0]}${coords[1]}`,
        coordinates: {
          lat: coords[0],
          long: coords[1],
        },
      },
    ])
    setMapZoom(17)
    const { data } = await axios.get(
      `${webAddress}/api/geocode?lat=${coords[0]}&lon=${coords[1]}`
    )
    let house = ''
    data.data.addressItems.map((item: any) => {
      if (item.kind == 'house') {
        house = item.name
      }
    })
    setValue('house', house)
    setValue('address', data.data.formatted)
    downshiftControl?.current?.reset({
      inputValue: data.data.formatted,
    })
    setLocationData({
      ...locationData,
      location: coords,
      address: data.data.formatted,
      house,
    })
  }

  const mapState = useMemo<MapState>(() => {
    const baseState: MapStateBase = {
      controls: ['fullscreenControl'],
    }
    const mapStateCenter: MapStateCenter = {
      center: mapCenter || [],
      zoom: mapZoom || 10,
    }

    const res: MapState = Object.assign({}, baseState, mapStateCenter)
    return res
  }, [mapCenter, mapZoom, activeCity])

  const onSubmit: SubmitHandler<AnyObject> = (data) => {
    saveDeliveryData(data, null)
  }

  const choosePickupPoint = (point: any) => {
    if (!point.isWorking) {
      toast.warn(tr('terminal_is_not_working'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    }
    setActivePoint(point.id)
    let terminalData = pickupPoints.find((pickup: any) => pickup.id == point.id)
    setLocationData({
      ...locationData,
      terminal_id: point.id,
      terminalData,
    })
  }

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const saveDeliveryData = async (
    data: Object = {},
    event: React.MouseEvent | null
  ) => {
    event?.preventDefault()
    event?.stopPropagation()
    setIsSearchingTerminals(true)
    if (!Object.keys(data).length) {
      data = getValues()
    }

    if (!locationData || !locationData.location) {
      toast.warn('Не указан адрес или точка доставки', {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setIsSearchingTerminals(false)
      return
    }

    const { data: terminalsData } = await axios.get(
      `${webAddress}/api/terminals/find_nearest?lat=${locationData.location[0]}&lon=${locationData.location[1]}`
    )

    if (terminalsData.data && !terminalsData.data.items.length) {
      toast.warn(
        terminalsData.data.message
          ? terminalsData.data.message
          : 'Ресторан не найден',
        {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        }
      )
      setIsSearchingTerminals(false)
      return
    }

    setIsSearchingTerminals(false)
    if (terminalsData.data) {
      setLocationData({
        ...locationData,
        ...data,
        // location: [
        //   terminalsData.data.items[0].latitude,
        //   terminalsData.data.items[0].longitude,
        // ],
        terminal_id: terminalsData.data.items[0].id,
        terminalData: terminalsData.data.items[0],
      })

      const { data: terminalStock } = await axios.get(
        `${webAddress}/api/terminals/get_stock?terminal_id=${terminalsData.data.items[0].id}`
      )

      if (!terminalStock.success) {
        toast.warn(terminalStock.message, {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        })
        return
      } else {
        setStopProducts(terminalStock.data)
      }



      hideAddress()
    }

    const otpToken = Cookies.get('opt_token')
    if (otpToken) {
      if (addressId) {
        await setCredentials()
        await axios.post(
          `${webAddress}/api/address/${addressId}`,

          {
            ...data,
            lat: locationData.location[0],
            lon: locationData.location[1],
          },
          {
            headers: {
              Authorization: `Bearer ${otpToken}`,
            },
          }
        )
      } else {
        await setCredentials()
        const { data: addressData } = await axios.post(
          `${webAddress}/api/address/new`,
          {
            ...data,
            lat: locationData.location[0],
            lon: locationData.location[1],
          },
          {
            headers: {
              Authorization: `Bearer ${otpToken}`,
            },
          }
        )

        // console.log(addressData)

        setAddressId(addressData.data.id)
      }
    }
  }

  const submitPickup = async () => {
    if (!activePoint) {
      toast.warn(`${tr('pickup_point_not_selected')}`, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    }

     const { data: terminalStock } = await axios.get(
       `${webAddress}/api/terminals/get_stock?terminal_id=${activePoint}`
     )

     if (!terminalStock.success) {
       toast.warn(terminalStock.message, {
         position: toast.POSITION.BOTTOM_RIGHT,
         hideProgressBar: true,
       })
       return
     } else {
       setStopProducts(terminalStock.data)
     }

    hideAddress(false)
  }

  const { t: tr } = useTranslation('common')

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  let haveAddress = watch('address')

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }

  const loadPolygonsToMap = (ymaps: any) => {
    setYmaps(ymaps)
    var geolocation = ymaps.geolocation
    geolocation
      .get({
        provider: 'yandex',
        mapStateAutoApply: true,
      })
      .then((result: any) => {
        console.log(result)
      })
    let geoObjects: any = {
      type: 'FeatureCollection',
      metadata: {
        name: 'delivery',
        creator: 'Yandex Map Constructor',
      },
      features: [],
    }
    cities.map((city: any) => {
      if (city.polygons) {
        let arrPolygons = city.polygons.split(',').map((poly: any) => +poly)
        arrPolygons = chunk(arrPolygons, 2)
        arrPolygons = arrPolygons.map((poly: any) => sortBy(poly))
        let polygon: any = {
          type: 'Feature',
          id: 0,
          geometry: {
            type: 'Polygon',
            coordinates: [arrPolygons],
          },
          properties: {
            fill: '#FAAF04',
            fillOpacity: 0.1,
            stroke: '#FAAF04',
            strokeWidth: '7',
            strokeOpacity: 0.4,
            slug: city.slug,
          },
        }
        geoObjects.features.push(polygon)
      }
    })
    let deliveryZones = ymaps.geoQuery(geoObjects).addToMap(map.current)
    deliveryZones.each((obj: any) => {
      obj.options.set({
        fillColor: obj.properties.get('fill'),
        fillOpacity: obj.properties.get('fillOpacity'),
        strokeColor: obj.properties.get('stroke'),
        strokeWidth: obj.properties.get('strokeWidth'),
        strokeOpacity: obj.properties.get('strokeOpacity'),
      })
      obj.events.add('click', clickOnMap)
    })
    objects.current = deliveryZones
  }

  return (
    <>
      <div className="relative">
        <YMaps>
          <div>
            <Map
              state={mapState}
              onLoad={(ymaps: any) => loadPolygonsToMap(ymaps)}
              instanceRef={(ref) => (map.current = ref)}
              width="100%"
              height="100vh"
              modules={[
                'control.ZoomControl',
                'control.FullscreenControl',
                'control.GeolocationControl',
                'geoQuery',
                'geolocation',
              ]}
              onClick={clickOnMap}
            >
              {tabIndex == 'pickup'
                ? pickupPoints.map((point) => (
                    <Placemark
                      modules={['geoObject.addon.balloon']}
                      defaultGeometry={[point.latitude, point.longitude]}
                      key={point.id}
                      onClick={() => choosePickupPoint(point.id)}
                      // options={{
                      //   iconColor:
                      //     activePoint && activePoint == point.id
                      //       ? '#FAAF04'
                      //       : '#1E98FF',
                      // }}
                      properties={{
                        balloonContentBody: `<b>${point.name}</b> <br />
                          ${point.desc}
                          `,
                      }}
                      defaultOptions={{
                        iconLayout: 'default#image',
                        iconImageHref: '/map_placemark_pickup.png',
                        iconImageSize:
                          activePoint && activePoint == point.id
                            ? [100, 100]
                            : [50, 50],
                      }}
                    />
                  ))
                : selectedCoordinates.map((item: any, index: number) => (
                    <Placemark
                      modules={['geoObject.addon.balloon']}
                      defaultGeometry={[
                        item?.coordinates?.lat,
                        item?.coordinates?.long,
                      ]}
                      geomerty={[
                        item?.coordinates?.lat,
                        item?.coordinates?.long,
                      ]}
                      key={item.key}
                      defaultOptions={{
                        iconLayout: 'default#image',
                        iconImageHref: '/map_placemark.png',
                        iconImageSize: [100, 100],
                      }}
                    />
                  ))} 
                  <GeolocationControl options={{ float: 'left' }} />
                  <ZoomControl options={{ size: 'small' }} />
            </Map>
          </div>
        </YMaps>
      </div>
      <div
        className="absolute bg-white right-20 rounded-2xl top-8 p-3 cursor-pointer"
        onClick={hideAddress}
      >
        <XIcon className=" w-5" />
      </div>
      <div className="w-96 absolute top-8 bg-white rounded-3xl p-5 left-40 shadow-2xl">
        <div className="bg-gray-100 flex rounded-full w-full p-1">
          <button
            className={`${
              tabIndex == 'deliver' ? 'bg-white' : ''
            } flex-1 font-medium py-3 rounded-full outline-none focus:outline-none`}
            onClick={() => changeTabIndex('deliver')}
          >
            {tr('delivery')}
          </button>
          <button
            className={`${
              tabIndex == 'pickup' ? 'bg-white' : ''
            } flex-1 font-medium py-3  rounded-full outline-none focus:outline-none`}
            onClick={() => changeTabIndex('pickup')}
          >
            {tr('pickup')}
          </button>
        </div>
        {tabIndex == 'deliver' && (
          <div className="mt-2">
            <div className="mt-2">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mt-8">
                  <Downshift
                    onChange={(selection) => setSelectedAddress(selection)}
                    ref={downshiftControl}
                    itemToString={(item) =>
                      item ? item.formatted : watch('address')
                    }
                    initialInputValue={locationData?.address || currentAddress}
                  >
                    {({
                      getInputProps,
                      getItemProps,
                      getLabelProps,
                      getMenuProps,
                      isOpen,
                      inputValue,
                      highlightedIndex,
                      selectedItem,
                      getRootProps,
                    }) => (
                      <>
                        <div
                          className="bg-gray-100 focus:outline-none outline-none px-4 py-2 rounded-xl"
                          {...getRootProps(undefined, {
                            suppressRefError: true,
                          })}
                        >
                          <div className="text-xs text-gray-400">
                            {tr('chooseLocation')}
                          </div>
                          <div className="flex">
                            <input
                              type="text"
                              {...register('address')}
                              {...getInputProps({
                                onChange: debouncedAddressInputChangeHandler,
                              })}
                              className="bg-gray-100 mt-2 w-full outline-none focus:outline-none"
                            />
                            <XIcon
                              className="w-5 text-gray-400 cursor-pointer"
                              onClick={() => resetField('address')}
                            />
                          </div>

                          <ul
                            {...getMenuProps()}
                            className="absolute w-full z-[1000] rounded-[15px] shadow-lg"
                          >
                            {isOpen
                              ? geoSuggestions.map(
                                  (item: any, index: number) => (
                                    <li
                                      {...getItemProps({
                                        key: index,
                                        index,
                                        item,
                                        className: `py-2 px-4 flex items-center ${
                                          highlightedIndex == index
                                            ? 'bg-gray-100'
                                            : 'bg-white'
                                        }`,
                                      })}
                                    >
                                      <CheckIcon
                                        className={`w-5 text-yellow font-bold mr-2 ${
                                          highlightedIndex == index
                                            ? ''
                                            : 'invisible'
                                        }`}
                                      />
                                      <div>
                                        <div>{item.title}</div>
                                        <div className="text-sm">
                                          {item.description}
                                        </div>
                                      </div>
                                    </li>
                                  )
                                )
                              : null}
                          </ul>
                        </div>
                      </>
                    )}
                  </Downshift>
                  <div className="flex mt-2 space-x-2">
                    <div className="bg-gray-100 focus:outline-none outline-none px-4 py-2 rounded-xl">
                      <div className="text-xs text-gray-400">{tr('house')}</div>
                      <input
                        type="text"
                        {...register('house')}
                        className="bg-gray-100 w-full mt-2 focus:outline-none"
                      />
                    </div>
                    <div className="bg-gray-100 focus:outline-none outline-none px-4 py-2 rounded-xl">
                      <div className="text-xs text-gray-400">{tr('flat')}</div>
                      <input
                        type="text"
                        {...register('flat')}
                        className="bg-gray-100 w-full mt-2 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex mt-2 space-x-2">
                    <div className="bg-gray-100 focus:outline-none outline-none px-4 py-2 rounded-xl">
                      <div className="text-xs text-gray-400">
                        {tr('entrance')}
                      </div>
                      <input
                        type="text"
                        {...register('entrance')}
                        className="bg-gray-100 w-full mt-2 focus:outline-none"
                      />
                    </div>
                    <div className="bg-gray-100 focus:outline-none outline-none px-4 py-2 rounded-xl">
                      <div className="text-xs text-gray-400">{tr('floor')}</div>
                      <input
                        type="text"
                        {...register('floor')}
                        className="bg-gray-100 w-full mt-2 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 focus:outline-none outline-none px-4 py-2 rounded-xl mt-2">
                  <div className="text-xs text-gray-400">Название адреса</div>
                  <div className="flex">
                    <input
                      type="text"
                      {...register('label')}
                      className="bg-gray-100 mt-2 w-full outline-none focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-gray-100 focus:outline-none outline-none px-4 py-2 rounded-xl mt-2">
                  <div className="text-xs text-gray-400">
                    Комментарий к адресу
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      {...register('comments')}
                      className="bg-gray-100 mt-2 w-full outline-none focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    type="submit"
                    className={`${
                      haveAddress ? 'bg-green-500' : 'bg-gray-400'
                    } font-medium px-12 py-3 rounded-xl text-[18px] text-white outline-none focus:outline-none w-full`}
                    disabled={isSearchingTerminals}
                    onClick={(event: React.MouseEvent) => {
                      saveDeliveryData(undefined, event)
                      hideAddress()
                    }}
                  >
                    {isSearchingTerminals ? (
                      <svg
                        className="animate-spin h-5 mx-auto text-center text-white w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      tr('confirm')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {tabIndex == 'pickup' && (
          <div className="mt-2">
            <div className="flex">
              <div className=" text-x">
                Выберите ближайший вам ресторан для выдачи заказа
              </div>
              {/* <div
              className={`${
                pickupIndex == 1 ? ' text-yellow' : 'text-gray-400'
              } cursor-pointer font-bold text-[18px] mx-5`}
              onClick={() => {
                setPickupIndex(1)
              }}
            >
              {tr('on_the_map')}
            </div> */}
              {/* <div
              className={`${
                pickupIndex == 2 ? ' text-yellow' : 'text-gray-400'
              } cursor-pointer font-bold text-[18px]`}
              onClick={() => {
                setPickupIndex(2)
              }}
            >
              {tr('list')}
            </div> */}
            </div>
            <SimpleBar style={{ maxHeight: 400 }}>
              <div className="mt-5">
                {/* {pickupIndex == 1 && ( */}
                {/* <YMaps>
                <div>
                  <Map
                    defaultState={{
                      center: [40.351706, 69.090118],
                      zoom: 7.2,
                      controls: [
                        'zoomControl',
                        'fullscreenControl',
                        'geolocationControl',
                      ],
                    }}
                    width="100%"
                    height="530px"
                    modules={[
                      'control.ZoomControl',
                      'control.FullscreenControl',
                      'control.GeolocationControl',
                    ]}
                  >
                    {pickupPoints.map((point) => (
                      <Placemark
                        modules={['geoObject.addon.balloon']}
                        defaultGeometry={[point.latitude, point.longitude]}
                        key={point.id}
                        onClick={() => choosePickupPoint(point.id)}
                        options={{
                          iconColor:
                            activePoint && activePoint == point.id
                              ? '#FAAF04'
                              : '#1E98FF',
                        }}
                        properties={{
                          balloonContentBody: `<b>${point.name}</b> <br />
                          ${point.desc}
                          `,
                        }}
                        defaultOptions={{
                          iconLayout: 'default#image',
                          iconImageHref: '/map_placemark.png',
                        }}
                      />
                    ))}
                  </Map>
                </div>
              </YMaps> */}
                {/* )} */}
                {/* {pickupIndex == 2 && ( */}
                <div className="gap-2 grid w-full">
                  {pickupPoints.map((point) => (
                    <label key={point.id}>
                      <div
                        className={`border flex items-start p-3 rounded-[10px] cursor-pointer justify-between bg-gray-100 ${
                          activePoint && activePoint == point.id
                            ? 'border-gray-400'
                            : ''
                        }  ${!point.isWorking ? 'opacity-30' : ''}`}
                        onClick={() => choosePickupPoint(point)}
                      >
                        <div>
                          <div className="text-[18px]">
                            {locale == 'ru' ? point.name : point.name_uz}
                          </div>
                          {point.desc && (
                            <div className="text-gray-400 text-sm">
                              {tr('address')}:{' '}
                              {locale == 'ru' ? point.desc : point.desc_uz}
                            </div>
                          )}
                          {point.near && (
                            <div className="text-gray-400 text-sm">
                              {tr('nearLabel')}:{' '}
                              {locale == 'ru' ? point.near : point.near_uz}
                            </div>
                          )}
                          <div className="font-bold text-gray-700">
                            {tr('terminalWorkTime', {
                              workTimeStart: point.workTimeStart,
                              workTimeEnd: point.workTimeEnd,
                            })}
                          </div>
                          {point.services && (
                            <div className="flex py-2 space-x-3">
                              {point.services
                                .split(',')
                                .map((service: string) => (
                                  <span key={service}>
                                    <img
                                      src={`/assets/services/${service}.webp`}
                                      alt=""
                                    />
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            className={`${
                              activePoint && activePoint == point.id
                                ? ''
                                : 'border'
                            } text-green-500 form-checkbox rounded-md w-5 h-5 `}
                            defaultChecked={activePoint == point.id}
                            // checked={activePoint == point.id}
                          />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {/* )} */}
              </div>
            </SimpleBar>
            <div className="flex mt-4 justify-end">
              <button
                type="submit"
                className={`${
                  activePoint ? 'bg-green-500' : 'bg-gray-200'
                } font-medium px-12 py-3 rounded-lg text-[18px] text-white outline-none focus:outline-none w-full`}
                disabled={!activePoint}
                onClick={submitPickup}
              >
                Заказать здесь
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default memo(LocationTabs)
function Dispatch<T>() {
  throw new Error('Function not implemented.')
}
