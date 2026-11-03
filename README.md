# Bulogenda

A minimalist, ultra-lightweight local-first application for tracking prospection, job applications. Built with a strict, clean architecture (Python standard library, SQLite, and native ES Modules).

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:
* **Python** (version 3.9 or higher)
* **SQLite3** (built-in and included by default with Python)

## 🚀 Installation & Usage

1. **Clone or copy (zip) the repository**:
   ```bash
   git clone <repository-url>
   cd bulogenda
   ```

2. **Create and activate a virtual environment** (recommended):
   ```bash
   python -m venv venv
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   ```

3. **Install the package in editable mode**:
   ```bash
   pip install -e .
   ```

4. **Run the application**:
   ```bash
   bulogenda
   ```
   *(The local server will start and automatically open your default web browser to `http://127.0.0.1:8765`)*.

---

## 🛠️ Launch Options

You can customize the server behavior via command-line arguments:

* **Change the port**: `bulogenda --port 8080`
* **Specify a custom SQLite database file**: `bulogenda --db ./my-database.db`
* **Start without automatically opening the browser**: `bulogenda --no-browser`

---

## 📂 Project Structure

* **`src/backend/`** : Standard HTTP server, domain controllers, SQLite engine & repository, and static file service.
* **`src/frontend/`** : Modular user interface featuring semantic HTML partials, layered CSS, and native ES Modules.

---

## 🗄️ Data Storage (Local-First)

All your data (contacts, opportunities, appointments, and interaction history) is stored securely and completely privately in a single SQLite database file named suivi.db.
This file is created automatically and resides directly at the root directory where the application code is located. No external database server or complex configuration is required.

### 📱 How to Back Up or Migrate Your Data to Another Device?

Since everything is contained in a single suivi.db file, backup and migration are extremely straightforward:

### Backup / Copy:
Close the application, then simply copy the suivi.db file located at the root of your project directory.

### Migration to another device:

Transfer the suivi.db file to your new device (via USB stick, local network share, personal cloud storage, etc.).

Place it in the exact same location (at the root of the application folder on the new device).

Launch the application (bulogenda): it will instantly detect you