import { Request, Response } from "express";
import { routeId } from "../lib/routeId";
import * as service from "../services/memberService";

export async function list(req: Request, res: Response) {
  res.json(await service.listMembers(String(req.query.search || ""), String(req.query.program || "")));
}

export async function get(req: Request, res: Response) {
  const item = await service.getMember(routeId(req.params.id));
  if (!item) return res.status(404).json({ message: "Member not found" });
  res.json(item);
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createMember(req.body));
}

export async function update(req: Request, res: Response) {
  const item = await service.updateMember(routeId(req.params.id), req.body);
  if (!item) return res.status(404).json({ message: "Member not found" });
  res.json(item);
}

export async function remove(req: Request, res: Response) {
  await service.deleteMember(routeId(req.params.id));
  res.status(204).end();
}
