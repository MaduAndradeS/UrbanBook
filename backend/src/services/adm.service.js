const prisma = require('../lib/prisma');

exports.criarAdmTeste = async () => {
  return await prisma.aDM.create({
    data: {}
  });
};

exports.listarAdms = async () => {
  return await prisma.aDM.findMany();
};