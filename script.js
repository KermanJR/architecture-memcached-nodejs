const axios = require('axios');
const Chance = require('chance');
const chance = new Chance();

// Função para gerar produtos aleatórios e garantir que eles caibam no limite de 1MB do Memcached
const generateProduct = () => {
  let product = {
    name: chance.string({ length: 50 }),
    price: parseFloat(chance.floating({ min: 0, max: 1000, fixed: 2 })),
    description: chance.string({ length: 100 }), // Reduzindo a descrição para 100 caracteres
    productId: chance.guid(),
    category: chance.string({ length: 50 }),
    images: [chance.url({ length: 30 })],
    stock: chance.integer({ min: 0, max: 100 }),
    createdAt: chance.date({ year: 2022 }),
    updatedAt: new Date(),
    ratings: chance.floating({ min: 0, max: 5, fixed: 1 }),
  };

  let productString = JSON.stringify(product);
  let productSize = Buffer.byteLength(productString, 'utf8');

  // Reduz os campos iterativamente até que o produto caiba no limite de 1MB
  while (productSize > 900000) { // Um limite de 900KB para garantir margem
    if (product.description.length > 50) { // Reduzindo a descrição ainda mais
      product.description = product.description.substring(0, product.description.length - 20);
    } else if (product.name.length > 30) {
      product.name = product.name.substring(0, product.name.length - 10);
    } else if (product.category.length > 30) {
      product.category = product.category.substring(0, product.category.length - 10);
    } else if (product.images.length > 1) {
      product.images = product.images.slice(0, product.images.length - 1);
    } else {
      break; // Caso não seja mais possível reduzir o produto
    }

    // Recalcula o tamanho do produto após a redução
    productString = JSON.stringify(product);
    productSize = Buffer.byteLength(productString, 'utf8');
  }

  return product;
};


// Função para postar o produto na API
const postProduct = async (product, i) => {
  try {
    const response = await axios.post('http://localhost:3001/api/products', product);
    console.log(`${i} - Product posted: ${response.data.name}`);
  } catch (error) {
    console.error(`Error posting product: ${error.message}`);
  }
};

// Função para gerar e postar múltiplos produtos
const postProducts = async (count) => {
  for (let i = 0; i < count; i++) {
    const product = generateProduct();
    await postProduct(product, i);
  }
};


postProducts(20000).then(() => {
  console.log('All products have been posted');
});
