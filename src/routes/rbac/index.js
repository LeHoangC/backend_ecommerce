const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandle')
const rbacController = require('../../controllers/rbac.controller')

const router = express.Router()

router.post('/role', asyncHandler(rbacController.newRole))
router.get('/roles', asyncHandler(rbacController.listRoles))

router.post('/resource', asyncHandler(rbacController.newResource))
router.get('/resources', asyncHandler(rbacController.listResources))

module.exports = router
