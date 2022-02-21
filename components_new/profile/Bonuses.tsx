import { FC, memo } from 'react'
import useTranslation from 'next-translate/useTranslation'

const Bonuses: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <div>
      <div className="text-2xl mt-8 mb-5">{tr('profile_bonuses_my')}</div>
      <div className="border flex h-28 justify-between p-10 rounded-2xl text-xl">
        <div className="font-bold">
          {tr('profile_bounuses_current_balance')}
        </div>
        <div className="text-primary">0 {tr('profile_bounuses_score')} </div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
