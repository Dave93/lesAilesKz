import { memo, FC, useEffect, useState } from 'react'
import { Address } from '@commerce/types/address'
import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { XIcon, PencilIcon } from '@heroicons/react/solid'
import { useUI } from '@components/ui/context'
import Cookies from 'js-cookie'
import axios from 'axios'
import getConfig from 'next/config'
import getAddressList from '@lib/load_addreses'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const Address: FC = () => {
  const { t: tr } = useTranslation('common')
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
  const {
    showAddressMobile,
    setAddressId,
    setLocationData,
    setAddressList,
    addressList,
    showAddress,
  } = useUI()

  const loadAddresses = async () => {
    const addresses = await getAddressList()
    if (!addresses) {
      setErrorMessage(tr('user_must_login'))
    } else {
      setAddressList(addresses)
    }
  }

  const addNewAddress = () => {
    setLocationData(null)
    setAddressId(null)
    window.innerWidth < 768 ? showAddressMobile() : showAddress()
  }

  const editAddress = (address: Address) => {
    setLocationData({
      ...address,
      location: [address.lat, address.lon],
    })
    setAddressId(address.id)
    window.innerWidth < 768 ? showAddressMobile() : showAddress()
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

  const deleteAddress = async (addressId: number) => {
    await setCredentials()
    const otpToken = Cookies.get('opt_token')
    const response = await axios.delete(
      `${webAddress}/api/address/${addressId}`,
      {
        headers: {
          Authorization: `Bearer ${otpToken}`,
        },
      }
    )
    if (response.status === 200) {
      loadAddresses()
    }
  }

  useEffect(() => {
    loadAddresses()
    return () => {}
  }, [])

  return (
    <>
      <div className="m-auto my-12 text-2xl w-max md:mt-0">
        {tr('profile_address')}
      </div>
      {errorMessage && (
        <div className="text-red-500 text-center">{errorMessage}</div>
      )}
      <div className="w-11/12 md:w-5/12 m-auto">
        {!errorMessage && addressList && addressList.length > 0 && (
          <>
            {addressList.map((item: Address) => {
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
                    <XIcon
                      className="text-primary w-5 h-5 cursor-pointer"
                      onClick={() => deleteAddress(item.id)}
                    />
                  </div>
                </div>
              )
            })}
          </>
        )}
        {!errorMessage && addressList && addressList.length === 0 && (
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
