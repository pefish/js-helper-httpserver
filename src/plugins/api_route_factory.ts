import ResponseUtil from '../utils/response'
import FileUtil from '@pefish/js-util-file'
import path from 'path'
import { Api, Controller } from '../http_server'

/**
 * api工厂类
 * @private
 */
class ApiRouteFactory {

  apis: {
    [routeName: string]: {
      handlerInstance: Controller,
      apiConfig: Api,
    }
  }
  apiConfigs: {
    [name: string]: Api[],
  }

  constructor () {
    this.apis = {}
    this.apiConfigs = {}
  }

  /**
   * 构建所有路由
   * @param app
   * @param routePath
   * @param apiPath
   * @returns {Promise<boolean>}
   */
  async buildRoute (app, routePath, apiPath) {
    const filesAndDirs = FileUtil.getFilesAndDirs(routePath)
    for (const file of filesAndDirs.files) {
      if (!file.endsWith(`.js`) && !file.endsWith(`.ts`)) {
        continue
      }
      const name = path.basename(file, '.js')
      const apisOfName = require(`${routePath}/${file}`).default
      const class_ = new (require(`${apiPath}/${name}`).default)()
      apisOfName.forEach((api: Api) => {
        if (!api.preHandlers) {
          api.preHandlers = {}
        }
        if (!api.preHandlers["api_params_validate"]) {
          api.preHandlers["api_params_validate"] = {}
        }
        app[api.method](api.path,
          loadApiConfig,
          loadParams,
          (req, res, next) => { printParams(req, res, next, 'before') },
          ...this._buildGlobalHandlers(name, api.apiHandler),
          ...this.buildBaseHandle(api.preHandlers),
          loadParams,
          (req, res, next) => { printParams(req, res, next, 'later') },
          rootHandler
        )
        // 预加载
        this.apis[api.method.toUpperCase() + '-' + api.path] = {
          handlerInstance: class_,
          apiConfig: api
        }
      })
      this.apiConfigs[name] = apisOfName
    }
    app.all(`/healthz`, loadParams, printParams, (req, res) => {
      global.logger.debug(`I am healthy`)
      res.status(200)
      res.send('ok')
    })
    app.all(`/*`, loadParams, printParams, (req, res) => {
      global.logger.info(`api not found`)
      res.status(404)
      res.send('not found')
    })
    return true
  }

  _excludeIsMatch (exclude, moduleName, methodName) {
    for (const [module, method] of exclude) {
      if (module === '*') {
        return true
      }
      if (module === moduleName && (method === '*' || method === methodName)) {
        return true
      }
    }
    return false
  }

  _buildGlobalHandlers (moduleName, methodName) {
    const result = []
    global['globalHandlers'] && global['globalHandlers'].forEach(({handler, exclude}) => {
      this._excludeIsMatch(exclude, moduleName, methodName) || result.push(async (req, res, next) => {
        try {
          await handler(req, res, next)
          next()
        } catch (err) {
          ResponseUtil.failed(res, err)
        }
      })
    })
    return result
  }

  buildBaseHandle (preHandlers) {
    const allPreHandlers = []
    for (const [handlerName, params] of Object.entries(preHandlers)) {
      if (typeof params === 'string') {
        // 没有参数的hander
        allPreHandlers.push(async (req, res, next) => {
          try {
            if (handlerName.indexOf('/') !== -1) {
              // 路径
              await require(path.resolve(handlerName)).default(req, res, next)
            } else {
              await require(`../pre-handlers/${handlerName}`).default(req, res, next)
            }
            next()
          } catch (err) {
            ResponseUtil.failed(res, err)
          }
        })
      } else {
        allPreHandlers.push(async (req, res, next) => {
          try {
            if (handlerName.indexOf('/') !== -1) {
              // 路径
              await require(path.resolve(handlerName)).default(req, res, next, params)
            } else {
              await require(`../pre-handlers/${handlerName}`).default(req, res, next, params)
            }
            next()
          } catch (err) {
            ResponseUtil.failed(res, err)
          }
        })
      }
    }
    return allPreHandlers
  }
}

/**
 * ApiRouteFactory的实例
 * @type {ApiRouteFactory}
 */
const apiRouteFactory = new ApiRouteFactory()


function loadApiConfig (req, res, next) {
  try {
    req.apiConfig = apiRouteFactory.apis[req.method.toUpperCase() + '-' + req.route.path].apiConfig
    next()
  } catch (err) {
    ResponseUtil.failed(res, err)
  }
}

function loadParams (req, res, next) {
  try {
    const params = {}
    if (req.method === 'GET') {
      Object.assign(params, req.params, req.query)
    } else {
      Object.assign(params, req.params, req.body)
    }
    req.params = params
    next()
  } catch (err) {
    ResponseUtil.failed(res, err)
  }
}

function printParams (req, res, next, when_ = null) {
  try {
    const params = Object.assign({}, req.params)
    const passLists = ['password', 'login_pass', 'trade_pass', 'pwd']
    passLists.forEach((passText) => {
      params[passText] && (params[passText] = '*******')
    })
    const fileLists = ['images', 'image', 'files', 'file']
    fileLists.forEach((fileText) => {
      params[fileText] && (params[fileText] = '......')
    })
    global.logger.info(`pid: ${process.pid} --> ${req.originalUrl} --> ${when_ || ``} ${JSON.stringify(params)}`)
    next()
  } catch (err) {
    ResponseUtil.failed(res, err)
  }
}

async function rootHandler (req, res, next) {
  try {
    const handlerInstance = apiRouteFactory.apis[req.method.toUpperCase() + '-' + req.route.path].handlerInstance
    const data = await handlerInstance[req.apiConfig.apiHandler](req, res, next)
    if (data) {
      ResponseUtil.success(res, data)
    }
  } catch (err) {
    ResponseUtil.failed(res, err)
  }
}


export default apiRouteFactory
