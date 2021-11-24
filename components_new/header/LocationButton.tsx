import { FC, Fragment, memo, useEffect, useState } from 'react'
import { useUI } from '@components/ui/context'
import useTranslation from 'next-translate/useTranslation'
import Cookies from 'js-cookie'
import axios from 'axios'
import getConfig from 'next/config'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Address } from '@commerce/types/address'

const LocationButton: FC = () => {
  const [addressList, setAddressList] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address>()
  const { showAddress, locationData, user, setAddressId, setLocationData } =
    useUI()
  const { t: tr } = useTranslation('common')
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
        console.log(data)
        if (data.success) {
          setAddressList(data.data)
        }
        // orderData = data.data
      } catch (e) {}
    } else {
      return
    }
  }

  const changeAddress = (address: Address) => {
    setLocationData({
      ...address,
      location: [address.lat, address.lon],
    })
    setAddressId(address.id)
    setSelectedAddress(address)
  }

  useEffect(() => {
    fetchAddress()
  }, [])
  return (
    <>
      {!user ? (
        <button
          className="bg-primary truncate cursor-pointer flex items-center justify-center rounded-xl text-white w-64 h-12 md:h-[36px] outline-none focus:outline-none"
          onClick={() => {
            showAddress()
          }}
        >
          <div className="flex items-center mr-3">
            <img src="/assets/location.svg" width="14" height="16" />
          </div>
          {locationData && locationData.address
            ? locationData.address
            : tr('chooseLocation')}
        </button>
      ) : (
        <Listbox value={selectedAddress} onChange={changeAddress}>
          <div className="relative">
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
              <span className="block truncate">
                {locationData && locationData.address
                  ? locationData.address
                  : tr('chooseLocation')}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
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
              <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                {addressList.map((address) => (
                  <Listbox.Option
                    key={address.id}
                    className={({ active }) =>
                      `${
                        active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'
                      }
                          cursor-default select-none relative py-2 pl-10 pr-4`
                    }
                    value={address}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`${
                            selected ? 'font-medium' : 'font-normal'
                          } block truncate`}
                        >
                          {address.address}
                        </span>
                        {selected ? (
                          <span
                            className={`${
                              active ? 'text-amber-600' : 'text-amber-600'
                            }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                          >
                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    </>
  )
}

export default memo(LocationButton)
