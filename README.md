# Foliage Farm - Desktop App

This is the desktop version of the Foliage Farm web application, built with Electron.

## Features

- Cross-platform desktop application (Windows, macOS, Linux)
- Integrated MongoDB database connection
- Secure storage of sensitive data
- Complete user authentication system
- All features of the web version available offline

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or remote)

## Setup

1. Clone the repository or copy the `electron-app` folder to your desired location
2. Navigate to the `electron-app` folder in your terminal
3. Install dependencies:

```bash
npm install
```

4. Ensure MongoDB is running (either locally or remotely)
5. Update the MongoDB URI in `.env` file if needed:

```
MONGO_URI=mongodb://localhost:27017/foliage_farm
```

## Running the App

To start the application in development mode:

```bash
npm start
```

## Building the App

To build the application for your current platform:

```bash
npm run build
```

The built application will be available in the `dist` folder.

## Platform-specific Builds

To build for a specific platform:

### Windows

```bash
npm run build -- --win
```

### macOS

```bash
npm run build -- --mac
```

### Linux

```bash
npm run build -- --linux
```

## Security

This application uses `electron-store` for securely storing sensitive information such as API keys and tokens. The data is encrypted with a secure encryption key.

## Troubleshooting

### MongoDB Connection Issues

If you encounter issues connecting to MongoDB:

1. Ensure MongoDB is running
2. Check the MongoDB URI in the `.env` file
3. Check firewall settings if connecting to a remote database
4. Try running MongoDB locally for testing

### Build Issues

If you encounter issues during the build process:

1. Ensure all dependencies are installed
2. Try clearing the npm cache: `npm cache clean --force`
3. Delete the `node_modules` folder and run `npm install` again

