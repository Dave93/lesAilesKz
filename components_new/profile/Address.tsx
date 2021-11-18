import { memo, FC } from 'react'
import AddresItems from '@commerce/data/address'
import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { XIcon } from '@heroicons/react/solid'
import { useUI } from '@components/ui/context'

const Address: FC = () => {
  const { t: tr } = useTranslation('common')

  let items = AddresItems.map((item) => {
    return {
      ...item,
      type: tr(item.type),
    }
  })

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
  } = useUI()

  return (
    <>
      <div className="m-auto my-12 text-2xl w-max md:mt-0">{tr('profile_address')}</div>
      <div className="w-max m-auto">
        <div className="flex items-center py-2 px-4 bg-gray-200 rounded-lg justify-between w-max m-auto mb-2">
          <div>
            <div className="text-base">Мой дом</div>
            <div className="text-sm">
              ул. Нукус, д. 35, кв. 40, под. 1, эт. 4{' '}
            </div>
          </div>
          <XIcon className="w-5 h-5 ml-24" />
        </div>
        <div className="flex items-center py-2 px-4 bg-gray-200 rounded-lg justify-between w-max m-auto mb-2">
          <div>
            <div className="text-base">Мой дом</div>
            <div className="text-sm">
              ул. Нукус, д. 35, кв. 40, под. 1, эт. 4{' '}
            </div>
          </div>
          <XIcon className="w-5 h-5 ml-24" />
        </div>
        <button
          className="py-5 px-16 font-medium text-xl bg-green-500 rounded-2xl mt-12 text-white text-center w-full"
          onClick={showAddressMobile}
          type="button"
        >
          Добавить новый адрес
        </button>
      </div>
    </>
  )
}

export default memo(Address)
