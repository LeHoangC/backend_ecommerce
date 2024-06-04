const { findById } = require('../services/apikey.service')

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
}

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString()
        if (!key) {
            return res.status(403).json({
                msg: 'Forbidden Error',
            })
        }

        const objKey = await findById(key)

        if (!objKey) {
            return res.status(403).json({
                msg: 'Forbidden Error',
            })
        }
        req.objKey = objKey

        return next()
    } catch (error) {}
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                msg: 'Permission dinied',
            })
        }

        const validPermission = req.objKey.permissions.includes(permission)
        if (!validPermission) {
            return res.status(403).json({
                msg: 'Permission dinied',
            })
        }

        return next()
    }
}

module.exports = {
    apiKey,
    permission,
}
