/** @module */

import RequestUtil from '../utils/request'
import ErrorHelper from '@pefish/js-error'

/**
 * 验证api请求的参数个数
 * @param req
 * @returns {Promise<void>}
 */
export default async (req) => {
  const clientParams = RequestUtil.getAllParams(req)
  const apiConfig = req['apiConfig']
  apiConfig['params'] || (apiConfig['params'] = {})
  if (Object.keys(clientParams).length !== Object.keys(apiConfig['params']).length) {
    throw new ErrorHelper('params num error')
  }
}
