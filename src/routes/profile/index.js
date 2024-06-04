const express = require('express')
const ProfileController = require('../../controllers/profile.controller')
const { grantAccess } = require('../../middlewares/rbac')

const router = express.Router()

router.get('/viewAny', grantAccess('readAny', 'profile'), ProfileController.profiles)

router.get('/viewOwn', grantAccess('readOwn', 'profile'), ProfileController.profile)

module.exports = router
