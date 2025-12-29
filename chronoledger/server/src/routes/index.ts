import { Router } from "express";
import auth from "./auth.js";
import orgs from "./orgs.js";
import branches from "./branches.js";
import events from "./events.js";
import publicIngest from "./public.js";

const r = Router();

r.use("/auth", auth);
r.use("/orgs", orgs);
r.use("/orgs", branches);
r.use("/orgs", events);
r.use("/public", publicIngest);

export default r;
