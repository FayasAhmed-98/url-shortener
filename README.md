# url-shortener
A scalable and efficient URL Shortening Service built with Node.js, Express.js, and MongoDB. This service allows users to shorten long URLs into unique short URLs and redirect from short URLs to the original URLs. It features a RESTful API for URL creation and redirection, input validation, caching for improved performance, and basic error handling.


## Features

- Shortens long URLs into short, unique identifiers.
- Redirects shortened URLs to their original long URLs.
- Caches frequent lookups to improve performance.
- Includes a Swagger API for better documentation and testing.


# Architecture

## Architecture Diagram


The architecture of the URL Shortener service is designed to be simple yet robust, enabling fast response times and easy scalability.


![App Screenshot](https://github.com/user-attachments/assets/55ef66dd-c098-4259-b3e3-17e6298ea3d3)

Below is a detailed description of the components, scalability strategy, fault tolerance, and data consistency mechanisms:


## Components
1. Client
- The client interacts with the service through RESTful API endpoints. This can be a web interface, mobile application, or any other API consumer.

2. API Server (Express.js)
- **Role**:  Node.js with Express.js handles HTTP requests and serves API endpoints. It provides endpoints for:
- Shortening a long URL (`POST /shorten`).
- Redirecting a shortened URL to its original long URL (`GET /:short_url`).
- **Why Express.js?**: It is lightweight, efficient, and well-suited for building REST APIs.

3. Database (MongoDB)
- **Role**: Stores original URLs, their corresponding shortened URLs, and metadata such as creation and expiration timestamps.
- **Why MongoDB?**: Its schema flexibility and indexing capabilities allow for fast lookups and easy scalability as the dataset grows.
- **Schema Design**
- `short_url`: Unique identifier for the shortened URL.
- `long_url`: The original long URL.
- `created_at`: Timestamp when the entry was created.
- `expires_at (optional)`: Optional expiration timestamp.

4. Caching Layer (Node-Cache)
- **Role**: Provides in-memory caching of frequently accessed URLs to reduce database load and improve response times.
- **Why Node-Cache?**: It’s simple to integrate and improves performance for frequently requested URLs.
- **Future Considerations**: For distributed environments, replacing Node-Cache with Redis or Memcached would be necessary.

5. Load Balancer
- **Role**: Distributes incoming traffic evenly across multiple API server instances to ensure high availability and fault tolerance.
- **Why?**: Prevents any single server from becoming a bottleneck and enables horizontal scaling.
- **Current Setup**: Since the service is being developed locally, a load balancer is not currently implemented. However, it is a future consideration for scaling the service in production environments.

### Scalability
##### Horizontal Scaling

- **API Servers**: Multiple instances of the Express.js API server can be deployed, with traffic distributed using a load balancer (e.g., NGINX or AWS ELB).
- **Database**: MongoDB supports sharding for horizontal scaling, enabling the distribution of data across multiple servers.
- **Caching**: Transitioning to a distributed caching system like Redis ensures scalability across multiple API servers.

### Fault Tolerance
- **Caching** - Cached results (via Node-Cache) prevent database overload during high-traffic periods. However, since Node-Cache is not persistent, the cache is rebuilt if the server restarts.
- **Database Replication** - MongoDB’s replica sets ensure high availability and fault tolerance. If the primary database server fails, one of the replicas automatically takes over.

### Data Consistency
- **URL Uniqueness** - The service ensures that each shortened URL is unique by checking for existing `short_url` values in the database before creating a new one.
- **Atomic Operations** - Database operations for creating and querying URLs are atomic, ensuring no duplicate entries are created even under high concurrency.
- **Cache Consistency** - When a new short URL is created, both the long URL and short URL are added to the cache. However, updates to cached entries require proper invalidation strategies to prevent stale data.
- **Handling Expired URLs** - Optional expiration timestamps (`expires_at`) allow URLs to become invalid after a certain period. Expired URLs can be periodically cleaned up using a scheduled background job (not implemented)
## Setup Instructions
### Prerequisites

- Node.js (>= 16.x)
- MongoDB (local instance or cloud instance)
- npm package manager





## Run Locally

Clone the project

```bash
  git clone https://github.com/FayasAhmed-98/url-shortener.git
```

Go to the project directory

```bash
  cd url-shortener
```

Install dependencies

```bash
  npm install
```

Set up environment variables: Create a .env file in the project root and add the following:

```bash
  MONGODB_URI=mongodb://localhost:27017/urlShortener
```
Start the application

```bash
   node index.js
```

## URL Shortener API Documentation

## Base URL
`http://localhost:3000`

---

### 1. Shorten URL
**POST** `/shorten`

- **Description**: Shortens a given long URL into a unique short URL.

#### Request
**Headers**:
```json
Content-Type: application/json
```
- Request Body: 

```
{
  "long_url": "https://example.com"
}
```
- Response:
```
{
  "short_url": "http://short.ly/abc123"
}
```
### 2. Redirect to Original URL
**GET** /:`{short_url}`
- **Description**: Redirects a shortened URL to the original long URL.
#### Request

Path Parameter:

`short_url`: The short URL identifier.

**Responses**

*302 Found:* Redirects to the original long URL.

*404 Not Found:* 
```
{
  "error": "URL not found"
}
```
*500 Internal Server Error:*
```
{
  "error": "Internal Server Error"
}

```

## Project Structure

```css
url-shortener/
│
├── models/             # MongoDB schemas
│   └── urlModel.js     # URL schema for short and long URLs
├── routes/             # API routes
│   └── urlRoutes.js    # Endpoints for URL shortening and redirection
├── swagger.yaml        # OpenAPI specification for Swagger documentation
├── tests/              # Unit tests
│   └── urlRoutes.test.js
├── index.js            # Main application entry point
├── README.md           # Project documentation
└── package.json        # Project metadata and dependencies
```

## Database Schema
- **Collection**: `URLs`
- **Fields**: 
- `short_url`: Unique identifier for the shortened URL.
- `long_url`: The original long URL.
- `created_at`: Timestamp when the entry was created.
- `expires_at (optional)`: Timestamp for expiration of the short URL.

- **Indexes**:
- long_url: For faster lookups of long URLs.
- expires_at: For potential expiration logic.
## Running Tests

1. To run tests, run the following command

```bash
  npm test
```
2. Example Test Cases:
- Validate shortening a valid URL.
- Redirecting from a short URL.
- Handling invalid or missing URLs.

## Tech Stack

### Backend:
- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web framework for building the RESTful API.
- **MongoDB**: NoSQL database for storing URLs.
- **Node-Cache**: In-memory caching solution for improved performance.
- **Mongoose**: ODM library for MongoDB integration.
- **Swagger UI**: For API documentation.

### Development and Testing:
- **Jest & Supertest**: For unit and integration testing.
- **dotenv**: For managing environment variables.

