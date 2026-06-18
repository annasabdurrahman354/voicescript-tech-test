import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Court Reporting Workflow Manager API',
      version: '1.0.0',
      description:
        'REST API for managing court reporting transcription jobs — including reporter auto-assignment, editor assignment, state-machine status transitions, and payment calculation. Built for the VoiceScript fullstack assessment.',
      contact: {
        name: 'VoiceScript Tech Assessment',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'Jobs', description: 'Job CRUD, assignment workflow, and lifecycle management' },
      { name: 'Reporters', description: 'Reporter directory' },
      { name: 'Editors', description: 'Editor directory' },
      { name: 'Health', description: 'Service health check' },
    ],
    components: {
      schemas: {
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'b3d8e1a2-4f5b-4c8a-9e7d-1a2b3c4d5e6f' },
            caseName: { type: 'string', example: 'Smith v. Jones — Deposition' },
            durationMin: { type: 'integer', minimum: 1, example: 90 },
            locationType: { type: 'string', enum: ['PHYSICAL', 'REMOTE'], example: 'PHYSICAL' },
            city: {
              type: 'string',
              nullable: true,
              description: 'Required when locationType is PHYSICAL',
              example: 'Jakarta',
            },
            status: {
              type: 'string',
              enum: ['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'],
              example: 'NEW',
            },
            reporterId: { type: 'string', format: 'uuid', nullable: true },
            editorId: { type: 'string', format: 'uuid', nullable: true },
            reporter: { $ref: '#/components/schemas/Reporter' },
            editor: { $ref: '#/components/schemas/Editor' },
            payment: { $ref: '#/components/schemas/Payment' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Reporter: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Alice Hartman' },
            city: { type: 'string', example: 'Jakarta' },
            available: { type: 'boolean', example: true },
            ratePerMinute: {
              type: 'integer',
              description: 'IDR per minute',
              example: 2000,
            },
          },
        },
        Editor: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Frank Wijaya' },
            available: { type: 'boolean', example: true },
            flatFee: {
              type: 'integer',
              description: 'IDR flat fee per job',
              example: 50000,
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            jobId: { type: 'string', format: 'uuid' },
            reporterPayout: { type: 'integer', example: 180000, description: 'IDR' },
            editorPayout: { type: 'integer', example: 50000, description: 'IDR' },
            totalPayout: { type: 'integer', example: 230000, description: 'IDR' },
            calculatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateJobInput: {
          type: 'object',
          required: ['caseName', 'durationMin', 'locationType'],
          properties: {
            caseName: { type: 'string', minLength: 1, example: 'Smith v. Jones — Deposition' },
            durationMin: { type: 'integer', minimum: 1, example: 90 },
            locationType: { type: 'string', enum: ['PHYSICAL', 'REMOTE'], example: 'PHYSICAL' },
            city: {
              type: 'string',
              description: 'Required when locationType is PHYSICAL',
              example: 'Jakarta',
            },
          },
        },
        UpdateStatusInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED'],
              example: 'TRANSCRIBED',
            },
          },
        },
        AssignEditorInput: {
          type: 'object',
          required: ['editorId'],
          properties: {
            editorId: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Resource not found' },
            details: {
              type: 'object',
              description: 'Zod validation error details (only on 400 validation failures)',
              additionalProperties: true,
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        BadRequest: {
          description: 'Validation failed or invalid request',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        InvalidTransition: {
          description: 'Invalid job status transition',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NoAvailableReporter: {
          description: 'No available reporter matches this job',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ServerError: {
          description: 'Internal server error',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '..', 'modules', '**', '*.routes.ts').replace(/\\/g, '/'),
    path.join(__dirname, '..', 'modules', '**', '*.controller.ts').replace(/\\/g, '/'),
    path.join(__dirname, '..', 'app.ts').replace(/\\/g, '/'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Court Reporting API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  );

  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
