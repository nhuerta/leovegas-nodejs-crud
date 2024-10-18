# Leovegas Node.js CRUD API

## Project Overview

This is a RESTful API built using Node.js and MySQL, following the JSON:API specification. The API allows creating, reading, updating, and deleting users with role-based access control (RBAC) for **USER** and **ADMIN** roles. It also provides validation, JSON Web Token (JWT) authentication, and proper status codes for all scenarios. The API is designed with best practices in mind, including the separation of concerns, middleware for authentication, and proper unit testing coverage.

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the API](#running-the-api)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [TODO](#todo)
- [License](#license)

## Project Structure

```
leovegas-nodejs-crud/
.
├── NodeJS API test.pdf
├── README.md
├── curl.txt
├── package-lock.json
├── package.json
├── public
│   └── users.html
├── src
│   ├── app.js
│   ├── db.js
│   ├── logger.js
│   ├── middleware
│   │   └── auth.js
│   ├── models
│   │   └── user.js
│   └── routes
│       └── users.js
└── test
    ├── helper.js
    └── user_test.js
```

- **`src/app.js`**: Main entry point of the application.
- **`src/middleware/auth.js`**: Middleware for JWT authentication.
- **`src/models/user.js`**: User model to interact with the database.
- **`src/routes/users.js`**: User routes to handle API requests.
- **`test/user_test.js`**: Unit tests for the user endpoints.
- **`test/helper.js`**: Helper functions for tests.
- **`public/users.html`**: Frontend interface for user management.

## Features

- **User Management**: Create, read, update, and delete users.
- **Role-Based Access Control (RBAC)**: User roles include `USER` and `ADMIN`.
    - **USER** can view and update their own details.
    - **ADMIN** can manage all users (view, update, and delete), but cannot delete themselves.
- **Authentication**: Secure routes using JWT tokens.
- **Input Validation**: Validates email format and password length.
- **Status Codes**: Proper handling of errors with meaningful status codes (e.g., `403` for unauthorized access, `404` for not found).
- **Unit Tests**: Comprehensive test coverage using Mocha, Chai, and Supertest.

## Requirements

- **Node.js**: v12 or higher
- **MySQL**: v5.7 or higher

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nhuerta/leovegas-nodejs-crud.git
   cd leovegas-nodejs-crud
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Database Setup

1. **Create MySQL Database**:
   ```sql
   CREATE DATABASE leovegas_nodejs_crud;
   USE leovegas_nodejs_crud;

   CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('USER', 'ADMIN') DEFAULT 'USER',
      access_token VARCHAR(255)
    );
   ```

2. **Configure MySQL connection**:
   Update the MySQL connection configuration in `src/db.js`:
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root',
     password: '',
     database: 'leovegas_nodejs_crud'
   });
   ```

## Running the API

1. **Start the server**:
   ```bash
   npm start
   ```

2. The API will be running on `http://localhost:3000/`.

## Testing

1. **Run unit tests**:
   ```bash
   npm test
   ```

The unit tests cover creating a new user, retrieving a user by ID, updating a user, and deleting a user.

## TODO
- Proper session token handling. Expiration time, persistence. If the app runs in a distributed manner, all instances must see the same session token; this is accomplished by storing the token in a shared database or a dedicated service. In the current state, if the app is killed, session tokens are lost since they are being stored in RAM. Users would need to re-login to obtain a new token in this scenario. Also, when running the app in multiple machines, the session token wouldn't be shared across valid sessions. A sticky session mechanism would be required in order to ensure that all requests are routed to the same instance, so that the same token is returned. This is not ideal and not production ready, but it is important to note the limitations of the system given the requirements and time constraints.
- Validate for existing email in the database.
- Strong password validation policy.
- Frontend interface.
- Default error handling middleware so we don't return HTML for error cases that are not covered by the API.
- Pagination API and cursor handling for large result sets when querying the database.

## License

This project is licensed under the ISC License.



