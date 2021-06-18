import React, { FC, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { HeaderMenuItems } from '@commerce/types/headerMenu'

const HeaderMenu: FC<HeaderMenuItems> = ({ menuItems }) => {
  const { locale } = useRouter()
  return (
    <ul className="flex justify-between">
      {menuItems.length &&
        menuItems.map((item) => (
          <li className="px-4" key={item.id}>
            <Link href={item.href} prefetch={false}>
              <a className="no-underline text-secondary">
                {item.label[locale]}
              </a>
            </Link>
          </li>
        ))}
    </ul>
  )
}

export default memo(HeaderMenu)
