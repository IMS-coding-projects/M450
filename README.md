# OrariAperti – Dockerisierte Full-Stack-Anwendung

Dieses Projekt ist eine containerisierte Full-Stack-Anwendung, die aus einer **MySQL-Datenbank**, einem **Spring Boot-Backend** und einem **Vite + React-Frontend** besteht. Docker und Docker Compose werden für eine nahtlose Entwicklung und Bereitstellung verwendet.

---

## Projekt

Dieses Repository enthält eine Docker-Version von [OrariAperti (M223)](https://github.com/IMS-coding-projects/M223), die eine schnellere und zuverlässigere Bereitstellung mit Docker ermöglicht.

OrariAperti ist ein Mehrbenutzer-Raumreservierungssystem, das mit Spring Boot (Java) für das Backend und React (TypeScript, Vite) für das Frontend erstellt wurde.

Die Anwendung selbst bleibt unverändert – die Verbesserung besteht in der vereinfachten Bereitstellung durch Docker Compose.

## 🚀 Schnellstart

1. Klonen Sie dieses Repository.
   `git clone https://github.com/IMS-coding-projects/M347.git`
2. Benennen Sie `.env.example` in `.env` um.
3. Starten Sie die Container.
   `docker compose up -d`

Die App ist in Kürze betriebsbereit.

## 🔗 Ursprüngliches Projekt

Weitere Informationen zur App selbst finden Sie im [ursprünglichen OrariAperti-Repository](https://github.com/IMS-coding-projects/M223).

---

## 📦 Projektstruktur

```bash.

├── .dockerignore
├── README.md
├── .env
├── compose.yml
├── OrariAperti/
│   ├── backend/
│   │   ├── Dockerfile
│   │   └── ...
│   └── frontend/
│       ├── Dockerfile
│       └── ...
````

> [!NOTE]
> Beim Klonen des Repositorys finden Sie eine Datei namens `.env.example` im Stammverzeichnis des Ordners. Sie müssen diese Datei in `.env` umbenennen, damit sie ordnungsgemäss ausgeführt wird.

---

## 🐳 Aufsetzung

Diese Einrichtung besteht aus drei Diensten:

### 1. **MySQL-Datenbank**

* **Image**: `mysql:8.0`

* **Umgebungsvariablen**: Werden aus Sicherheits- und Flexibilitätsgründen über `.env` verwaltet.

* **Volumes**: Verwendet ein benanntes Volume (`db_data`) zur Speicherung von Daten.

---

### 2. **Backend – Spring Boot App**

* **Build-Stage-Basisimage**: `maven:3.9.6-eclipse-temurin-21`

   * **Warum?**
    Dieses Image bündelt Maven mit OpenJDK 21 (Eclipse Temurin), was ideal für die moderne Java-Entwicklung ist. Maven wird benötigt, um die App während der Build-Phase zu kompilieren und zu packen.

* **Basisimage für die Ausführungsphase**: `eclipse-temurin:21-jre`

   * **Warum?**
    Dieses reine JRE-Image ist kleiner als ein vollständiges JDK und für die Ausführung von Java-Anwendungen in der Produktion optimiert. Durch die Verwendung eines mehrstufigen Builds werden Build- und Laufzeitaspekte voneinander getrennt, wodurch die endgültige Image-Grösse reduziert wird.

* **Ports**: Stellt Port `8080` bereit.

* **Abhängigkeiten**: Verwendet den MySQL-Container (`db`) über internes Netzwerk (via bridge verbunden).

---

### 3. **Frontend – Vite + React**

* **Basisimage für die Build-Phase**: `node:20-alpine`

   * **Warum?**
    Node.js 20 ist das aktuelle LTS und Alpine wird für minimalen Speicherbedarf und schnellere Builds verwendet. Das Flag `--force` in `npm install` gewährleistet die Kompatibilität während der Installation von Abhängigkeiten.

* **Basisimage für die Produktionsphase**: `nginx:alpine`

   * **Warum?**
    Nginx stellt die von Vite erstellten statischen Dateien effizient bereit. Alpine hält die Image-Grösse klein und wird häufig in produktionsreifen Frontend-Bereitstellungen verwendet.

* **Benutzerdefinierte Nginx-Konfiguration**: Bietet eine fein abgestimmte Bereitstellung statischer Dateien. [siehe hier](https://github.com/IMS-coding-projects/M347/blob/main/OrariAperti/frontend/nginx.conf)

* **Ports**: Stellt Port `3000` bereit.

> [!NOTE]
> Sie können diesen bequem über das `.env` im Rootverzeichnis ändern.

---

## 🧾 .env-Konfiguration

Alle sensiblen und umgebungsspezifischen Variablen (z. B. DB-Anmeldedaten, Portnummern) werden in `.env` gespeichert. Dies ermöglicht:

* Einfache Anpassung
* Entkopplung der Konfiguration vom Code
* Bessere Verwaltung von Geheimnissen (funktioniert mit `.gitignore`)

---

## 🚫 .dockerignore

Dateien, die während des Docker-Builds ignoriert werden:

* Entwicklungsartefakte (`*.log`, `*.class`, `node_modules`, `dist` usw.)
* IDE- und Systemdateien (`.idea`, `.vscode`, `.DS_Store`)
* Quellarchive (`*.jar`, `*.zip`, `*.tar.gz`)
* Hält den Build-Kontext sauber und verbessert die Leistung.

---

## 🔄 Docker Compose

Definiert in `compose.yml`:

* Deklariert drei Dienste: `db`, `backend` und `frontend`
* Verbindet sie über ein gemeinsames benutzerdefiniertes **Bridge**-Netzwerk `orariaperti-net`
* Legt die Abhängigkeitsreihenfolge über `depends_on` fest
* Ordnet Ports für die lokale Entwicklung via `.env`-Datei zu:

---

## 📁 Volumes und Netzwerke

* `db_data`: Benanntes Volume zum Speichern von MySQL-Daten.
* `orariaperti-net`: **Bridge**-Netzwerk, das die Kommunikation zwischen Containern anhand ihres Namens (`db`, `backend`, `frontend`) ermöglicht.

---

## 📚 Referenzen

* [Offizielle Docker-Dokumentation](https://docs.docker.com/)
* [MySQL Docker Image](https://hub.docker.com/_/mysql)
* [Eclipse Temurin](https://hub.docker.com/_/eclipse-temurin)
* [Nginx Alpine](https://hub.docker.com/_/nginx)
* [Vite](https://vitejs.dev/)
* [Spring Boot](https://spring.io/projects/spring-boot)
