import { memo, FC } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
const CreditCardComponent: FC = () => {
  const { t: tr } = useTranslation('common')

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

  return (
    <>
      <div className="m-auto my-12 text-2xl w-max md:mt-0">
        {tr('profile_mycreditcard')}
      </div>
      <div className="w-max m-auto"></div>
    </>
  )
}

export default memo(CreditCardComponent)
