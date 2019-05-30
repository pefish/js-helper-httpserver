import '@pefish/js-node-assist'
import http from 'http'
import express from 'express'
import error from './plugins/error'
import helmet from 'helmet'
import cors from './plugins/cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import apiRouteFactory from './plugins/api_route_factory'
import ResponseUtil from './utils/response'
import ErrorHelper from '@pefish/js-error'


declare global {
  namespace NodeJS {
    interface Global {
      logger: any,
    }
  }
}

/**
 * web服务器帮助类
 */
class HttpServerHelper {

  _host: string
  _port: number
  app: any
  _server: any

  constructor (host: string = 'localhost', port: number = 80, middlewares: Array<any> = [], app: any = express()) {
    this._host = host
    this._port = port
    this._applyPlugins()
    this.app = app
    this._useMiddlewares(middlewares)
  }

  close (): any {
    return this._server && this._server.close()
  }

  _applyPlugins (): void {
    error()
  }

  _useMiddlewares (middlewares: Array<any>): void {
    this.app.use(helmet())
    this.app.use(cookieParser())
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({extended: false}))
    middlewares.forEach((middleware) => {
      if (middleware instanceof Array) {
        this.app.use(...middleware)
      } else {
        this.app.use(middleware)
      }
    })

  }

  /**
   * 开始监听
   * @param routePath {string} 路由存放目录, 相对项目根目录
   * @param apiPath {string} api方法存放目录, 相对项目根目录
   * @param origins {array} 允许哪些origin
   * @returns {Promise<void>}
   */
  async listen (routePath: string = null, apiPath: string = null, origins: string | Array<string> = null): Promise<any> {
    this._server = http.createServer(this.app)
    origins && cors(this.app, origins)
    this.app.use((err, req, res, next) => {
      if (err) {
        ResponseUtil.failed(res, new ErrorHelper(err.message))
      } else {
        next()
      }
    })
    if (routePath && apiPath) {
      // 后面的错误需要自己捕捉
      await apiRouteFactory.buildRoute(this.app, routePath, apiPath)
    }
    this._server.listen(this._port, this._host, () => {
      global.logger.info(`应用实例 http://${this._server.address().address}:${this._server.address().port}`)
    })
    return this.app
  }
}

export default HttpServerHelper
