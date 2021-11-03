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
} from '@heroicons/react/solid'
import {
  YMaps,
  withYMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
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

const { publicRuntimeConfig } = getConfig()

let webAddress = publicRuntimeConfig.apiUrl
interface Props {
  setOpen?: any
}

interface AnyObject {
  [key: string]: any
}

const LocationTabs: FC<Props> = ({ setOpen }) => {
  const { locale, pathname, query } = useRouter()
  const { locationData, setLocationData, cities, activeCity, setActiveCity } =
    useUI()
  const [tabIndex, setTabIndex] = useState(
    locationData?.deliveryType || 'deliver'
  )
  const [pickupIndex, setPickupIndex] = useState(1)
  const [pickupPoints, setPickupPoint] = useState([] as any[])

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

  const { register, handleSubmit, getValues, setValue, watch } =
    useForm<AnyObject>({
      defaultValues: {
        address: locationData?.address || currentAddress,
        flat: locationData?.flat || '',
        house: locationData?.house || '',
        entrance: locationData?.entrance || '',
        door_code: locationData?.door_code || '',
      },
    })

  const changeTabIndex = async (index: string) => {
    setLocationData({ ...locationData, deliveryType: index })

    if (index == 'pickup') {
      await loadPickupItems()
    }

    setTabIndex(index)
  }

  const loadPickupItems = async () => {
    const { data } = await axios.get(
      `${webAddress}/api/terminals/pickup?city_id=${activeCity.id}`
    )
    let res: any[] = []
    data.data.map((item: any) => {
      if (item.latitude) {
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
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
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

  const choosePickupPoint = (pointId: number) => {
    setActivePoint(pointId)
    let terminalData = pickupPoints.find((pickup: any) => pickup.id == pointId)
    setLocationData({
      ...locationData,
      terminal_id: pointId,
      terminalData,
    })
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
      setOpen(false)
    }
  }

  const submitPickup = () => {
    if (!activePoint) {
      toast.warn(`${tr('pickup_point_not_selected')}`, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    }

    setOpen(false)
  }

  const { t: tr } = useTranslation('common')

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  return (
    <>
      <div>
        <YMaps>
          <div>
            <Map
              state={mapState}
              width="100%"
              height="100vh"
              onClick={clickOnMap}
              modules={[
                'control.ZoomControl',
                'control.FullscreenControl',
                'control.GeolocationControl',
              ]}
            >
              {selectedCoordinates.map((item: any, index: number) => (
                <Placemark
                  modules={['geoObject.addon.balloon']}
                  defaultGeometry={[
                    item?.coordinates?.lat,
                    item?.coordinates?.long,
                  ]}
                  geomerty={[item?.coordinates?.lat, item?.coordinates?.long]}
                  key={item.key}
                  defaultOptions={{
                    iconLayout: 'default#image',
                    iconImageHref: '/map_placemark.png',
                  }}
                />
              ))}
            </Map>
          </div>
        </YMaps>
      </div>
      <div className="bg-gray-100 flex rounded-full w-full">
        <button
          className={`${
            tabIndex == 'deliver' ? 'text-white' : ' text-gray-400'
          } flex-1 font-bold py-3 text-[18px] rounded-full outline-none focus:outline-none`}
          onClick={() => changeTabIndex('deliver')}
        >
          {tr('delivery')}
        </button>
        <button
          className={`${
            tabIndex == 'pickup' ? 'text-white' : ' text-gray-400'
          } flex-1 font-bold py-3 text-[18px] rounded-full outline-none focus:outline-none`}
          onClick={() => changeTabIndex('pickup')}
        >
          {tr('pickup')}
        </button>
      </div>
      {tabIndex == 'deliver' && (
        <div className="mt-2">
          <div className="flex justify-between">
            <div className="text-gray-400 font-bold text-[18px]">
              {tr('chooseLocation')}
            </div>
            <div>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="focus:outline-none font-medium inline-flex justify-center px-4 py-2 text-secondary text-sm w-full">
                    {locale == 'uz' ? chosenCity?.name_uz : chosenCity?.name}
                    <ChevronDownIcon
                      className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="z-20 absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {cities.map((city: City) => (
                      <Menu.Item key={city.id}>
                        <span
                          onClick={() => setActive(city)}
                          className={`block px-4 py-2 text-sm cursor-pointer ${
                            city.id == chosenCity.id
                              ? 'bg-secondary text-white'
                              : 'text-secondary'
                          }`}
                        >
                          {locale == 'uz' ? city.name_uz : city.name}
                        </span>
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          <div className="mt-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="font-bold text-[18px] text-gray-400">
                {tr('order_address')}
              </div>
              <div className="flex justify-between mt-3">
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
                        className="relative w-7/12"
                        {...getRootProps(undefined, { suppressRefError: true })}
                      >
                        <input
                          type="text"
                          {...register('address')}
                          {...getInputProps({
                            onChange: debouncedAddressInputChangeHandler,
                          })}
                          placeholder={tr('address')}
                          className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                        />
                        <ul
                          {...getMenuProps()}
                          className="absolute w-full z-[1000] rounded-[15px] shadow-lg"
                        >
                          {isOpen
                            ? geoSuggestions.map((item: any, index: number) => (
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
                              ))
                            : null}
                        </ul>
                      </div>
                    </>
                  )}
                </Downshift>
                <div className="mx-5 w-3/12">
                  <input
                    type="text"
                    {...register('flat')}
                    placeholder={tr('flat')}
                    className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                  />
                </div>
                <div className="w-2/12">
                  <input
                    type="text"
                    {...register('house')}
                    placeholder={tr('house')}
                    className="bg-gray-100 px-8 py-3 rounded-full w-full"
                  />
                </div>
              </div>

              <div className="mt-2">
                <Disclosure defaultOpen={true}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex text-yellow w-1/4 outline-none focus:outline-none">
                        <span>{tr('indicate_intercom_and_entrance')}</span>
                        {/*
                          Use the `open` render prop to rotate the icon when the panel is open
                        */}
                        <ChevronRightIcon
                          className={`w-6 transform ${
                            open ? 'rotate-90' : '-rotate-90'
                          }`}
                        />
                      </Disclosure.Button>
                      <Transition
                        show={open}
                        enter="transition duration-300 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-300 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel>
                          <div className="flex mt-3">
                            <div>
                              <input
                                type="text"
                                {...register('entrance')}
                                placeholder={tr('entrance')}
                                className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                              />
                            </div>
                            <div className="mx-5">
                              <input
                                type="text"
                                {...register('door_code')}
                                placeholder={tr('door_code')}
                                className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                              />
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="bg-yellow font-bold px-12 py-3 rounded-full text-[18px] text-white outline-none focus:outline-none"
                  disabled={isSearchingTerminals}
                  onClick={(event: React.MouseEvent) =>
                    saveDeliveryData(undefined, event)
                  }
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
            <div className="font-bold text-[18px] text-gray-400">
              {tr('select_pizzeries')}
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
            <div className="gap-2 grid grid-cols-4">
              {pickupPoints.map((point) => (
                <div
                  key={point.id}
                  className={`border flex items-start p-3 rounded-[15px] cursor-pointer ${
                    activePoint && activePoint == point.id
                      ? 'border-yellow'
                      : 'border-gray-400'
                  }`}
                  onClick={() => choosePickupPoint(point.id)}
                >
                  <div
                    className={`border mr-4 mt-1 rounded-full ${
                      activePoint && activePoint == point.id
                        ? 'border-yellow'
                        : 'border-gray-400'
                    }`}
                  >
                    <div
                      className={`h-3 m-1 rounded-full w-3 ${
                        activePoint && activePoint == point.id
                          ? 'bg-yellow'
                          : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                  <div>
                    <div className="font-bold">
                      {locale == 'ru' ? point.name : point.name_uz}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {locale == 'ru' ? point.desc : point.desc_uz}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* )} */}
          </div>
          <div className="flex mt-2 justify-end">
            <button
              type="submit"
              className={`${
                activePoint ? 'bg-yellow' : 'bg-gray-200'
              } font-bold px-12 py-3 rounded-full text-[18px] text-white outline-none focus:outline-none`}
              disabled={!activePoint}
              onClick={submitPickup}
            >
              {tr('confirm')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(LocationTabs)
function Dispatch<T>() {
  throw new Error('Function not implemented.')
}
