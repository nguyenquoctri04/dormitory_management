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
// Services grouping for more efficient proxying
const targetServices = [
  {
    prefix: "/api/v1/auth",
    target: process.env.AUTH_SERVICE_URL || "http://auth-service:3001",
    securePaths: ["/api/v1/auth/users", "/api/v1/auth/change-password", "/api/v1/auth/admin"]
  },
  {
    prefix: "/api/v1/students",
    target: process.env.STUDENT_SERVICE_URL || "http://student-service:3002",
    secure: true
  },
  {
    prefix: ["/api/v1/rooms", "/api/v1/periods", "/api/v1/stays"],
    target: process.env.ROOM_SERVICE_URL || "http://room-service:3003",
    secure: true
  },
  {
    prefix: "/api/v1/registrations",
    target: process.env.REGISTRATION_SERVICE_URL || "http://registration-service:3004",
    secure: true
  },
  {
    prefix: ["/api/v1/payments", "/api/v1/invoices"],
    target: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3005",
    secure: true
  },
  {
    prefix: "/api/v1/complaints",
    target: process.env.COMPLAINT_SERVICE_URL || "http://complaint-service:3006",
    secure: true
  },
  {
    prefix: "/api/v1/utilities",
    target: process.env.UTILITY_SERVICE_URL || "http://utility-service:3007",
    secure: true
  }
];

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "API Gateway" });
});

// Setup Proxies
targetServices.forEach((service) => {
  const paths = Array.isArray(service.prefix) ? service.prefix : [service.prefix];
  
  paths.forEach(p => {
    // Apply authMiddleware if generally secure or specifically secure
    if (service.secure) {
      app.use(p, authMiddleware);
    } else if (service.securePaths) {
      service.securePaths.forEach(sp => {
        if (sp.startsWith(p)) {
          app.use(sp, authMiddleware);
        }
      });
    }

    app.use(
      createProxyMiddleware({
        target: service.target,
        changeOrigin: true,
        pathFilter: p,
      })
    );
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on port ${PORT}`);
});

// Fix MaxListenersExceededWarning
server.setMaxListeners(20);
