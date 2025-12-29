import { Activity } from "../models/activity.model.js";
import { emitOrgEvent } from "./realtimeBus.js";

export async function logActivity({ orgId, actorId, type, message, meta = {} }) {
  const doc = await Activity.create({
    org: orgId,
    actor: actorId,
    type,
    message,
    meta
  });

  emitOrgEvent(orgId, "activity.created", { activityId: doc._id.toString(), type, message, meta });
  return doc;
}
