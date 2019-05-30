/** @module */

/**
 * api请求的工具类
 */
export default class RequestUtil {
  static getAllParams (req: any): object {
    let clientParams
    if (req.method === 'GET') {
      clientParams = req.query
    } else {
      clientParams = req.body
    }
    req['params'] && Object.assign(clientParams, req['params'])
    return clientParams
  }

  static getApiUrl (req: any): string {
    const pos = req.url.indexOf('?')
    if (pos === -1) {
      return req.baseUrl + req.url
    }
    return req.baseUrl + req.url.substr(0, pos)
  }
}
