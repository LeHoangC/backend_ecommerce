const { SuccessResponse } = require('../core/success.response')
const InventoryService = require('../services/inventory.service')

class InventoryController {
    addStockToInventory = async (req, res, next) => {
        new SuccessResponse({
            message: 'addStockToInventory success',
            metadata: await InventoryService.addStockToInventory({ shopId: req.user.userId, ...req.body }),
        }).send(res)
    }
}

module.exports = new InventoryController()
