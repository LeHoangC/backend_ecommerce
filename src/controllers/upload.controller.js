const { BadRequestError } = require('../core/error.response')
const { SuccessResponse } = require('../core/success.response')
const {
    uploadImageFromUrl,
    uploadImageFromLocal,
    uploadImageFromLocalS3,
    uploadImagesFromLocal,
} = require('../services/upload.service')

class UploadController {
    uploadFile = async (req, res, next) => {
        new SuccessResponse({
            message: 'upload',
            metadata: await uploadImageFromUrl(),
        }).send(res)
    }

    uploadFileThumb = async (req, res, next) => {
        // console.log(req)

        const { file } = req

        console.log(file.path)

        if (!file) throw new BadRequestError('File missing')

        new SuccessResponse({
            message: 'upload',
            metadata: await uploadImageFromLocal({ path: file.path }),
        }).send(res)
    }

    uploadImagesFromLocalFiles = async (req, res, next) => {
        const { files } = req
        if (!files.length) throw new BadRequestError('File missing')

        new SuccessResponse({
            message: 'upload',
            metadata: await uploadImagesFromLocal({ files }),
        }).send(res)
    }

    // use s3

    uploadImageFromLocalS3 = async (req, res, next) => {
        // console.log(req)

        const { file } = req

        console.log(file.path)

        if (!file) throw new BadRequestError('File missing')

        new SuccessResponse({
            message: 'upload file use s3 aws',
            metadata: await uploadImageFromLocalS3({ file }),
        }).send(res)
    }
}

module.exports = new UploadController()
