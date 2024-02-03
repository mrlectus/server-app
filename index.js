import express from "express";
import "dotenv/config";
import { affinidiProvider } from "@affinidi/passport-affinidi";
import { products } from "./data/data.js";
import nodemailer from "nodemailer";

import cors from "cors";

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const PORT = process.env.PORT || 3003;

const initializeServer = async () => {
  app.get("/", function (req, res, next) {
    res.json({ success: "Express" });
  });

  /**
   * Configures Affinidi authentication provider.
   * @param {Express} app - The Express app instance
   * @param {Object} options - The configuration options
   * @param {string} options.id - The provider ID
   * @param {string} options.issuer - The Affinidi issuer URL
   * @param {string} options.client_id - The OAuth client ID
   * @param {string} options.client_secret - The OAuth client secret
   * @param {string[]} options.redirect_uris - Allowed redirect URIs for OAuth flow
   */
  await affinidiProvider(app, {
    id: "affinidi",
    issuer: process.env.AFFINIDI_ISSUER,
    client_id: process.env.AFFINIDI_CLIENT_ID,
    client_secret: process.env.AFFINIDI_CLIENT_SECRET,
    redirect_uris: ["https://main--incandescent-valkyrie-50314c.netlify.app/auth/callback/"],
  });

  /**
   * Simple ping route to test if the server is running and responding to requests.
   * Responds with a JSON message 'Pong'.
   */

  app.get("/ping", function (req, res) {
    res.json({ message: "Pong" });
  });

  /**
   * Gets all products.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  app.get("/products", function (req, res) {
    res.send(products);
  });

  /**
   * Gets a single product by ID.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  app.get("/products/:id", function (req, res) {
    const { id } = req.params;
    const product = products.find((p) => p.id == id);
    if (!product) {
      res.status(404).send({ message: "Product not found" });
      return;
    }
    res.send(products.find((p) => p.id == id));
  });

  /**
   * Sends an email using Mailgun.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise} Sends response with result of sending email
   */

  app.post("/send", async (req, res) => {
    const { message, email } = req.body;
    let transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: 587,
      auth: {
        user: "postmaster@sandbox104beec85e2f4b458b8f4ef87a90c037.mailgun.org",
        pass: process.env.MAILGUN_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: "postmaster@sandbox104beec85e2f4b458b8f4ef87a90c037.mailgun.org",
      to: email,
      subject: "HURRAY 🎈 YOUR PRODUCT IS ON THE WAY",
      text: message,
    });
    res.send({
      message: "mail has been sent, please check you spam",
      id: info.messageId,
    });
  });

  app.listen(PORT, async () => {
    console.log(`Server listening on ${PORT}`);
  });
};

initializeServer();
