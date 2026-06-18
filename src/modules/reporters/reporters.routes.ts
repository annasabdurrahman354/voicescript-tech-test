import { Router } from 'express';
import {
  listReportersController,
  getReporterController,
  createReporterController,
} from './reporters.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createReporterSchema } from './reporters.schema';

const router = Router();

/**
 * @openapi
 * /api/reporters:
 *   get:
 *     tags: [Reporters]
 *     summary: List reporters with filtering, searching, and sorting
 *     description: Returns a list of reporters, optionally filtered by availability, searched by name/city, and sorted by name, city, or ratePerMinute.
 *     parameters:
 *       - in: query
 *         name: available
 *         schema: { type: boolean }
 *         description: Filter by availability (true or false)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or city (partial, case-insensitive)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, city, ratePerMinute] }
 *         description: Sort field (default is name)
 *     responses:
 *       200:
 *         description: Array of reporters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Reporter' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', listReportersController);

/**
 * @openapi
 * /api/reporters/{id}:
 *   get:
 *     tags: [Reporters]
 *     summary: Get a reporter by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Reporter UUID
 *     responses:
 *       200:
 *         description: Reporter found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Reporter' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', getReporterController);

/**
 * @openapi
 * /api/reporters:
 *   post:
 *     tags: [Reporters]
 *     summary: Create a new reporter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, city, ratePerMinute]
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               ratePerMinute:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reporter created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Reporter' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', validateRequest(createReporterSchema), createReporterController);

export default router;
