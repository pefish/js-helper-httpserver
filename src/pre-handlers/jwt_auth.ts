/** @module */

import ErrorHelper from '@pefish/js-error'

export default async (req, res, next, params) => {
  const JwtUtil = require('@pefish/js-util-jwt')
  const { in: in_, name, secret } = params
  if (in_ === 'header') {
    const jwt = req.headers[name]
    if (!jwt) {
      throw new ErrorHelper(`jwt 不存在`)
    }
    const data = await JwtUtil.verifyJwt(jwt, secret)
    if (!data) {
      throw new ErrorHelper('jwt中没有payload')
    }
    req['jwtPayload'] = data
    global.logger.info('jwtPayload:', data)
  } else {
    throw new ErrorHelper(`jwtAuth in_ 暂且不支持 in_: ${in_}`)
  }
}
