const modelResource = require('../models/resource.model')
const modelRole = require('../models/role.model')

/**
 * new resource
 * @param {String} name
 * @param {String} slug
 * @param {String} description
 */

const createResource = async ({ name, slug, description }) => {
    try {
        //1. check name exists

        // 2. new resource

        const resource = await modelResource.create({
            src_name: name,
            src_slug: slug,
            src_description: description,
        })

        return resource
    } catch (error) {
        return error
    }
}

const resourceList = async ({ userId = 0, limit = 30, offset = 0, search = '' }) => {
    try {
        const resources = await modelResource.aggregate([
            {
                $project: {
                    _id: 0,
                    name: '$src_name',
                    slug: '$src_slug',
                    description: '$src_description',
                    resourceId: '$_id',
                    createdAt: 1,
                },
            },
        ])

        return resources
    } catch (error) {
        return []
    }
}

const createRole = async ({ name = 'shop', slug = 's001', description = '', grants = [] }) => {
    try {
        const role = await modelRole.create({
            role_name: name,
            role_slug: slug,
            role_description: description,
            role_grants: grants,
        })

        return role
    } catch (error) {
        return error
    }
}

const roleList = async ({ userId = 0, limit = 30, offset = 0, search = '' }) => {
    try {
        const roles = await modelRole.aggregate([
            {
                $unwind: '$role_grants',
            },
            {
                $lookup: {
                    from: 'resources',
                    localField: 'role_grants.resource',
                    foreignField: '_id',
                    as: 'resource',
                },
            },
            {
                $unwind: '$resource',
            },
            {
                $project: {
                    role: '$role_name',
                    resource: '$resource.src_name',
                    action: '$role_grants.actions',
                    attributes: '$role_grants.attributes',
                },
            },
            {
                $unwind: '$action',
            },
            {
                $project: {
                    _id: 0,
                    role: 1,
                    resource: 1,
                    action: 1,
                    attributes: 1,
                },
            },
        ])

        return roles
    } catch (error) {
        return error
    }
}

module.exports = {
    createResource,
    roleList,
    createRole,
    resourceList,
}
