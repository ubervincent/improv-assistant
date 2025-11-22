---
description: How to deploy the Improv Assistant application
---

# Deployment Guide

The Improv Assistant is a Next.js application. The easiest and most recommended way to deploy it is using [Vercel](https://vercel.com), the creators of Next.js.

## Option 1: Deploy to Vercel (Recommended)

1.  **Push to GitHub**: Ensure your project is pushed to a GitHub repository.
2.  **Import to Vercel**:
    *   Go to [vercel.com](https://vercel.com) and sign up/login.
    *   Click "Add New..." -> "Project".
    *   Import your GitHub repository.
3.  **Configure**:
    *   Vercel automatically detects Next.js.
    *   **Build Command**: `npm run build` (default)
    *   **Output Directory**: `.next` (default)
    *   **Install Command**: `npm install` (default)
4.  **Deploy**: Click "Deploy".

## Option 2: Docker / Self-Hosted

You can build a Docker image for the application.

1.  **Build**:
    ```bash
    npm run build
    ```
2.  **Start**:
    ```bash
    npm run start
    ```

## Important Notes

*   **Microphone Access**: For the pitch detection to work on a deployed site, the site **MUST be served over HTTPS**. Vercel provides this automatically.
*   **Browser Permissions**: Users will need to allow microphone access when they first visit the site.
