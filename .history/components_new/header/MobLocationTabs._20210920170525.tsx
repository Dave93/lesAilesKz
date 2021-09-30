import React, {
  memo,
  Fragment,
  useEffect,
  useRef,
  useState,
  useMemo,
  FC,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react'
import { Menu, Transition, Disclosure } from '@headlessui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/solid'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
} from 'react-yandex-maps'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
import axios from 'axios'
import Downshift from 'downshift'
import debounce from 'lodash.debounce'
import { useUI } from '@components/ui/context'
import { toast } from 'react-toastify'

const { publicRuntimeConfig } = getConfig()

interface MobLocationTabProps {
  setOpen: Dispatch<SetStateAction<boolean>>
}

const MobLocationTabs: FC<MobLocationTabProps> = ({ setOpen }) => {
  
  const { locationData, setLocationData } = useUI()
  const [tabIndex, setTabIndex] = useState(
    locationData?.deliveryType || 'deliver'
  )
  const [pickupIndex, setPickupIndex] = useState(1)
  const [cities, setCities] = useState([
    {
      id: 'tash',
      label: 'Ташкент',
      active: true,
      mapCenter: [41.311158, 69.279737],
      mapZoom: 11.76,
    },
    {
      id: 'ferg',
      label: 'Фергана',
      active: false,
      mapCenter: [40.38942, 71.783009],
      mapZoom: 12.73,
    },
    {
      id: 'sam',
      label: 'Самарканд',
      active: false,
      mapCenter: [39.654522, 66.96883],
      mapZoom: 13.06,
    },
  ])
  const [pickupPoints, setPickupPoint] = useState([] as any[])

  const [geoSuggestions, setGeoSuggestions] = useState([])
  const [isSearchingTerminals, setIsSearchingTerminals] = useState(false)

  const activeLabel = cities.find((item) => item.active)?.label
  const activeCity = cities.find((item) => item.active)

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
    (locationData?.location || activeCity?.mapCenter) as number[]
  )
  const [mapZoom, setMapZoom] = useState(
    ((locationData?.location ? 17 : 10) || activeCity?.mapZoom) as number
  )

  const [activePoint, setActivePoint] = useState(
    (locationData ? locationData.terminal_id : null) as number | null
  )

  const [configData, setConfigData] = useState({} as any)

  const { register, handleSubmit, getValues, setValue } = useForm({
    defaultValues: {
      address: locationData?.address || '',
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
      `${publicRuntimeConfig.apiUrl}/api/terminals/pickup`
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
      let { data } = await axios.get(
        `${publicRuntimeConfig.apiUrl}/api/configs/public`
      )
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

  const setActive = (id: string) => {
    setCities(
      cities.map((item) => {
        if (item.id == id) {
          item.active = true
        } else {
          item.active = false
        }
        return item
      })
    )

    const activeCity = cities.find((item) => item.id == id)
    if (activeCity) setMapCenter(activeCity.mapCenter)
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
    setValue('address', selection.title)
  }

  const clickOnMap = (event: any) => {
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
    setLocationData({ ...locationData, location: coords })
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
  }, [mapCenter, mapZoom])

  const onSubmit = (data: Object) => {
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
      `${publicRuntimeConfig.apiUrl}/api/terminals/find_nearest?lat=${locationData.location[0]}&lon=${locationData.location[1]}`
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
        location: [
          terminalsData.data.items[0].latitude,
          terminalsData.data.items[0].longitude,
        ],
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

  return (
    <>
      <div className="flex items-center pt-5 mb-8">
        <span onClick={() => setOpen(false)} className="flex">
          <Image src="/assets/back.png" width="24" height="24" />
        </span>
        <div className="text-lg flex-grow text-center">Адрес</div>
      </div>
      <div className="bg-gray-100 flex rounded-full w-full h-11 items-center">
        <button
          className={`${
            tabIndex == 1 ? 'bg-yellow text-white' : ' text-gray-400'
          } flex-1 font-bold  text-[16px] rounded-full outline-none focus:outline-none  h-11`}
          onClick={() => setTabIndex(1)}
        >
          {tr('delivery')}
        </button>
        <button
          className={`${
            tabIndex == 2 ? 'bg-yellow text-white' : ' text-gray-400'
          } flex-1 font-bold  text-[16px] rounded-full outline-none focus:outline-none  h-11`}
          onClick={() => setTabIndex(2)}
        >
          {tr('pickup')}
        </button>
      </div>
      {tabIndex == 1 && (
        <div className="mt-5">
          <div className="flex justify-between">
            <div className="text-gray-400 font-bold text-[18px]">
              {tr('chooseLocation')}
            </div>
            <div>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="focus:outline-none font-medium inline-flex justify-center px-4 py-2 text-secondary text-sm w-full">
                    {activeLabel}
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
                    {cities.map((item) => (
                      <Menu.Item key={item.id}>
                        <span
                          onClick={() => setActive(item.id)}
                          className={`block px-4 py-2 text-sm cursor-pointer ${
                            item.active
                              ? 'bg-secondary text-white'
                              : 'text-secondary'
                          }`}
                        >
                          {item.label}
                        </span>
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
          <div>
            <YMaps>
              <div>
                <Map
                  state={mapState}
                  width="100%"
                  height="270px"
                  modules={[
                    'control.ZoomControl',
                    'control.FullscreenControl',
                    'control.GeolocationControl',
                  ]}
                />
              </div>
            </YMaps>
          </div>
          <div className="mt-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="font-bold text-[18px]">{tr('address')}</div>
              <div className="mt-3 space-y-6">
                <Downshift
                  onChange={(selection) => setSelectedAddress(selection)}
                  itemToString={(item) => (item ? item.formatted : '')}
                  initialInputValue={locationData?.address || ''}
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

                {/* <div className="w-full">
                  <input
                    type="text"
                    {...register('address')}
                    placeholder={tr('address')}
                    className="bg-gray-100 px-8 py-2 rounded-full w-full outline-none focus:outline-none "
                  />
                </div> */}
                <div className="flex justify-between">
                  <input
                    type="text"
                    {...register('flat')}
                    placeholder={tr('flat')}
                    className="bg-gray-100 px-8 py-2 rounded-full w-40  outline-none focus:outline-none"
                  />
                  <input
                    type="text"
                    {...register('house')}
                    placeholder={tr('house')}
                    className="bg-gray-100 px-8 py-2 rounded-full w-40 "
                  />
                </div>
              </div>
              <div className="mt-5">
                <Disclosure defaultOpen={true}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex text-yellow outline-none focus:outline-none">
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
                          <div className="flex mt-3 justify-between">
                            <div>
                              <input
                                type="text"
                                {...register('entrance')}
                                placeholder={tr('entrance')}
                                className="bg-gray-100 px-8 py-2 rounded-full w-40  outline-none focus:outline-none"
                              />
                            </div>
                            <div className="mx-5">
                              <input
                                type="text"
                                {...register('door_code')}
                                placeholder={tr('door_code')}
                                className="bg-gray-100 px-8 py-2 rounded-full w-40 outline-none focus:outline-none"
                              />
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </div>
              <div className="flex mt-12">
                <button
                  type="submit"
                  className="bg-yellow font-bold px-12 py-2 rounded-full text-[18px] text-white outline-none focus:outline-none w-full"
                >
                  {tr('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {tabIndex == 2 && (
        <div className="mt-5">
          {/* <div> */}
          <div className="font-bold text-[18px] text-gray-400">
            {tr('select_pizzeries')}{' '}
          </div>
          {/* <div className="flex mt-3"> */}
          {/* <div
                className={`${
                  pickupIndex == 1 ? ' text-yellow' : 'text-gray-400'
                } cursor-pointer font-bold text-[18px] mr-5`}
                onClick={() => {
                  setPickupIndex(1)
                }}
              >
                На карте
              </div> */}
          {/* <div
                className={`${
                  pickupIndex == 2 ? ' text-yellow' : 'text-gray-400'
                } cursor-pointer font-bold text-[18px]`}
                onClick={() => {
                  setPickupIndex(2)
                }}
              >
                Списком
              </div> */}
          {/* </div> */}
          {/* </div> */}
          {/* <div className="w-full mt-5">
          <input
            type="text"
            {...register('address')}
            placeholder="Адрес"
            className="bg-gray-100 px-8 rounded-full w-full outline-none focus:outline-none py-2"
          />
        </div> */}
          <div className="mt-5">
            {/* {pickupIndex == 1 && ( */}
            {/* <>
                <YMaps>
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
                      height="270px"
                      modules={[
                        'control.ZoomControl',
                        'control.FullscreenControl',
                        'control.GeolocationControl',
                      ]}
                    >
                      {pickupPoints.map((point) => (
                        <div>
                          <Placemark
                            modules={['geoObject.addon.balloon']}
                            defaultGeometry={point.mapCenter}
                            key={point.id}
                            onClick={() => setActivePoint(point.id)}
                            options={{
                              iconColor:
                                activePoint && activePoint.id == point.id
                                  ? '#FAAF04'
                                  : '#1E98FF',
                              iconLayout: 'default#image',
                              iconImageHref: '/assets/locationLogo.png',
                              iconImageSize: [40, 40],
                            }}
                          />
                        </div>
                      ))}
                    </Map>
                  </div>
                </YMaps>
                {activePoint && (
                  <div className="w-72">
                    <div className="font-bold text-base">
                      {activePoint.label}
                    </div>
                    <div>{activePoint.desc}</div>
                  </div>
                )}
              </> */}
            {/* )} */}
            {/* {pickupIndex == 2 && ( */}
            <div className="space-y-3">
              {pickupPoints.map((point) => (
                <div
                  key={point.id}
                  className={`border flex items-start p-3 rounded-[15px] cursor-pointer ${
                    activePoint && activePoint.id == point.id
                      ? 'border-yellow'
                      : 'border-gray-400'
                  }`}
                  onClick={() => setActivePoint(point.id)}
                >
                  <div
                    className={`border mr-4 mt-1 rounded-full ${
                      activePoint && activePoint.id == point.id
                        ? 'border-yellow'
                        : 'border-gray-400'
                    }`}
                  >
                    <div
                      className={`h-3 m-1 rounded-full w-3 ${
                        activePoint && activePoint.id == point.id
                          ? 'bg-yellow'
                          : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                  <div>
                    <div className="font-bold">{point.label}</div>
                    <div className="text-gray-400 text-sm">{point.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* )} */}
          </div>
          <div className="flex mt-12">
            <button
              type="submit"
              className={`${
                activePoint ? 'bg-yellow' : 'bg-gray-200'
              } font-bold px-12 rounded-full text-[18px] text-white outline-none focus:outline-none w-full py-2`}
              disabled={!activePoint}
              onClick={() => {
                // console.log('davr')
              }}
            >
              {tr('confirm')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(MobLocationTabs)