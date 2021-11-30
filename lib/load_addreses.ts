import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const getAddressList = async () => {
  // get opt_token from cookies

  let otpToken: any = Cookies.get('opt_token')
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

  let orderData = []
  try {
    const { data } = await axios.get(`${webAddress}/api/address/my_addresses`, {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    })

    if (!data.success) {
      return null
    } else {
      return data.data
    }
    // orderData = data.data
  } catch (e) {}
}
export default getAddressList
