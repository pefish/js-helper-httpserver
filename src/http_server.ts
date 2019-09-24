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
import { Server } from 'http';
import { AddressInfo } from 'net';


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

  private host: string
  private port: number
  private app: any
  private server: Server

  constructor (host: string = 'localhost', port: number = 80, middlewares: Array<any> = [], app: any = express()) {
    this.host = host
    this.port = port
    this.applyPlugins()
    this.app = app
    this.useMiddlewares(middlewares)
  }

  close (): any {
    return this.server && this.server.close()
  }

  private applyPlugins (): void {
    error()
  }

  private useMiddlewares (middlewares: Array<any>): void {
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
    this.server = http.createServer(this.app)
    origins && cors(this.app, origins)
    this.app.use((err, req, res, next) => {
      if (err) {
        ResponseUtil.failed(res, err)
      } else {
        next()
      }
    })
    if (routePath && apiPath) {
      // 后面的错误需要自己捕捉
      await apiRouteFactory.buildRoute(this.app, routePath, apiPath)
    }
    this.server.listen(this.port, this.host, () => {
      global.logger.info(`应用实例 http://${(this.server.address() as AddressInfo).address}:${(this.server.address() as AddressInfo).port}`)
    })
    return this.app
  }
}

export default HttpServerHelper
