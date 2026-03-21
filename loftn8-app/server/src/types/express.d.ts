import type { GuestSession, Table, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      guestSession?: GuestSession & { table: Table };
      user?: User;
    }
  }
}

export {};  
