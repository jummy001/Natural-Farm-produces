require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();

// ===============================
// 🟢 MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// 🔐 ENV CONFIG (SECURE)
// ===============================
const PORT = process.env.PORT || 5000;
const PRODUCT_ID = process.env.PRODUCT_ID;
const PAY_ITEM_ID = process.env.PAY_ITEM_ID;
const API_KEY = process.env.API_KEY;
const BASE_URL =
  process.env.BASE_URL || `http://localhost:${PORT}`;

// ===============================
// 🚨 SAFETY CHECK (IMPORTANT)
// ===============================
if (!PRODUCT_ID || !PAY_ITEM_ID || !API_KEY) {
  console.error("❌ Missing environment variables in .env file");
  process.exit(1);
}

// ===============================
// 🟢 INITIATE PAYMENT ROUTE
// ===============================
app.post("/pay", (req, res) => {
  const { amount, email, name } = req.body;

  if (!amount || !email || !name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const txnRef = "TXN_" + Date.now();
  const amountKobo = Number(amount) * 100;

  // 🔐 HASH GENERATION (INTERSWITCH REQUIREMENT)
  const hashString =
    PRODUCT_ID +
    PAY_ITEM_ID +
    txnRef +
    amountKobo +
    API_KEY;

  const hash = crypto
    .createHash("sha512")
    .update(hashString, "utf-8")
    .digest("hex");

  console.log("🔐 HASH GENERATED:", hash);

  // 🟢 AUTO-SUBMIT PAYMENT FORM
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to Payment...</title>
    </head>
    <body onload="document.forms[0].submit()">

      <h3>Redirecting to secure payment gateway...</h3>

      <form method="POST" action="https://qa.interswitchng.com/webpay/pay">

        <input type="hidden" name="product_id" value="${PRODUCT_ID}" />
        <input type="hidden" name="pay_item_id" value="${PAY_ITEM_ID}" />
        <input type="hidden" name="amount" value="${amountKobo}" />
        <input type="hidden" name="currency" value="566" />
        <input type="hidden" name="txn_ref" value="${txnRef}" />
        <input type="hidden" name="site_redirect_url" value="${BASE_URL}/verify" />
        <input type="hidden" name="cust_email" value="${email}" />
        <input type="hidden" name="cust_name" value="${name}" />
        <input type="hidden" name="payment_params" value="cart_id=${txnRef}&cust_id=${email}" />
        <input type="hidden" name="hash" value="${hash}" />

      </form>

    </body>
    </html>
  `);
});

// ===============================
// 🟢 VERIFY PAYMENT ROUTE
// ===============================
app.get("/verify", (req, res) => {
  res.send(`
    <html>
    <body style="font-family:Arial;text-align:center;margin-top:100px;background:#0f172a;color:white;">

      <h1 style="color:#22c55e;">✅ Payment Successful</h1>
      <p>Your transaction was completed successfully.</p>

      <div style="margin-top:20px;">
        <strong>Reference:</strong> ${req.query.txnref || "TXN_DEMO_123"}
      </div>

      <br/><br/>

      <a href="/" style="color:#22c55e;">Return to Dashboard</a>

    </body>
    </html>
  `);
});

// ===============================
// 🟢 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${BASE_URL}`);
});