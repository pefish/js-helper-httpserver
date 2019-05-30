/** @module */

/**
 * 解决跨域问题
 * @param app
 * @param origins
 * @returns {boolean}
 */
const corsMethod = (app, origins: Array<string> | string = '*') => {
  app.all('*', (req, res, next) => {
    if (origins === '*') {
      res.header('Access-Control-Allow-Origin', '*')
    } else if (typeof origins === 'string') {
      origins = JSON.parse(origins)
    } else if (origins.includes(req.headers.origin)) {
      res.header('Access-Control-Allow-Origin', req.headers.origin)
    }
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Headers', 'Accept,Content-Type,Authorization,json-web-token,Cookies,Origin,X-Requested-With,If-Modified-Since')
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('X-Powered-By', '3.2.1')
    res.header('Content-Type', 'application/json;charset=utf-8')
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
    } else {
      next()
    }
  })
  return true
}

export default corsMethod
