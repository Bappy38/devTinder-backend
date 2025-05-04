# DevTinder Backend

This is the backend server for DevTinder – a developer matching and chatting platform. It is built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- RESTful API for user authentication, profile, connection requests
- Real-time messaging support
- JWT-based authentication
- MongoDB for data persistence
- CORS and secure cookie handling

## 🛠 Tech Stack

- **Node.js** – Runtime
- **Express.js** – Server framework
- **MongoDB + Mongoose** – Database and ODM
- **JWT** – Auth
- **Socket.io** – Real-time communication
- **cookie-parser** – For managing session cookies

## 📦 Installation

```bash
git clone https://github.com/your-username/devtinder-backend.git
cd devtinder-backend
npm install
```

## 🔐 Environment Variables

```
MONGO_CONNECTION=<CONNECTION_STRING>
PORT=3000
SECRET_KEY=<SECRET_KEY>
TOKEN_EXPIRES_IN=<EXPIRY_TIME>
COOKIE_EXPIRES_IN_MS=<EXPIRY_TIME>
```

## 🚀 Deployment

Deployed on AWS EC2. Used `NGINX proxy pass` to forward /api routes to the port backend service is running on.
