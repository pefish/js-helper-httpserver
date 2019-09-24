/** @module */

/**
 * 白名单认证
 * @param req
 * @param res
 * @param next
 * @param params
 * @returns {Promise<void>}
 */
export default async (req, res, next, params) => {
  let target = req
  params['target'].forEach((unique_) => {
    if (!(unique_ instanceof Array)) {
      target = target[unique_]
    } else {
      for (const unique__ of unique_) {
        const temp = target[unique__]
        if (temp) {
          target = target[unique__]
          break
        }
      }
    }
  })
  const whiteList = params['allow']
  if (!whiteList.includes(target)) {
    throw new Error('permission error')
  }
}
