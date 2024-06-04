const amqp = require('amqplib')

async function producerOrderedMessage() {
    const connection = await amqp.connect('amqp://guest:12345@localhost')
    const channel = await connection.createChannel()

    const queueName = 'ordered_queue_message'
    await channel.assertQueue(queueName, {
        durable: true,
    })

    for (let i = 0; i < 10; i++) {
        const message = `ordered_queue_message::: ${i}`
        console.log(`Message::${message}`)
        channel.sendToQueue(queueName, Buffer.from(message), {
            persistent: true,
        })
    }
    setTimeout(() => {
        connection.close()
    }, 1000)
}

producerOrderedMessage().then((error) => console.error(error))
