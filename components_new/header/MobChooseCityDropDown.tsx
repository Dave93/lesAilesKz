import React, { Fragment, FC, memo, useState, useMemo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'
import { useUI } from '@components/ui'
import { City } from '@commerce/types/cities'

const ChooseCityDropDown: FC = () => {
  const { cities, activeCity, setActiveCity } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <div className={`${open ? 'hidden' : ''}`}>
            <Menu.Button className="focus:outline-none font-medium justify-center outline-none px-4 py-2 text-white text-sm w-full">
              <div className="flex items-center">
                <Image src="/assets/location.png" width="14" height="16" />
                <div className="ml-3 text-xl">
                  {chosenCity?.name ? chosenCity?.name : 'Ваш город'}
                </div>
              </div>
            </Menu.Button>
          </div>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="text-white w-full h-full z-50 fixed bg-secondary"
            >
              {cities.map((item: City) => (
                <Menu.Item key={item.id}>
                  <span
                    onClick={() => setActiveCity(item)}
                    className={`block px-4 py-2 cursor-pointer text-xl ml-12`}
                  >
                    {item.name}
                  </span>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default memo(ChooseCityDropDown)
