module.exports = {
  locales: ['ru', 'uz', 'en'],
  defaultLocale: 'ru',
  pages: {
    '*': ['common'],
  },
  loadLocaleFrom: async (lang, ns) => {
    const res = await fetch(`${process.env.API_URL}/api/get_langs?lang=${lang}`)
    const { result } = await res.json()
    // console.log(result)
    return result
  },
}
