# Predictive AI Frontend

A React application for malnutrition assessment with multilingual support.

## Features

- User registration and management
- Malnutrition assessment with WHO standards
- Dashboard with health metrics
- Hospital finder
- Multilingual support (English, Hindi)
- Voice assistance

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Go to vercel.com
2. Connect your GitHub repository
3. Deploy automatically

### Netlify

1. Go to netlify.com
2. Drag and drop the `build` folder
3. Or connect GitHub repository

### Manual Deployment

1. Build the application: `npm run build`
2. Upload the `build` folder to any static hosting service
3. Configure the API base URL in the environment

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_BASE_URL=https://your-api-url.com
```

## API Integration

The frontend expects the backend API to be available at the configured base URL. Make sure to update the API calls in the components to use the correct backend URL.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
