const amqp = require('amqplib')

async function consumerOrderedMessage() {
    const connection = await amqp.connect('amqp://guest:12345@localhost')
    const channel = await connection.createChannel()

    const queueName = 'ordered_queue_message'
    await channel.assertQueue(queueName, {
        durable: true,
    })

    channel.prefetch(1)

    channel.consume(queueName, (msg) => {
        const message = msg.content.toString()

        setTimeout(() => {
            console.log(`Processed::`, message)
            channel.ack(msg)
        }, Math.random() * 10)
    })

    setTimeout(() => {
        connection.close()
    }, 1000)
}

consumerOrderedMessage().then((error) => console.error(error))
