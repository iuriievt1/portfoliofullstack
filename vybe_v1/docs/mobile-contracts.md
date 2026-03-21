# Mobile Contracts

The future Flutter app can integrate against these backend contracts:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/:id`
- `GET /api/places?city=Prague&type=cafe`
- `GET /api/places/:id`
- `POST /api/posts`
- `GET /api/posts/feed`
- `GET /api/posts/place/:placeId`
- `POST /api/posts/:id/like`
- `DELETE /api/posts/:id/like`
- `DELETE /api/posts/:id`
- `POST /api/upload/image`

JWT bearer auth is used for all protected routes, and the response shapes are aligned with `@vybe/shared-types`.

