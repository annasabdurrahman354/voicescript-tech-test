import { Response } from 'express';

/**
 * Returns HTTP 200 with raw JSON data.
 */
export function ok(res: Response, data: any) {
  return res.status(200).json(data);
}

/**
 * Returns HTTP 201 with raw JSON data.
 */
export function created(res: Response, data: any) {
  return res.status(201).json(data);
}
