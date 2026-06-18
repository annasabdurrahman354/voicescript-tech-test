import { Router } from 'express';
import { getStatisticsController } from './statistics.controller';

const router = Router();

/**
 * @openapi
 * /api/statistics:
 *   get:
 *     tags: [Statistics]
 *     summary: Get aggregate statistics for jobs, reporters, and editors
 *     description: Returns total counts, status breakdowns, and availability metrics for all resources.
 *     responses:
 *       200:
 *         description: Statistics object containing jobs, reporters, and editors metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 10 }
 *                     byStatus:
 *                       type: object
 *                       properties:
 *                         NEW: { type: integer, example: 2 }
 *                         ASSIGNED: { type: integer, example: 3 }
 *                         TRANSCRIBED: { type: integer, example: 1 }
 *                         REVIEWED: { type: integer, example: 2 }
 *                         COMPLETED: { type: integer, example: 2 }
 *                     byLocation:
 *                       type: object
 *                       properties:
 *                         PHYSICAL: { type: integer, example: 6 }
 *                         REMOTE: { type: integer, example: 4 }
 *                 reporters:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 5 }
 *                     available: { type: integer, example: 3 }
 *                     unavailable: { type: integer, example: 2 }
 *                 editors:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 3 }
 *                     available: { type: integer, example: 1 }
 *                     unavailable: { type: integer, example: 2 }
 *                 payouts:
 *                   type: object
 *                   properties:
 *                     reporter: { type: integer, example: 180000, description: 'Sum of reporter payouts for COMPLETED jobs (IDR)' }
 *                     editor: { type: integer, example: 50000, description: 'Sum of editor payouts for COMPLETED jobs (IDR)' }
 *                     total: { type: integer, example: 230000, description: 'Sum of total payouts for COMPLETED jobs (IDR)' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', getStatisticsController);

export default router;
