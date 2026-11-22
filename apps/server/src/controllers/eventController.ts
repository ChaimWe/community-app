import { Request, Response } from "express";
import { routeId } from "../lib/routeId";
import * as service from "../services/eventService";
import { AuthRequest } from "../middleware/auth";

export async function list(req: AuthRequest, res: Response) {
  const includeArchived = String(req.query.includeArchived || "") === "true";
  if (includeArchived && !req.isAdmin) {
    return res.status(403).json({ message: "Admin access required to view archived events" });
  }
  res.json(await service.listEvents(includeArchived));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createEvent(req.body));
}

export async function update(req: AuthRequest, res: Response) {
  const event = await service.getEvent(routeId(req.params.id));
  if (!event || (event.archived && !req.isAdmin)) return res.status(404).json({ message: "Event not found" });
  res.json(await service.updateEvent(event.id, req.body));
}

export async function get(req: AuthRequest, res: Response) {
  const event = await service.getEvent(routeId(req.params.id));
  if (!event || (event.archived && !req.isAdmin)) return res.status(404).json({ message: "Event not found" });
  res.json(event);
}

export async function generate(req: AuthRequest, res: Response) {
  const event = await service.getEvent(routeId(req.params.id));
  if (!event || (event.archived && !req.isAdmin)) return res.status(404).json({ message: "Event not found" });
  res.json(await service.generateSeating(event.id));
}

export async function saveSeating(req: AuthRequest, res: Response) {
  const event = await service.getEvent(routeId(req.params.id));
  if (!event || (event.archived && !req.isAdmin)) return res.status(404).json({ message: "Event not found" });

  const plan = event.seatingPlans.id(routeId(req.params.planId));
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  plan.tables = req.body.tables;
  plan.score = req.body.score ?? plan.score;
  plan.lockedMemberIds = req.body.lockedMemberIds ?? plan.lockedMemberIds;
  plan.lockedGuestIds = req.body.lockedGuestIds ?? plan.lockedGuestIds;
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
