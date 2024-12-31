# Reservly
Reservly is an open-source RESTful API built to power restaurant reservation systems with ease and scalability. It provides essential features for managing table bookings, availability, notifications, and real-time updates, all designed to support any restaurant looking to integrate a seamless reservation solution.

# Quick Start
To run the app, you need the following command:
1. Run git clone `git@github.com:emmacode/Reservly.git`
2. Run `npm install`
3. Copy the `.env.example` file to create `.env` file: `cp .env.example .env`
- `NODE_ENV`: Set to `development` for local development or `production` for deployment.
- `PORT`: The port number on which app will run.
- `DATABASE`: Your MongoDB connection string.
- `DATABASE_PASSWORD`: The password for your database user.
- `JWT_SECRET`: Secret key for JSON Web Token authentication.
- `JWT_EXPIRES_IN`: Token expiration time (e.g 30m for 30 minutes).
- `EMAIL_USERNAME`: Username provided by the email service.
- `EMAIL_PASSWORD`: Email password.
- `EMAIL_HOST`: Mailtrap for email.
- `EMAIL_PORT`: port number.
4. `npm run dev` to run the app in development.
5. `npm run prod` to run in production environment.
6. `npm test` to run test.
7. Documentation: `http://127.0.0.1:9999/api-docs/`
