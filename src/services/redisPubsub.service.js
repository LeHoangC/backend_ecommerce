const Redis = require('redis')

class RedisPubsubService {
    constructor() {
        this.subscriber = Redis.createClient()
        this.publisher = Redis.createClient()
    }

    publish(channel, message) {
        this.publisher.connect()
        return new Promise((resolve, reject) => {
            this.publisher.publish(channel, message, (err, reply) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(reply)
                }
            })
        })
    }

    subscribe(channel, callback) {
        this.subscriber.connect()
        this.subscriber.subscribe(channel, callback)
    }
}

module.exports = new RedisPubsubService()
