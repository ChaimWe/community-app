import { Request, Response } from "express";
import { routeId } from "../lib/routeId";
import * as service from "../services/groupService";

export async function list(req: Request, res: Response) {
  const includeArchived = String(req.query.includeArchived || "") === "true";
  res.json(await service.listGroups(includeArchived));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createGroup(req.body));
}

export async function update(req: Request, res: Response) {
  const group = await service.updateGroup(routeId(req.params.id), req.body);
  if (!group) return res.status(404).json({ message: "Group not found" });
  res.json(group);
}

export async function addMembers(req: Request, res: Response) {
  const group = await service.addMembers(routeId(req.params.id), req.body.memberIds);
  if (!group) return res.status(404).json({ message: "Group not found" });
  res.json(group);
}

export async function archive(req: Request, res: Response) {
  const group = await service.archiveGroup(routeId(req.params.id));
  if (!group) return res.status(404).json({ message: "Group not found" });
  res.json(group);
}

export async function restore(req: Request, res: Response) {
  const group = await service.restoreGroup(routeId(req.params.id));
  if (!group) return res.status(404).json({ message: "Group not found" });
  res.json(group);
}

export async function remove(req: Request, res: Response) {
  const group = await service.deleteGroup(routeId(req.params.id));
  if (!group) return res.status(404).json({ message: "Group not found" });
  res.status(204).end();
}
