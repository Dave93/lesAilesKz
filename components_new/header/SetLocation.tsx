import React, { Fragment, useRef, useState, memo, FC } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Dialog, Transition } from '@headlessui/react'
import LocationTabs from './LocationTabs'
import Image from 'next/image'
import { useUI } from '@components/ui/context'
import { XIcon } from '@heroicons/react/solid'

const SetLocation: FC = () => {
  const { t: tr } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const { locationData, showAddress, hideAddress } = useUI()
  const cancelButtonRef = useRef(null)

  return (
    <>
      <LocationTabs setOpen={setOpen} />
    </>
  )
}

export default memo(SetLocation)
