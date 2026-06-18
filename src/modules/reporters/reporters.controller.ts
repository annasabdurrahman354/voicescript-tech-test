import type { Request, Response } from 'express';
import { findAllReporters, findReporterById, createReporter } from './reporters.service';
import { ok, created } from '../../utils/response';
import { getString, getInt } from '../../utils/parse';

export async function listReportersController(req: Request, res: Response) {
  const availableQuery = req.query.available;
  let available: boolean | undefined = undefined;
  if (availableQuery === 'true') {
    available = true;
  } else if (availableQuery === 'false') {
    available = false;
  }

  const search = req.query.search ? getString(req.query.search) : undefined;
  const sortByQuery = req.query.sortBy ? getString(req.query.sortBy) : undefined;
  let sortBy: 'name' | 'city' | 'ratePerMinute' | undefined = undefined;
  if (sortByQuery === 'name' || sortByQuery === 'city' || sortByQuery === 'ratePerMinute') {
    sortBy = sortByQuery;
  }

  const reporters = await findAllReporters({ available, search, sortBy });
  return ok(res, reporters);
}

export async function getReporterController(req: Request, res: Response) {
  const id = getString(req.params.id);
  const reporter = await findReporterById(id);
  return ok(res, reporter);
}

export async function createReporterController(req: Request, res: Response) {
  const name = getString(req.body.name);
  const city = getString(req.body.city);
  const ratePerMinute = getInt(req.body.ratePerMinute);

  const reporter = await createReporter({ name, city, ratePerMinute, available: true });
  return created(res, reporter);
}
