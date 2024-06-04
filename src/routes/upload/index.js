const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandle')
const uploadController = require('../../controllers/upload.controller')
const { uploadDiskS, uploadMemory } = require('../../configs/multer.config')

const router = express.Router()

// authentication

// router.use(authenticationV2)

// use cloudinary
router.post('/product', asyncHandler(uploadController.uploadFile))
router.post('/product/thumb', uploadDiskS.single('file'), asyncHandler(uploadController.uploadFileThumb))
router.post(
    '/product/multiple',
    uploadDiskS.array('files', 3),
    asyncHandler(uploadController.uploadImagesFromLocalFiles)
)

// use s3Client
router.post('/product/bucket', uploadMemory.single('file'), asyncHandler(uploadController.uploadImageFromLocalS3))

module.exports = router
