# DevTinder Backend

This is the backend for **DevTinder**, a Tinder-like application designed specifically for developers to connect, collaborate, and chat. It is built with a modern Node.js stack, featuring a scalable real-time chat system and a robust API.

## 🚀 Features

- **User Authentication:** Secure user registration and login system using JSON Web Tokens (JWT) for session management and `bcrypt` for password hashing.
- **Developer Profile:** Users can create and manage their profiles, showcasing their skills, bio, and personal information.
- **Connection System:** A "Tinder-style" swipe-and-match system where users can express interest in one another. A mutual interest results in a connection.
- **Real-time Chat:** Once connected, users can communicate through a private, real-time chat room. The system supports message history and pagination.
- **Live User Feed:** A dynamic feed that shows potential connections, filtering out users who have already been seen or connected with.
- **User Presence:** Tracks and displays the `lastSeen` status of users, indicating their online presence.
- **API & Chat Security:** Implemented rate limiting on both the API endpoints and the chat to prevent spam and abuse.
- **Email Notifications:** Integrated with AWS Simple Email Service (SES) to send email notifications for events like new connection requests.
- **Scalable & Containerized:** The entire application is containerized using Docker and Docker Compose, and the chat system is built to scale horizontally using the Socket.IO Redis adapter.

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-time Communication:** Socket.IO
- **Scalability & Caching:** Redis (for Socket.IO adapter and rate limiting)
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Containerization:** Docker, Docker Compose
- **Email Service:** AWS SES

## 📦 Technical Challenges Resolved

- **Scalable Real-time Chat:** A key challenge was building a chat system that could support a growing number of users without performance degradation. This was solved by using the **Socket.IO Redis Adapter**, which allows broadcasting events across multiple server instances, enabling horizontal scaling.

- **API Security:** To protect the application from common vulnerabilities, a multi-layered security approach was implemented:
    - **Authentication:** All sensitive routes are protected with a JWT middleware.
    - **Rate Limiting:** A flexible rate limiter (`rate-limiter-flexible`) was applied to both API routes and socket events to prevent brute-force attacks and spam.
    - **Input Validation:** User input is validated to prevent malformed data from entering the system.

- **Efficient Database Querying:** The application requires complex queries to fetch user feeds (excluding certain users) and connections. This was optimized by carefully structuring Mongoose queries, using operators like `$or` and `$nin`, and populating related data efficiently.

- **State Management in a Distributed System:** Tracking user presence (`lastSeen`) and managing socket connections across multiple instances was handled by leveraging Redis and a persistent database (MongoDB) as the single source of truth.

- **Simplified Deployment:** The complexity of deploying a multi-service application (Node.js, MongoDB, Redis) was abstracted away using **Docker and Docker Compose**. This creates a reproducible and isolated environment for both development and production.