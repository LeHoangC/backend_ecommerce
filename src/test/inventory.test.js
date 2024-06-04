const redisPubsubService = require('../services/redisPubsub.service')

class InventoryService {
    constructor() {
        redisPubsubService.subscribe('purchase_events', (message) => {
            console.log('Received message', message)
            InventoryService.updateInventory(JSON.parse(message))
        })
    }

    static updateInventory({ productId, quantity }) {
        console.log(`Update inventory ${productId}, quantity ${quantity}`)
    }
}

module.exports = new InventoryService()
