const { SuccessResponse } = require('../core/success.response')
const CartService = require('../services/cart.service')

class CartController {
    static async addToCart(req, res, next) {
        new SuccessResponse({
            message: 'Add to cart success',
            metadata: await CartService.addToCart(req.body),
        }).send(res)
    }

    static async update(req, res, next) {
        console.log(req.body)

        new SuccessResponse({
            message: 'update Cart success',
            metadata: await CartService.addToCartV2(req.body),
        }).send(res)
    }
    static async deleteUserCartItem(req, res, next) {
        new SuccessResponse({
            message: 'deleted Cart success',
            metadata: await CartService.deleteUserCartItem(req.body),
        }).send(res)
    }
    static async listToCart(req, res, next) {
        new SuccessResponse({
            message: 'Get list cart success',
            metadata: await CartService.getListUserCart(req.query),
        }).send(res)
    }
}

module.exports = CartController
