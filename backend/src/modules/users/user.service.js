const prisma = require('../../config/database')

function normalizeProfile(user) {
	return {
		id: user.id,
		name: user.fullName,
		fullName: user.fullName,
		email: user.email,
		phone: user.phone || '',
		city: user.city || '',
		heightCm: user.heightCm || null,
		preferredBrands: user.preferredBrands || [],
		budgetRange: user.budgetRange || null,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	}
}

async function getMyProfile(userId) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			fullName: true,
			email: true,
			phone: true,
			city: true,
			heightCm: true,
			preferredBrands: true,
			budgetRange: true,
			createdAt: true,
			updatedAt: true,
		},
	})

	if (!user) {
		const error = new Error('Usuario no encontrado')
		error.statusCode = 404
		throw error
	}

	return normalizeProfile(user)
}

async function updateMyProfile(userId, data) {
	const user = await prisma.user.update({
		where: { id: userId },
		data: {
			fullName: data.fullName?.trim(),
			phone: data.phone?.trim() || null,
			city: data.city?.trim() || null,
			heightCm: data.heightCm,
			preferredBrands: data.preferredBrands,
		},
		select: {
			id: true,
			fullName: true,
			email: true,
			phone: true,
			city: true,
			heightCm: true,
			preferredBrands: true,
			budgetRange: true,
			createdAt: true,
			updatedAt: true,
		},
	})

	return normalizeProfile(user)
}

module.exports = { getMyProfile, updateMyProfile }
