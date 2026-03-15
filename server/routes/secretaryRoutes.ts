import { Router } from "express";
import { nanoid } from "nanoid";
import { requireUser, requireSecretary, type UserAuthedRequest } from "../auth/userMiddleware";
import { getActiveMembers, listUsers } from "../db/siteUsers";
import { createGroup, listGroups, getGroupById, updateGroup, deleteGroup, addGroupMember, removeGroupMember, getGroupMembers } from "../db/groups";
import { createMemberEvent, listMemberEvents, getMemberEventById, updateMemberEvent, deleteMemberEvent, countMemberEvents } from "../db/memberEvents";
import { sendBulkEmail } from "../utils/email";
import { getObserversWithEmailConsent } from "../db/siteUsers";

export function mountSecretaryRoutes(router: Router) {
  // All routes require at least user auth
  router.use(requireUser as any);

  // ═══════════════════════════════════════════
  // Members list (secretary+ only)
  // ═══════════════════════════════════════════
  router.get("/members", requireSecretary as any, async (_req, res) => {
    try {
      const members = await getActiveMembers();
      return res.json({ ok: true, data: members });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.get("/all-users", requireSecretary as any, async (_req, res) => {
    try {
      const users = await listUsers();
      return res.json({ ok: true, data: users });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ═══════════════════════════════════════════
  // Groups CRUD (secretary+ only)
  // ═══════════════════════════════════════════
  router.get("/groups", requireSecretary as any, async (_req, res) => {
    try {
      const groups = await listGroups();
      return res.json({ ok: true, data: groups });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.post("/groups", requireSecretary as any, async (req: UserAuthedRequest, res) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Name required." } });
      const group = await createGroup({ id: nanoid(16), name, description, createdBy: req.siteUser?.id });
      return res.json({ ok: true, data: group });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.patch("/groups/:id", requireSecretary as any, async (req, res) => {
    try {
      const { name, description } = req.body;
      const updated = await updateGroup(req.params.id, { name, description });
      if (!updated) return res.status(404).json({ ok: false });
      return res.json({ ok: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.delete("/groups/:id", requireSecretary as any, async (req, res) => {
    try {
      await deleteGroup(req.params.id);
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ── Group members ──
  router.get("/groups/:id/members", requireSecretary as any, async (req, res) => {
    try {
      const members = await getGroupMembers(req.params.id);
      return res.json({ ok: true, data: members });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.post("/groups/:id/members", requireSecretary as any, async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "userId required." } });
      await addGroupMember({ id: nanoid(16), groupId: req.params.id, userId });
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.delete("/groups/:groupId/members/:userId", requireSecretary as any, async (req, res) => {
    try {
      await removeGroupMember(req.params.groupId, req.params.userId);
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ═══════════════════════════════════════════
  // Member Events CRUD (secretary+ only)
  // ═══════════════════════════════════════════
  router.get("/member-events", requireSecretary as any, async (req, res) => {
    try {
      const { eventType, targetGroupId } = req.query;
      const events = await listMemberEvents({
        eventType: eventType as string,
        targetGroupId: targetGroupId as string,
      });
      return res.json({ ok: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.post("/member-events", requireSecretary as any, async (req: UserAuthedRequest, res) => {
    try {
      const { title, description, eventType, date, time, location, targetGroupId } = req.body;
      if (!title || !date) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Title and date required." } });
      }
      const event = await createMemberEvent({
        id: nanoid(16),
        title,
        description,
        eventType: eventType || "member",
        date,
        time,
        location,
        targetGroupId,
        createdBy: req.siteUser?.id,
      });
      return res.json({ ok: true, data: event });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.patch("/member-events/:id", requireSecretary as any, async (req, res) => {
    try {
      const { title, description, eventType, date, time, location, targetGroupId } = req.body;
      const updated = await updateMemberEvent(req.params.id, {
        title, description, eventType, date, time, location, targetGroupId,
      });
      if (!updated) return res.status(404).json({ ok: false });
      return res.json({ ok: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.delete("/member-events/:id", requireSecretary as any, async (req, res) => {
    try {
      await deleteMemberEvent(req.params.id);
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ═══════════════════════════════════════════
  // Send email to group or all observers
  // ═══════════════════════════════════════════
  router.post("/send-email", requireSecretary as any, async (req, res) => {
    try {
      const { subject, body, targetGroupId, sendToObservers, memberEventId } = req.body;
      if (!subject || !body) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Subject and body required." } });
      }

      const recipients: Array<{ email: string; userId?: string }> = [];

      if (sendToObservers) {
        const observers = await getObserversWithEmailConsent();
        for (const o of observers) {
          recipients.push({ email: o.email, userId: o.id });
        }
      }

      if (targetGroupId) {
        const members = await getGroupMembers(targetGroupId);
        for (const m of members) {
          if (!recipients.find(r => r.email === m.email)) {
            recipients.push({ email: m.email, userId: m.userId });
          }
        }
      }

      if (recipients.length === 0) {
        return res.status(400).json({ ok: false, error: { code: "NO_RECIPIENTS", message: "No recipients found." } });
      }

      await sendBulkEmail(recipients, {
        subject,
        body,
        memberEventId,
        sendType: memberEventId ? "member_event" : "event_notification",
      });

      return res.json({ ok: true, data: { sent: recipients.length } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ═══════════════════════════════════════════
  // Dashboard stats for secretary
  // ═══════════════════════════════════════════
  router.get("/stats", requireSecretary as any, async (_req, res) => {
    try {
      const members = await getActiveMembers();
      const groups = await listGroups();
      const eventCount = await countMemberEvents();
      return res.json({ ok: true, data: { memberCount: members.length, groupCount: groups.length, eventCount } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ═══════════════════════════════════════════
  // Member-only: my events (events for groups I'm in)
  // ═══════════════════════════════════════════
  router.get("/my-events", async (req: UserAuthedRequest, res) => {
    try {
      if (!req.siteUser) return res.status(401).json({ ok: false });
      // Get all member events (public ones + ones for groups user is in)
      const allEvents = await listMemberEvents();
      const { getUserGroups } = await import("../db/groups");
      const myGroups = await getUserGroups(req.siteUser.id);
      const myGroupIds = new Set(myGroups.map(g => g.id));

      const myEvents = allEvents.filter(e => {
        if (e.eventType === "public") return true;
        if (!e.targetGroupId) return true; // no group = visible to all members
        return myGroupIds.has(e.targetGroupId);
      });

      return res.json({ ok: true, data: myEvents });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });
}
