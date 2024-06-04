const crypto = require('crypto')

const cloudinary = require('../configs/cloudinary.config')
const { PutObjectCommand, s3, GetObjectCommand, DeleteBucketCommand } = require('../configs/s3.config')

// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer')

const urlImagePublic = 'https://de5z2se96sxdb.cloudfront.net'

// ----------------------- start upload file use cloudinary --------------------------

// 1. upload image from url
const uploadImageFromUrl = async () => {
    const urlImage = 'https://down-vn.img.susercontent.com/file/daaec5abde7512b312d74d84339980e0'
    const folderName = 'product/shopId',
        newFileName = 'testdemo'
    try {
        const result = await cloudinary.uploader.upload(urlImage, {
            folder: folderName,
        })
        return result
    } catch (error) {
        console.log(error)
    }
}

// 2. upload image from local

const uploadImageFromLocal = async ({ path, folderName = 'product/2002' }) => {
    try {
        const result = await cloudinary.uploader.upload(path, {
            public_id: 'thumb',
            folder: folderName,
        })
        console.log(result)

        return {
            image_url: result.secure_url,
            shopId: 2002,
        }
    } catch (error) {
        console.log(error)
    }
}

// 3. upload multiple image from local

const uploadImagesFromLocal = async ({ files, folderName = 'product/2002' }) => {
    try {
        if (!files) return

        const uploadedUrls = []

        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: folderName,
            })

            uploadedUrls.push({
                image_url: result.secure_url,
                shopId: 2002,
            })
        }
    } catch (error) {}
}

// --------------------- end upload file use cloudinary -----------------------

// --------------------start upload file use s3Client (AWS) -----------------------

// 1. upload image from local

const uploadImageFromLocalS3 = async ({ file }) => {
    const randomImageName = () => crypto.randomBytes(16).toString('hex')
    const imageName = randomImageName()

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageName, //file.originalname || 'unknow',
            Body: file.buffer,
            ContentType: 'image/jpeg',
        })

        const result = await s3.send(command)

        // --------get url use s3

        // const signedUrl = new GetObjectCommand({
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: imageName,
        // })

        // const url = await getSignedUrl(s3, signedUrl, { expiresIn: 3600 })

        // --------get url use cloudfront

        const url = getSignedUrl({
            url: `${urlImagePublic}/${imageName}`,
            keyPairId: process.env.AWS_BUCKET_KEY_PAIR_ID,
            dateLessThan: new Date(Date.now() + 1000 * 60),
            privateKey: process.env.AWS_BUCKET_PRIVATE_KEY_ID,
        })

        console.log({ url })

        return {
            url,
            result,
        }
    } catch (error) {
        console.log(`error uploading file use s3Client`)
    }
}

// ---------------------- end upload file use s3Client (AWS) -------------------

module.exports = {
    uploadImageFromUrl,
    uploadImageFromLocal,
    uploadImagesFromLocal,
    uploadImageFromLocalS3,
}
