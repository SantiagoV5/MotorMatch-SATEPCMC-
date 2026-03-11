const { processQuestionnaire } = require('./questionnaire.service')

async function submitQuestionnaire(req, res, next) {
  try {
    const result = await processQuestionnaire(req.user.id, req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = { submitQuestionnaire }
