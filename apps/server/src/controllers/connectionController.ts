import { Request, Response } from "express";
import { routeId } from "../lib/routeId";
import * as connections from "../services/connectionService";

export async function list(req: Request, res: Response) {
  res.json(await connections.listConnections(String(req.query.memberId || "")));
}

export async function upsert(req: Request, res: Response) {
  res.status(201).json(await connections.upsertConnection(req.body));
}

export async function remove(req: Request, res: Response) {
  await connections.deleteConnection(routeId(req.params.id));
  res.status(204).end();
}
