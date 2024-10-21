const express = require("express");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer();
const app = express();

// Route requests to the auth service
app.use("/auth", (req, res) => {
  proxy.web(req, res, { target: "http://auth:3000" });
});

// Route requests to the product service
app.use("/products", (req, res) => {
  proxy.web(req, res, { target: "http://product:3001/api/products" });
});

// Route requests to the order service
app.use("/orders", (req, res) => {
  proxy.web(req, res, { target: "http://order:3002" });
});

// Start the server
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway ouvindo na porta ${port}`);
});
