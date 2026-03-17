# 🧪 OrariAperti – Testing Setup (JUnit + React Testing Library)

Dieses Repository erweitert die dockerisierte Full-Stack-Anwendung um **automatisierte Tests** für Backend und Frontend.

Die Anwendung besteht weiterhin aus:

* **MySQL-Datenbank**
* **Spring Boot Backend (mit JUnit)**
* **React Frontend (mit @testing-library/react)**

---

## 🎯 Ziel

Dieses Setup dient zum:

* Testen von Backend-Logik mit **JUnit**
* Testen von UI-Komponenten mit **React Testing Library**
* Sicherstellen der Funktionalität vor Deployment
* Integration in CI/CD-Pipelines

---

## 🚀 Schnellstart (inkl. Tests)

1. Repository klonen

   ```bash
   git clone https://github.com/IMS-coding-projects/M450.git
   ```

2. `.env.example` → `.env` umbenennen / kopieren und dann umbenennen

3. Container starten

   ```bash
   docker compose up -d
   ```

4. Tests ausführen

   **Backend (JUnit):**

   ```bash
   docker compose exec backend mvn test
   ```

   **Frontend (React Testing Library):**

   ```bash
   docker compose exec frontend npm run test
   ```

---

## 🧪 Backend Testing – JUnit

Das Backend verwendet **JUnit 5** für Unit- und Integrationstests.

### 🔧 Technologien

* JUnit 5
* Spring Boot Test
* Mockito (für Mocks)

### 📁 Struktur

```bash
backend/
├── src/
│   ├── main/
│   └── test/
│       ├── java/
│       │   └── ...Tests
```

### ▶️ Test ausführen

```bash
mvn test
```

### ✅ Beispiel

```java
@SpringBootTest
class RoomServiceTest {

    @Test
    void shouldReturnAllRooms() {
        assertNotNull(roomService.getAllRooms());
    }
}
```

---

## ⚛️ Frontend Testing – React Testing Library

Das Frontend verwendet **@testing-library/react** für komponentenbasierte Tests.

### 🔧 Technologien

* @testing-library/react
* @testing-library/jest-dom
* Vitest oder Jest (abhängig von Setup)

### 📁 Struktur

```bash
frontend/
├── src/
│   ├── components/
│   ├── __tests__/
│   │   └── ...
```

### ▶️ Test ausführen

```bash
npm run test
```

### ✅ Beispiel

```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders headline', () => {
  render(<App />);
  expect(screen.getByText(/OrariAperti/i)).toBeInTheDocument();
});
```

---

## 🐳 Docker & Testing

Tests können direkt innerhalb der Container ausgeführt werden:

| Service  | Command                                     |
| -------- | ------------------------------------------- |
| Backend  | `docker compose exec backend mvn test`      |
| Frontend | `docker compose exec frontend npm run test` |

👉 Vorteil:

* Gleiche Umgebung für alle Entwickler
* Keine lokalen Abhängigkeitsprobleme

---

## 🔄 Continuous Integration (optional)

Empfohlen:

* Tests automatisch bei jedem Push ausführen
* Integration mit GitHub Actions

Beispiel:

```yaml
- name: Run Backend Tests
  run: mvn test

- name: Run Frontend Tests
  run: npm run test
```

---

## 📦 Unveränderte Struktur

Die eigentliche Anwendung bleibt identisch mit dem Originalprojekt:
👉 [https://github.com/IMS-coding-projects/M223](https://github.com/IMS-coding-projects/M223)

---

## 📁 Wichtige Hinweise

* `.env` muss vorhanden sein
* Datenbank muss laufen für Integrationstests
* Frontend-Tests laufen unabhängig vom Backend

---

## 📚 Referenzen

* JUnit 5
* React Testing Library
* Spring Boot Testing
* Docker Compose

---

If you want, I can also:

* add **integration tests with Testcontainers**
* or set up a **full CI pipeline (GitHub Actions ready)**
* or include **coverage reports (JaCoCo + Vitest coverage)**
