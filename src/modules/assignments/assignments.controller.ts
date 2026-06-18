import type { Request, Response } from 'express';
import { assignReporter, assignEditor } from './assignments.service';
import { ok } from '../../utils/response';
import { getString } from '../../utils/parse';

export async function assignReporterController(req: Request, res: Response) {
  const jobId = getString(req.params.id);
  const updatedJob = await assignReporter(jobId);
  return ok(res, updatedJob);
}

export async function assignEditorController(req: Request, res: Response) {
  const jobId = getString(req.params.id);
  const editorId = getString(req.body.editorId);
  const updatedJob = await assignEditor(jobId, editorId);
  return ok(res, updatedJob);
}
