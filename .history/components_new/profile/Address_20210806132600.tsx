import { memo, FC } from 'react'
import AddresItems from '@commerce/data/address'
import useTranslation from 'next-translate/useTranslation'

const Address: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      {AddresItems.map((value, key) => ( 
        <div key={key}>
          <div className="text-2xl mt-8 mb-5">{tr('profile_address')}</div>
          <div className="border flex h-28 justify-between p-10 rounded-2xl text-xl">
            <div className="font-bold">
              {tr('profile_bounuses_current_balance')}
            </div>
            <div className="text-yellow">0 {value.address} </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default memo(Address)