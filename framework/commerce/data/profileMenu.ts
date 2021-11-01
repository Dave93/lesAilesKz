export type profileMenuItem = {
  href: string
  icon: string
  langCode: string
  activeIcon: string
}

const menuItems: profileMenuItem[] = [
  // {
  //   href: '/profile',
  //   activeIcon: '/activeBonuses.png',
  //   icon: '/bonuses.png',
  //   langCode: 'profile_bonuses',
  // },

  {
    href: '/profile/account',
    icon: '/Setting.png',
    activeIcon: '/activePersonal.png',
    langCode: 'profile_account',
  },
  {
    href: '/profile/orders',
    icon: '/Bag.png',
    activeIcon: '/activeOrder.png',
    langCode: 'profile_orders',
  },
  // {
  //   href: '/profile/address',
  //   icon: '/address.png',
  //   activeIcon: '/activeAddress.png',
  //   langCode: 'profile_address',
  // },
]

export default menuItems
