export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers
  });
  if (!parsed.success) return next(parsed.error);
  req.validated = parsed.data;
  next();
};
