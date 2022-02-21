export type profileMenuItem = {
  href: string
  icon: string
  langCode: string
  activeIcon: string
}

const menuItems: profileMenuItem[] = [
  // {
  //   href: '/news',
  //   activeIcon: '/activeBonuses.png',
  //   icon: '/bonuses.png',
  //   langCode: 'news',
  // },
  {
    href: '/sale',
    icon: '/order.png',
    activeIcon: '/activeOrder.png',
    langCode: 'sale',
  },
]

export default menuItems
