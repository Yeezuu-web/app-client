import axios, { AxiosInstance } from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'
import * as cookie from 'cookie'
import * as setCookie from 'set-cookie-parser'

// Create axios instance.
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

// Create axios interceptor
createAuthRefreshInterceptor(axiosInstance, (failedRequest: any) =>

  // 1. First try request fails - refresh the token.
  axiosInstance.get('/api/refreshToken').then(resp => {
    // 1a. Clear old helper cookie used in 'authorize.ts' higher order function.
    if (axiosInstance.defaults.headers.common['setCookie']) {
      delete axiosInstance.defaults.headers.common['setCookie']
    }
    const { accessToken } = resp.data

    // 2. Set up new access token
    const bearer = `Bearer ${accessToken}`
    axiosInstance.defaults.headers.common['Authorization'] = bearer

    // 3. Set up new refresh token as cookie
    const responseCookie = setCookie.parse(resp.headers['set-cookie'] as string[])[0] // 3a. We can't just access it, we need to parse it first.
    axiosInstance.defaults.headers.common['setCookie'] = resp.headers['set-cookie'] as any // 3b. Set helper cookie for 'authorize.ts' Higher order Function.
    axiosInstance.defaults.headers.common['setCookie'] = cookie.serialize(
      responseCookie.name,
      responseCookie.value,
    )

    // 4. Set up access token of the failed request.
    failedRequest.response.config.headers.Authorization = bearer

    // 5. Retry the request with new setup!
    return Promise.resolve()
  }),
);

export default axiosInstance

