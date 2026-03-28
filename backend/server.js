const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");

const app = express();

// ===============================
// 🟢 MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// 🟢 STATIC FRONTEND (IMPORTANT FIX)
// ===============================
app.use(express.static(path.join(__dirname, "frontend")));

// ===============================
// 🔥 CONFIG (QUICKTELLER LIVE)
// ===============================
const PORT = process.env.PORT || 5000;

const PRODUCT_ID = "MX180463";
const PAY_ITEM_ID = "Default_Payable_MX180463";
const SECRET_KEY = "a25uPFC7Xf0fCHD";

const BASE_URL = "https://natural-farm-produces.onrender.com";

// ===============================
// 🟢 HOME ROUTE (FIXED - SHOWS WEBSITE)
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// ===============================
// 🟢 PAYMENT INITIATE ROUTE
// ===============================
app.post("/pay", (req, res) => {
  const { amount, email, name } = req.body;

  if (!amount || !email || !name) {
    return res.status(400).send("Missing required fields");
  }

  const txnRef = "TXN_" + Date.now();
  const amountKobo = Number(amount) * 100;

  // ===============================
  // 🔐 CORRECT HASH (VERY IMPORTANT)
  // ===============================
  const hashString =
    PRODUCT_ID +
    PAY_ITEM_ID +
    txnRef +
    amountKobo +
    SECRET_KEY;

  const hash = crypto
    .createHash("sha512")
    .update(hashString, "utf-8")
    .digest("hex");

  console.log("🔐 HASH GENERATED:", hash);

  // ===============================
  // 🟢 REDIRECT PAGE (FIXED FLOW)
  // ===============================
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting...</title>
    </head>

    <body style="font-family:Arial;text-align:center;margin-top:100px;">

      <h2>Redirecting to payment...</h2>
      <p>Please wait...</p>

      <form id="payForm" method="POST" action="https://webpay.interswitchng.com/collections/w/pay">

        <input type="hidden" name="product_id" value="${PRODUCT_ID}" />
        <input type="hidden" name="pay_item_id" value="${PAY_ITEM_ID}" />
        <input type="hidden" name="amount" value="${amountKobo}" />
        <input type="hidden" name="currency" value="566" />
        <input type="hidden" name="txn_ref" value="${txnRef}" />
        <input type="hidden" name="site_redirect_url" value="${BASE_URL}/verify" />
        <input type="hidden" name="cust_email" value="${email}" />
        <input type="hidden" name="cust_name" value="${name}" />
        <input type="hidden" name="hash" value="${hash}" />

        <button type="submit" style="padding:10px 20px;background:green;color:white;">
          Pay Now
        </button>

      </form>

      <script>
        // auto submit (with fallback)
        window.onload = function () {
          document.getElementById("payForm").submit();
        };

        setTimeout(() => {
          document.getElementById("payForm").submit();
        }, 1200);
      </script>

    </body>
    </html>
  `);
});

// ===============================
// 🟢 PAYMENT SUCCESS CALLBACK
// ===============================
app.get("/verify", (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial;text-align:center;margin-top:100px;">
        <h1 style="color:green;">Payment Successful ✅</h1>
        <p>Thank you for your order</p>

        <a href="/" style="color:blue;">Go Back Home</a>
      </body>
    </html>
  `);
});

// ===============================
// 🟢 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});