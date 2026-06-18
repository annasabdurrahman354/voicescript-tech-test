import type { Request, Response } from 'express';
import { findAllEditors, findEditorById, createEditor } from './editors.service';
import { ok, created } from '../../utils/response';
import { getString, getInt } from '../../utils/parse';

export async function listEditorsController(req: Request, res: Response) {
  const availableQuery = req.query.available;
  let available: boolean | undefined = undefined;
  if (availableQuery === 'true') {
    available = true;
  } else if (availableQuery === 'false') {
    available = false;
  }

  const search = req.query.search ? getString(req.query.search) : undefined;
  const sortByQuery = req.query.sortBy ? getString(req.query.sortBy) : undefined;
  let sortBy: 'name' | 'flatfee' | undefined = undefined;
  if (sortByQuery === 'name' || sortByQuery === 'flatfee') {
    sortBy = sortByQuery;
  }

  const editors = await findAllEditors({ available, search, sortBy });
  return ok(res, editors);
}

export async function getEditorController(req: Request, res: Response) {
  const id = getString(req.params.id);
  const editor = await findEditorById(id);
  return ok(res, editor);
}

export async function createEditorController(req: Request, res: Response) {
  const name = getString(req.body.name);
  const flatFee = getInt(req.body.flatFee);

  const editor = await createEditor({ name, flatFee, available: true });
  return created(res, editor);
}
