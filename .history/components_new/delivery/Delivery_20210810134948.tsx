import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'

const Delivery: FC = () => {
  return (
    <>
          <div className="text-3xl">Доставка в Chopar Pizza ежедневно с 10:00 до 03:00 </div>
          <div className="border-b-2 w-20 border-yellow"></div>
      <Image src="/banner.png" layout="responsive" width={1160} height={270} />
    </>
  )
}

export default memo(Delivery)