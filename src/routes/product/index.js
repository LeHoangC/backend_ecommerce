const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const productController = require('../../controllers/product.controller')
const asyncHandler = require('../../helpers/asyncHandle')

const router = express.Router()

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct))
router.get('/', asyncHandler(productController.findAllProduct))
router.get('/:product_id', asyncHandler(productController.findProduct))

// authentication

router.use(authenticationV2)

// put

router.post('/', asyncHandler(productController.createProduct))
router.post('/publish/:id', asyncHandler(productController.publishProductByShop))
router.post('/unpublish/:id', asyncHandler(productController.unPublishProductByShop))

// patch (update)

router.patch('/:productId', asyncHandler(productController.updateProduct))

// query

router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
router.get('/published/all', asyncHandler(productController.getAllPublishForShop))

module.exports = router
