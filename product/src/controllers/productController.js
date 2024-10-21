const Product = require("../models/product");
const memcachedClient = require("../config/memcached");
const uuid = require('uuid');

class ProductController {
  constructor() {
    this.createProduct = this.createProduct.bind(this);
    this.getOrderStatus = this.getOrderStatus.bind(this);
    this.ordersMap = new Map();
  }

  async createProduct(req, res, next) {
    try {
      const product = new Product(req.body);

      const validationError = product.validateSync();
      if (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      await product.save({ timeout: 30000 });

      // Invalida o cache de produtos
      await this.invalidateCache();

      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async invalidateCache() {
    return new Promise((resolve, reject) => {
      memcachedClient.delete("products", (err) => {
        if (err) {
          console.error("Erro ao invalidar o cache:", err);
          return reject(err);
        }
        console.log("Cache de produtos invalidado");
        resolve();
      });
    });
  }

  async createOrder(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { ids } = req.body;
      const products = await Product.find({ _id: { $in: ids } });

      const orderId = uuid.v4();
      this.ordersMap.set(orderId, {
        status: "pending",
        products,
        username: req.user.username
      });

      let order = this.ordersMap.get(orderId);
      while (order.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        order = this.ordersMap.get(orderId);
      }

      return res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getOrderStatus(req, res, next) {
    const { orderId } = req.params;
    const order = this.ordersMap.get(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(200).json(order);
  }

  async getProducts(req, res) {
    try {
      // Recupera todos os IDs dos produtos do banco de dados
      const products = await Product.find();
      
      // Tenta recuperar cada produto do cache
      const cachedProducts = await Promise.all(products.map(async (product) => {
        return new Promise((resolve) => {
          memcachedClient.get(`product_${product.productId}`, (err, value) => {
            if (err) return resolve(null); // Se houve erro, retorna null
            resolve(value ? JSON.parse(value) : null); // Converte o valor JSON para objeto
          });
        });
      }));
  
      // Filtra produtos não encontrados no cache
      const foundProducts = cachedProducts.filter(product => product !== null);
      
      // Se houver produtos em cache, retorna eles
      if (foundProducts.length > 0) {
        console.log("Produtos recuperados do cache");
        return res.json(foundProducts);
      } else {
        // Se não encontrado no cache, armazena no cache
        await Promise.all(products.map((product) => {
          return new Promise((resolve, reject) => {
            memcachedClient.set(`product_${product.productId}`, JSON.stringify(product), 3600, (err) => {
              if (err) return reject(err);
              resolve(); // Indica que a operação de armazenamento foi bem-sucedida
            });
          });
        }));
        console.log("Produtos recuperados do banco de dados e armazenados no cache");
        return res.json(products);
      }
    } catch (err) {
      // Captura e registra erros, retornando um status de erro 500
      console.error('Erro:', err);
      return res.status(500).json({ message: "Server error" });
    }
  }
  
}

module.exports = ProductController;
