import { XIcon } from '@heroicons/react/outline'
import { useForm, Controller } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, {
  Fragment,
  useState,
  useMemo,
  FC,
  memo,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import { Menu, Transition, Disclosure, Dialog } from '@headlessui/react'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LocationMarkerIcon,
} from '@heroicons/react/solid'

import { ClockIcon } from '@heroicons/react/outline'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
} from 'react-yandex-maps'
import Image from 'next/image'
import { useCart } from '@framework/cart'
import currency from 'currency.js'
import getConfig from 'next/config'
import axios from 'axios'
import { debounce } from 'lodash'
import Downshift from 'downshift'
import Select from '@components_new/utils/Select'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import OtpInput from 'react-otp-input'
import styles from './Orders.module.css'
import { DateTime } from 'luxon'
import Input from 'react-phone-number-input/input'
import { City } from '@commerce/types/cities'
import { chunk, sortBy } from 'lodash'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

type FormData = {
  name: string
  address: string | null | undefined
  phone: string
  email: string
  flat: string
  house: string
  entrance: string
  door_code: string
  floor: string
  change: string
  notes: string
  card_number: string
  card_month: string
  holder_name: string
  cvv_code: string
  delivery_day: string
  delivery_time: string
  pay_type: string
  delivery_schedule: string
  comment_to_address: string
  comment_to_order: string
  addressId: number | null
  additional_phone: string
}

interface SelectItem {
  value: string
  label: string
}

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, '0')

const paymentTypes = ['payme', 'click', 'oson']

interface Errors {
  [key: string]: string
}

const errors: Errors = {
  name_field_is_required:
    'Мы Вас не нашли в нашей системе. Просьба указать своё имя.',
  opt_code_is_incorrect: 'Введённый код неверный или срок кода истёк',
}

let otpTimerRef: NodeJS.Timeout

type OrdersProps = {
  channelName: any
}

const Orders: FC<OrdersProps> = ({ channelName }: { channelName: any }) => {
  const deliveryTimeOptions = [] as SelectItem[]

  let startTime = DateTime.now()
  startTime = startTime.plus({ minutes: 40 })
  startTime = startTime.set({
    minute: Math.ceil(startTime.minute / 10) * 10,
  })

  while (startTime.hour < 3 || startTime.hour > 10) {
    let val = `${zeroPad(startTime.hour, 2)}:${zeroPad(startTime.minute, 2)}`
    startTime = startTime.plus({ minutes: 20 })
    startTime = startTime.set({
      minute: Math.ceil(startTime.minute / 10) * 10,
    })

    val += ` - ${zeroPad(startTime.hour, 2)}:${zeroPad(startTime.minute, 2)}`
    deliveryTimeOptions.push({
      value: val,
      label: val,
    })

    startTime = startTime.plus({ minutes: 40 })
    startTime = startTime.set({
      minute: Math.ceil(startTime.minute / 10) * 10,
    })
  }
  //Contacts
  const { t: tr } = useTranslation('common')
  const {
    user,
    setUserData,
    locationData,
    setLocationData,
    cities,
    activeCity,
    setActiveCity,
    openSignInModal,
    addressId,
    setStopProducts,
    stopProducts,
  } = useUI()
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }

  const router = useRouter()
  const { locale, query } = router
  const downshiftControl = useRef<any>(null)
  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  })

  const [deliveryPrice, setDeliveryPrice] = useState(0)
  const [deliveryDistance, setDeliveryDistance] = useState(0)
  const [yandexGeoKey, setYandexGeoKey] = useState('')
  const [ymaps, setYmaps] = useState<any>(null)
  const map = useRef<any>(null)
  const objects = useRef<any>(null)

  let currentAddress = ''
  if (activeCity.active) {
    if (locale == 'ru') {
      currentAddress = 'Узбекистан, ' + activeCity.name + ','
    } else {
      currentAddress = "O'zbekiston, " + activeCity.name_uz + ','
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: user?.user?.name,
      phone: user?.user?.phone,
      email: '',
      address: locationData?.address || currentAddress,
      flat: locationData?.flat || '',
      house: locationData?.house || '',
      entrance: locationData?.entrance || '',
      door_code: locationData?.door_code || '',
      floor: locationData?.floor || '',
      comment_to_address: '',
      comment_to_order: '',
      change: '',
      notes: '',
      card_number: '',
      card_month: '',
      holder_name: '',
      cvv_code: '',
      delivery_day: '',
      delivery_time: '',
      pay_type: '',
      delivery_schedule: 'now',
      addressId: addressId || null,
      additional_phone: '',
    },
  })

  const {
    register: passwordFormRegister,
    handleSubmit: handlePasswordSubmit,
    formState: passwordFormState,
  } = useForm({
    mode: 'onChange',
  })

  const onSubmit = (data: any) => console.log(JSON.stringify(data))

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

  const authName = watch('name')
  const authPhone = watch('phone')
  const authEmail = watch('email')
  const additionalPhone = watch('additional_phone')

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }
  //Orders
  const dayOptions = [
    {
      value: 'today',
      label: tr('today'),
    },
    {
      value: 'tomorrow',
      label: tr('tomorrow'),
    },
  ]
  const [tabIndex, setTabIndex] = useState(
    locationData?.deliveryType || 'deliver'
  )
  const [pickupIndex, setPickupIndex] = useState(1)
  const [pickupPoints, setPickupPoint] = useState([] as any[])
  const [activePoint, setActivePoint] = useState(
    (locationData ? locationData.terminal_id : null) as number | null
  )
  const [cutlery, setCutlery] = useState('Y')
  const [isPhoneConfirmOpen, setIsPhoneConfirmOpen] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpShowCode, setOtpShowCode] = useState(0)

  const [geoSuggestions, setGeoSuggestions] = useState([])
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

  const [isLoadingBasket, setIsLoadingBasket] = useState(false)

  let authButtonRef = useRef(null)
  const otpTime = useRef(0)

  const [mapCenter, setMapCenter] = useState(
    (locationData?.location && locationData.location.length
      ? locationData?.location
      : [activeCity?.lat, activeCity?.lon]) as number[]
  )
  const [mapZoom, setMapZoom] = useState(
    ((locationData?.location && locationData.location.length ? 17 : 10) ||
      activeCity?.map_zoom) as number
  )

  const [noChange, setNoChange] = useState(false)

  const [configData, setConfigData] = useState({} as any)
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
    let yandexGeoKey = configData.yandexGeoKey
    yandexGeoKey = yandexGeoKey.split(',')
    // get random item from yandexGeoKey
    yandexGeoKey = yandexGeoKey[Math.floor(Math.random() * yandexGeoKey.length)]

    setYandexGeoKey(yandexGeoKey)
  }

  const getDeliveryPrice = async () => {
    if (locationData.terminal_id) {
      let { data: deliveryPriceData } = await axios.get(
        `${webAddress}/api/orders/calc_basket_delivery?lat=${locationData?.location[0]}&lon=${locationData?.location[1]}&terminal_id=${locationData.terminal_id}&total_price=${data.totalPrice}`
      )

      setDeliveryPrice(deliveryPriceData.totalPrice)
      setDeliveryDistance(deliveryPriceData.distance)
    }
  }

  const stopList = async () => {
    if (locationData?.terminalData) {
      const { data: terminalStock } = await axios.get(
        `${webAddress}/api/terminals/get_stock?terminal_id=${locationData?.terminalData.id}`
      )

      if (!terminalStock.success) {
        return
      } else {
        setStopProducts(terminalStock.data)
      }
      return
    }
  }

  useEffect(() => {
    stopList()
    fetchConfig()
    if (locationData && locationData.deliveryType == 'pickup') {
      loadPickupItems()
    }
    if (locationData && locationData.deliveryType == 'deliver' && data) {
      getDeliveryPrice()
    }

    let formValues = getValues()

    if (formValues.addressId != addressId) {
      reset({
        name: user?.user?.name,
        phone: user?.user?.phone,
        email: '',
        address: locationData?.address || currentAddress,
        flat: locationData?.flat || '',
        house: locationData?.house || '',
        entrance: locationData?.entrance || '',
        door_code: locationData?.door_code || '',
        floor: locationData?.floor || '',
        comment_to_address: '',
        comment_to_order: '',
        change: '',
        notes: '',
        card_number: '',
        card_month: '',
        holder_name: '',
        cvv_code: '',
        delivery_day: '',
        delivery_time: '',
        pay_type: '',
        delivery_schedule: 'now',
        addressId: addressId,
      })
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
      `/api/geocode?text=${encodeURI(event.target.value)}&bounds=${
        activeCity.bounds
      }`
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
    searchTerminal({
      ...locationData,
      location: [selection.coordinates.lat, selection.coordinates.long],
    })
  }

  const clickOnMap = async (event: any) => {
    const coords = event.get('coords')
    setMapCenter(coords)
    // console.log(window.ymaps)
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
      `${webAddress}/api/geocode?lat=${coords[0]}&lon=${coords[1]}&bounds=${activeCity.bounds}`
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
    searchTerminal({ ...locationData, location: coords })
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
  // time of delivery
  const [deliveryActive, setDeliveryActive] = useState('now' as string)
  // pay
  const [openTab, setOpenTab] = useState(1)
  const [payType, setPayType] = useState('')

  const onValueChange = (e: any) => {
    setPayType(e.target.value)
  }

  //pay final
  const [sms, smsSetChecked] = useState(false)
  const [newsletter, newsSetChecked] = useState(false)

  const smsValueChange = (e: any) => {
    smsSetChecked(e.target.checked)
  }
  const newsletterValueChange = (e: any) => {
    newsSetChecked(e.target.checked)
  }

  let [isShowPrivacy, setIsShowPrivacy] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  const showPrivacy = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setIsShowPrivacy(true)
  }

  const setDeliverySchedule = (val: string) => {
    setValue('delivery_schedule', val)
    setDeliveryActive(val)
  }

  const closePrivacy = () => {
    setIsShowPrivacy(false)
  }
  let privacyButtonRef = useRef(null)

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

  const choosePickupPoint = (pointId: number) => {
    setActivePoint(pointId)
    let terminalData = pickupPoints.find((pickup: any) => pickup.id == pointId)
    setLocationData({
      ...locationData,
      terminal_id: pointId,
      terminalData,
    })
  }

  const searchTerminal = async (locationData: any = {}) => {
    if (!locationData || !locationData.location) {
      toast.warn(tr('no_address_specified'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setLocationData({
        ...locationData,
        terminal_id: undefined,
        terminalData: undefined,
      })
      return
    }

    const { data: terminalsData } = await axios.get(
      `${webAddress}/api/terminals/find_nearest?lat=${locationData.location[0]}&lon=${locationData.location[1]}`
    )

    if (terminalsData.data && !terminalsData.data.items.length) {
      toast.warn(
        terminalsData.data.message
          ? terminalsData.data.message
          : tr('restaurant_not_found'),
        {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        }
      )
      setLocationData({
        ...locationData,
        terminal_id: undefined,
        terminalData: undefined,
      })
      return
    }

    if (terminalsData.data) {
      setLocationData({
        ...locationData,
        terminal_id: terminalsData.data.items[0].id,
        terminalData: terminalsData.data.items[0],
      })
    }
  }

  const handleOtpChange = (otp: string) => {
    setOtpCode(otp)
  }

  const startTimeout = () => {
    otpTimerRef = setInterval(() => {
      if (otpTime.current > 0) {
        otpTime.current = otpTime.current - 1
        setOtpShowCode(otpTime.current)
      } else {
        clearInterval(otpTimerRef)
      }
    }, 1000)
  }

  const prepareOrder = async () => {
    setIsSavingOrder(true)
    await setCredentials()
    let sourceType = 'web'
    if (window.innerWidth < 768) {
      sourceType = 'mobile_web'
    }
    try {
      const { data } = await axios.post(`${webAddress}/api/orders/prepare`, {
        formData: {
          ...locationData,
          ...getValues(),
          pay_type: payType,
          sms_sub: sms,
          email_sub: newsletter,
          sourceType,
          need_napkins: cutlery == 'Y',
        },
        basket_id: cartId,
      })
      if (!data.success) {
        toast.error(data.message, {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        })
      } else {
        let success: any = Buffer.from(data.success, 'base64')
        success = success.toString()
        success = JSON.parse(success)
        Cookies.set('opt_token', success.user_token)
        otpTime.current = data?.time_to_answer
        setOtpShowCode(otpTime.current)
        startTimeout()
        setIsPhoneConfirmOpen(true)
      }
      setIsSavingOrder(false)
    } catch (e) {
      toast.error(e.response.data.error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setIsSavingOrder(false)
    }
  }

  const loadPolygonsToMap = (ymaps: any) => {
    setYmaps(ymaps)
    map.current.controls.remove('geolocationControl')
    var geolocationControl = new ymaps.control.GeolocationControl({
      options: { noPlacemark: true },
    })
    geolocationControl.events.add('locationchange', function (event: any) {
      var position = event.get('position'),
        // При создании метки можно задать ей любой внешний вид.
        locationPlacemark = new ymaps.Placemark(position)

      clickOnMap(event)
      // Установим новый центр карты в текущее местоположение пользователя.
      map.current.panTo(position)
    })
    map.current.controls.add(geolocationControl)
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

  const saveOrder = async () => {
    if (!user) {
      return openSignInModal()
    }

    setIsSavingOrder(true)
    await setCredentials()
    const otpToken = Cookies.get('opt_token')

    let sourceType = 'web'
    if (window.innerWidth < 768) {
      sourceType = 'mobile_web'
    }

    try {
      setIsLoadingBasket(true)
      const { data } = await axios.post(
        `${webAddress}/api/orders`,
        {
          formData: {
            ...locationData,
            ...getValues(),
            pay_type: payType,
            sms_sub: sms,
            email_sub: newsletter,
            sourceType,
          },
          code: otpCode,
          basket_id: cartId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      setIsLoadingBasket(false)
      setIsSavingOrder(false)
      clearInterval(otpTimerRef)
      // setUserData(data.user)
      localStorage.removeItem('basketId')
      router.push(`/${activeCity.slug}/order/${data.order.id}`)
    } catch (e) {
      toast.error(e.response.data.error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setIsLoadingBasket(false)
      setIsSavingOrder(false)
    }
  }

  const cutleryHandler = (e: any) => {
    setCutlery(e.target.value)
  }

  const otpTimerText = useMemo(() => {
    let text = 'Получить новый код через '
    const minutes: number = parseInt((otpShowCode / 60).toString(), 0)
    const seconds: number = otpShowCode % 60
    if (minutes > 0) {
      text += minutes + ' мин. '
    }

    if (seconds > 0) {
      text += seconds + ' сек.'
    }
    return text
  }, [otpShowCode])

  const getNewCode = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    prepareOrder()
  }

  if (errors.pay_type) {
    toast.error(tr('payment_system_not_selected'), {
      position: toast.POSITION.BOTTOM_RIGHT,
      hideProgressBar: true,
    })
  }

  if (errors.delivery_day || errors.delivery_time) {
    toast.error(tr('delivery_time_not_specified'), {
      position: toast.POSITION.BOTTOM_RIGHT,
      hideProgressBar: true,
    })
  }

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const isWorkTime = useMemo(() => {
    let currentHour = new Date().getHours()
    // let currentHour = 4
    if (
      configData.workTimeStart <= currentHour ||
      configData.workTimeEnd > currentHour
    )
      return true
    return false
  }, [configData])

  const isProductInStop = useMemo(() => {
    let res: number[] = []
    if (!isEmpty) {
      data.lineItems.map((item: any) => {
        if (stopProducts.includes(item.variant.product_id)) {
          res.push(item.id)
        }
      })
    }
    return res
  }, [stopProducts, data])

  const totalPrice = useMemo(() => {
    let total = 0
    if (!isEmpty) {
      data.lineItems.map((lineItem: any) => {
        if (!stopProducts.includes(lineItem.variant.product_id)) {
          total +=
            lineItem.child && lineItem.child.length
              ? (+lineItem.total + +lineItem.child[0].total) * lineItem.quantity
              : lineItem.total * lineItem.quantity
        }
      })
    }
    return total
  }, [stopProducts, data])

  if (!isWorkTime) {
    return (
      <div className="bg-white flex py-20 text-xl text-primary font-bold md:px-10 px-5">
        <div>
          {tr('isNotWorkTime')}{' '}
          {locale == 'uz' ? configData.workTimeUz : configData.workTimeRu}
        </div>
      </div>
    )
  }

  const setNoChangeHandler = () => {
    setNoChange(true)
    resetField('change')
  }

  return (
    <div className="md:mx-0 pt-1 md:pt-0 pb-1">
      {/* Contacts */}
      <div className="md:flex justify-between md:mt-12 md:px-0 px-5">
        <div className="text-3xl">Оформление заказа</div>
        <div
          className="cursor-pointer"
          onClick={() => router.push(`/${activeCity.slug}/cart`)}
        >
          Вернуться в корзину
        </div>
      </div>
      <div className="w-full bg-white md:my-10 md:rounded-2xl shadow-xl my-3">
        <div className="py-7 md:px-10 px-5 ">
          <div className="text-3xl mb-5">Контакты</div>
          <form onSubmit={handleSubmit(onSubmit)} className="md:flex mt-8 ">
            <div className="bg-gray-100 rounded-xl py-2 px-4 relative md:w-72 h-16 mb-2 md:mb-0">
              <label className="text-sm text-gray-400 block">
                {tr('personal_data_name')}
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  {...register('name', { required: true })}
                  className="focus:outline-none outline-none  bg-gray-100 w-56"
                />
                {authName && (
                  <button
                    className="absolute focus:outline-none outline-none right-4 text-gray-400"
                    onClick={() => resetField('name')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
              {errors.name && (
                <div className="text-sm text-center text-red-600">
                  {tr('required')}
                </div>
              )}
            </div>
            <div className=" bg-gray-100 rounded-xl py-2 px-4 relative md:ml-2 md:w-72 h-16 mb-2 md:mb-0">
              <label className="text-sm text-gray-400 block">
                {tr('personal_phone')}
              </label>
              <div className="flex items-center">
                <Controller
                  render={({ field: { onChange, value } }) => (
                    <Input
                      defaultCountry="UZ"
                      country="UZ"
                      international
                      withCountryCallingCode
                      value={value}
                      className="focus:outline-none outline-none rounded-xl w-56 bg-gray-100"
                      onChange={(e: any) => onChange(e)}
                    />
                  )}
                  rules={{
                    required: true,
                  }}
                  key="phone"
                  name="phone"
                  control={control}
                />
                {authPhone && (
                  <button
                    className="absolute focus:outline-none outline-none right-4 text-gray-400"
                    onClick={() => resetField('phone')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className=" bg-gray-100 rounded-xl py-2 px-4 relative md:ml-2 md:w-72 h-16">
              <div className="text-gray-400 text-sm">
                {tr('additional_phone')}
              </div>
              <Input
                defaultCountry="UZ"
                country="UZ"
                international
                withCountryCallingCode
                value={additionalPhone}
                className="focus:outline-none outline-none  bg-gray-100 w-56"
                onChange={(e: any) => {
                  setValue('additional_phone', e)
                }}
              />
              {additionalPhone && (
                <button
                  className="absolute focus:outline-none outline-none right-4 text-gray-400"
                  onClick={() => resetField('additional_phone')}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Orders */}
      <div className="mb-7 shadow-xl">
        <div className="bg-white flex rounded-2xl w-full items-center py-7 md:px-10 px-5 h-32 mb-5">
          <div className="bg-gray-100 flex  w-full rounded-xl">
            <button
              className={`${
                tabIndex == 'deliver'
                  ? 'bg-green-600 text-white'
                  : ' text-gray-400'
              } flex-1 font-bold py-3 text-[18px] rounded-xl outline-none focus:outline-none`}
              onClick={() => changeTabIndex('deliver')}
            >
              {tr('delivery')}
            </button>
            <button
              className={`${
                tabIndex == 'pickup'
                  ? 'bg-green-600 text-white'
                  : ' text-gray-400'
              } flex-1 font-bold py-3 text-[18px] rounded-xl outline-none focus:outline-none`}
              onClick={() => changeTabIndex('pickup')}
            >
              {tr('pickup')}
            </button>
          </div>
        </div>
        {tabIndex == 'deliver' && (
          <div className="bg-white py-7 md:px-10 px-5  rounded-2xl">
            <div className="flex justify-between">
              <div className="text-3xl mb-5">Адрес доставки</div>
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

            <div>
              {yandexGeoKey && (
                <YMaps
                  // enterprise
                  query={{
                    apikey: yandexGeoKey,
                  }}
                >
                  <div>
                    <Map
                      state={mapState}
                      onLoad={(ymaps: any) => loadPolygonsToMap(ymaps)}
                      instanceRef={(ref) => (map.current = ref)}
                      width="100%"
                      height={`${window.innerWidth < 768 ? '200px' : '530px'}`}
                      onClick={clickOnMap}
                      modules={[
                        'control.ZoomControl',
                        'control.FullscreenControl',
                        'control.GeolocationControl',
                        'geoQuery',
                      ]}
                    >
                      {selectedCoordinates.map((item: any, index: number) => (
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
                          }}
                        />
                      ))}
                    </Map>
                  </div>
                </YMaps>
              )}
            </div>
            <div className="mt-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mt-3">
                  <div className="md:flex justify-between md:w-full space-y-2 md:space-y-0">
                    <Downshift
                      onChange={(selection) => setSelectedAddress(selection)}
                      ref={downshiftControl}
                      itemToString={(item) =>
                        item ? item.formatted : watch('address')
                      }
                      initialInputValue={watch('address') || currentAddress}
                      inputValue={watch('address')}
                      onStateChange={(changes, stateAndHelpers) => {
                        if (changes.hasOwnProperty('inputValue')) {
                          setValue('address', changes.inputValue)
                        }
                      }}
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
                            className="relative md:mr-2"
                            {...getRootProps(undefined, {
                              suppressRefError: true,
                            })}
                          >
                            <input
                              type="text"
                              {...register('address', { required: true })}
                              {...getInputProps({
                                onChange: debouncedAddressInputChangeHandler,
                              })}
                              placeholder={tr('address')}
                              className="bg-gray-100 px-4 py-5 rounded-xl md:w-96 w-full outline-none focus:outline-none"
                            />
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
                                          className={`w-5 text-primary font-bold mr-2 ${
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
                    <div className="grid md:grid-cols-4 grid-cols-2 gap-2">
                      <div className="bg-gray-100 px-4 py-3 rounded-xl">
                        <div className="text-gray-400 text-xs">
                          {tr('house')}
                        </div>
                        <input
                          type="text"
                          {...register('house', { required: true })}
                          className="bg-gray-100   w-full outline-none focus:outline-none"
                        />
                        {errors.house && (
                          <div className="text-sm text-center text-red-600">
                            {tr('required')}
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-xl">
                        <div className="text-gray-400 text-xs">
                          {tr('flat')}
                        </div>
                        <input
                          type="text"
                          {...register('flat')}
                          className="bg-gray-100  w-full  outline-none focus:outline-none"
                        />
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-xl">
                        <div className="text-gray-400 text-xs">
                          {tr('entrance')}
                        </div>
                        <input
                          type="text"
                          {...register('entrance')}
                          className="bg-gray-100    w-full outline-none focus:outline-none"
                        />
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-xl">
                        <div className="text-gray-400 text-xs">
                          {tr('floor')}
                        </div>
                        <input
                          type="text"
                          {...register('floor')}
                          className="bg-gray-100   w-full  outline-none focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:flex mt-2">
                  <div className="bg-gray-100 px-4 py-3 rounded-xl md:w-96 w-full mr-2 mb-2 md:mb-0">
                    <div className="text-gray-400 text-xs">
                      Комментарий к адресу
                    </div>
                    <textarea
                      {...register('comment_to_address')}
                      className="bg-gray-100  outline-none focus:outline-none w-full overflow-hidden resize-none"
                    />
                  </div>

                  <div className="bg-gray-100 px-4 py-3 rounded-xl w-full">
                    <div className="text-gray-400 text-xs">
                      Комментарий к заказу
                    </div>
                    <textarea
                      {...register('comment_to_order')}
                      className="bg-gray-100   w-full  outline-none focus:outline-none overflow-hidden resize-none"
                    />
                  </div>
                </div>
                {locationData?.terminalData && (
                  <div className="md:mt-3 flex space-x-2 items-center">
                    <LocationMarkerIcon className="w-5 h-5" />
                    <div className="font-bold">
                      {tr('nearest_filial', {
                        filialName: locationData?.terminalData.name,
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
        {tabIndex == 'pickup' && (
          <div className="bg-white py-7 md:px-10 px-5 rounded-2xl">
            <div>
              <div className="font-bold text-[18px] text-gray-400">
                {tr('search_for_the_nearest_restaurant')}
              </div>
              {/* <div className="flex mt-3">
                <div
                  className={`${
                    pickupIndex == 1 ? ' text-primary' : 'text-gray-400'
                  } cursor-pointer font-bold text-[18px] mr-5`}
                  onClick={() => {
                    setPickupIndex(1)
                  }}
                >
                  {tr('on_the_map')}
                </div>
                <div
                  className={`${
                    pickupIndex == 2 ? ' text-primary' : 'text-gray-400'
                  } cursor-pointer font-bold text-[18px]`}
                  onClick={() => {
                    setPickupIndex(2)
                  }}
                >
                  {tr('list')}
                </div>
              </div> */}
            </div>
            {/* <div className="w-full mt-5">
              <input
                type="text"
                {...register('address')}
                placeholder={tr('address')}
                className="bg-gray-100 px-8 rounded-xl w-full outline-none focus:outline-none py-2"
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
                        height="520px"
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
                  </YMaps>
                </> */}
              {/* )} */}
              {/* {pickupIndex == 2 && ( */}
              <div className="gap-5 grid md:grid-cols-2">
                {pickupPoints.map((point) => (
                  <div
                    key={point.id}
                    className={`border flex items-start p-3 rounded-[15px] cursor-pointer ${
                      activePoint && activePoint == point.id
                        ? 'border-primary'
                        : 'border-gray-400'
                    }`}
                    onClick={() => choosePickupPoint(point.id)}
                  >
                    <div
                      className={`border mr-4 mt-1 rounded-xl ${
                        activePoint && activePoint == point.id
                          ? 'border-primary'
                          : 'border-gray-400'
                      }`}
                    >
                      <div
                        className={`h-3 m-1 rounded-xl w-3 ${
                          activePoint && activePoint == point.id
                            ? 'bg-primary'
                            : 'bg-gray-400'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <div className="font-bold">
                        {locale == 'uz' ? point.name_uz : point.name}
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
                          {point.services.split(',').map((service: string) => (
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
                  </div>
                ))}
              </div>
              {/* )} */}
            </div>
          </div>
        )}
      </div>
      {/* time of delivery */}
      <div className="w-full bg-white md:mb-10 mb-5 md:rounded-2xl py-7 md:px-10 px-5  shadow-xl">
        <div className="text-3xl mb-5">Время доставки</div>
        <div className="md:flex  md:space-x-2 justify-between">
          <div className="flex  space-x-2 mb-2 md:mb-0">
            <div
              className="bg-gray-100 flex items-center w-max rounded-2xl p-4 pr-14 cursor-pointer"
              onClick={() => setDeliverySchedule('now')}
            >
              <input
                type="checkbox"
                className={`${
                  deliveryActive == 'now' ? '' : 'border'
                } text-green-500 form-checkbox rounded-md w-5 h-5 mr-4`}
                defaultChecked={false}
                checked={deliveryActive == 'now'}
              />
              <div>{tr('hurry_up')}</div>
            </div>

            <div
              className="bg-gray-100 flex items-center md:w-max w-full rounded-2xl p-4 md:pr-14 cursor-pointer"
              onClick={() => setDeliverySchedule('later')}
            >
              <input
                type="checkbox"
                className={`${
                  deliveryActive == 'later' ? '' : 'border'
                } text-green-500 form-checkbox rounded-md w-5 h-5 mr-4`}
                defaultChecked={false}
                checked={deliveryActive == 'later'}
              />
              {tr('later')}
            </div>
          </div>

          {deliveryActive == 'later' ? (
            <div className="">
              {/* <Controller
              render={({ field: { onChange } }) => (
                <Select
                  items={dayOptions}
                  placeholder={tr('today')}
                  onChange={(e: any) => onChange(e)}
                />
              )}
              rules={{
                required: true,
              }}
              key="delivery_day"
              name="delivery_day"
              control={control}
            /> */}

              <Controller
                render={({ field: { onChange } }) => (
                  <Select
                    items={deliveryTimeOptions}
                    placeholder={tr('time')}
                    onChange={(e: any) => onChange(e)}
                  />
                )}
                rules={{
                  required: true,
                }}
                key="delivery_time"
                name="delivery_time"
                control={control}
              />
            </div>
          ) : (
            <div className="flex items-center bg-gray-100 p-4 md:pr-14 rounded-2xl">
              <ClockIcon className="w-5 mr-3" />
              <div>Доставим в течение 30 минут</div>
            </div>
          )}
        </div>
      </div>
      {/* pay */}
      <div className="w-full bg-white md:mb-10 mb-5 md:rounded-2xl py-7 md:px-10 px-5 relative shadow-xl">
        {!locationData?.terminal_id && (
          <div className="absolute md:w-full h-full md:-ml-10 md:-mt-10 bg-opacity-60 bg-gray-100 z-20 items-center flex justify-around bottom-0 left-0 md:left-auto text-center">
            <div className="text-primary font-bold text-2xl">
              {tr('no_address_no_restaurant')}
            </div>
          </div>
        )}
        <div className="text-3xl mb-5">Способы оплаты</div>
        <div className="md:flex justify-between">
          <div className="space-y-2 mb-2 md:mb-0">
            <div
              className="bg-gray-100 flex items-center w-64 rounded-2xl p-4  cursor-pointer"
              onClick={() => setOpenTab(1)}
            >
              <input
                type="checkbox"
                className={`${
                  openTab !== 1 ? '' : 'border'
                } text-green-500 form-checkbox rounded-md w-5 h-5 mr-4`}
                defaultChecked={false}
                checked={openTab == 1}
              />
              <div>{tr('in_cash')}</div>
            </div>
            <div
              className="bg-gray-100 flex items-center w-64 rounded-2xl p-4  cursor-pointer"
              onClick={() => setOpenTab(3)}
            >
              <input
                type="checkbox"
                className={`${
                  openTab !== 3 ? '' : 'border'
                } text-green-500 form-checkbox rounded-md w-5 h-5 mr-4`}
                defaultChecked={false}
                checked={openTab == 3}
              />
              <div>{tr('online')}</div>
            </div>
            <div
              className="bg-gray-100 flex items-center w-64 rounded-2xl p-4  cursor-pointer"
              onClick={() => setOpenTab(2)}
            >
              <input
                type="checkbox"
                className={`${
                  openTab !== 2 ? '' : 'border'
                } text-green-500 form-checkbox rounded-md w-5 h-5 mr-4`}
                defaultChecked={false}
                checked={openTab == 2}
              />
              <div>{tr('by_card')}</div>
            </div>
          </div>
          <div>
            <div
              className={openTab === 1 ? 'md:flex md:h-14' : 'hidden'}
              id="link1"
            >
              <div
                className="bg-gray-100 flex items-center rounded-2xl p-4  cursor-pointer mr-2 w-max"
                onClick={setNoChangeHandler}
              >
                <input
                  type="checkbox"
                  className={`${
                    openTab !== 1 ? '' : 'border'
                  } text-green-500 form-checkbox rounded-md w-5 h-5 mr-4`}
                  defaultChecked={false}
                  checked={noChange}
                />
                <div>Без сдачи</div>
              </div>
              <div
                className="bg-gray-100 flex items-center md:justify-between rounded-2xl p-4  cursor-pointer mt-2 md:mt-0 w-max"
                onClick={() => setNoChange(false)}
              >
                <input
                  type="checkbox"
                  className={`${
                    openTab !== 1 ? '' : 'border'
                  } text-green-500 form-checkbox rounded-md w-5 h-5 mr-4`}
                  defaultChecked={false}
                  checked={!noChange}
                />
                <div>{tr('change')}</div>
                <input
                  type="number"
                  {...register('change')}
                  min="10000"
                  step="1000"
                  className="border border-gray-400 focus:outline-none outline-none  py-2 px-2 rounded-xl  bg-gray-100 mx-3 w-24"
                />
                <div>сум</div>
              </div>
            </div>
            <div className={openTab === 2 ? 'block' : 'hidden'} id="link2">
              <div className="grid grid-cols-2 gap-2 pt-8 items-center">
                <label
                  className={`flex justify-around items-center w-24 h-24 p-3 rounded-2xl ${
                    payType == 'uzcard' ? 'border-primary' : 'border-gray-200'
                  } border cursor-pointer`}
                >
                  <img src="/assets/uzcard.png" />
                  <input
                    type="radio"
                    defaultValue="uzcard"
                    checked={payType === 'uzcard'}
                    onChange={onValueChange}
                    className="hidden"
                  />
                </label>
                <label
                  className={`flex justify-around items-center w-24 h-24 p-3 rounded-2xl ${
                    payType == 'humo' ? 'border-primary' : 'border-gray-200'
                  } border cursor-pointer`}
                >
                  <img src="/assets/humo.png" />
                  <input
                    type="radio"
                    defaultValue="humo"
                    onChange={onValueChange}
                    checked={payType === 'humo'}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className={openTab === 3 ? 'block' : 'hidden'} id="link3">
              <div className="justify-between pt-8 items-center grid grid-cols-2 gap-2">
                {locationData?.terminal_id &&
                  paymentTypes
                    .filter(
                      (payment: string) =>
                        !!locationData?.terminalData[`${payment}_active`]
                    )
                    .map((payment: string) => (
                      <label
                        className={`flex justify-around items-center w-24 h-24 p-3 rounded-2xl ${
                          payType == payment
                            ? 'border-primary'
                            : 'border-gray-200'
                        } border cursor-pointer`}
                        key={payment}
                      >
                        <img src={`/assets/${payment}.png`} />
                        <input
                          type="radio"
                          {...register('pay_type', { required: openTab === 3 })}
                          defaultValue={payment}
                          checked={payType === payment}
                          onChange={onValueChange}
                          className="hidden"
                        />
                      </label>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* order list */}
      <div className="w-full bg-white md:mb-10 mb-5 md:rounded-2xl py-7 md:px-10 px-5  shadow-xl">
        <div className="text-3xl mb-5">{tr('order_order_list')}</div>
        {!isEmpty &&
          data &&
          data?.lineItems.map((lineItem: any) => (
            <div
              className="flex justify-between items-center border-b py-2"
              key={lineItem.id}
            >
              {lineItem.child &&
              lineItem.child.length &&
              lineItem.child[0].variant?.product?.id !=
                lineItem?.variant?.product?.box_id ? (
                <div
                  className={`${
                    isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                  } h-11 w-11 flex relative`}
                >
                  <div className="w-5 relative overflow-hidden">
                    <div>
                      <Image
                        src={
                          lineItem?.variant?.product?.assets?.length
                            ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                            : '/no_photo.svg'
                        }
                        width="40"
                        height="40"
                        layout="fixed"
                        className="absolute rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="w-5 relative overflow-hidden">
                    <div className="absolute right-0">
                      <Image
                        src={
                          lineItem?.child[0].variant?.product?.assets?.length
                            ? `${webAddress}/storage/${lineItem?.child[0].variant?.product?.assets[0]?.location}/${lineItem?.child[0].variant?.product?.assets[0]?.filename}`
                            : '/no_photo.svg'
                        }
                        width="40"
                        height="40"
                        layout="fixed"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`${
                    isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                  } flex items-center`}
                >
                  <Image
                    src={
                      lineItem?.variant?.product?.assets?.length
                        ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                        : '/no_photo.svg'
                    }
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              )}
              <div className="flex flex-grow items-center mx-2">
                <div className="font-bold text-xl">
                  {lineItem.child && lineItem.child.length > 1 ? (
                    `${
                      lineItem?.variant?.product?.attribute_data?.name[
                        channelName
                      ][locale || 'ru']
                    } + ${lineItem?.child
                      .filter(
                        (v: any) =>
                          lineItem?.variant?.product?.box_id !=
                          v?.variant?.product?.id
                      )
                      .map(
                        (v: any) =>
                          v?.variant?.product?.attribute_data?.name[
                            channelName
                          ][locale || 'ru']
                      )
                      .join(' + ')}`
                  ) : (
                    <div
                      className={
                        isProductInStop.includes(lineItem.id)
                          ? 'opacity-25'
                          : ''
                      }
                    >
                      {isProductInStop.includes(lineItem.id)
                        ? tr('stop_product')
                        : lineItem?.variant?.product?.attribute_data?.name[
                            channelName
                          ][locale || 'ru']}
                    </div>
                  )}
                </div>
                {lineItem.modifiers &&
                  lineItem.modifiers
                    .filter((mod: any) => mod.price > 0)
                    .map((mod: any) => (
                      <div
                        className="bg-primary rounded-xl px-2 py-1 ml-2 text-xs text-white"
                        key={mod.id}
                      >
                        {locale == 'uz' ? mod.name_uz : mod.name}
                      </div>
                    ))}
              </div>
              <div
                className={`${
                  isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                }  text-xl`}
              >
                {lineItem.child && lineItem.child.length
                  ? (lineItem.total > 0 ? lineItem.quantity + ' X ' : '') +
                    currency(+lineItem.total + +lineItem.child[0].total, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                      precision: 0,
                    }).format()
                  : (lineItem.total > 0 ? lineItem.quantity + ' X ' : '') +
                    currency(lineItem.total * lineItem.quantity, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                      precision: 0,
                    }).format()}
              </div>
            </div>
          ))}
        <div className="flex items-center border-b py-2 text-2xl">
          <div className="font-bold">{tr('cutlery_and_napkins')}</div>
          <label htmlFor="N" className="ml-12">
            <div className="font-bold mx-2">{tr('no')}</div>
          </label>
          <input
            type="radio"
            value={'N'}
            checked={cutlery === 'N'}
            className={` ${
              cutlery ? 'text-primary' : 'bg-gray-200'
            } border-2 border-primary form-checkbox rounded-md text-primary outline-none focus:outline-none active:outline-none focus:border-primary`}
            onChange={cutleryHandler}
            id="N"
          />

          <label htmlFor="Y">
            <div className="font-bold mx-2">{tr('yes')}</div>
          </label>
          <input
            type="radio"
            value={'Y'}
            checked={cutlery === 'Y'}
            className={` ${
              cutlery ? 'text-primary' : 'bg-gray-200'
            } border-2 border-primary form-checkbox rounded-md text-primary outline-none focus:outline-none active:outline-none focus:border-primary`}
            onChange={cutleryHandler}
            id="Y"
          />
        </div>
      </div>
      <div className="md:rounded-2xl md:bg-gray-100 md:flex items-center justify-between md:px-10  px-5 py-16">
        {/* <div className="md:w-72">
                <form onSubmit={handleSubmit(onSubmit)} className="relative">
                  <input
                    type="text"
                    placeholder={tr('promocode')}
                    {...register('discount_code')}
                    className="bg-gray-100 focus:outline-none outline-none px-5 py-2 rounded-full text-lg w-full"
                  />
                  <button className="absolute focus:outline-none outline-none right-1 top-1">
                    <Image src="/discount_arrow.png" width={37} height={37} />
                  </button>
                </form>
              </div> */}
        <div className="space-y-4 md:w-1/3 rounded-2xl bg-gray-100 p-4 md:p-0 ">
          {!isEmpty && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-lg">{tr('basket_order_price')}</div>
                <div className="ml-7 text-lg">
                  {currency(totalPrice, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                    precision: 0,
                  }).format()}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg">Доставка:</div>
                <div className="ml-7 text-lg">
                  {currency(deliveryPrice, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                    precision: 0,
                  }).format()}
                  {query && query.debug && (
                    <div className="text-xs text-gray-600">
                      {deliveryDistance} км
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium">Итого:</div>
                <div className="ml-7 text-2xl font-medium">
                  {currency(totalPrice + deliveryPrice, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                    precision: 0,
                  }).format()}
                </div>
              </div>
            </>
          )}
        </div>
        <button
          className={`bg-green-600 md:text-xl rounded-2xl text-white md:w-64 w-full py-5 px-12 font-medium mt-5 md:mt-0 ${
            !locationData?.terminal_id ? 'opacity-25 cursor-not-allowed' : ''
          }`}
          onClick={handleSubmit(saveOrder)}
          disabled={!locationData?.terminal_id || isSavingOrder}
        >
          {isSavingOrder ? (
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
            <>{tr('checkout')}</>
          )}
        </button>
      </div>
      <Transition appear show={isPhoneConfirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => {}}
          initialFocus={authButtonRef}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="align-middle inline-block overflow-hidden w-full">
                <div className="md:inline-flex my-8 items-start">
                  <div className="align-middle bg-white inline-block overflow-hidden md:px-40 px-6 py-10 rounded-2xl shadow-xl text-center transform transition-all max-w-2xl">
                    <Dialog.Title as="h3" className="leading-6 text-3xl">
                      $
                      {locale == 'uz'
                        ? 'Buyurtmani tasdiqlash'
                        : 'Подтверждение заказа'}
                    </Dialog.Title>
                    <Dialog.Description>
                      $
                      {locale == 'uz'
                        ? 'SMS-dan kodni kiriting'
                        : 'Укажите код из смс'}
                    </Dialog.Description>
                    <div>
                      <form onSubmit={handlePasswordSubmit(saveOrder)}>
                        <div className="mt-10">
                          <label className="text-sm text-gray-400 mb-2 block">
                            ${locale == 'uz' ? 'SMS-dan kod' : 'Код из смс'}
                          </label>
                          <OtpInput
                            value={otpCode}
                            onChange={handleOtpChange}
                            inputStyle={`${styles.digitField} border border-primary w-16 rounded-3xl h-12 outline-none focus:outline-none text-center`}
                            isInputNum={true}
                            containerStyle="grid grid-cols-4 gap-1.5 justify-center"
                            numInputs={4}
                          />
                          {otpShowCode > 0 ? (
                            <div className="text-xs text-primary mt-3">
                              {otpTimerText}
                            </div>
                          ) : (
                            <button
                              className="text-xs text-primary mt-3 outline-none focus:outline-none border-b border-primary pb-0.5"
                              onClick={(e) => getNewCode(e)}
                            >
                              $
                              {locale == 'uz'
                                ? 'Kodni qayta olish'
                                : 'Получить код заново'}
                            </button>
                          )}
                        </div>
                        <div className="mt-10">
                          <button
                            className={`py-3 px-20 text-white font-bold text-xl text-center rounded-xl w-full outline-none focus:outline-none ${
                              otpCode.length >= 4 ? 'bg-primary' : 'bg-gray-400'
                            }`}
                            disabled={otpCode.length < 4}
                            ref={authButtonRef}
                          >
                            {passwordFormState.isSubmitting ? (
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
                            ) : locale == 'uz' ? (
                              'Tasdiqlash'
                            ) : (
                              'Подтвердить'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default memo(Orders)
