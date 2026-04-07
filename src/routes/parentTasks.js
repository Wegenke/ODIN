const router = require('express').Router()
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')
const validate = require('../middleware/validate')
const { createParentTaskSchema, updateParentTaskSchema, addNoteSchema, reorderParentTasksSchema } = require('../validators/parentTaskSchemas')
const { getTasks, getRecentlyCompleted, createTask, updateTask, startTask, pauseTask, archiveTask, reorderTasks, getNotes, addNote } = require('../controllers/parentTaskController')

router.get('/', auth, roleCheck('parent'), getTasks)
router.get('/recent', auth, roleCheck('parent'), getRecentlyCompleted)
router.post('/', auth, roleCheck('parent'), validate(createParentTaskSchema), createTask)
router.patch('/reorder', auth, roleCheck('parent'), validate(reorderParentTasksSchema), reorderTasks)
router.patch('/:id', auth, roleCheck('parent'), validate(updateParentTaskSchema), updateTask)
router.patch('/:id/start', auth, roleCheck('parent'), startTask)
router.patch('/:id/pause', auth, roleCheck('parent'), pauseTask)
router.patch('/:id/archive', auth, roleCheck('parent'), archiveTask)
router.get('/:id/notes', auth, roleCheck('parent'), getNotes)
router.post('/:id/notes', auth, roleCheck('parent'), validate(addNoteSchema), addNote)

module.exports = router
