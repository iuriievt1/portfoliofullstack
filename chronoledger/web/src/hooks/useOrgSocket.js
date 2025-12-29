import { useEffect } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../api/http.js";

let socket;

export function useOrgSocket(orgId, onAnyEvent) {
  useEffect(() => {
    if (!orgId) return;
    if (!socket) {
      socket = io(API_URL, { transports: ["websocket"], withCredentials: true });
    }
    socket.emit("org:join", orgId);

    const handler = () => onAnyEvent?.();
    socket.on("event:new", handler);
    socket.on("branch:new", handler);

    return () => {
      socket.off("event:new", handler);
      socket.off("branch:new", handler);
    };
  }, [orgId, onAnyEvent]);
}
