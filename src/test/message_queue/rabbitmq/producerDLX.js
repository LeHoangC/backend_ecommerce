const amqp = require('amqplib')

const messages = 'hello rabbitMQ'

const runProducerDLX = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost')
        const channel = await connection.createChannel()

        const notificationExchange = 'notificationEx' // type: direct
        const notiQueue = 'notificationQueueProcess'
        const notificationExchangeDLX = 'notificationExDLX'
        const notificationRoutingKey = 'notificationRoutingKeyDLX'

        // 1. Create Exchange
        await channel.assertExchange(notificationExchange, 'direct', {
            durable: true,
        })

        // 2. Create Queue
        const queueResult = await channel.assertQueue(notiQueue, {
            exclusive: false,
            deadLetterExchange: notificationExchangeDLX,
            deadLetterRoutingKey: notificationRoutingKey,
        })

        // 3. bindQueue
        await channel.bindQueue(queueResult.queue, notificationExchange)

        // 4. Send Message
        const msg = 'a new product'
        console.log(`Producer msg::: ${msg}`)

        channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
            expiration: 10 * 1000,
        })

        setTimeout(() => {
            connection.close()
            process.exit()
        }, 500)
    } catch (error) {
        console.error(error)
    }
}

runProducerDLX()
    .then((rs) => console.log(rs))
    .catch((error) => console.error(error))
