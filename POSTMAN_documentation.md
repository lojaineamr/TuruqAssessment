# API Testing with Postman

make sure that you are in the correct folder that run in the termainal:

npm start

expected output:


> user-management-api@1.0.0 start
> node src/server.js

Server is running on port 3000
Environment: development
Connected to MongoDB successfully

## Then open postman and start testing:

### 1. Register a new Admin
Method: POST  
URL: http://localhost:3000/api/auth/register 

then click on body -> raw, JSON 
write for example:
{
  "username": "malakHatem",
  "email": "malakhatem@gmail.com",
  "password": "Malak1234"
}

expected output:

{
    "status": "success",
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "68cee68c38e934b49129a69a",
            "username": "malakHatem",
            "email": "malakhatem@gmail.com",
            "role": "user"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNlZTY4YzM4ZTkzNGI0OTEyOWE2OWEiLCJlbWFpbCI6Im1hbGFraGF0ZW1AZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgzODk5MDEsImV4cCI6MTc1ODk5NDcwMX0.4J6QI-RCBkESG00mGFUobZ40x5H1FzwvvCqPfludFWo"
    }
}

### 2. Login Admin
Method: POST  
URL: http://localhost:3000/api/auth/login

then click on body -> raw, JSON 
using the same email and password that you created in step 1:
{
  "email": "malakhatem@gmail.com",
  "password": "Malak1234"
}

expected output:

{
    "status": "success",
    "message": "Login successful",
    "data": {
        "user": {
            "id": "68cee68c38e934b49129a69a",
            "username": "malakHatem",
            "email": "malakhatem@gmail.com",
            "role": "user",
            "lastLogin": "2025-09-20T17:41:36.335Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNlZTY4YzM4ZTkzNGI0OTEyOWE2OWEiLCJlbWFpbCI6Im1hbGFraGF0ZW1AZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgzOTAwOTYsImV4cCI6MTc1ODk5NDg5Nn0.nDgw8Pj7Hsp6q49shYDAWO1ZUCwXhV-xsR67U6JSJ6o"
    }
}


### 3. Create a user profile
Method: POST  
URL: http://localhost:3000/api/users

Go to headers and write:
- Content-Type: application/json
- Authorization: Bearer {Token that was recived in step 2}

then click on body -> raw, JSON 
write for example:
{
  "name": "hana reda",
  "email": "hana@gmail.com",
  "age": 22
}

expected output:

{
    "status": "success",
    "message": "User created successfully",
    "data": {
        "user": {
            "id": "68cee89638e934b49129a6a0",
            "name": "hana reda",
            "email": "hana@gmail.com",
            "age": 22,
            "ageCategory": "Adult",
            "createdAt": "2025-09-20T17:47:02.765Z",
            "updatedAt": "2025-09-20T17:47:02.767Z"
        }
    }
}

### 4. Get all users with pagination and filtering
Method: GET  
URL: http://localhost:3000/api/users

Go to headers and write:
- Authorization: Bearer {Token that was recived in step 2}

then click on body -> none

- if you want to add filters this is an example of the url:
http://localhost:3000/api/users?page=1&limit=10&ageMin=18&ageMax=65&sortBy=createdAt&sortOrder=desc

Query Parameters:
- page (integer, default: 1): Page number
- limit (integer, default: 10, max: 100): Items per page
- ageMin (integer): Minimum age filter
- ageMax (integer): Maximum age filter
- search (string): Search by name or email
- sortBy (string): Sort field (name, email, age, createdAt)
- sortOrder (string): Sort order (asc, desc)

expected output will be all the created users:

{
    "status": "success",
    "message": "Users retrieved successfully",
    "data": {
        "users": [
            {
                "id": "68cee89638e934b49129a6a0",
                "name": "hana reda",
                "email": "hana@gmail.com",
                "age": 22,
                "createdAt": "2025-09-20T17:47:02.765Z",
                "updatedAt": "2025-09-20T17:47:02.767Z"
            },
            {
                "id": "68ce4f32d1d58c284106956b",
                "name": "maya haytham",
                "email": "maya@example.com",
                "age": 20,
                "createdAt": "2025-09-20T06:52:34.544Z",
                "updatedAt": "2025-09-20T06:52:34.546Z"
            },
            {
                "id": "68ce4f1ed1d58c2841069567",
                "name": "reem mostafa",
                "email": "reem@example.com",
                "age": 30,
                "createdAt": "2025-09-20T06:52:14.899Z",
                "updatedAt": "2025-09-20T06:52:14.902Z"
            },
            {
                "id": "68ce4efdd1d58c2841069563",
                "name": "alya amr",
                "email": "loj@example.com",
                "age": 18,
                "createdAt": "2025-09-20T06:51:41.522Z",
                "updatedAt": "2025-09-20T06:53:17.429Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalUsers": 4,
            "hasNextPage": false,
            "hasPrevPage": false,
            "limit": 10
        },
        "filters": {
            "sortBy": "createdAt",
            "sortOrder": "desc"
        }
    }
}


### 5. Get user by ID
Method: GET  
URL: http://localhost:3000/api/users/68cee89638e934b49129a6a0

note: this is the id of the user created in step 3: 68cee89638e934b49129a6a0

Go to headers and write:
- Authorization: Bearer {Token that was recived in step 2}

then click on body -> none

expected output:

{
    "status": "success",
    "message": "User retrieved successfully",
    "data": {
        "user": {
            "id": "68cee89638e934b49129a6a0",
            "name": "hana reda",
            "email": "hana@gmail.com",
            "age": 22,
            "ageCategory": "Adult",
            "createdAt": "2025-09-20T17:47:02.765Z",
            "updatedAt": "2025-09-20T17:47:02.767Z"
        }
    }
}

### 6. Update user
Method: PUT  
URL: http://localhost:3000/api/users/68cee89638e934b49129a6a0

note: this is the id of the user created in step 3: 68cee89638e934b49129a6a0

Go to headers and write:
- Authorization: Bearer {Token that was recived in step 2}

then click on body -> raw, JSON
write for example to update the name and age:
{
    "name": "karma amr",
    "age": 14
}

you can also update the email.

expected output:

{
    "status": "success",
    "message": "User updated successfully",
    "data": {
        "user": {
            "id": "68cee89638e934b49129a6a0",
            "name": "karma amr",
            "email": "hana@gmail.com",
            "age": 14,
            "ageCategory": "Minor",
            "createdAt": "2025-09-20T17:47:02.765Z",
            "updatedAt": "2025-09-20T17:55:02.221Z"
        }
    }
}


### 7. Delete user
Method: DELETE  
URL: http://localhost:3000/api/users/68cee89638e934b49129a6a0

note: this is the id of the user that you want to delete that was created in step 3: 68cee89638e934b49129a6a0

Go to headers and write:
- Authorization: Bearer {Token that was recived in step 2}

then click on body -> none

expected output:

{
    "status": "success",
    "message": "User deleted successfully",
    "data": {
        "deletedUser": {
            "id": "68cee89638e934b49129a6a0",
            "name": "karma amr",
            "email": "hana@gmail.com"
        }
    }
}

### 8. Get user statistics
Method: GET  
URL: http://localhost:3000/api/users/stats

Go to headers and write:
- Authorization: Bearer {Token that was recived in step 2}

then click on body -> none

expected output:
{
    "status": "success",
    "message": "User statistics retrieved successfully",
    "data": {
        "overview": {
            "totalUsers": 3,
            "minAge": 18,
            "maxAge": 30,
            "avgAge": 22.67
        },
        "ageDistribution": [
            {
                "_id": 18,
                "count": 2,
                "users": [
                    {
                        "name": "alya amr",
                        "age": 18
                    },
                    {
                        "name": "maya haytham",
                        "age": 20
                    }
                ]
            },
            {
                "_id": 30,
                "count": 1,
                "users": [
                    {
                        "name": "reem mostafa",
                        "age": 30
                    }
                ]
            }
        ]
    }
}


## 9. Health Check

Method: GET  
URL: http://localhost:3000/api/health

Go to headers and write:
- Authorization: Bearer {Token that was recived in step 2}

then click on body -> none

expected output:

{
    "status": "success",
    "message": "Server is running successfully",
    "timestamp": "2025-09-20T18:01:19.285Z"
}

## 10. Get current profile
Method: GET  
URL: http://localhost:3000/api/auth/profile

Go to headers and write:
- Authorization: Bearer {Token that was recived in step 2}

then click on body -> none

expected output:

{
    "status": "success",
    "data": {
        "user": {
            "id": "68cee68c38e934b49129a69a",
            "username": "malakHatem",
            "email": "malakhatem@gmail.com",
            "role": "user",
            "lastLogin": "2025-09-20T17:41:36.335Z",
            "createdAt": "2025-09-20T17:38:20.256Z"
        }
    }
}