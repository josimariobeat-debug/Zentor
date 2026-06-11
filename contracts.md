# Zentor — Backend Contracts

## Auth (JWT)
- `POST /api/auth/register` `{name,email,password}` → `{token, user}`
- `POST /api/auth/login` `{email,password}` → `{token, user}`
- `GET  /api/auth/me` (Bearer) → `{user}`

`Authorization: Bearer <jwt>` for all protected routes.

## Apps
- `GET  /api/apps/catalog` → `[{id,name,type,description,price,installed}]`
- `GET  /api/apps/installed` → `[{id,name,type,description,status,expiresInDays}]`
- `POST /api/apps/install/{app_id}` → `{ok:true}` (creates installed_app + subscription)
- `DELETE /api/apps/uninstall/{app_id}` → `{ok:true}`

Catalog is server-seeded (constant list). Installation creates a record in `installed_apps` for the user.

## Stories (per installed app)
- `GET  /api/stories?app_id=` → list
- `POST /api/stories` body: `{app_id,title,format,scroll,active,cta,media:[{url,type,name,cover}],urls:[{value,type,ignore_params}]}` → story
- `GET  /api/stories/{id}` → story
- `PUT  /api/stories/{id}` → story
- `DELETE /api/stories/{id}` → `{ok:true}`
- `PATCH /api/stories/{id}/toggle` → `{active:bool}`

## Upload (frontend uploads file → backend stores as base64 in `media_files` collection and returns URL)
- `POST /api/upload` (multipart `file`) → `{id,url,name,mime,size}`
- `GET  /api/files/{id}` → streams the file
(URLs are like `${BACKEND}/api/files/{id}`)

## Subscriptions
- `GET /api/subscriptions` → list

## Feedback
- `POST /api/feedback` `{rating,text}` → ok

## Profile
- `PUT /api/profile` `{name,email}` → user

## Frontend integration
- `src/lib/api.js` (axios instance with REACT_APP_BACKEND_URL + auth header)
- `src/context/AuthContext.jsx` (token in localStorage; redirect to /login if 401)
- Replace mock imports gradually: `mock.installedApps`, `mock.storeApps`, `mock.sampleStories`, `mock.subscriptions`, `mock.currentUser` → API calls.
- Mocks kept visual-only: Galeria modal, QR Code mobile, Instagram source.

## DB collections
- `users` (id, name, email, password_hash, initials, created_at)
- `installed_apps` (id, user_id, app_id, expires_at, installed_at)
- `stories` (id, user_id, app_id, title, format, scroll, active, cta, media, urls, views, created_at, updated_at)
- `subscriptions` (id, user_id, app_id, plan, price, next_billing, status)
- `feedbacks` (id, user_id, rating, text, created_at)
- `media_files` (id, user_id, name, mime, size, data_b64, created_at)
