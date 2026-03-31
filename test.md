# Test Strategy & Test Concept — OrariAperti (M450)

**Project:** OrariAperti - Room Reservation Web Application  
**Repository:** [IMS-coding-projects/M450](https://github.com/IMS-coding-projects/M450)  
**Date:** 2026-03-31  
**Version:** 1.0

---

## 1. Test Strategy

### 1.1 Goal

The goal of testing is to verify that the OrariAperti application behaves correctly according to the OpenAPI specification and the defined business rules. This includes:

- Correctness of all REST API endpoints
- Validation logic (participants format, time overlaps)
- Authorization via private/public UUID key mechanism
- Correct HTTP status codes for all scenarios
- Basic frontend integration (smoke / manual)

### 1.2 Test Scope

| Component | In Scope | Out of Scope |
|---|---|---|
| Backend REST API (`/api/reservation`, `/api/room`) | ✅ | — |
| Input validation (participants, time overlap) | ✅ | — |
| Key-based authorization (privateKey / publicKey) | ✅ | — |
| Frontend React components | ✅ (manual) | Automated UI tests |
| Database persistence layer (Repository) | ✅ (via mock) | Real DB integration tests |
| Room creation via API | ❌ | Not supported by app |
| Authentication / OAuth | ❌ | Not implemented by app |

### 1.3 Test Levels

| Level | Description | Applied To |
|---|---|---|
| Unit Test | Test individual components in isolation with mocks | Backend controllers |
| Integration Test | Test full request-response cycle with real context | Planned (not yet present) |
| Manual / Exploratory | Human-driven testing of UI flows | Frontend |
| API Smoke Test | Script-driven end-to-end API calls | `tests.js` (manual run) |

### 1.4 Test Approach

- **Backend:** White-box unit testing using `@WebMvcTest` with `MockMvc` and `Mockito`. Tests are isolated — the repository layer is always mocked via `@MockitoBean`.
- **Frontend:** No automated tests exist. Manual exploratory testing is recommended for all dialog flows.
- **API-level:** A JavaScript smoke test script (`tests.js`) exists for manually verifying the live API. It is not part of the automated test pipeline.

### 1.5 Test Automation & CI

- Backend tests run via Maven: `./mvnw test`
- Tests are structured under `src/test/java/ims/orariaperti/`
- CI/CD pipeline will come soon

### 1.6 Roles & Responsibilities

| Role | Responsibility |
|---|---|
| Developer | Write and maintain unit tests |
| Tester / Developer | Execute manual frontend tests and `tests.js` smoke script |
| Reviewer | Verify test coverage in PRs |

---

## 2. Test Concept

### 2.1 Test Objects

| Test Object | Type | File / Location |
|---|---|---|
| `ReservationController` | REST Controller (Java/Spring) | `src/main/java/ims/orariaperti/controller/ReservationController.java` |
| `RoomController` | REST Controller (Java/Spring) | `src/main/java/ims/orariaperti/controller/RoomController.java` |
| `ReservationRepository` | JPA Repository (mocked) | `src/main/java/ims/orariaperti/repository/ReservationRepository.java` |
| `RoomRepository` | JPA Repository (mocked) | `src/main/java/ims/orariaperti/repository/RoomRepository.java` |
| `Reservation` entity | Domain model | `src/main/java/ims/orariaperti/entity/Reservation.java` |
| `Room` entity | Domain model | `src/main/java/ims/orariaperti/entity/Room.java` |
| `ReservationDTO` | Data Transfer Object | `src/main/java/ims/orariaperti/DTO/ReservationDTO.java` |
| `RoomFeatures` | Enum | `src/main/java/ims/orariaperti/utilities/RoomFeatures.java` |
| `NewReservationDialog` | React component (frontend) | `src/components/dialogs/NewReservationDialog.tsx` |
| `CurrentReservation` | React component (frontend) | `src/components/CurrentReservation.tsx` |
| `AccessKeys` | React component (frontend) | `src/components/AccessKeys.tsx` |
| `tests.js` | Manual API smoke test script | `src/main/java/ims/orariaperti/controller/tests.js` |

---

### 2.2 Test Methods

| Method | Tool / Framework | Layer |
|---|---|---|
| Unit test with MockMvc | JUnit, Mockito, Spring MockMvc | Backend |
| Mock-based repository isolation | `@MockitoBean` (Spring Test) | Backend |
| JSON assertion | `jsonPath()` (MockMvc ResultMatchers) | Backend |
| HTTP status assertion | `status().isOk()`, `.isBadRequest()`, etc. | Backend |
| Manual smoke testing | `tests.js` via Node.js / Browser DevTools | API |
| Frontend Integration Testing | Vitest | Frontend |

---

### 2.3 Test Cases

#### TC-R01 — GET /api/reservation: No keys provided → 400 Bad Request

| Field | Value |
|---|---|
| **Test ID** | TC-R01 |
| **Object** | `ReservationController.getReservation()` |
| **Precondition** | No headers provided |
| **Input** | `GET /api/reservation` (no headers) |
| **Expected Result** | HTTP 400 |
| **Method** | Unit Test (`@WebMvcTest`) |
| **Status** | ✅ Implemented (`getReservationsReturnsBadRequestWhenNoKeysProvided`) |

---

#### TC-R02 — GET /api/reservation: Valid privateKey → 200 with reservation data

| Field | Value |
|---|---|
| **Test ID** | TC-R02 |
| **Object** | `ReservationController.getReservation()` |
| **Precondition** | Reservation exists in repository (mocked) |
| **Input** | `GET /api/reservation` with `privatekey` header = valid UUID |
| **Expected Result** | HTTP 200, JSON with `privateKey`, `publicKey`, `reservationDetails.id` |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`getReservationsReturnsReservationByPrivateKey`) |

---

#### TC-R03 — GET /api/reservation: Unknown publicKey → 404 Not Found

| Field | Value |
|---|---|
| **Test ID** | TC-R03 |
| **Object** | `ReservationController.getReservation()` |
| **Precondition** | Repository returns empty for given publicKey (mocked) |
| **Input** | `GET /api/reservation` with `publickey` = unknown UUID |
| **Expected Result** | HTTP 404 |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`getReservationsReturnsNotFoundWhenPublicKeyDoesNotExist`) |

---

#### TC-R04 — POST /api/reservation: Invalid participants → 400 Bad Request

| Field | Value |
|---|---|
| **Test ID** | TC-R04 |
| **Object** | `ReservationController.createReservation()` |
| **Precondition** | — |
| **Input** | POST body with `participants: "Alice, Bob1"` (numeric in name) |
| **Expected Result** | HTTP 400; `reservationRepository.save()` never called |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`createReservationReturnsBadRequestForInvalidParticipants`) |

---

#### TC-R05 — POST /api/reservation: Time overlap with existing → 400 Bad Request

| Field | Value |
|---|---|
| **Test ID** | TC-R05 |
| **Object** | `ReservationController.createReservation()` |
| **Precondition** | An existing reservation occupies 09:30–10:30 on the same date |
| **Input** | POST body for 10:00–11:00, same room |
| **Expected Result** | HTTP 400; save not called |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`createReservationReturnsBadRequestWhenTimeOverlaps`) |

---

#### TC-R06 — POST /api/reservation: Valid input → 200 with keys

| Field | Value |
|---|---|
| **Test ID** | TC-R06 |
| **Object** | `ReservationController.createReservation()` |
| **Precondition** | Room exists; no existing overlapping reservations |
| **Input** | Valid `ReservationDTO` (date, times, roomId, description, valid participants) |
| **Expected Result** | HTTP 200; response contains `reservation.room.id`, `privateKey`, `publicKey`; save called |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`createReservationPersistsAndReturnsKeysForValidInput`) |

---

#### TC-R07 — DELETE /api/reservation/{id}: No privateKey → 401 Unauthorized

| Field | Value |
|---|---|
| **Test ID** | TC-R07 |
| **Object** | `ReservationController.deleteReservation()` |
| **Precondition** | — |
| **Input** | `DELETE /api/reservation/{id}` with no `privateKey` header |
| **Expected Result** | HTTP 401; delete never called |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`deleteReservationReturnsUnauthorizedWhenNoPrivateKey`) |

---

#### TC-R08 — DELETE /api/reservation/{id}: Wrong privateKey → 401 Unauthorized

| Field | Value |
|---|---|
| **Test ID** | TC-R08 |
| **Object** | `ReservationController.deleteReservation()` |
| **Precondition** | Reservation exists (mocked) |
| **Input** | `DELETE /api/reservation/{id}` with a different UUID as `privateKey` |
| **Expected Result** | HTTP 401; delete never called |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`deleteReservationReturnsUnauthorizedWhenPrivateKeyIsWrong`) |

---

#### TC-R09 — DELETE /api/reservation/{id}: Correct privateKey → 200 OK

| Field | Value |
|---|---|
| **Test ID** | TC-R09 |
| **Object** | `ReservationController.deleteReservation()` |
| **Precondition** | Reservation exists with known privateKey |
| **Input** | `DELETE /api/reservation/{id}` with correct `privateKey` header |
| **Expected Result** | HTTP 200; `reservationRepository.delete(reservation)` called |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`deleteReservationDeletesReservationWhenPrivateKeyMatches`) |

---

#### TC-R10 — PUT /api/reservation/{id}: No privateKey → 401 Unauthorized

| Field | Value |
|---|---|
| **Test ID** | TC-R10 |
| **Object** | `ReservationController.updateReservation()` |
| **Precondition** | — |
| **Input** | `PUT /api/reservation/{id}` with no header, valid body |
| **Expected Result** | HTTP 401 |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`updateReservationReturnsUnauthorizedWhenNoPrivateKey`) |

---

#### TC-R11 — PUT /api/reservation/{id}: Invalid participants → 400 Bad Request

| Field | Value |
|---|---|
| **Test ID** | TC-R11 |
| **Object** | `ReservationController.updateReservation()` |
| **Precondition** | Reservation exists |
| **Input** | PUT with valid `privateKey`, body with `participants: "Alice, Bob1"` |
| **Expected Result** | HTTP 400 |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`updateReservationReturnsBadRequestForInvalidParticipants`) |

---

#### TC-R12 — PUT /api/reservation/{id}: Valid input → 200 with updated data

| Field | Value |
|---|---|
| **Test ID** | TC-R12 |
| **Object** | `ReservationController.updateReservation()` |
| **Precondition** | Reservation + room exist (mocked) |
| **Input** | PUT with correct `privateKey` and valid DTO |
| **Expected Result** | HTTP 200; response `description` and `participants` match DTO; save called |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`updateReservationUpdatesReservationWhenInputIsValid`) |

---

#### TC-ROOM01 — GET /api/room: No rooms exist → 404 Not Found

| Field | Value |
|---|---|
| **Test ID** | TC-ROOM01 |
| **Object** | `RoomController.getRooms()` |
| **Precondition** | `roomRepository.findAll()` returns empty list |
| **Input** | `GET /api/room` |
| **Expected Result** | HTTP 404 |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`getRoomsReturnsNotFoundWhenNoRoomsExist`) |

---

#### TC-ROOM02 — GET /api/room: Rooms exist → 200 with mapped room list

| Field | Value |
|---|---|
| **Test ID** | TC-ROOM02 |
| **Object** | `RoomController.getRooms()` |
| **Precondition** | Room with number "101", features `[BEAMER, WIFI]` is mocked |
| **Input** | `GET /api/room` |
| **Expected Result** | HTTP 200; JSON array with correct `id`, `roomNumber`, `roomFeatures` values |
| **Method** | Unit Test |
| **Status** | ✅ Implemented (`getRoomsReturnsMappedRoomsWhenDataExists`) |

---

#### TC-SMOKE01 — Full lifecycle: Create → Read → Update → Delete

| Field | Value |
|---|---|
| **Test ID** | TC-SMOKE01 |
| **Object** | Full API (all endpoints chained) |
| **Precondition** | Backend running on `localhost:8080`, at least one room seeded in DB |
| **Input** | Execute `tests.js` via Node.js or browser DevTools |
| **Expected Result** | All console outputs show valid data; DELETE returns status 200 |
| **Method** | Manual API smoke test |
| **Status** | ✅ Script exists (`tests.js`); must be run manually |

---

#### TC-FE01 — Frontend: Create reservation via dialog

| Field | Value |
|---|---|
| **Test ID** | TC-FE01 |
| **Object** | `NewReservationDialog.tsx` |
| **Precondition** | App running, rooms available |
| **Steps** | 1. Open app, 2. Click "New Reservation", 3. Fill in all fields, 4. Submit |
| **Expected Result** | Success dialog with `privateKey` and `publicKey` displayed |
| **Method** | Automated Vitest test |
| **Status** | ✅ Implemented |

---

#### TC-FE02 — Frontend: Look up reservation by publicKey

| Field | Value |
|---|---|
| **Test ID** | TC-FE02 |
| **Object** | `AccessKeys.tsx`, `CurrentReservation.tsx` |
| **Precondition** | An existing reservation's publicKey is known |
| **Steps** | 1. Enter publicKey in lookup field, 2. Submit |
| **Expected Result** | Reservation details shown (read-only: no edit/delete options) |
| **Method** | Automated Vitest test |
| **Status** | ✅ Implemented |

---

#### TC-FE03 — Frontend: Look up reservation by privateKey

| Field | Value |
|---|---|
| **Test ID** | TC-FE03 |
| **Object** | `AccessKeys.tsx`, `CurrentReservation.tsx` |
| **Precondition** | An existing reservation's privateKey is known |
| **Steps** | 1. Enter privateKey in lookup field, 2. Submit |
| **Expected Result** | Reservation shown with edit and delete options enabled |
| **Method** | Automated Vitest test |
| **Status** | ✅ Implemented |

---

#### TC-FE04 — Frontend: Delete reservation with privateKey

| Field | Value |
|---|---|
| **Test ID** | TC-FE04 |
| **Object** | `DeleteSingleReservationDialog.tsx` |
| **Precondition** | Reservation loaded via privateKey |
| **Steps** | 1. Click Delete, 2. Confirm in dialog |
| **Expected Result** | Reservation removed; UI resets |
| **Method** | Automated Vitest test |
| **Status** | ✅ Implemented |

---

### 2.4 Test Infrastructure

#### Backend

| Component | Technology |
|---|---|
| Language | Java 21+ |
| Framework | Spring Boot |
| Test Framework | JUnit 5 (`@Test`) |
| Mock Framework | Mockito (`@MockitoBean`) |
| HTTP Test Layer | Spring MockMvc (`@WebMvcTest`) |
| JSON Parsing | Jackson (`ObjectMapper`) |
| Build Tool | Maven (`./mvnw test`) |
| Test location | `OrariAperti/backend/src/test/java/ims/orariaperti/` |

#### Frontend

| Component | Technology |
|---|---|
| Language | TypeScript |
| Framework | React + Vite |
| UI Components | shadcn/ui |
| Test Framework | Vitest |
| Manual testing | Browser (Chrome/Firefox DevTools) |

#### Infrastructure / Deployment

| Component | Technology |
|---|---|
| Containerization | Docker + `compose.yml` |
| Frontend server | nginx in Docker. Vite Dev server in Development |
| Backend server | Spring Boot embedded Tomcat (`localhost:8080`) |
| API spec | OpenAPI 3.1 (`backend-openapi.yaml`) |
| Environment config | `.env` (based on `.env.example`) |

#### Running the Tests

```bash
# Backend unit tests
cd OrariAperti/backend
./mvnw test

# Frontend tests (coming soon)
cd OrariAperti/frontend
npm install --force
npm run test

# Manual API smoke test
# 1. Start backend server (e.g., via Docker or `./mvnw spring-boot:run`)
# 2. Run tests.js via Node.js or browser console
```
