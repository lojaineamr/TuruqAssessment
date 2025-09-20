# User Management API

Built with Node.js, Express, and MongoDB.

### Features
- User Profile Management: 
Complete CRUD operations for user profiles

- JWT Authentication:
Secure token-based authentication system

- input validation

- Efficient data retrieval with pagination and age filtering

- error handling with detailed error messages

- Prevent API abuse with configurable rate limits

- MongoDB Indexing: Optimized database queries with indexing

- CORS Support: Cross-origin resource sharing configuration

### Tech Stack

- Node.js
- Express.js
- MongoDB 
- JSON Web Tokens (JWT)
- Joi & Express Validator
- CORS, Rate Limiting

## Project Structure

```
backend-assessment/
├── src/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   └── userController.js      # User CRUD operations
│   ├── models/
│   │   ├── AuthUser.js           # Authentication user model
│   │   └── User.js               # User profile model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   └── users.js              # User management routes
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   ├── errorHandler.js       # Error handling middleware
│   │   └── validation.js         # Input validation rules
│   ├── utils/
│   │   ├── database.js           # Database connection utility
│   │   └── jwt.js                # JWT utility functions
│   └── server.js                 # Application entry point
├── .gitignore                    # Git ignore rules
├── package.json                  # Project dependencies
├── DeliverySlotAllocationPseudocode  # Task 2 pseudocode
└── README.md                     # Project documentation
```


### Prerequisites

- Node.js 
- MongoDB 
- npm 

### Installation

   1. git clone https://github.com/lojaineamr/TuruqAssessment.git
   2. cd backend-assessment
   3. npm install
   4. make .env file that includes:
        NODE_ENV=development
        PORT=3000

        # MongoDB Atlas Connection (replace with your actual connection string)
        MONGODB_URI=

        JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
        JWT_EXPIRES_IN=7d

        RATE_LIMIT_WINDOW_MS=900000
        RATE_LIMIT_MAX_REQUESTS=100
    5. Run the project using: 
        npm run dev or npm start


### Base URL
http://localhost:3000/api

all apis and more details about them are included in the POSTMAN_documentation.md file

### Token Expiration
- Default expiration: 7 days
- Configurable via `JWT_EXPIRES_IN` environment variable

### Error Response Format
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}


### Authentication Security
- Password Hashing: bcrypt with 12 salt rounds
- JWT Secrets: Configurable secret keys
- Token Expiration: Automatic token expiration
- User Status Validation: Active user verification

### Database Optimization
- MongoDB User model indexes:
  userSchema.index({ email: 1 });
  userSchema.index({ age: 1 });
  userSchema.index({ createdAt: -1 });


## Task 2: Delivery Slot Allocation

The detailed pseudocode for the dynamic delivery slot allocation system is available in the file `DeliverySlotAllocationPseudocode.md`. This pseudocode mainly includes:

- Dynamic Allocation: Real-time slot availability checking
- Overbooking Prevention: Atomic transactions and capacity validation
- Alternative Suggestions: scoring algorithm for slot recommendations
- High Demand Handling idea
- Error Handling helper

### Challenges faced

- I was unfamiliar with pagination, so i tried to search and understand what is it. 

- I did not know alot about JWT token authorization and validtaion so i tried to understand what they are and how they work within the short time that i had so that i understand what i am implementing.

- I started searching about tests and how to write them so that i will have the knoweledge and implement them in the future. 
