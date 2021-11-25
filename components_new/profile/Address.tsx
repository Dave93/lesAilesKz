import { memo, FC, useEffect, useState } from 'react'
import { Address } from '@commerce/types/address'
import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { XIcon, PencilIcon } from '@heroicons/react/solid'
import { useUI } from '@components/ui/context'
import Cookies from 'js-cookie'
import axios from 'axios'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const Address: FC = () => {
  const { t: tr } = useTranslation('common')
  const [addressList, setAddressList] = useState<Address[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  // let items = AddresItems.map((item) => {
  //   return {
  //     ...item,
  //     type: tr(item.type),
  //   }
  // })

  type FormData = {
    street: string
    house: string
    flat: string
    floor: string
    door_code: string
    addressType: string
  }
  const { register } = useForm<FormData>({
    defaultValues: {
      street: '',
      house: '',
      flat: '',
      floor: '',
      door_code: '',
      addressType: '',
    },
  })
  const { showAddressMobile, setAddressId, setLocationData, showAddress } = useUI()

  const getAddressList = async () => {
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
      if (!data.success) {
        setErrorMessage(data.message)
      } else {
        setAddressList(data.data)
      }
      // orderData = data.data
    } catch (e) {}
  }

  const addNewAddress = () => {
    setLocationData(null)
    setAddressId(null)
    window.innerWidth < 768 ? showAddressMobile() : showAddress()
  }

  const editAddress = (address: Address) => {
    console.log(address)
    setLocationData({
      ...address,
      location: [address.lat, address.lon],
    })
    setAddressId(address.id)
    window.innerWidth < 768 ? showAddressMobile() : showAddress()
  }

  useEffect(() => {
    getAddressList()
    return () => {}
  }, [])

  return (
    <>
      <div className="m-auto my-12 text-2xl w-max md:mt-0">
        {tr('profile_address')}
      </div>
      {errorMessage && (
        <div className="text-red-500 text-center">{tr(errorMessage)}</div>
      )}
      <div className="w-11/12 md:w-5/12 m-auto">
        {!errorMessage && addressList.length > 0 && (
          <>
            {addressList.map((item) => {
              return (
                <div
                  className="flex items-center py-2 px-4 bg-gray-200 rounded-lg justify-between mb-2"
                  key={item.id}
                >
                  <div className="w-11/12">
                    <div className="text-base">
                      {item.label ? item.label : tr('address_name_is_empty')}
                    </div>
                    <div className="text-sm">
                      {item.address}{' '}
                      {item.house
                        ? ', ' +
                          tr('house').toLocaleLowerCase() +
                          ': ' +
                          item.house
                        : ''}
                      {item.flat
                        ? ', ' +
                          tr('flat').toLocaleLowerCase() +
                          ': ' +
                          item.flat
                        : ''}
                      {item.entrance
                        ? ', ' +
                          tr('entrance').toLocaleLowerCase() +
                          ': ' +
                          item.entrance
                        : ''}
                      {item.door_code
                        ? ', ' +
                          tr('code_on_doors').toLocaleLowerCase() +
                          ': ' +
                          item.door_code
                        : ''}
                    </div>
                  </div>
                  <div>
                    <PencilIcon
                      className="text-green-500 w-5 h-5 cursor-pointer"
                      onClick={() => editAddress(item)}
                    />
                    <XIcon className="text-primary w-5 h-5 cursor-pointer" />
                  </div>
                </div>
              )
            })}
          </>
        )}
        {!errorMessage && addressList.length === 0 && (
          <div className="text-center">{tr('no_address')}</div>
        )}
        {!errorMessage && (
          <button
            className="py-5 font-medium text-xl bg-green-500 rounded-2xl mt-12 text-white text-center w-full"
            onClick={addNewAddress}
            type="button"
          >
            {tr('add_new_address')}
          </button>
        )}
      </div>
    </>
  )
}

export default memo(Address)
