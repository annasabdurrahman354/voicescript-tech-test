import { Router } from 'express';
import {
  listEditorsController,
  getEditorController,
  createEditorController,
} from './editors.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createEditorSchema } from './editors.schema';

const router = Router();

/**
 * @openapi
 * /api/editors:
 *   get:
 *     tags: [Editors]
 *     summary: List editors with filtering, searching, and sorting
 *     description: Returns a list of editors, optionally filtered by availability, searched by name, and sorted by name or flatfee.
 *     parameters:
 *       - in: query
 *         name: available
 *         schema: { type: boolean }
 *         description: Filter by availability (true or false)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by editor name (partial, case-insensitive)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, flatfee] }
 *         description: Sort field (default is name)
 *     responses:
 *       200:
 *         description: Array of editors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Editor' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', listEditorsController);

/**
 * @openapi
 * /api/editors/{id}:
 *   get:
 *     tags: [Editors]
 *     summary: Get an editor by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Editor UUID
 *     responses:
 *       200:
 *         description: Editor found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Editor' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', getEditorController);

/**
 * @openapi
 * /api/editors:
 *   post:
 *     tags: [Editors]
 *     summary: Create a new editor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, flatFee]
 *             properties:
 *               name:
 *                 type: string
 *               flatFee:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Editor created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Editor' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', validateRequest(createEditorSchema), createEditorController);

export default router;
