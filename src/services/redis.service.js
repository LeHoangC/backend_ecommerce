const { promisify } = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo')

const { getRedis } = require('../dbs/init.redis')

const { instanceConnect: redisClient } = getRedis()

const pexpire = promisify(redisClient.pExpire).bind(redisClient)
const setNxAsync = promisify(redisClient.setNX).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v1_${productId}`
    const retryTimes = 10
    const expireTime = 3000 //thoi gian tam khoa

    // console.log({ productId, quantity, cartId })

    for (let i = 0; i < retryTimes; i++) {
        //tao mot key, ai giu thi vao thanh toan
        // const result = await setNxAsync(key, expireTime)
        const result = await redisClient.setNX(key, 'keyLock')
        console.log({ result })
        if (result === true) {
            //thao tac voi inventory
            const isReservation = await reservationInventory({ productId, quantity, cartId })

            if (isReservation.modifiedCount) {
                await redisClient.pExpire(key, expireTime)
                return key
            }
            return null
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async (keyLock) => {
    // const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await redisClient.del(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock,
}
