const express = require("express");
const mongoose = require("mongoose");
const config = require("./config.js");
const productsRouter = require("./routes/productRoutes");
require("dotenv").config();

class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setMiddlewares();
    this.setRoutes();
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB conectado");
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    this.app.use((req, res, next) => {
      console.log(`Recebida requisição: ${req.method} ${req.url}`);
      next();
    });
    this.app.use("/api/products", productsRouter);
  }

  start() {
    this.server = this.app.listen(3001, () =>
      console.log("Servidor iniciado na porta 3001")
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Servidor parado");
  }
}

module.exports = App;
