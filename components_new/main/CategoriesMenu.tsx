import { FC, memo, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { LinkItem } from '@commerce/types/headerMenu'
import Image from 'next/image'
import { Link } from 'react-scroll'

const CategoriesMenu: FC<{ categories: any[]; channelName: string }> = ({
  categories = [],
  channelName = '',
}) => {
  const { locale = 'ru', pathname } = useRouter()

  const [fixed, changeState] = useState(false)

  const categoriesFixing = () => {
    window.pageYOffset > 600 ? changeState(true) : changeState(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', categoriesFixing)
    }
  }, [])

  return (
    <div
      className={`${
        fixed
          ? 'bg-white fixed flex md:overflow-x-visible overflow-x-scroll top-0 w-full z-30'
          : 'mt-10'
      }`}
    >
      <div className="container  flex items-center m-auto overflow-x-scroll sm:overflow-x-hidden md:overflow-x-visible">
        <div className="flex h-14 items-center md:w-full space-x-4">
          {categories.map((item: any) => {
            return (
              <div
                className="text-black text-lg text-center  cursor-pointer min-w-max bg-gray-200 rounded-lg"
                key={item.id}
              >
                <Link
                  to={`productSection_${item.id}`}
                  spy={true}
                  smooth={true}
                  activeClass="bg-gray-500 text-white rounded-lg"
                  offset={-100}
                  className=""
                >
                  <span className="p-3  block">
                    {item?.attribute_data?.name[channelName][locale || 'ru']}
                  </span>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(CategoriesMenu)
