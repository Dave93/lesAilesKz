import { FC, Fragment, memo, useEffect, useMemo, useState } from 'react'
import { useUI } from '@components/ui/context'
import useTranslation from 'next-translate/useTranslation'
import Cookies from 'js-cookie'
import axios from 'axios'
import getConfig from 'next/config'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid'
import { toast } from 'react-toastify'
import { Address } from '@commerce/types/address'

const { publicRuntimeConfig } = getConfig()

let webAddress = publicRuntimeConfig.apiUrl

const LocationButton: FC = () => {
  const [addressList, setAddressList] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address>()
  const { t: tr } = useTranslation('common')
  const {
    showAddress,
    locationData,
    user,
    setAddressId,
    setLocationData,
    showAddressMobile,
    addressId,
    selectAddress,
  } = useUI()

  const addNewAddress = () => {
    setLocationData(null)
    setAddressId(null)
    window.innerWidth < 768 ? showAddressMobile() : showAddress()
  }

  const fetchAddress = async () => {
    const { publicRuntimeConfig } = getConfig()
    let webAddress = publicRuntimeConfig.apiUrl
    if (user) {
      // get opt_token from cookies

      let otpToken: any = Cookies.get('opt_token')
      axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

      try {
        const { data } = await axios.get(
          `${webAddress}/api/address/my_addresses`,
          {
            headers: {
              Authorization: `Bearer ${otpToken}`,
            },
          }
        )
        if (data.success) {
          setAddressList(data.data)
          data.data.map((address: Address) => {
            if (address.id == addressId) {
              setSelectedAddress(address)
            }
          })
        }
        // orderData = data.data
      } catch (e) {}
    } else {
      return
    }
  }

  const searchTerminal = async (
    locationData: any = {},
    returnResult: boolean = false
  ) => {
    if (!locationData || !locationData.location) {
      toast.warn(tr('no_address_specified'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      // if returnResult is true, return object else return setLocationData
      return returnResult
        ? {
            terminal_id: undefined,
            terminalData: undefined,
          }
        : setLocationData({
            ...locationData,
            terminal_id: undefined,
            terminalData: undefined,
          })
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

      // if returnResult is true, return object else return setLocationData
      return returnResult
        ? {
            terminal_id: undefined,
            terminalData: undefined,
          }
        : setLocationData({
            ...locationData,
            terminal_id: undefined,
            terminalData: undefined,
          })
    }

    if (terminalsData.data) {
      // if returnResult is true, return object else return setLocationData
      return returnResult
        ? {
            terminal_id: terminalsData.data.items[0].id,
            terminalData: terminalsData.data.items[0],
          }
        : setLocationData({
            ...locationData,
            terminal_id: terminalsData.data.items[0].id,
            terminalData: terminalsData.data.items[0],
          })
    }
  }

  const changeAddress = async (address: Address) => {
    if (address.id == addressId) {
      setAddressId(null)
    } else {
      if (address.lat && address.lon) {
        let terminalData = await searchTerminal(
          {
            location: [address.lat, address.lon],
          },
          true
        )
        selectAddress({
          locationData: {
            ...address,
            location: [address.lat, address.lon],
            terminal_id: terminalData.terminal_id,
            terminalData: terminalData.terminalData,
          },
          addressId: address.id,
        })
      } else {
        selectAddress({
          locationData: {
            ...address,
            location: [],
            terminal_id: undefined,
            terminalData: undefined,
          },
          addressId: address.id,
        })
      }
    }
  }

  const locationLabel = useMemo(() => {
    let res = ''
    if (locationData) {
      res = locationData.label ? locationData.label : locationData.address
    } else {
      res = tr('chooseLocation')
    }
    return res
  }, [locationData])

  useEffect(() => {
    fetchAddress()
  }, [])
  return (
    <>
      {!user ? (
        <button
          className="bg-primary truncate cursor-pointer flex items-center justify-center rounded-xl text-white w-64 h-12 md:h-[36px] outline-none focus:outline-none"
          onClick={() => {
            addNewAddress()
          }}
        >
          <div className="flex items-center mr-3">
            <img src="/assets/location.svg" width="14" height="16" />
          </div>
          {locationLabel}
        </button>
      ) : (
        <Listbox value={selectedAddress} onChange={changeAddress}>
          <div className="relative">
            <Listbox.Button className="py-2 pl-3 pr-10 bg-gray-100 rounded-lg w-64 border-gray-200 border">
              <div className="flex items-center">
                <img
                  src="/assets/location_primary.svg"
                  width="14"
                  height="16"
                  className="mr-2"
                />
                <span className="block truncate">{locationLabel}</span>
              </div>
              <span className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-2">
                <ChevronDownIcon
                  className="bg-white rounded-md h-5 w-5"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute py-1 mt-1 overflow-auto bg-white rounded-2xl max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 w-64">
                {addressList.map((address) => (
                  <Listbox.Option
                    key={address.id}
                    className={({ active }) =>
                      `${
                        active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'
                      }
                           select-none relative px-6 cursor-pointer`
                    }
                    value={address}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`${
                            selected ? 'font-medium' : 'font-normal'
                          } block border-b border-gray-200 py-4 truncate ml-3`}
                        >
                          {address.label ? address.label : address.address}
                        </span>
                        {selected ? (
                          <span
                            className={`${
                              active ? 'text-amber-600' : 'text-amber-600'
                            }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                          >
                            <input
                              type="checkbox"
                              className={`${
                                selected ? '' : 'border border-gray-200'
                              } text-green-500 form-checkbox rounded-md w-4 h-4 mr-4`}
                              defaultChecked={selected}
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
                <div
                  className="bg-green-500 px-6 py-4 text-white w-max rounded-xl my-2 m-auto cursor-pointer"
                  onClick={() => {
                    addNewAddress()
                  }}
                >
                  Добавить новый адрес
                </div>
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    </>
  )
}

export default memo(LocationButton)
