import { Request, Response } from "express";
import { routeId } from "../lib/routeId";
import * as service from "../services/eventService";

export async function list(req: Request, res: Response) {
  const includeArchived = String(req.query.includeArchived || "") === "true";
  res.json(await service.listEvents(includeArchived));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createEvent(req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await service.updateEvent(routeId(req.params.id), req.body));
}

export async function get(req: Request, res: Response) {
  const event = await service.getEvent(routeId(req.params.id));
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
}

export async function generate(req: Request, res: Response) {
  res.json(await service.generateSeating(routeId(req.params.id)));
}

export async function saveSeating(req: Request, res: Response) {
  const event = await service.updateEvent(routeId(req.params.id), { $set: {} });
  if (!event) return res.status(404).json({ message: "Event not found" });

  const plan = event.seatingPlans.id(routeId(req.params.planId));
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  plan.tables = req.body.tables;
  plan.score = req.body.score ?? plan.score;
  plan.lockedMemberIds = req.body.lockedMemberIds ?? plan.lockedMemberIds;
  await event.save();
  res.json(event);
}

export async function archive(req: Request, res: Response) {
  const item = await service.archiveEvent(routeId(req.params.id));
  if (!item) return res.status(404).json({ message: "Event not found" });
  res.json(item);
}

export async function restore(req: Request, res: Response) {
  const item = await service.restoreEvent(routeId(req.params.id));
  if (!item) return res.status(404).json({ message: "Event not found" });
  res.json(item);
}

export async function remove(req: Request, res: Response) {
  await service.deleteEvent(routeId(req.params.id));
  res.status(204).end();
}
