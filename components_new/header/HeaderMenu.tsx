import React, { FC, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { HeaderMenuItems } from '@commerce/types/headerMenu'
import { useUI } from '@components/ui/context'

const HeaderMenu: FC<HeaderMenuItems> = ({ menuItems }) => {
  const { locale } = useRouter()
  const { activeCity } = useUI()
  return (
    <ul className="md:flex justify-between md:space-y-0 space-y-3">
      {menuItems.length &&
        menuItems.map((item) => {
          const keyTyped = `name_${locale}` as keyof typeof item
          let href = `${item.href}`

          if (href.indexOf('http') < 0) {
            href = `/${activeCity.slug}${item.href}`
          }

          return (
            <li className="md:px-2 truncate justify-items-center" key={item.id}>
              <Link href={href} prefetch={false}>
                <a className="no-underline text-lg md:text-base">
                  {item[keyTyped]}
                </a>
              </Link>
            </li>
          )
        })}
    </ul>
  )
}

export default memo(HeaderMenu)
