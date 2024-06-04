const { BadRequestError } = require('../core/error.response')
const { getDiscountAmount } = require('../services/discount.service')
const { findCartById } = require('../models/repositories/cart.repo')
const { checkProductByServer } = require('../models/repositories/product.repo')
const { acquireLock, releaseLock } = require('./redis.service')
const orderModel = require('../models/order.model')

class CheckoutService {
    /*

    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discounts: [
                    {
                        shopId,
                        discountId,
                        discount_code
                    }
                ],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            },
            {
                shopId,
                shop_discounts: [],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            }
        ]
    }

*/
    static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new BadRequestError('Cart does not exists')

        const checkout_order = {
                totalPrice: 0, //tong tien hang
                feeShip: 0, //phi ship
                totalDiscount: 0, //tong tien giam gia
                totalCheckout: 0, //tong tien phai tra
            },
            shop_order_ids_new = []

        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts, item_products } = shop_order_ids[i]
            console.log(`item_products:::`, item_products)

            const checkProductServer = await checkProductByServer(item_products)

            console.log(`checkProductServer:::`, checkProductServer)

            if (!checkProductServer[0]) throw new BadRequestError('order wrong!')

            // tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.quantity * product.price
            }, 0)

            // tong tien truoc khi xu ly

            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, //tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            }

            if (shop_discounts.length > 0) {
                // gia su chi mot discount
                // tinh so tien duoc giam gia
                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer,
                })

                checkout_order.totalDiscount += discount

                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount

            shop_order_ids_new.push(itemCheckout)
        }
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        }
    }

    static async orderByUser({ shop_order_ids, cartId, userId, user_address = {}, user_payment = {} }) {
        const { shop_order_ids_new, checkout_order } = await this.checkoutReview({ cartId, userId, shop_order_ids })

        // kiem tra xem co vuot ton kho hay khong
        const products = shop_order_ids_new.flatMap((order) => order.item_products)

        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const { quantity, productId } = products[i]
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            console.log({ keyLock })

            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        // console.log({ acquireProduct })

        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long quay lai gio hang')
        }

        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_product: shop_order_ids_new,
        })

        if (newOrder) {
            // xoa san pham trong don hang nay trong gio hang
        }

        return newOrder
    }

    // get all order [user]
    static async getOrderByUser() {}

    // get one order [user]
    static async getOneOrderByUser() {}

    // cancel order [user]
    static async cancelOrderByUser() {}

    // update order status shop [Shop | Admin]
    static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService
