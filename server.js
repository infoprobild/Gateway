require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

function mockResponse(data) {
  if (process.env.MOCK_GATEWAY === "1") return data;
  return null;
}

function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "Missing token" });

  const token = header.replace("Bearer ", "");
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/", (req, res) => res.send("Mock Gateway API Running ✅"));

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    const token = jwt.sign(
      { id: 1, username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      token,
      user: { id: 1, username, role: "admin" }
    });
  }

  res.status(400).json({ message: "Invalid credentials" });
});

app.post("/api/addandearn/order/create", auth, (req, res) => {
  return res.json(mockResponse({
    status: 1,
    msg: "ok",
    data: {
      type: "url",
      pay_url: `https://payment-mock.com/${req.body.order_sn}`
    }
  }));
});

app.post("/api/addandearn/order/query", auth, (req, res) => {
  return res.json(mockResponse({
    status: 1,
    msg: "success",
    data: { money: 10 }
  }));
});

app.post("/api/addandearn/deposit/create", auth, (req, res) => {
  return res.json(mockResponse({ status: 1, msg: "ok" }));
});

app.post("/api/addandearn/deposit/balance", auth, (req, res) => {
  return res.json(mockResponse({
    status: 1,
    msg: "ok",
    data: { balance: 98765432 }
  }));
});

app.post("/api/bank-scraper/session/create", auth, (req, res) => {
  return res.json(mockResponse({
    success: true,
    message: "Scraping session created successfully",
    data: {
      orderSn: req.body.order_sn,
      sessionId: "session_" + Date.now(),
      bankAccountId: req.body.bank_account_id,
      bankName: "State Bank of India",
      loginUrl: "https://onlinesbi.sbi/"
    }
  }));
});

app.post("/api/bank-scraper/session/start", auth, (req, res) => {
  return res.json(mockResponse({
    success: true,
    orderSn: req.body.order_sn,
    message: "Scraping completed successfully",
    data: {
      transactionsCount: 25,
      saved: 23,
      skipped: 2
    }
  }));
});

app.post("/api/bank-scraper/session/query", auth, (req, res) => {
  return res.json(mockResponse({
    success: true,
    orderSn: req.body.order_sn,
    status: "completed",
    message: "Scraping completed successfully",
    data: {
      sessionId: "session_1234567890_abc123",
      bankName: "State Bank of India",
      transactionsCount: 25
    }
  }));
});

app.post("/api/addandearn/callback/order", (req, res) => res.send("ok"));
app.post("/api/addandearn/callback/deposit", (req, res) => res.send("ok"));
app.post("/api/bank-scraper/callback", (req, res) => res.send("ok"));

app.listen(PORT, () => {
  console.log(`✅ Mock Gateway Server running on port ${PORT}`);
});
