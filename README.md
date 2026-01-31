# Car E-commerce Platform

A modern car e-commerce platform designed to provide a seamless buying experience. This project combines a dynamic React frontend with a robust PHP backend.

## Tech Stack

### Frontend
- **React**: Library for building user interfaces.
- **Vite**: Next Generation Frontend Tooling.
- **TypeScript**: Typed superset of JavaScript.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn UI**: Re-usable components built using Radix UI and Tailwind CSS.
- **TanStack Query**: Powerful asynchronous state management.

### Backend
- **PHP**: Server-side scripting language.

## Getting Started

### Prerequisites
- Node.js & npm
- PHP installed locally or a local server environment (like XAMPP, MAMP, or Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kumailthe1/car-ecommerce.git
   cd car-ecommerce
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Setup**
   - Ensure your PHP server is running.
   - Configure your web server to point to the `backend` directory or serve the root if using a router.
   - Adjust `serverController.php` or `serverAction.php` configuration if necessary for database connections.

## Project Structure

- `/src` - React frontend source code
- `/backend` - PHP backend logic and API endpoints
- `/public` - Static assets
