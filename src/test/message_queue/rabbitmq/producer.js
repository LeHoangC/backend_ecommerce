const amqp = require('amqplib')

const messages = 'hello rabbitMQ'

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost')
        const channel = await connection.createChannel()

        const queueName = 'test-topic'
        await channel.assertQueue(queueName, {
            durable: true,
        })

        channel.sendToQueue(queueName, Buffer.from(messages), {
            persistent: true,
            expiration: 10000,
        })

        console.log(`message send: `, messages)

        setTimeout(() => {
            connection.close()
            process.exit()
        }, 2000)
    } catch (error) {
        console.error(error)
    }
}

runProducer().catch(console.error)
