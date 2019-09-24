/** @module */

/**
 * jwt登录验证
 * @param req
 * @param res
 * @param next
 * @param params
 * @returns {Promise<void>}
 */
export default async (req, res, next, params) => {
  const JwtUtil = require('@pefish/js-util-jwt')
  const jwtKeyName = params['jwtKeyName'] || 'json-web-token'
  const jwtSecret = params['jwtSecret']
  const cookies = req.cookies
  const headers = req.headers
  let jwtToken = null
  if (headers[jwtKeyName]) {
    jwtToken = headers[jwtKeyName]
  } else if (cookies[jwtKeyName]) {
    jwtToken = cookies[jwtKeyName]
  }
  if (jwtToken) {
    const data = await JwtUtil.verifyJwt(jwtToken, jwtSecret)
    if (!data) {
      throw new Error('jwt payload not exist')
    }
    if (!data.aud) {
      throw new Error('jwt aud')
    }
    req['jwtPayload'] = data
    global.logger.info('userId:', req['jwtPayload']['aud'])
  } else {
    throw new Error('jwt not exist')
  }
}
