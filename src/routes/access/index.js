const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const accessController = require('../../controllers/access.controller')
const asyncHandler = require('../../helpers/asyncHandle')

const router = express.Router()

router.post('/signup', asyncHandler(accessController.signUp))
router.post('/login', asyncHandler(accessController.login))

// authentication

router.use(authenticationV2)

router.post('/logout', asyncHandler(accessController.logout))
router.post('/handleRefreshToken', asyncHandler(accessController.handleRefreshToken))

module.exports = router
