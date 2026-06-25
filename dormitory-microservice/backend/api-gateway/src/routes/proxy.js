const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Define service mapping
const services = [
  // Auth Service (Port 3001) - UNPROTECTED for login/register
  {
    path: "/api/v1/auth",
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    protected: false,
  },
  // Specific Admin Routes first to avoid overlap
  {
    path: "/api/v1/admin/stays",
    target: process.env.ROOM_SERVICE_URL || "http://localhost:3003",
    protected: true,
    rewrite: {
        "^/api/v1/admin/stays": "/api/v1/stays/admin"
    }
  },
  // Student Service (Port 3002)
  {
    path: "/api/v1/students",
    target: process.env.STUDENT_SERVICE_URL || "http://localhost:3002",
    protected: true,
  },
  // Room Service (Port 3003)
  {
    path: "/api/v1/rooms",
    target: process.env.ROOM_SERVICE_URL || "http://localhost:3003",
    protected: true,
  },
  {
    path: "/api/v1/periods",
    target: process.env.ROOM_SERVICE_URL || "http://localhost:3003",
    protected: true,
  },
  {
    path: "/api/v1/stays",
    target: process.env.ROOM_SERVICE_URL || "http://localhost:3003",
    protected: true,
  },
  // Registration Service (Port 3004)
  {
    path: "/api/v1/registrations",
    target: process.env.REGISTRATION_SERVICE_URL || "http://localhost:3004",
    protected: true,
  },
  // Payment Service (Port 3005)
  {
    path: "/api/v1/payments",
    target: process.env.PAYMENT_SERVICE_URL || "http://localhost:3005",
    protected: true,
  },
  {
    path: "/api/v1/invoices",
    target: process.env.PAYMENT_SERVICE_URL || "http://localhost:3005",
    protected: true,
  },
  // Complaint Service (Port 3006)
  {
    path: "/api/v1/complaints",
    target: process.env.COMPLAINT_SERVICE_URL || "http://localhost:3006",
    protected: true,
  },
  // Utility Service (Port 3007)
  {
    path: "/api/v1/utilities",
    target: process.env.UTILITY_SERVICE_URL || "http://localhost:3007",
    protected: true,
  },
];

services.forEach((service) => {
  const proxyOptions = {
    target: service.target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // 1. First apply custom rewrites if any
      let newPath = path;
      if (service.rewrite) {
        for (const [pattern, replacement] of Object.entries(service.rewrite)) {
          const regex = new RegExp(pattern);
          if (regex.test(req.originalUrl)) {
            newPath = req.originalUrl.replace(regex, replacement);
            return newPath;
          }
        }
      }
      
      // 2. Default behavior: Ensure prefix is kept because express strips mount point
      // originalUrl is the full path from the client
      // We want to send the full path to the microservice
      return req.originalUrl;
    },
    onProxyReq: (proxyReq, req, res) => {
      // Ensure custom user headers are passed if they were set by authMiddleware
      if (req.headers["x-user-id"]) {
        proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
      }
      if (req.headers["x-user-role"]) {
        proxyReq.setHeader("x-user-role", req.headers["x-user-role"]);
      }
    },
    onError: (err, req, res) => {
      console.error(`Proxy Error (${service.path}):`, err.message);
      res.status(502).json({ message: "Service Unavailable" });
    },
  };

  if (service.protected) {
    router.use(service.path, authMiddleware, createProxyMiddleware(proxyOptions));
  } else {
    router.use(service.path, createProxyMiddleware(proxyOptions));
  }
});

module.exports = router;

