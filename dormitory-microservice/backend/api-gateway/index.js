const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const proxyRoutes = require("./src/routes/proxy");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "x-user-role"]
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // increased for development
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// IMPORTANT: Do NOT use express.json() globally here if you want to proxy POST/PUT requests with bodies.
// Body parsing interferes with the proxy stream.
// If specific routes in the gateway (not proxied) need it, add it to those routes only.

// Proxy Routes
app.use("/", proxyRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.error("Gateway Error:", err);
    res.status(500).json({ message: "Internal Gateway Error" });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
});

