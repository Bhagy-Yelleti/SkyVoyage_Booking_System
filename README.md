# ✈️ SkyVoyage Booking System: Full-Stack Flight Reservation Application

This repository contains the complete codebase for the SkyVoyage Booking System, a modern, full-stack application designed to simulate a comprehensive flight reservation experience, including searching, seat selection, and booking management. This is the finalized version configured for local development and demonstration.

---

### ✨ Key Features & Functionality

* **Flight Search & Booking Flow:** Allows users to search for one-way flights, select seats from a dynamic map, input passenger details, and complete a simulated payment process.
* **Booking Management (Local User):** Users can view their past and upcoming bookings and cancel existing trips, which automatically releases reserved seats.
* **Admin Panel:** Includes administrative routes for viewing all system flights and all user bookings for reporting and management (accessible locally).
* **Modern UI/UX:** Built with React and styled using Tailwind CSS and [Shadcn UI](https://ui.shadcn.com/) for a responsive and aesthetically pleasing user experience across devices.

### 🏛️ Technical Architecture

This project employs a robust, three-tier full-stack architecture built on modern JavaScript/TypeScript standards.

* **Frontend (Client):**
    * **Technology:** React with TypeScript.
    * **Styling:** Tailwind CSS and Shadcn UI.
    * **Routing:** `wouter` for lightweight client-side navigation.

* **Backend (Server):**
    * **Technology:** Express.js with TypeScript (`server/index.ts`, `server/routes.ts`).
    * **ORM:** **Drizzle ORM** (TypeScript-native ORM) for managing database interactions.
    * **API Design:** A clean, RESTful API providing data for flights, airports, and booking transactions.

* **Database (Data Layer):**
    * **Platform:** **Neon** (Serverless PostgreSQL).
    * **Data Integrity:** Schema defined in Drizzle and managed with PostgreSQL for reliable, relational data storage.
    * **Seeding:** The database is seeded with necessary mock data (flights, airports) to ensure the application is functional immediately upon setup.

### 🛠️ Development & Deployment Status

This project is fully operational and configured for immediate local execution.

| Area | Technical Achievement |
| :--- | :--- |
| **Authentication** | **Mocked User Authentication:** External login services were intentionally removed. The system uses a **static local user ID (`DUMMY_LOCAL_USER`)** defined in the backend to manage bookings and demonstrate user-specific features (My Trips/Admin Panel). |
| **Database Connectivity** | Successfully connected to a **Neon PostgreSQL** instance using environment variables (`.env`) for secure access and managed by Drizzle ORM. |
| **Project Cleanliness** | All unnecessary files and configuration code related to previous development environments have been removed, resulting in a lean, production-ready folder structure. |

### 🚀 To Run the Application Locally

1.  Clone the repository: `git clone [repository url]`
2.  Install dependencies: `npm install`
3.  Configure environment: Set up your `.env` file with the Neon PostgreSQL connection string.
4.  Run the backend: `npx tsx -r dotenv/config server/index.ts`
5.  Run the frontend: `npm run dev` (or your client start command)
