import { Router, Request, Response } from "express";
import { routeId } from "../lib/routeId";
import * as guestService from "../services/guestService";
import { requireAuth, requireEdit } from "../middleware/auth";
import { guestInput } from "../schemas/common";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireEdit,
  async (req: Request, res: Response) => {
    try {
      const data = guestInput.parse(req.body);
      const guest = await guestService.createGuest(data);
      res.status(201).json(guest);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string } | Error;
      const status = (error as { status?: number }).status || 500;
      const message = error instanceof Error ? error.message : "Internal server error";
      res.status(status).json({ error: message });
    }
  },
);

router.get(
  "/",
  async (req: Request, res: Response) => {
    try {
      const memberId = req.query.memberId ? String(req.query.memberId) : undefined;
      const includeArchived = req.query.includeArchived === "true";
      const guests = await guestService.listGuests(memberId, includeArchived);
      res.json(guests);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Internal server error");
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const guest = await guestService.getGuest(routeId(req.params.id));
      if (!guest) {
        res.status(404).json({ error: "Guest not found" });
        return;
      }
      res.json(guest);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Internal server error");
      res.status(500).json({ error: error.message });
    }
  },
);

router.patch(
  "/:id",
  requireEdit,
  async (req: Request, res: Response) => {
    try {
      const data = guestInput.partial().parse(req.body);
      const guest = await guestService.updateGuest(routeId(req.params.id), data);
      if (!guest) {
        res.status(404).json({ error: "Guest not found" });
        return;
      }
      res.json(guest);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string } | Error;
      const status = (error as { status?: number }).status || 500;
      const message = error instanceof Error ? error.message : "Internal server error";
      res.status(status).json({ error: message });
    }
  },
);

router.delete(
  "/:id",
  requireEdit,
  async (req: Request, res: Response) => {
    try {
      const guest = await guestService.deleteGuest(routeId(req.params.id));
      if (!guest) {
        res.status(404).json({ error: "Guest not found" });
        return;
      }
      res.json({ message: "Guest deleted" });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Internal server error");
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/:id/archive",
  requireEdit,
  async (req: Request, res: Response) => {
    try {
      const guest = await guestService.archiveGuest(routeId(req.params.id));
      if (!guest) {
        res.status(404).json({ error: "Guest not found" });
        return;
      }
      res.json(guest);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Internal server error");
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/:id/restore",
  requireEdit,
  async (req: Request, res: Response) => {
    try {
      const guest = await guestService.restoreGuest(routeId(req.params.id));
      if (!guest) {
        res.status(404).json({ error: "Guest not found" });
        return;
      }
      res.json(guest);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Internal server error");
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
