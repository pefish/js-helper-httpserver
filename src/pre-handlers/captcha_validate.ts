/** @module */

/**
 * 要求验证码通过
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
  let captchaKey = req
  keyArrKey.forEach((key) => {
    captchaKey = captchaKey[key]
  })
  if (captchaKey instanceof Object) {
    throw new Error('preHandler config error')
  }

  let code = req
  codeArrKey.forEach((key) => {
    code = code[key]
  })
  if (code instanceof Object) {
    throw new Error('preHandler config error')
  }
  if (global['debug'] === true && captchaKey === '123456' && code === '123456') {
    return true
  }
  const result = (await global[redisClientStr].string.get(captchaKey)).get()
  if (!result || result.toLowerCase() !== code.toLowerCase()) {
    throw new Error('vcode verify error')
  }
}
