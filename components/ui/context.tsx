import { City } from '@commerce/types/cities'
import React, { FC, useCallback, useMemo } from 'react'
import Cookies from 'js-cookie'

let userData: any = null

let locationData: any = {
  address: '',
  flat: '',
  house: '',
  entrance: '',
  door_code: '',
  deliveryType: 'deliver',
  location: [],
}

let activeCity: City | null = null

let activeCityData: any = Cookies.get('activeCity')
try {
  activeCityData = Buffer.from(activeCityData, 'base64')
  activeCityData = activeCityData.toString()
  activeCityData = JSON.parse(activeCityData)
} catch (e) {}

activeCity = activeCityData

let otpToken: string | null | undefined = Cookies.get('opt_token')

if (typeof window !== 'undefined') {
  if (!otpToken) {
    otpToken = localStorage.getItem('opt_token')
    if (otpToken) {
      Cookies.set('opt_token', otpToken)
    }
  }
}

if (typeof window !== 'undefined') {
  userData = localStorage.getItem('mijoz')
  try {
    userData = Buffer.from(userData, 'base64')
    userData = userData.toString()
    userData = JSON.parse(userData)
  } catch (e) {}

  locationData = sessionStorage.getItem('yetkazish') ?? locationData
  try {
    if (locationData) {
      let locData: any = Buffer.from(locationData, 'base64')
      locData = locData.toString()
      locationData = JSON.parse(locData)
    }
  } catch (e) {}
}

interface AnyObject {
  [key: string]: any
}

export interface UserData {
  user_identity: number[]
  user_contact: string
  user_token: string
  try: number
  status: number
  user: AnyObject
}

export interface LocationData {
  address: string
  flat: string
  house: string
  entrance: string
  door_code?: string
  floor?: string
  deliveryType: 'pickup' | 'deliver'
  location?: number[]
  terminalId?: number
  terminalData?: AnyObject
}

export interface State {
  displaySidebar: boolean
  displayDropdown: boolean
  displayModal: boolean
  sidebarView: string
  modalView: string
  userAvatar: string
  user?: UserData | null
  locationData: LocationData | null
  cities: City[] | null
  activeCity: City | null
  showSignInModal: boolean
  overlay: boolean
  addressModal: boolean
  addressId: number | null
}

const initialState = {
  displaySidebar: false,
  displayDropdown: false,
  displayModal: false,
  modalView: 'LOGIN_VIEW',
  sidebarView: 'CART_VIEW',
  userAvatar: '',
  user: userData,
  locationData,
  cities: null,
  activeCity: activeCity,
  showSignInModal: false,
  overlay: false,
  addressModal: false,
  addressModalMobile: false,
  addressId: null,
}

type Action =
  | {
      type: 'OPEN_SIDEBAR'
    }
  | {
      type: 'CLOSE_SIDEBAR'
    }
  | {
      type: 'OPEN_DROPDOWN'
    }
  | {
      type: 'CLOSE_DROPDOWN'
    }
  | {
      type: 'OPEN_MODAL'
    }
  | {
      type: 'CLOSE_MODAL'
    }
  | {
      type: 'SET_MODAL_VIEW'
      view: MODAL_VIEWS
    }
  | {
      type: 'SET_SIDEBAR_VIEW'
      view: SIDEBAR_VIEWS
    }
  | {
      type: 'SET_USER_AVATAR'
      value: string
    }
  | {
      type: 'SET_USER_DATA'
      value: UserData
    }
  | {
      type: 'SET_LOCATION_DATA'
      value: LocationData
    }
  | {
      type: 'SET_CITIES_DATA'
      value: City[]
    }
  | {
      type: 'SET_ACTIVE_CITY'
      value: City
    }
  | {
      type: 'SHOW_SIGNIN_MODAL'
    }
  | {
      type: 'CLOSE_SIGNIN_MODAL'
    }
  | {
      type: 'SHOW_OVERLAY'
    }
  | {
      type: 'HIDE_OVERLAY'
    }
  | {
      type: 'SHOW_ADDRESS'
    }
  | {
      type: 'HIDE_ADDRESS'
    }
  | {
      type: 'SHOW_ADDRESS_MOBILE'
    }
  | {
      type: 'HIDE_ADDRESS_MOBILE'
    }
  | {
      type: 'SET_ADDRESS_ID'
      value: number
    }

type MODAL_VIEWS =
  | 'SIGNUP_VIEW'
  | 'LOGIN_VIEW'
  | 'FORGOT_VIEW'
  | 'NEW_SHIPPING_ADDRESS'
  | 'NEW_PAYMENT_METHOD'

type SIDEBAR_VIEWS = 'CART_VIEW' | 'CHECKOUT_VIEW' | 'PAYMENT_METHOD_VIEW'

export const UIContext = React.createContext<State | any>(initialState)

UIContext.displayName = 'UIContext'

function uiReducer(state: State, action: Action) {
  switch (action.type) {
    case 'OPEN_SIDEBAR': {
      return {
        ...state,
        displaySidebar: true,
      }
    }
    case 'CLOSE_SIDEBAR': {
      return {
        ...state,
        displaySidebar: false,
      }
    }
    case 'OPEN_DROPDOWN': {
      return {
        ...state,
        displayDropdown: true,
      }
    }
    case 'CLOSE_DROPDOWN': {
      return {
        ...state,
        displayDropdown: false,
      }
    }
    case 'OPEN_MODAL': {
      return {
        ...state,
        displayModal: true,
        displaySidebar: false,
      }
    }
    case 'CLOSE_MODAL': {
      return {
        ...state,
        displayModal: false,
      }
    }
    case 'SET_MODAL_VIEW': {
      return {
        ...state,
        modalView: action.view,
      }
    }
    case 'SET_SIDEBAR_VIEW': {
      return {
        ...state,
        sidebarView: action.view,
      }
    }
    case 'SET_USER_AVATAR': {
      return {
        ...state,
        userAvatar: action.value,
      }
    }
    case 'SET_USER_DATA': {
      try {
        let userNewData = JSON.stringify(action.value)
        userNewData = Buffer.from(userNewData).toString('base64')
        localStorage.setItem('mijoz', userNewData)
      } catch (e) {}
      if (action.value == null) {
        localStorage.removeItem('mijoz')
        localStorage.removeItem('opt_token')
        Cookies.remove('opt_token')
      }
      return {
        ...state,
        user: action.value,
      }
    }
    case 'SET_LOCATION_DATA': {
      try {
        let locationNewData = JSON.stringify(action.value)
        locationNewData = Buffer.from(locationNewData).toString('base64')
        sessionStorage.setItem('yetkazish', locationNewData)
      } catch (e) {}
      return {
        ...state,
        locationData: action.value,
      }
    }
    case 'SET_CITIES_DATA': {
      return {
        ...state,
        cities: action.value,
      }
    }
    case 'SET_ACTIVE_CITY': {
      try {
        let locationNewData = JSON.stringify(action.value)
        locationNewData = Buffer.from(locationNewData).toString('base64')
        Cookies.set('activeCity', locationNewData)
        Cookies.set('city_slug', action.value.slug)
      } catch (e) {}
      return {
        ...state,
        activeCity: action.value,
      }
    }
    case 'SHOW_SIGNIN_MODAL': {
      return {
        ...state,
        showSignInModal: true,
      }
    }
    case 'CLOSE_SIGNIN_MODAL': {
      return {
        ...state,
        showSignInModal: false,
      }
    }
    case 'SHOW_OVERLAY': {
      return {
        ...state,
        overlay: true,
      }
    }
    case 'HIDE_OVERLAY': {
      return {
        ...state,
        overlay: false,
      }
    }
    case 'SHOW_ADDRESS': {
      return {
        ...state,
        addressModal: true,
      }
    }
    case 'HIDE_ADDRESS': {
      return {
        ...state,
        addressModal: false,
      }
    }
    case 'SHOW_ADDRESS_MOBILE': {
      return {
        ...state,
        addressModalMobile: true,
      }
    }
    case 'HIDE_ADDRESS_MOBILE': {
      return {
        ...state,
        addressModalMobile: false,
      }
    }
    case 'SET_ADDRESS_ID': {
      return {
        ...state,
        addressId: action.value,
      }
    }
  }
}

type UIProviderProps = {
  children?: React.ReactNode
  pageProps?: any
}

export const UIProvider: FC<UIProviderProps> = (props) => {
  if (props.pageProps.currentCity) {
    initialState.activeCity = props.pageProps.currentCity
  }
  const [state, dispatch] = React.useReducer(uiReducer, initialState)

  const openSidebar = useCallback(
    () => dispatch({ type: 'OPEN_SIDEBAR' }),
    [dispatch]
  )
  const closeSidebar = useCallback(
    () => dispatch({ type: 'CLOSE_SIDEBAR' }),
    [dispatch]
  )
  const toggleSidebar = useCallback(
    () =>
      state.displaySidebar
        ? dispatch({ type: 'CLOSE_SIDEBAR' })
        : dispatch({ type: 'OPEN_SIDEBAR' }),
    [dispatch, state.displaySidebar]
  )
  const closeSidebarIfPresent = useCallback(
    () => state.displaySidebar && dispatch({ type: 'CLOSE_SIDEBAR' }),
    [dispatch, state.displaySidebar]
  )

  const openDropdown = useCallback(
    () => dispatch({ type: 'OPEN_DROPDOWN' }),
    [dispatch]
  )
  const closeDropdown = useCallback(
    () => dispatch({ type: 'CLOSE_DROPDOWN' }),
    [dispatch]
  )

  const openModal = useCallback(
    () => dispatch({ type: 'OPEN_MODAL' }),
    [dispatch]
  )
  const closeModal = useCallback(
    () => dispatch({ type: 'CLOSE_MODAL' }),
    [dispatch]
  )

  const setUserAvatar = useCallback(
    (value: string) => dispatch({ type: 'SET_USER_AVATAR', value }),
    [dispatch]
  )

  const setModalView = useCallback(
    (view: MODAL_VIEWS) => dispatch({ type: 'SET_MODAL_VIEW', view }),
    [dispatch]
  )

  const setSidebarView = useCallback(
    (view: SIDEBAR_VIEWS) => dispatch({ type: 'SET_SIDEBAR_VIEW', view }),
    [dispatch]
  )

  const setUserData = useCallback(
    (value: UserData) => dispatch({ type: 'SET_USER_DATA', value }),
    [dispatch]
  )

  const setLocationData = useCallback(
    (value: LocationData) => dispatch({ type: 'SET_LOCATION_DATA', value }),
    [dispatch]
  )

  const setCitiesData = useCallback(
    (value: City[]) => dispatch({ type: 'SET_CITIES_DATA', value }),
    [dispatch]
  )

  const setActiveCity = useCallback(
    (value: City) => dispatch({ type: 'SET_ACTIVE_CITY', value }),
    [dispatch]
  )

  const openSignInModal = useCallback(
    () => dispatch({ type: 'SHOW_SIGNIN_MODAL' }),
    [dispatch]
  )

  const closeSignInModal = useCallback(
    () => dispatch({ type: 'CLOSE_SIGNIN_MODAL' }),
    [dispatch]
  )

  const showOverlay = useCallback(
    () => dispatch({ type: 'SHOW_OVERLAY' }),
    [dispatch]
  )
  const hideOverlay = useCallback(
    () => dispatch({ type: 'HIDE_OVERLAY' }),
    [dispatch]
  )
  const showAddress = useCallback(
    () => dispatch({ type: 'SHOW_ADDRESS' }),
    [dispatch]
  )
  const hideAddress = useCallback(
    () => dispatch({ type: 'HIDE_ADDRESS' }),
    [dispatch]
  )
  const showAddressMobile = useCallback(
    () => dispatch({ type: 'SHOW_ADDRESS_MOBILE' }),
    [dispatch]
  )
  const hideAddressMobile = useCallback(
    () => dispatch({ type: 'HIDE_ADDRESS_MOBILE' }),
    [dispatch]
  )
  const setAddressId = useCallback(
    (value: number) => dispatch({ type: 'SET_ADDRESS_ID', value }),
    [dispatch]
  )

  const value = useMemo(
    () => ({
      ...state,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      closeSidebarIfPresent,
      openDropdown,
      closeDropdown,
      openModal,
      closeModal,
      setModalView,
      setSidebarView,
      setUserAvatar,
      setUserData,
      setLocationData,
      setCitiesData,
      setActiveCity,
      openSignInModal,
      closeSignInModal,
      showOverlay,
      hideOverlay,
      showAddress,
      hideAddress,
      showAddressMobile,
      hideAddressMobile,
      setAddressId,
    }),
    [state]
  )

  return <UIContext.Provider value={value} {...props} />
}

export const useUI = () => {
  const context = React.useContext(UIContext)
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`)
  }
  return context
}

export const ManagedUIContext: FC<UIProviderProps> = ({
  children,
  pageProps,
}) => <UIProvider pageProps={pageProps}>{children}</UIProvider>
