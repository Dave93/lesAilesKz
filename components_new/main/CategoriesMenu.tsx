import { FC, memo, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { LinkItem } from '@commerce/types/headerMenu'
import Image from 'next/image'
import { Link } from 'react-scroll'
import dynamic from 'next/dynamic'
import SimpleBar from 'simplebar-react'

const CartWithNoSSR = dynamic(
  () => import('@components_new/common/SmallCart'),
  { ssr: false }
)

const CategoriesMenu: FC<{ categories: any[]; channelName: string }> = ({
  categories = [],
  channelName = '',
}) => {
  const { locale = 'ru', pathname } = useRouter()

  const [fixed, changeState] = useState(false)

  const categoriesFixing = () => {
    window.pageYOffset > 700 ? changeState(true) : changeState(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', categoriesFixing)
    }
    return () => {
      window.removeEventListener('scroll', categoriesFixing)
    }
  }, [])

  return (
    <div
      className={`${
        fixed
          ? 'bg-white fixed flex md:overflow-x-visible overflow-x-scroll top-0 w-full z-30'
          : 'mt-8'
      }`}
    >
      <div
        className={`${
          fixed
            ? 'container flex items-center justify-between m-auto py-3'
            : 'container m-auto'
        }`}
      >
        <SimpleBar
          style={{ maxHeight: 120 }}
          className={`${fixed ? 'w-10/12' : ''}`}
        >
          <div className="flex items-center md:w-full space-x-3">
            {categories.map((item: any) => {
              return (
                <div
                  className="text-black text-lg text-center  cursor-pointer min-w-max  bg-gray-200 rounded-lg"
                  key={item.id}
                >
                  <Link
                    to={`productSection_${item.id}`}
                    spy={true}
                    smooth={true}
                    activeClass="text-primary rounded-lg"
                    offset={-100}
                    className=""
                  >
                    <div className="p-3 leading-4">
                      {item?.attribute_data?.name[channelName][locale || 'ru']}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </SimpleBar>
        {fixed && <CartWithNoSSR channelName={channelName} />}
      </div>
    </div>
  )
}

export default memo(CategoriesMenu)
