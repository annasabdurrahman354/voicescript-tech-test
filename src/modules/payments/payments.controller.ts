import type { Request, Response } from 'express';
import { getOrCalculatePayment } from './payments.service';
import { ok } from '../../utils/response';
import { getString } from '../../utils/parse';

export async function getPaymentController(req: Request, res: Response) {
  const jobId = getString(req.params.id);
  const payment = await getOrCalculatePayment(jobId);
  return ok(res, payment);
}
