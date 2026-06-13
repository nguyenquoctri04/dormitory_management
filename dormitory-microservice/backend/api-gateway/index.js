const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const { createProxyMiddleware } = require("http-proxy-middleware");
const authMiddleware = require("./src/middleware/auth");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(helmet());
// No global express.json() to avoid breaking the proxy for POST/PUT requests
// app.use(express.json());

// Services mapping
const services = [
  {
    path: "/api/v1/auth",
    target: process.env.AUTH_SERVICE_URL || "http://auth-service:3001",
    secure: false, // Login/Register are public
  },
  {
    path: "/api/v1/students",
    target: process.env.STUDENT_SERVICE_URL || "http://student-service:3002",
    secure: true,
  },
  {
    path: "/api/v1/rooms",
    target: process.env.ROOM_SERVICE_URL || "http://room-service:3003",
    secure: true,
  },
  {
    path: "/api/v1/periods",
    target: process.env.ROOM_SERVICE_URL || "http://room-service:3003",
    secure: true,
  },
  {
    path: "/api/v1/stays",
    target: process.env.ROOM_SERVICE_URL || "http://room-service:3003",
    secure: true,
  },
  {
    path: "/api/v1/registrations",
    target: process.env.REGISTRATION_SERVICE_URL || "http://registration-service:3004",
    secure: true,
  },
  {
    path: "/api/v1/payments",
    target: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3005",
    secure: true,
  },
  {
    path: "/api/v1/invoices",
    target: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3005",
    secure: true,
  },
  {
    path: "/api/v1/complaints",
    target: process.env.COMPLAINT_SERVICE_URL || "http://complaint-service:3006",
    secure: true,
  },
  {
    path: "/api/v1/utilities",
    target: process.env.UTILITY_SERVICE_URL || "http://utility-service:3007",
    secure: true,
  },
];

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "API Gateway" });
});

// Setup Proxies
services.forEach((service) => {
  // Apply authMiddleware separately if secure
  if (service.secure) {
    app.use(service.path, authMiddleware);
  }

  // Use pathFilter in the options object to match the path without stripping it (HPM v3/v4 style)
  app.use(
    createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathFilter: service.path,
    })
  );
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on port ${PORT}`);
});