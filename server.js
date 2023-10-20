require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Item 1" }],
  [2, { priceInCents: 20000, name: "Item 2" }],
  [3, { priceInCents: 30000, name: "Item 3" }],
]);
app.use("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/failure`,
      line_items: req.body.items.map((item) => {
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
    res.json(err).status(500);
  }
});
app.use("/", (req, res) => {
  res.send("working on port 5001 !");
});
app.listen(5001, () => {
  console.log("listening on port 5001");
});
