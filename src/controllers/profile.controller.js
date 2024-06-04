const { SuccessResponse } = require('../core/success.response')

const dataProfiles = [
    {
        user_id: 1,
        user_name: 'a',
        user_avt: 'image.a',
    },
    {
        user_id: 2,
        user_name: 'b',
        user_avt: 'image.b',
    },
    {
        user_id: 3,
        user_name: 'c',
        user_avt: 'image.c',
    },
]

class ProfileController {
    // admin
    profiles = async (req, res, next) => {
        new SuccessResponse({
            message: 'View all profile',
            metadata: dataProfiles,
        }).send(res)
    }

    // shop

    profile = async (req, res, next) => {
        new SuccessResponse({
            message: 'View one profile',
            metadata: {
                user_id: 3,
                user_name: 'c',
                user_avt: 'image.c',
            },
        }).send(res)
    }
}

module.exports = new ProfileController()
