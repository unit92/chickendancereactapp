# Developer Guide

This document outlines how to work on the Chicken Dance React app.

## Getting Started

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   This starts Vite and opens the app on `http://localhost:5173` by default.

## Building for Production

Run `npm run build` to generate a production build in the `dist` folder. You can preview it locally with `npm run preview`.

## Code Quality

Use ESLint to lint the project:
```bash
npm run lint
```
Linting is based on the standard React configuration provided in this repository.

## Project Structure

- `frontend/src/App.jsx` – main React component containing the three.js scene and UI.
- `frontend/public/Chicken.glb` – the 3D chicken model loaded at runtime.
- `tailwind.config.js` and `postcss.config.js` – Tailwind CSS configuration.

## Features

- A looping dancing chicken animation rendered with three.js.
- Drag and drop camera playlist that tweens the camera through preset angles.
- Simple sound generator using the Web Audio API.

Happy hacking!
