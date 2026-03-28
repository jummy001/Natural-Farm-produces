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
// 🔐 CONFIG
// ===============================
const PORT = process.env.PORT || 5000;

const PRODUCT_ID = "MX276268";
const PAY_ITEM_ID = "Default_Payable_MX276268";
const API_KEY = "i6/KGNOgNSsr2+JJdq77mkAmCLltiOcd5tgSneHa8qIx7iX3I3zjuKIZTCch88LG";

// LIVE Render URL
const BASE_URL = "https://natural-farm-produces.onrender.com";

// ===============================
// 🟢 HOME ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send(`
    <h2 style="text-align:center;margin-top:100px;">
      🌿 Natural Farm API is Running
    </h2>
    <p style="text-align:center;">
      Payment service is active 🚀
    </p>
  `);
});

// ===============================
// 🟢 INITIATE PAYMENT
// ===============================
app.post("/pay", (req, res) => {
  const { amount, email, name } = req.body;

  if (!amount || !email || !name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const txnRef = "TXN_" + Date.now();
  const amountKobo = Number(amount) * 100;

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

  // ===============================
  // 🟢 REDIRECT PAGE (FIXED)
  // ===============================
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting Payment</title>
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
        <input type="hidden" name="payment_params" value="cart_id=${txnRef}&cust_id=${email}" />
        <input type="hidden" name="hash" value="${hash}" />
        <input type="hidden" name="site_name" value="Natural Farm" />

      </form>

      <script>
        window.onload = function () {
          document.getElementById("payForm").submit();
        };

        setTimeout(() => {
          document.getElementById("payForm").submit();
        }, 800);
      </script>

    </body>
    </html>
  `);
});

// ===============================
// 🟢 VERIFY ROUTE
// ===============================
app.get("/verify", (req, res) => {
  res.send(`
    <html>
    <body style="font-family:Arial;text-align:center;margin-top:100px;background:#0f172a;color:white;">

      <h1 style="color:#22c55e;">✅ Payment Successful</h1>
      <p>Demo confirmation page</p>

      <p><strong>Reference:</strong> ${req.query.txnref || "TXN_DEMO_123"}</p>

      <br>
      <a href="/" style="color:#38bdf8;">Go Home</a>

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