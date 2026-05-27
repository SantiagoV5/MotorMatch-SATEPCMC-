const prisma = require('../../config/database')

let reviewSchemaReady

async function ensureReviewVisibilityColumn() {
  if (!reviewSchemaReady) {
    reviewSchemaReady = prisma.$executeRaw`
      ALTER TABLE reviews
      ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true
    `
  }

  return reviewSchemaReady
}

module.exports = { ensureReviewVisibilityColumn }