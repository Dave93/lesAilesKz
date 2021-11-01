import React, { FC, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { HeaderMenuItems } from '@commerce/types/headerMenu'
import { useUI } from '@components/ui/context'

const HeaderMenu: FC<HeaderMenuItems> = ({ menuItems }) => {
  const { locale } = useRouter()
  const { activeCity } = useUI()
  return (
    <ul className="flex justify-between">
      {menuItems.length &&
        menuItems.map((item) => {
          const keyTyped = `name_${locale}` as keyof typeof item
          let href = `${item.href}`

          if (href.indexOf('http') < 0) {
            href = `/${activeCity.slug}${item.href}`
          }

          return (
            <li className="px-3" key={item.id}>
              <Link href={href} prefetch={false}>
                <a className="no-underline">{item[keyTyped]}</a>
              </Link>
            </li>
          )
        })}
    </ul>
  )
}

export default memo(HeaderMenu)
