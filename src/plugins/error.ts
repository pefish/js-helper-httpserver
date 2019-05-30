/** @module */

/**
 * 捕捉未处理的rejection
 */
const errorMethod = () => {
  process.on('unhandledRejection', (err) => {
    global.logger.error('unhandledRejection', err)
  })
}

export default errorMethod
