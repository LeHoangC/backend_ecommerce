const Redis = require('ioredis')
const { RedisErrorResponce } = require('../core/error.response')

let client = {},
    statusConnectRedis = {
        CONNECT: 'connect',
        END: 'end',
        RECONNECT: 'reconnecting',
        ERROR: 'error',
    },
    connectionTimeout

const REDIS_CONNECT_TIMEOUT = 10 * 1000,
    REDIS_CONNECT_MESSAGE = {
        code: -99,
        message: {
            vn: 'Redis lỗi rồi hotfix, hotfix!!!',
            en: 'Service redis connect error',
        },
    }

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new RedisErrorResponce(REDIS_CONNECT_MESSAGE.message.vn, REDIS_CONNECT_MESSAGE.code)
    }, REDIS_CONNECT_TIMEOUT)
}

const handleEventConnection = async ({ connectionRedis }) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`ConnectionIoRedis - Connection Status: Connected`)
        clearTimeout(connectionTimeout)
    })
    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`ConnectionIoRedis - Connection Status: End`)
        handleTimeoutError()
    })
    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`ConnectionIoRedis - Connection Status: reconnecting`)
        clearTimeout(connectionTimeout)
    })
    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`ConnectionIoRedis - Connection Status: Error:::${err}`)
        handleTimeoutError()
    })
}

const init = ({ IOREDIS_IS_ENABLED, IOREDIS_HOST = process.env.REDIS_CACHE_HOST, IOREDIS_PORT = 6379 }) => {
    if (IOREDIS_IS_ENABLED) {
        const instanceRedis = new Redis()

        client.instanceConnect = instanceRedis
        handleEventConnection({ connectionRedis: instanceRedis })
    }
}

const getIoRedis = () => client

const closeIoRedis = () => {
    client.instanceConnect.close()
}

module.exports = {
    init,
    getIoRedis,
    closeIoRedis,
}
