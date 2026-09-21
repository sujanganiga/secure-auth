# secure-auth
For Secure Authentication, JWT Session Management, Resilience and Logging Capstone Project

Secure Auth is a full-stack authentication project with a Spring Boot backend and a Next.js frontend.

The main focus of the project is implementing authentication securely while also handling token management, login rate limiting, external service failures, and API documentation.

## Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT
- Resilience4j
- Swagger / OpenAPI

### Frontend
- Next.js
- React
- TypeScript
- Axios
- Jest

## Features

- User registration
- User login
- BCrypt password hashing
- JWT access token authentication
- Refresh token support
- Token validation
- Logout and token revocation
- Login rate limiting based on username and IP address
- Circuit breaker for the external login service
- Global exception handling
- CORS configuration
- Request logging
- Swagger UI documentation
- Protected frontend routes
- Login and registration pages
- Password reset page
- Inactivity handling
- Frontend authentication state management

## Project Structure

secure-auth/
│
├── Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   │
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
