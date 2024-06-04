const { BadRequestError } = require('../core/error.response')
const { product, clothing, electronic } = require('../models/product.model')
const { inserInventory } = require('../models/repositories/inventory.repo')
const {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
} = require('../models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')
const { pushNotiToSystem } = require('./notification.service')

class ProductFactory {
    static productRegistry = {}

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid product types ${type}`)
        return new productClass(payload).createProduct()
    }

    // update product

    static updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid product types ${type}`)
        return new productClass(payload).updateProduct(productId)
    }

    // query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDraftsForShop({ query, limit, skip })
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await findAllPublishForShop({ query, limit, skip })
    }
    // end query

    // put
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id })
    }
    // end put

    // search product by user

    static async searchProduct({ keySearch }) {
        return await searchProductByUser({ keySearch })
    }

    static async findAllProduct({
        limit = 50,
        sort = 'ctime',
        page = 1,
        filter = { isPublished: true },
        select = null,
    }) {
        console.log(typeof select)

        return await findAllProducts({
            limit,
            sort,
            page,
            filter,
            select: ['product_name', 'product_price', 'product_thumb'] || select,
        })
    }
    static async findProduct({ product_id }) {
        return await findProduct({ product_id, unSelect: ['__v', 'product_variations'] })
    }
}

// define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    async createProduct(product_id) {
        const newProduct = await product.create({ ...this, _id: product_id })

        if (newProduct) {
            await inserInventory({
                productId: product_id,
                shopId: this.product_shop,
                stock: this.product_quantity,
            })

            pushNotiToSystem({
                type: 'SHOP-001',
                receivedId: 1,
                senderId: this.product_shop,
                options: {
                    product_name: this.product_name,
                    shop_name: this.product_shop,
                },
            })
                .then((rs) => console.log(rs))
                .catch((err) => console.log(err))
        }

        return newProduct
    }

    // update product

    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({ productId, bodyUpdate, model: product })
    }
}

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        })
        if (!newClothing) throw new BadRequestError('Create new Clothing error')

        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) throw new BadRequestError('Create new Product error')

        return newProduct
    }

    async updateProduct(productId) {
        const objectParams = removeUndefinedObject(this)

        // update product_attributes
        if (objectParams.product_attributes) {
            const bodyUpdate = removeUndefinedObject(objectParams.product_attributes)
            await updateProductById({
                productId,
                bodyUpdate: bodyUpdate,
                model: clothing,
            })
        }

        const updateProduct = await super.updateProduct(productId, objectParams)

        return updateProduct
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        })
        if (!newElectronic) throw new BadRequestError('Create new Electronics error')

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('Create new Product error')

        return newProduct
    }
}

// register product type

ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Electronics', Electronics)

module.exports = ProductFactory
