# Testing Protocol

## Communication with testing sub-agents
- READ this file before invoking any testing agent.
- Update only the "Backend tests" and "Frontend tests" sections below — never edit this protocol section.
- For ANY backend code change → run `deep_testing_backend_v2`.
- For frontend testing → ALWAYS ask the user first; only invoke `auto_frontend_testing_agent` with explicit permission.
- Never fix something already fixed by a testing agent.
- Always test backend before frontend.

---

## Current task summary
Building Zentor clone: Portuguese B&W workspace dashboard. Frontend (React) + Backend (FastAPI + MongoDB + JWT auth).

Auth: JWT (email + password). Endpoints under /api prefix.

## Backend endpoints to test
- `POST /api/auth/register` { name, email, password } → { token, user }
- `POST /api/auth/login` { email, password } → { token, user }
- `GET  /api/auth/me` (Bearer) → { user }
- `PUT  /api/profile` (Bearer) { name, email } → { user }
- `GET  /api/apps/catalog` (Bearer) → list with installed flag
- `GET  /api/apps/installed` (Bearer) → list with expiresInDays
- `POST /api/apps/install/{app_id}` (Bearer)
- `DELETE /api/apps/uninstall/{app_id}` (Bearer)
- `GET  /api/stories?app_id=` (Bearer)
- `POST /api/stories` (Bearer) { app_id, title, format, scroll, active, cta, media:[{url,type,name,cover}], urls:[{value,type,ignore_params}] }
- `GET  /api/stories/{id}` (Bearer)
- `PUT  /api/stories/{id}` (Bearer)
- `DELETE /api/stories/{id}` (Bearer)
- `PATCH /api/stories/{id}/toggle` (Bearer)
- `POST /api/upload` (Bearer, multipart) → { id, url, name, mime, size }
- `GET  /api/files/{fid}` → streams file content (public)
- `GET  /api/files` (Bearer) → list of user files
- `GET  /api/subscriptions` (Bearer)
- `POST /api/feedback` (Bearer) { rating: 1-5, text }

Notes:
- New users automatically get Stories Vídeos installed with 7-day trial and a subscription.
- App ids in catalog: stories-videos, avaliacoes-pro, popup-conversao, frete-tempo-real, whatsapp-button, timer-promo
- Tokens expire in 30 days. Bcrypt password hashing.

## Backend tests

### Test Execution Summary
**Date:** 2026-06-11  
**Test Script:** /app/backend_test.py  
**Base URL:** https://visual-creator-343.preview.emergentagent.com/api  
**Result:** ✅ **ALL 20 TESTS PASSED (100%)**

### Detailed Test Results

#### ✅ Authentication & Authorization (Steps 1-5)
1. **POST /api/auth/register** - ✅ PASS
   - Successfully registered user with unique email
   - Returns token and user object with id, name, email, initials
   - Password validation enforced (6+ characters)

2. **POST /api/auth/register (duplicate)** - ✅ PASS
   - Correctly rejects duplicate email with 400 status
   - Error message: "E-mail já cadastrado"

3. **POST /api/auth/login** - ✅ PASS
   - Successfully authenticates with correct credentials
   - Returns JWT token and user object

4. **POST /api/auth/login (wrong password)** - ✅ PASS
   - Correctly rejects invalid credentials with 401 status
   - Error message: "Credenciais inválidas"

5. **GET /api/auth/me** - ✅ PASS
   - Without token: Correctly returns 401 "Missing token"
   - With token: Returns user object successfully

#### ✅ Apps Management (Steps 6-10)
6. **GET /api/apps/catalog** - ✅ PASS
   - Returns all 6 apps in catalog
   - stories-videos correctly shows installed:true (auto-installed on registration)
   - Apps: stories-videos, avaliacoes-pro, popup-conversao, frete-tempo-real, whatsapp-button, timer-promo

7. **GET /api/apps/installed** - ✅ PASS
   - Returns stories-videos with expiresInDays=6 (7-day trial)
   - Status: "ativa"

8. **GET /api/subscriptions** - ✅ PASS
   - Returns subscription for "Stories Vídeos"
   - Plan: Mensal, Price: R$ 29,90
   - Next billing date correctly set to 7 days from registration

9. **POST /api/apps/install/avaliacoes-pro** - ✅ PASS
   - Successfully installs app
   - Verified in catalog (installed:true)
   - Verified in subscriptions (new entry created)

10. **DELETE /api/apps/uninstall/avaliacoes-pro** - ✅ PASS
    - Successfully uninstalls app
    - Verified removal from installed apps list
    - Verified removal from subscriptions

#### ✅ File Upload & Management (Steps 11, 20)
11. **POST /api/upload** - ✅ PASS
    - Successfully uploads PNG file (multipart/form-data)
    - Returns id, url, name, mime, size
    - Public URL accessible without authentication
    - Content-Type correctly set to image/png

20. **GET /api/files** - ✅ PASS
    - Lists all uploaded files for authenticated user
    - Returns file metadata (id, url, name, mime, size)

#### ✅ Stories CRUD Operations (Steps 12-17)
12. **POST /api/stories** - ✅ PASS
    - Successfully creates story with media and URL rules
    - Thumbnail correctly set to cover image URL
    - Returns complete story object with all fields

13. **GET /api/stories?app_id=stories-videos** - ✅ PASS
    - Lists stories filtered by app_id
    - Created story found in results

14. **GET /api/stories/{id}** - ✅ PASS
    - Retrieves specific story by ID
    - Returns complete story object

15. **PUT /api/stories/{id}** - ✅ PASS
    - Successfully updates story title
    - Returns updated story object

16. **PATCH /api/stories/{id}/toggle** - ✅ PASS
    - First toggle: active changed from true to false
    - Second toggle: active changed from false to true
    - Returns {active: bool} as expected

17. **DELETE /api/stories/{id}** - ✅ PASS
    - Successfully deletes story
    - Subsequent GET returns 404 "Story não encontrado"

#### ✅ Profile Management (Step 18)
18. **PUT /api/profile** - ✅ PASS
    - Successfully updates user name
    - Initials automatically recalculated (João Pedro Santos → JS)
    - Returns updated user object

#### ✅ Feedback System (Step 19)
19. **POST /api/feedback** - ✅ PASS
    - Valid feedback (rating=5): Successfully accepted
    - Invalid feedback (rating=10): Correctly rejected with 422 validation error
    - Rating constraint (1-5) properly enforced

### Key Findings
✅ **All endpoints working correctly**
✅ **JWT authentication properly implemented**
✅ **Auto-install of stories-videos on registration working**
✅ **File upload/download with base64 storage working**
✅ **CRUD operations for stories working**
✅ **Validation working (password length, rating range, duplicate email)**
✅ **Error handling appropriate (401, 400, 404, 422)**
✅ **MongoDB integration working correctly**
✅ **All /api prefix routes accessible via public URL**

### Test Credentials Used
- Email: maria.silva.1781208994@example.com
- Password: senha123
- User ID: 9e2ad697-f37d-4359-a3ee-914a56f6760d

### No Issues Found
All backend APIs are functioning as expected with proper error handling, validation, and data persistence.

## Frontend tests
(only when user authorizes)
