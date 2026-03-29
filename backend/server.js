const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "frontend")));

const PORT = process.env.PORT || 5000;

// 🔐 YOUR REAL CREDENTIALS
const PRODUCT_ID = "MX180463";
const PAY_ITEM_ID = "Default_Payable_MX180463";
const SECRET_KEY = "a25uPFC7Xf0fCHD";

// 🔥 LIVE DOMAIN
const BASE_URL = "https://natural-farm-produces.onrender.com";

// ✅ HOME ROUTE
app.get("/", (req, res) => {
  res.send("🌿 Natural Farm API Running 🚀");
});

// ===============================
// 🟢 PAYMENT ROUTE
// ===============================
app.post("/pay", (req, res) => {
  const { amount, email, name } = req.body;

  if (!amount || !email || !name) {
    return res.send("❌ Missing payment data");
  }

  const txnRef = "TXN_" + Date.now();
  const amountKobo = Number(amount) * 100;

  // 🔐 HASH
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

  console.log("✅ HASH:", hash);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting...</title>
    </head>
    <body>

      <h3>Redirecting to Quickteller...</h3>

      <form id="payForm" method="POST" action="https://qa.interswitchng.com/webpay/pay">

        <input type="hidden" name="product_id" value="${PRODUCT_ID}" />
        <input type="hidden" name="pay_item_id" value="${PAY_ITEM_ID}" />
        <input type="hidden" name="amount" value="${amountKobo}" />
        <input type="hidden" name="currency" value="566" />
        <input type="hidden" name="txn_ref" value="${txnRef}" />
        <input type="hidden" name="site_redirect_url" value="${BASE_URL}/verify" />

        <input type="hidden" name="cust_email" value="${email}" />
        <input type="hidden" name="cust_name" value="${name}" />

        <!-- 🔥 VERY IMPORTANT -->
        <input type="hidden" name="payment_params" value="cart_id=${txnRef}&cust_id=${email}" />

        <input type="hidden" name="hash" value="${hash}" />

      </form>

      <script>
        // 🔥 INSTANT SUBMIT (NO DELAY)
        document.getElementById("payForm").submit();
      </script>

    </body>
    </html>
  `);
});

// ===============================
// 🟢 VERIFY
// ===============================
app.get("/verify", (req, res) => {
  res.send(`
    <h2 style="text-align:center;margin-top:80px;color:green;">
      ✅ Payment Completed (Demo)
    </h2>
  `);
});

// ===============================
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});