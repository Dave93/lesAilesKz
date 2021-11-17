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
    icon: '/setting.svg',
    activeIcon: '/activeSetting.svg',
    langCode: 'profile_account',
  },
  {
    href: '/profile/orders',
    icon: '/inActivebag.svg',
    activeIcon: '/bag.svg',
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
