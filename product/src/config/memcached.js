// Importa a biblioteca Memcached para criar um cliente Memcached
const Memcached = require('memjs');

// Configura o cliente Memcached conectando-se ao servidor na porta 11211
const client = Memcached.Client.create('memcached:11211');

// Exporta o cliente Memcached para ser utilizado em outras partes da aplicação
module.exports = client;




