const bugReportService = require('../services/bugReportService')

const createBugReport = async (req, res) => {
  try {
    const { household_id, id: userId } = req.user
    const report = await bugReportService.createBugReport(req.body.body, household_id, userId)
    return res.status(201).json(report)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const getBugReports = async (req, res) => {
  try {
    const { household_id } = req.user
    const { status } = req.query
    const reports = await bugReportService.getBugReports(household_id, status)
    return res.json(reports)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateBugReportStatus = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    const report = await bugReportService.updateBugReportStatus(id, req.body.status, household_id)
    return res.json(report)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createBugReport, getBugReports, updateBugReportStatus }
