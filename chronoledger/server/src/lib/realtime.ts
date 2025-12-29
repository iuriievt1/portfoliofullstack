export function emitOrg(app: any, orgId: string, event: string, payload: any) {
  const io = app?.locals?.io;
  if (!io) return;
  io.to(`org:${orgId}`).emit(event, payload);
}
