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
    href: '/profile/address',
    icon: '/inactiveLocation.svg',
    activeIcon: '/assets/location.svg',
    langCode: 'profile_address',
  },
  {
    href: '/profile/creditcard',
    icon: '/creditcard.svg',
    activeIcon: '/activeCreditcard.svg',
    langCode: 'profile_mycreditcard',
  },
  {
    href: '/profile/orders',
    icon: '/inActivebag.svg',
    activeIcon: '/bag.svg',
    langCode: 'profile_orders',
  },
]

export default menuItems
