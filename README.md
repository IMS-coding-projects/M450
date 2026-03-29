# 🧪 OrariAperti – Testing Setup (JUnit + React Testing Library)

This repository extends the dockerized full-stack application with **automated tests** for both backend and frontend.

The application still consists of:

* **MySQL database**
* **Spring Boot backend (with JUnit)**
* **React frontend (with @testing-library/react)**

---

## 🎯 Goal

This setup is used for:

* Testing backend logic with **JUnit**
* Testing UI components with **React Testing Library**
* Ensuring functionality before deployment
* Integration into CI/CD pipelines

---

## 🚀 Quick Start (including tests)

1. Clone the repository

   ```bash
   git clone https://github.com/IMS-coding-projects/M450.git
   ```

2. Rename or copy `.env.example` to `.env`

3. Start the containers

   ```bash
   docker compose up -d
   ```

4. Run tests

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

The backend uses **JUnit 5** for unit and integration tests.

### 🔧 Technologies

* JUnit 5
* Spring Boot Test
* Mockito (for mocks)

### 📁 Structure

```bash
backend/
├── src/
│   ├── main/
│   └── test/
│       ├── java/
│       │   └── ...Tests
```

### ▶️ Run tests

```bash
mvn test
```

### ✅ Example

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

The frontend uses **@testing-library/react** for component-based tests.

### 🔧 Technologies

* @testing-library/react
* @testing-library/jest-dom
* Vitest or Jest (depending on setup)

### 📁 Structure

```bash
frontend/
├── src/
│   ├── components/
│   ├── __tests__/
│   │   └── ...
```

### ▶️ Run tests

```bash
npm run test
```

### ✅ Example

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

Tests can be executed directly inside the containers:

| Service  | Command                                     |
| -------- | ------------------------------------------- |
| Backend  | `docker compose exec backend mvn test`      |
| Frontend | `docker compose exec frontend npm run test` |

👉 Advantage:

* Same environment for all developers
* No local dependency issues

---

## 🔄 Continuous Integration (optional)

Recommended:

* Run tests automatically on every push
* Integration with GitHub Actions

Example:

```yaml
- name: Run Backend Tests
  run: mvn test

- name: Run Frontend Tests
  run: npm run test
```

---

## 📦 Unchanged Structure

The actual application remains identical to the original project:
👉 [https://github.com/IMS-coding-projects/M223](https://github.com/IMS-coding-projects/M223)

---

## 📁 Important Notes

* `.env` must exist
* Database must be running for integration tests
* Frontend tests run independently from the backend

---

## 📚 References

* JUnit 5
* React Testing Library
* Spring Boot Testing
* Docker Compose
