import { Request, Response } from "express";
import { routeId } from "../lib/routeId";
import * as relationships from "../services/relationshipService";

export async function list(req: Request, res: Response) {
  res.json(await relationships.listRelationships(String(req.query.memberId || "")));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await relationships.createRelationship(req.body));
}

export async function remove(req: Request, res: Response) {
  await relationships.deleteRelationship(routeId(req.params.id));
  res.status(204).end();
}
