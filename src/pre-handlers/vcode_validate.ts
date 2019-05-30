/** @module */
import ErrorHelper from '@pefish/js-error'

/**
 * 要求短信验证码通过
 * @param req
 * @param res
 * @param next
 * @param params {object} key: keyArrKey, code: codeArrKey, redisClientStr
 * @returns {Promise<void>}
 */
export default async (req, res, next, params) => {
  const { key: keyArrKey, code: codeArrKey } = params
  let { redisClientStr } = params
  redisClientStr || (redisClientStr = 'redisHelper')
  let vcodeKey = req
  keyArrKey.forEach((key) => {
    vcodeKey = vcodeKey[key]
  })
  if (vcodeKey instanceof Object) {
    throw new ErrorHelper('preHandler config error')
  }

  let code = req
  codeArrKey.forEach((key) => {
    code = code[key]
  })
  if (code instanceof Object) {
    throw new ErrorHelper('preHandler config error')
  }
  if (global['debug'] === true && vcodeKey === '123456' && code === '123456') {
    return true
  }
  const result = (await global[redisClientStr].string.get(vcodeKey)).get()
  if (!result || result.toLowerCase() !== code.toLowerCase()) {
    throw new ErrorHelper('vcode verify error')
  }
}
