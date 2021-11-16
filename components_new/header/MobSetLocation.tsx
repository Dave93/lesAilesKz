import React, { Fragment, useRef, useState, memo, FC } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import MobLocationTabs from './MobLocationTabs.'
import { useUI } from '@components/ui'

const SetLocation: FC = () => {
  const { t: tr } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const { locationData } = useUI()

  const cancelButtonRef = useRef(null)
  return (
    <>
      <button
        className="bg-primary truncate cursor-pointer flex items-center justify-center rounded-xl text-white w-64 h-12 md:h-[36px] outline-none focus:outline-none"
        onClick={() => {
          setOpen(true)
        }}
      >
        <div className="flex items-center mr-3">
          <Image src="/assets/location.svg" width="14" height="16" />
        </div>
        {locationData && locationData.address
          ? locationData.address
          : tr('chooseLocation')}
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed z-10 inset-0 overflow-y-auto"
          initialFocus={cancelButtonRef}
          open={open}
          onClose={setOpen}
        >
          <div className="flex items-end justify-center min-h-screen  text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="bg-white text-left transform h-screen overflow-y-auto w-full overflow-hidden">
                <MobLocationTabs setOpen={setOpen} />
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

export default memo(SetLocation)
