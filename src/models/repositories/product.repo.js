const { Types } = require('mongoose')
const { product } = require('../product.model')
const { getSelectData, unGetSelectData, convertToObjectIdMongodb } = require('../../utils')
const { BadRequestError } = require('../../core/error.response')

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate('product_shop', 'name email -_id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const { modifiedCount } = await product.updateOne(
        {
            product_shop: new Types.ObjectId(product_shop),
            _id: product_id,
        },
        {
            $set: {
                isDraft: false,
                isPublished: true,
            },
        }
    )

    return modifiedCount ? modifiedCount : null

    // const foundProduct = product.findOne({
    //     product_shop: new Types.ObjectId(product_shop),
    //     _id: product_id,
    // })

    // if (!foundProduct) return null

    // foundProduct.isDraft = false
    // foundProduct.isPublished = true

    // const { modifiedCount } = foundProduct.update(foundProduct)

    // return modifiedCount
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const { modifiedCount } = await product.updateOne(
        {
            product_shop: new Types.ObjectId(product_shop),
            _id: product_id,
        },
        {
            $set: {
                isDraft: true,
                isPublished: false,
            },
        }
    )

    return modifiedCount ? modifiedCount : null
}

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const result = await product
        .find(
            {
                isPublished: true,
                $text: { $search: regexSearch },
            },
            {
                score: { $meta: 'textScore' },
            }
        )
        .sort({ score: { $meta: 'textScore' } })
        .lean()

    return result
}

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    console.log({ limit, sort, page })

    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean()

    return products
}

const findProduct = async ({ product_id, unSelect }) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect))
}

const updateProductById = async ({ productId, bodyUpdate, model, isNew = true }) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, { new: isNew })
}

const getProductById = async (productId) => {
    return await product.findOne({ _id: convertToObjectIdMongodb(productId) }).lean()
}

const checkProductByServer = async (products) => {
    return await Promise.all(
        products.map(async (product) => {
            const foundProduct = await getProductById(product.productId)

            if (foundProduct) {
                if (foundProduct.product_price !== product.price) {
                    throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long quay lai gio hang!')
                }
                return {
                    price: foundProduct.product_price,
                    quantity: product.quantity,
                    productId: product.productId,
                }
            }
        })
    )
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer,
}
