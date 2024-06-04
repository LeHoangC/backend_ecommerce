const { cart } = require('../models/cart.model')
const { getProductById } = require('../models/repositories/product.repo')

class CartService {
    static async createUserCard({ userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active' },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product,
                },
            },
            options = { new: true, upsert: true }

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product

        console.log({ productId, quantity })

        const query = {
                cart_userId: userId,
                'cart_products.productId': productId,
                cart_state: 'active',
            },
            updateSet = {
                $inc: {
                    'cart_products.$.quantity': quantity,
                },
            },
            options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateSet, options)
    }

    static async addToCart({ userId, product = {} }) {
        // kiem tra gio hang co ton tai hay khong
        const userCart = await cart.findOne({ cart_userId: userId })
        if (!userCart) {
            // tao gio hang cho user neu chua co
            return await this.createUserCard({ userId, product })
        }

        // neu co gio hang roi:

        // neu gio hang chua co san pham (lenght === 0) thi:
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product]
            return userCart.save()
        }

        // neu gio hang ma length !== 0
        if (userCart.cart_products.length) {
            // neu gio hang da co san pham nay thi quantity++:
            if (userCart.cart_products.find((prd) => prd.productId === product.productId)) {
                return await this.updateUserCartQuantity({ userId, product })
            }
            // neu ma gio hang chua co san pham nay thi:
            userCart.cart_products = [...userCart.cart_products, product]
            return await userCart.save()
        }
    }

    static async addToCartV2({ userId, shop_order_ids }) {
        /*
            shop_order_ids = [
                {
                    shopId,
                    item_products: [
                        {
                            quantity,
                            price,
                            shopId,
                            old_quantity,
                            productId
                        }
                    ]
                }
            ]
        */
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]

        const foundProduct = await getProductById(productId)

        // console.log({ foundProduct })

        if (!foundProduct) throw new NotFoundError('')

        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError('Product do not belong to the shop')
        }

        if (quantity === 0) {
            // delete product
        }

        return await this.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        })
    }

    static async deleteUserCartItem({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: 'active' },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId,
                    },
                },
            }

        const deleteCart = await cart.updateOne(query, updateSet)

        return deleteCart
    }

    static async getListUserCart({ userId }) {
        return await cart
            .findOne({
                cart_userId: +userId,
            })
            .lean()
    }
}

module.exports = CartService
