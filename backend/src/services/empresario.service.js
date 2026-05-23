const prisma = require('../lib/prisma');
const geocodingService = require('./geocoding.service');
const bcrypt = require('bcryptjs');

const {
  criptografar,
  hashValor
} = require('../utils/crypto.util.js');

exports.listarEmpresarios = async (
  termoBusca,
  apenasAprovados = false,
  categoria = null
) => {
  const termo = termoBusca?.trim() || undefined;
  const cat =
    categoria && categoria !== 'Profissionais'
      ? categoria
      : undefined;

  const where = {};

  if (apenasAprovados) {
    where.ID_ADM = {
      not: null
    };
  }

  if (cat) {
    where.SERVICOS = {
      some: {
        NOME: cat
      }
    };
  }

  if (termo) {
    where.OR = [
      {
        NOME: {
          contains: termo
        }
      },
      {
        SERVICOS: {
          some: {
            NOME: {
              contains: termo
            }
          }
        }
      }
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

exports.listarEmpresariosPendentes = async () => {
  return await prisma.eMPRESARIO.findMany({
    where: {
      ID_ADM: null
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};

exports.buscarEmpresarioPorId = async (id) => {
  return await prisma.eMPRESARIO.findUnique({
    where: {
      ID_EMPRESARIO: Number(id)
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true,
      FOTO_TRABALHO: true
    }
  });
};

exports.criarEmpresario = async (data) => {

  const senhaHash = await bcrypt.hash(
      data.senha,
      10
    );

    const cnpjHash =
    hashValor(data.cnpj);

    const cnpjExistente =
    await prisma.eMPRESARIO.findFirst({
      where: {
        CNPJ_HASH: cnpjHash
      }
    });

  if (cnpjExistente) {
    throw new Error('CNPJ já cadastrado');
  }

  const novoEmpresario = await prisma.eMPRESARIO.create({
    data: {
      NOME: data.nome,
      CNPJ: criptografar(data.cnpj),
      CNPJ_HASH: cnpjHash,
      BIO: data.bio || null,
      EMAIL: data.email,
      SENHA_HASH: senhaHash,
      FOTO_PERFIL: data.foto_perfil,
      ID_ADM: null
    }
  });

  await geocodingService.buscarCoordenadas({
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

  return await exports.buscarEmpresarioPorId(
    novoEmpresario.ID_EMPRESARIO
  );
};

exports.aprovarEmpresario = async (
  idEmpresario,
  idAdm
) => {
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

exports.salvarDisponibilidade = async (dados) => {
  const {
    ID_EMPRESARIO,
    DURACAO_MIN,
    PERIODOS,
    DIAS_ATIVOS,
    BLOQUEIOS
  } = dados;

  const idEmpresario = Number(ID_EMPRESARIO);

  const datas = String(DIAS_ATIVOS)
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);

  const todosBloqueios = BLOQUEIOS
    ? BLOQUEIOS.split(',')
        .map((b) => b.trim())
        .filter(Boolean)
    : [];

  return await prisma.$transaction(
    async (tx) => {
      const resultados = [];

      for (const dataAtual of datas) {
        const disponibilidadeExistente =
          await tx.dISPONIBILIDADE.findFirst({
            where: {
              ID_EMPRESARIO: idEmpresario,
              DIAS_ATIVOS: dataAtual
            }
          });

        if (disponibilidadeExistente) {
          const inicioDia = new Date(`${dataAtual}T00:00:00`);
          const fimDia = new Date(`${dataAtual}T23:59:59`);

          const agendamentosConfirmados =
            await tx.aGENDAMENTO.count({
              where: {
                ID_EMPRESARIO: idEmpresario,
                CONFIRMACAO: true,
                CANCELAMENTO: false,
                DATA_HORA: {
                  gte: inicioDia,
                  lte: fimDia
                }
              }
            });

          if (agendamentosConfirmados > 0) {
            throw new Error(
              `Não é possível alterar a data ${dataAtual} pois existem agendamentos confirmados.`
            );
          }

          await tx.bLOQUEIO_DISPONIBILIDADE.deleteMany({
            where: {
              ID_DISP: disponibilidadeExistente.ID_DISP
            }
          });

          await tx.dISPONIBILIDADE.delete({
            where: {
              ID_DISP: disponibilidadeExistente.ID_DISP
            }
          });
        }

        const novaDisp = await tx.dISPONIBILIDADE.create({
          data: {
            ID_EMPRESARIO: idEmpresario,
            DURACAO_MIN: Number(DURACAO_MIN),
            PERIODOS: String(PERIODOS),
            DIAS_ATIVOS: dataAtual
          }
        });

        const bloqueiosDaData = todosBloqueios.filter(
          (bloqueio) =>
            bloqueio.startsWith(`${dataAtual}T`)
        );

        let bloqueiosRetorno = [];

        if (bloqueiosDaData.length > 0) {
          const bloqueiosData = bloqueiosDaData.map(
            (bloqueioCompleto) => {
              const [, hora] =
                bloqueioCompleto.split('T');

              return {
                ID_DISP: novaDisp.ID_DISP,
                HORA_INICIO: hora,
                HORA_FIM: null,
                DIA_INDISPONIVEL: false,
                MOTIVO: 'Bloqueio Manual'
              };
            }
          );

          await tx.bLOQUEIO_DISPONIBILIDADE.createMany({
            data: bloqueiosData
          });

          bloqueiosRetorno = bloqueiosData;
        }

        resultados.push({
          ...novaDisp,
          BLOQUEIO_DISPONIBILIDADE:
            bloqueiosRetorno
        });
      }

      return resultados;
    },
    {
      timeout: 15000
    }
  );
};

exports.adicionarFotoTrabalho = async (
  idEmpresario,
  url
) => {
  return await prisma.fOTO_TRABALHO.create({
    data: {
      URL: url,
      ID_EMPRESARIO: Number(idEmpresario)
    }
  });
};

exports.buscarDisponibilidadePorId = async (id) => {
  try {
    return await prisma.dISPONIBILIDADE.findMany({
      where: {
        ID_EMPRESARIO: Number(id)
      },
      include: {
        BLOQUEIO_DISPONIBILIDADE: true
      },
      orderBy: {
        DIAS_ATIVOS: 'asc'
      }
    });
  } catch (error) {
    console.error(
      'Erro no Prisma ao buscar disponibilidade:',
      error
    );
    throw error;
  }
};

exports.listarEmpresariosProximos = async (
  lat,
  lng,
  raioKm = 10
) => {
  const empresarios =
    await prisma.eMPRESARIO.findMany({
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

  const calcularDistanciaKm = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371;

    const dLat =
      ((lat2 - lat1) * Math.PI) / 180;

    const dLon =
      ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

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
        DISTANCIA_KM: Number(
          distancia.toFixed(2)
        )
      };
    })
    .filter(
      (empresario) =>
        empresario.DISTANCIA_KM <=
        Number(raioKm)
    )
    .sort(
      (a, b) =>
        a.DISTANCIA_KM - b.DISTANCIA_KM
    );
};

exports.excluirDisponibilidade = async (idDisp) => {
  const id = Number(idDisp);

  if (!id || isNaN(id)) {
    throw new Error('ID da disponibilidade inválido.');
  }

  return await prisma.$transaction(async (tx) => {

    // BUSCA DISPONIBILIDADE
    const disponibilidade = await tx.dISPONIBILIDADE.findUnique({
      where: {
        ID_DISP: id
      }
    });

    if (!disponibilidade) {
      throw new Error('Disponibilidade não encontrada.');
    }

    // VERIFICA AGENDAMENTOS CONFIRMADOS NA DATA
    const dataDia = disponibilidade.DIAS_ATIVOS;

    const inicioDia = new Date(`${dataDia}T00:00:00`);
    const fimDia = new Date(`${dataDia}T23:59:59`);

    const agendamentosConfirmados =
      await tx.aGENDAMENTO.count({
        where: {
          ID_EMPRESARIO: disponibilidade.ID_EMPRESARIO,
          CONFIRMACAO: true,
          CANCELAMENTO: false,
          DATA_HORA: {
            gte: inicioDia,
            lte: fimDia
          }
        }
      });

    if (agendamentosConfirmados > 0) {
      throw new Error(
        'Não é possível excluir esta disponibilidade pois existem agendamentos confirmados.'
      );
    }

    // APAGA BLOQUEIOS RELACIONADOS
    await tx.bLOQUEIO_DISPONIBILIDADE.deleteMany({
      where: {
        ID_DISP: id
      }
    });

    // APAGA DISPONIBILIDADE
    await tx.dISPONIBILIDADE.delete({
      where: {
        ID_DISP: id
      }
    });

    return {
      sucesso: true
    };
  });
};