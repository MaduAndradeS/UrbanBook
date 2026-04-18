const prisma = require('../lib/prisma');

exports.listarClientes = async () => {
  const clientes = await prisma.cLIENTE.findMany();
  return clientes;
};