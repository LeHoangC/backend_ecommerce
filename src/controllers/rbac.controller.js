const { SuccessResponse } = require('../core/success.response')
const { createRole, createResource, resourceList, roleList } = require('../services/rbac.service')

class RbacController {
    newRole = async (req, res, next) => {
        new SuccessResponse({
            message: 'Creared role',
            metadata: await createRole(req.body),
        }).send(res)
    }

    newResource = async (req, res, next) => {
        new SuccessResponse({
            message: 'Creared resource',
            metadata: await createResource(req.body),
        }).send(res)
    }

    listResources = async (req, res, next) => {
        new SuccessResponse({
            message: 'List resources',
            metadata: await resourceList(req.query),
        }).send(res)
    }

    listRoles = async (req, res, next) => {
        new SuccessResponse({
            message: 'List roles',
            metadata: await roleList(req.query),
        }).send(res)
    }
}

module.exports = new RbacController()
