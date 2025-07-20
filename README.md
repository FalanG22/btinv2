# ZoneScan

ZoneScan is a modern web application for scanning products and managing logistical zones, built with Next.js and TypeScript.

## Core Features

- **Article Scanning**: A streamlined interface to scan or enter article EANs, recording the time, zone, and user for each scan.
- **Zone Management**: Full CRUD (Create, Read, Update, Delete) functionality for logistical zones where scanning occurs.
- **Article Management**: View, manage, and delete scanned article records.
- **CSV Upload**: A feature to upload article data from a CSV file (UI demonstration).
- **Label Printing**: Print formatted labels for scanned products directly from the application.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Form Management**: React Hook Form with Zod for validation

This project uses Server Components and Server Actions for data fetching and mutations, providing a seamless and efficient user experience without the need for traditional API endpoints.

**Note**: For demonstration purposes, this application uses in-memory mock data instead of a persistent database like MySQL. All CRUD operations manipulate this mock data.

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or yarn

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd zonescan
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

## Application Structure

-   `/src/app` - Contains all the routes and pages of the application, following the Next.js App Router structure.
    -   `/src/app/page.tsx` - The main dashboard for scanning articles.
    -   `/src/app/zones` - The page for managing zones.
    -   `/src/app/articles` - The page for managing scanned articles.
-   `/src/components` - Contains reusable UI components.
    -   `/src/components/ui` - Auto-generated shadcn/ui components.
    -   `/src/components/layout` - Layout components like the sidebar and page headers.
-   `/src/lib` - Contains shared logic, mock data, and server actions.
    -   `/src/lib/data.ts` - Mock data and TypeScript types.
    -   `/src/lib/actions.ts` - Server Actions for data manipulation.
    -   `/src/lib/schemas.ts` - Zod schemas for form validation.
-   `/public` - Static assets.
