const rbac = require('./role.middleware')
const { AuthFailureError } = require('../core/error.response')
const { roleList } = require('../services/rbac.service')

const grantAccess = (action, resource) => {
    return async (req, res, next) => {
        try {
            rbac.setGrants(await roleList({ userId: 99 }))

            const role_name = req.query.role
            const permission = rbac.can(role_name)[action](resource)

            if (!permission.granted) {
                throw new AuthFailureError('You dont have enough permission')
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    grantAccess,
}
