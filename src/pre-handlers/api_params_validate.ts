/** @module */

import RequestUtil from '../utils/request'
import AssertUtil from '@pefish/js-util-assert'

/**
 * api参数验证
 * @param req
 * @returns {Promise<void>}
 */
export default async (req) => {
  const apiConfig = req['apiConfig']
  const clientParams = RequestUtil.getAllParams(req)
  if (!apiConfig) {
    throw new Error('api route not found')
  }
  if (apiConfig['params']) {
    const params = apiConfig['params']
    for (const [paramName, paramObj] of Object.entries(params)) {
      const realValue = clientParams[paramName]
      // 校验每个参数
      const noCheck = {
        noCheckInject: false
      }

      const policies = paramObj['policies']
      for (const policy of policies) {
        if (policy[0] === 'noCheckInject') {
          noCheck['noCheckInject'] = true
          break
        }
        // 用每个策略对参数校验
        if (policy[0] === 'default') {
          // 没传的话给予默认值，并不对其校验,有传的话忽略default策略继续下面的策略
          if (!realValue) {
            clientParams[paramName] = policy[1]
            break // 不对默认值校验
          }
        } else {
          // notEmpty以外的策略不检查没传的参数
          if (clientParams[paramName] !== undefined || policy[0] === 'notEmpty') {
            if (policy[1] !== undefined) {
              await AssertUtil[policy[0]](realValue, policy[1], paramName)
            } else {
              await AssertUtil[policy[0]](realValue, paramName)
            }
          }
        }
      }

      // 检查注入
      if (realValue !== undefined && noCheck['noCheckInject'] === false) {
        await AssertUtil['noInject'](realValue, paramName)
      }

      // 参数校验后预处理
      const preHandlers = paramObj['preHandlers']
      if (preHandlers) {
        for (const preHandler of preHandlers) {
          if (!AssertUtil.isType(preHandler, 'array', null, false)) {
            throw new Error(`参数的preHandlers配置有误  ${apiConfig['path']}`)
          }
          const method = preHandler[0]
          switch (method) {
            case 'parseInt':
              clientParams[paramName] && (clientParams[paramName] = parseInt(clientParams[paramName]))
              break
            case 'parseBool':
              clientParams[paramName] && (clientParams[paramName] = clientParams[paramName] !== 'false' && clientParams[paramName] !== '0' && clientParams[paramName] !== 0)
              break
            case 'toUpper':
              clientParams[paramName] && (clientParams[paramName] = clientParams[paramName].toString().toUpperCase())
              break
            case 'toLower':
              clientParams[paramName] && (clientParams[paramName] = clientParams[paramName].toString().toLowerCase())
              break
            case 'ifReplace':
              if (clientParams[paramName] === preHandler[1]) {
                clientParams[paramName] = preHandler[2]
              }
              break
            case 'remainDecimal':
              clientParams[paramName] && (clientParams[paramName] = clientParams[paramName].toString().remainDecimal(preHandler[1], preHandler[2]))
              break
          }
        }
      }
    }
  }
}

