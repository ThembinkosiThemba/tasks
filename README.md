## Task

A modern task and project management application built with Convex.

![image](/public/task.png)

## Features

- Project management
- Task tracking with priorities and status updates
- Daily task scheduling with time slots
- Drag-and-drop task reordering

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ThembinkosiThemba/tasks.git
cd tasks
```

2. Install dependencies:

```bash
npm install --legacy-peer-des
```

3. Set up Convex and server:

This will guide you through creating a Convex project and setting up authentication.

```bash
npm run dev
```

The app will open automatically at http://localhost:5173

## Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## PWA Installation

This app is a Progressive Web App (PWA) and can be installed on your device:

### Desktop (Chrome, Edge, Brave)

1. Visit the deployed web URL
2. Look for the install icon in the address bar (usually a plus sign or computer icon)
3. Click "Install" to add the app to your desktop

Once installed, the app works on device and provides a native app-like experience with auto-updates enabled.

Make sure to configure your Convex deployment URL in the production environment variables.
