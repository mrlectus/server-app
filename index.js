import express from "express";
import "dotenv/config";
import { affinidiProvider } from "@affinidi/passport-affinidi";
import { products } from "./data/data.js";
import nodemailer from "nodemailer";

import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const PORT = process.env.PORT || 3003;

const initializeServer = async () => {
  app.get("/", function (req, res, next) {
    res.json({ success: "Express" });
  });

  /**
   * Simple ping route to test if the server is running and responding to requests.
   * Responds with a JSON message 'Pong'.
   */

  app.get("/ping", function (req, res) {
    res.json({ message: "Pong" });
  });

   /**
   * Sends an email using Mailgun.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise} Sends response with result of sending email
   */

  app.post("/send", async (req, res) => {
    try {
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
    } catch (error) {
      throw error;
    }
  });

  app.listen(PORT, async () => {
    console.log(`Server listening on ${PORT}`);
  });
};

initializeServer();
