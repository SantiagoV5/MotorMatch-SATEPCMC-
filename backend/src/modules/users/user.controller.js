const userService = require('./user.service')

async function getMyProfile(req, res, next) {
	try {
		const profile = await userService.getMyProfile(req.user.id)
		res.json({ success: true, data: profile })
	} catch (err) {
		next(err)
	}
}

async function updateMyProfile(req, res, next) {
	try {
		const profile = await userService.updateMyProfile(req.user.id, req.body)
		res.json({ success: true, message: 'Perfil actualizado correctamente.', data: profile })
	} catch (err) {
		next(err)
	}
}

module.exports = { getMyProfile, updateMyProfile }
