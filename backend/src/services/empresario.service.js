const prisma = require('../lib/prisma');
const geocodingService = require('./geocoding.service');

// LISTAR EMPRESÁRIOS (COM BUSCA E CATEGORIA)
exports.listarEmpresarios = async (termoBusca, apenasAprovados = false, categoria = null) => {
  const termo = termoBusca?.trim() || undefined;
  const cat = (categoria && categoria !== 'Profissionais') ? categoria : undefined;

  const where = {};

  if (apenasAprovados) {
    where.ID_ADM = { not: null };
  }

  if (cat) {
    where.SERVICOS = {
      some: { NOME: cat }
    };
  }

  if (termo) {
    where.OR = [
      { NOME: { contains: termo } },
      { SERVICOS: { some: { NOME: { contains: termo } } } }
    ];
  }

  return await prisma.eMPRESARIO.findMany({
    where,
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true,
      FOTO_TRABALHO: true 
    }
  });
};

// LISTAR EMPRESÁRIOS PENDENTES
exports.listarEmpresariosPendentes = async () => {
  return await prisma.eMPRESARIO.findMany({
    where: { ID_ADM: null },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};

// BUSCAR POR ID
exports.buscarEmpresarioPorId = async (id) => {
  return await prisma.eMPRESARIO.findUnique({
    where: { ID_EMPRESARIO: id },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true,
      FOTO_TRABALHO: true
    }
  });
};

// CRIAR EMPRESÁRIO
exports.criarEmpresario = async (data) => {
  const novoEmpresario = await prisma.eMPRESARIO.create({
    data: {
      NOME: data.nome,
      CNPJ: data.cnpj,
      BIO: data.bio || null,
      EMAIL: data.email,
      SENHA_HASH: data.senha,
      FOTO_PERFIL: data.foto_perfil,
      ID_ADM: null
    }
  });
  
  const coordenadas = await geocodingService.buscarCoordenadas({
    rua: data.rua,
    num: data.num,
    bairro: data.bairro,
    cidade: data.cidade,
    estado: data.estado,
    cep: data.cep
  });

  await prisma.eNDERECO.create({
    data: {
      ID_EMPRESARIO: novoEmpresario.ID_EMPRESARIO,
      RUA: data.rua,
      NUM: data.num ? Number(data.num) : null,
      BAIRRO: data.bairro,
      CIDADE: data.cidade,
      ESTADO: data.estado,
      CEP: data.cep,
      COMP: data.comp || null,
      LATITUDE: data.latitude,
      LONGITUDE: data.longitude
    }
  });

  await prisma.tELEFONE.create({
    data: {
      ID_EMPRESARIO: novoEmpresario.ID_EMPRESARIO,
      TELEFONE: data.telefone
    }
  });

  if (Array.isArray(data.servicos) && data.servicos.length > 0) {
    for (const nomeServico of data.servicos) {
      await prisma.sERVICOS.create({
        data: {
          NOME: nomeServico,
          ID_EMPRESARIO: novoEmpresario.ID_EMPRESARIO
        }
      });
    }
  }

  return await this.buscarEmpresarioPorId(novoEmpresario.ID_EMPRESARIO);
};

// APROVAR EMPRESÁRIO (ADM)
exports.aprovarEmpresario = async (idEmpresario, idAdm) => {
  return await prisma.eMPRESARIO.update({
    where: {
      ID_EMPRESARIO: Number(idEmpresario)
    },
    data: {
      ID_ADM: Number(idAdm)
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true,
      FOTO_TRABALHO: true
    }
  });
};

// SALVAR DISPONIBILIDADE (Refinado)
exports.salvarDisponibilidade = async (dados) => {
  // Garantimos que os valores numéricos sejam de fato Numbers
  const { ID_EMPRESARIO, DURACAO_MIN, PERIODOS, DIAS_ATIVOS, BLOQUEIOS } = dados;
  const idEmp = Number(ID_EMPRESARIO);

  return await prisma.$transaction(async (tx) => {
    // Busca a config específica DESTE empresário
    let dispAtual = await tx.dISPONIBILIDADE.findFirst({
       where: { ID_EMPRESARIO: idEmp }
    });

    const dadosDisponibilidade = {
      DURACAO_MIN: Number(DURACAO_MIN),
      PERIODOS: PERIODOS || "",
      DIAS_ATIVOS: DIAS_ATIVOS || ""
    };

    if (dispAtual) {
       dispAtual = await tx.dISPONIBILIDADE.update({
          where: { ID_DISP: dispAtual.ID_DISP },
          data: dadosDisponibilidade
       });
    } else {
       dispAtual = await tx.dISPONIBILIDADE.create({
          data: {
             ID_EMPRESARIO: idEmp,
             ...dadosDisponibilidade
          }
       });
    }

    // Limpa bloqueios antigos apenas desta disponibilidade
    await tx.bLOQUEIO_DISPONIBILIDADE.deleteMany({
       where: { ID_DISP: dispAtual.ID_DISP }
    });

    // Salva novos bloqueios se existirem
    if (BLOQUEIOS && BLOQUEIOS.trim() !== "") {
      const listaBloqueios = BLOQUEIOS.split(',').map(b => {
        // Se o front enviar "2026-05-01T10:00", guardamos a string completa 
        // ou apenas a hora, dependendo da sua necessidade de filtro.
        return {
          ID_DISP: dispAtual.ID_DISP,
          HORA_INICIO: b.trim(), // Salvando a string completa facilita o match no front
          MOTIVO: "Bloqueio Manual"
        };
      });

      await tx.bLOQUEIO_DISPONIBILIDADE.createMany({
        data: listaBloqueios
      });
    }

    return dispAtual;
  });
};

// ADICIONAR FOTO DE TRABALHO
exports.adicionarFotoTrabalho = async (idEmpresario, url) => {
  return await prisma.fOTO_TRABALHO.create({
    data: {
      URL: url,
      ID_EMPRESARIO: idEmpresario
    }
  });
};

// BUSCAR DISPONIBILIDADE
exports.buscarDisponibilidadePorId = async (id) => {
  try {
    return await prisma.dISPONIBILIDADE.findFirst({
      where: { ID_EMPRESARIO: Number(id) },
      include: { BLOQUEIO_DISPONIBILIDADE: true } // AGORA CARREGA OS BLOQUEIOS!
    });
  } catch (error) {
    console.error("Erro no Prisma ao buscar disponibilidade:", error);
    throw error;
  }
};
// LISTAR EMPRESÁRIOS PRÓXIMOS (LOCALIZAÇÃO)
exports.listarEmpresariosProximos = async (lat, lng, raioKm = 10) => {
  const empresarios = await prisma.eMPRESARIO.findMany({
    where: {
      ID_ADM: {
        not: null
      },
      ENDERECO: {
        some: {
          LATITUDE: {
            not: null
          },
          LONGITUDE: {
            not: null
          }
        }
      }
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true,
      FOTO_TRABALHO: true
    }
  });

  const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return empresarios
    .map((empresario) => {
      const endereco = empresario.ENDERECO[0];

      const distancia = calcularDistanciaKm(
        Number(lat),
        Number(lng),
        Number(endereco.LATITUDE),
        Number(endereco.LONGITUDE)
      );

      return {
        ...empresario,
        DISTANCIA_KM: Number(distancia.toFixed(2))
      };
    })
    .filter((empresario) => empresario.DISTANCIA_KM <= Number(raioKm))
    .sort((a, b) => a.DISTANCIA_KM - b.DISTANCIA_KM);
};