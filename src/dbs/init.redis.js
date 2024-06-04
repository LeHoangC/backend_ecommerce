const redis = require('redis')
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
        console.log(`ConnectionRedis - Connection Status: Connected`)
        clearTimeout(connectionTimeout)
    })
    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`ConnectionRedis - Connection Status: End`)
        handleTimeoutError()
    })
    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`ConnectionRedis - Connection Status: reconnecting`)
        clearTimeout(connectionTimeout)
    })
    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`ConnectionRedis - Connection Status: Error:::${err}`)
        handleTimeoutError()
    })
}

const initRedis = () => {
    const instanceRedis = redis.createClient()

    ;(async () => {
        await instanceRedis.connect()
    })()

    client.instanceConnect = instanceRedis
    handleEventConnection({ connectionRedis: instanceRedis })
}

const getRedis = () => client

const closeRedis = () => {
    client.instanceConnect.close()
}

module.exports = {
    initRedis,
    getRedis,
    closeRedis,
}
