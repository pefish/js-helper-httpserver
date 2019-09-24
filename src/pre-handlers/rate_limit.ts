/** @module */

/**
 * 接口频率限制
 * @param req
 * @param res
 * @param next
 * @param params
 * @returns {Promise<void>}
 */
export default async (req, res, next, params) => {
  const apiConfig = req['apiConfig']
  const { interval, uniqueArr } = params
  let { redisClientStr } = params
  redisClientStr || (redisClientStr = 'redisHelper')
  let uniqueSign = req
  uniqueArr.forEach((unique_) => {
    if (!(unique_ instanceof Array)) {
      uniqueSign = uniqueSign[unique_]
    } else {
      for (const unique__ of unique_) {
        const temp = uniqueSign[unique__]
        if (temp) {
          uniqueSign = temp
          break
        }
      }
    }
  })
  if (uniqueSign instanceof Object) {
    throw new Error('uniqueSign illegal')
  }
  const key = `rateLimit-${apiConfig['path']}-${apiConfig['method']}:${uniqueSign}`
  const result = (await global[redisClientStr].string.get(key)).get()
  if (result) {
    throw new Error('rate limit')
  } else {
    await global[redisClientStr].string.setex(key, interval / 1000, '1')
  }
}
