const { BadRequestError } = require('../core/error.response')
const inventoryModel = require('../models/inventory.model')
const { getProductById } = require('../models/repositories/product.repo')

class InventoryService {
    static async addStockToInventory({ stock, productId, shopId, location = 'ha noi' }) {
        const product = await getProductById(productId)

        console.log({ product })

        if (!product) throw new BadRequestError('Product does not exists!')

        const query = {
                inven_shopId: shopId,
                inven_productId: productId,
            },
            updateSet = {
                $inc: {
                    inven_stock: stock,
                },
                $set: {
                    inven_location: location,
                },
            },
            options = { upsert: true, new: true }

        return await inventoryModel.findOneAndUpdate(query, updateSet, options)
    }
}

module.exports = InventoryService
