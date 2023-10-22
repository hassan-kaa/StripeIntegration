require("dotenv").config();
const express = require("express");
const { signUp, confirmEmail } = require("./cognito");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Item 1" }],
  [2, { priceInCents: 20000, name: "Item 2" }],
  [3, { priceInCents: 30000, name: "Item 3" }],
]);

// Move Cognito-related logic to a separate file (cognito.js)
app.post("/signup", async (req, res) => {
  try {
    const { username, password, ...attributes } = req.body;
    const attrList = Object.keys(attributes).map((key) => ({
      Name: key,
      Value: attributes[key],
    }));
    const user = await signUp(username, password, attrList);
    res.json(`User created successfully: ${user.getUsername()}`);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/confirm-email", async (req, res) => {
  try {
    await confirmEmail(req.body.username, req.body.code);
    res.json(`Confirmed successfully!`);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Stripe integration
app.post("/create-checkout-session", async (req, res) => {
  const obj = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/failure`,
      line_items: obj.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
    });
    res.json({ url: session.url });
  } catch (err) {
    console.log(obj, err.message);
    res.status(500).json(err.message);
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("Working on port 5001!");
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
