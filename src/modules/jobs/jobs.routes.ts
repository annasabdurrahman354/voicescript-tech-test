import { Router } from 'express';
import {
  listJobsController,
  getJobController,
  createJobController,
  assignReporterController,
  assignEditorController,
  getSuggestedReporterController,
  finishTranscriptionController,
  finishJobController,
} from './jobs.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createJobSchema,
  assignReporterSchema,
  assignEditorSchema,
} from './job.schema';

const router = Router();

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List all jobs with filtering, searching, and sorting
 *     description: Returns jobs matching parameters. Filters by status, location type, searches by caseName/city, and sorts by caseName, duration, or city.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [NEW, ASSIGNED, TRANSCRIBED, REVIEWED, COMPLETED] }
 *       - in: query
 *         name: locationType
 *         schema: { type: string, enum: [PHYSICAL, REMOTE] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by caseName or city (partial, case-insensitive)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [caseName, durationMin, city] }
 *         description: Sort field
 *     responses:
 *       200:
 *         description: Array of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Job' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', listJobsController);

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get a job by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Job UUID
 *     responses:
 *       200:
 *         description: Job found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Job' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', getJobController);

/**
 * @openapi
 * /api/jobs:
 *   post:
 *     tags: [Jobs]
 *     summary: Create a new job
 *     description: Creates a job in `NEW` status. If `locationType` is `PHYSICAL`, `city` is required. If `REMOTE`, `city` is optional.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateJobInput' }
 *     responses:
 *       201:
 *         description: Job created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Job' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', validateRequest(createJobSchema), createJobController);

/**
 * @openapi
 * /api/jobs/{id}/suggested-reporters:
 *   get:
 *     tags: [Jobs]
 *     summary: Get a list of suggested (ranked) available reporters for the job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Array of suggested reporters, sorted by suitability score and name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Reporter' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/suggested-reporters', getSuggestedReporterController);

/**
 * @openapi
 * /api/jobs/{id}/assign-reporter:
 *   post:
 *     tags: [Jobs]
 *     summary: Assign a reporter to a job
 *     description: Assigns the specified reporter (or the system's best recommendation if omitted). Transitions the job status to ASSIGNED, marks reporter unavailable, and sets reporter payout.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AssignReporterInput' }
 *     responses:
 *       200:
 *         description: Job with assigned reporter
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Job' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/InvalidTransition'
 */
router.post('/:id/assign-reporter', validateRequest(assignReporterSchema), assignReporterController);

/**
 * @openapi
 * /api/jobs/{id}/finish-transcription:
 *   post:
 *     tags: [Jobs]
 *     summary: Complete transcription for a job
 *     description: Transitions job status to TRANSCRIBED and makes the assigned reporter available again.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job with updated status
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Job' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/InvalidTransition'
 */
router.post('/:id/finish-transcription', finishTranscriptionController);

/**
 * @openapi
 * /api/jobs/{id}/assign-editor:
 *   post:
 *     tags: [Jobs]
 *     summary: Assign an editor to a job
 *     description: Assigns the editor and transitions job status to REVIEWED, marks editor unavailable, and sets editor flatfee payout.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AssignEditorInput' }
 *     responses:
 *       200:
 *         description: Job with assigned editor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Job' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/InvalidTransition'
 */
router.post('/:id/assign-editor', validateRequest(assignEditorSchema), assignEditorController);

/**
 * @openapi
 * /api/jobs/{id}/finish-job:
 *   post:
 *     tags: [Jobs]
 *     summary: Complete the review phase and close the job
 *     description: Transitions job status to COMPLETED, makes the editor available again, and records total payout.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job completed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Job' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/InvalidTransition'
 */
router.post('/:id/finish-job', finishJobController);

export default router;
