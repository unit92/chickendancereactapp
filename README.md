# Chickendancereactapp

This repository contains a small React application that renders a dancing chicken using three.js.

The app now includes generated audio using the Web Audio API and a camera playlist feature that tweens the camera through preset locations.

## Development

```bash
cd frontend
npm install
npm run dev
```

The dancing chicken model is located in `public/Chicken.glb` and loaded using Three.js.

Press **Play Sound** in the interface to generate a simple melody using the Web Audio API. The **Play Camera Playlist** button animates the camera through several preset viewpoints.
