import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export function useOrgSocket(orgId, onEvent) {
  const socket = useMemo(() => io("/", { autoConnect: false }), []);

  useEffect(() => {
    if (!orgId) return;
    socket.connect();
    socket.emit("join", { orgId });

    const onCreated = (p) => onEvent?.("lead.created", p);
    const onUpdated = (p) => onEvent?.("lead.updated", p);

    socket.on("lead.created", onCreated);
    socket.on("lead.updated", onUpdated);

    return () => {
      socket.off("lead.created", onCreated);
      socket.off("lead.updated", onUpdated);
      socket.disconnect();
    };
  }, [orgId, socket, onEvent]);

  return socket;
}
