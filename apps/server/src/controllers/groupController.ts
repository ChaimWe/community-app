import { Request, Response } from "express";
import { routeId } from "../lib/routeId";
import * as service from "../services/groupService";

export async function list(_req: Request, res: Response) {
  res.json(await service.listGroups());
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createGroup(req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await service.updateGroup(routeId(req.params.id), req.body));
}

export async function addMembers(req: Request, res: Response) {
  res.json(await service.addMembers(routeId(req.params.id), req.body.memberIds));
}
