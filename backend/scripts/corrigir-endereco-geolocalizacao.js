const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function limparCep(cep) {
  return String(cep || '').replace(/\D/g, '');
}

async function buscarEnderecoPorCep(cep) {
  const cepLimpo = limparCep(cep);

  if (cepLimpo.length !== 8) {
    return null;
  }

  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  const data = await response.json();

  if (data.erro) {
    return null;
  }

  return {
    rua: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade || '',
    estado: data.uf || '',
    cep: cepLimpo
  };
}

async function buscarLatitudeLongitude(endereco) {
  const tentativas = [
    `${endereco.rua}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.estado}, Brasil`,
    `${endereco.rua}, ${endereco.cidade}, ${endereco.estado}, Brasil`,
    `${endereco.bairro}, ${endereco.cidade}, ${endereco.estado}, Brasil`,
    `${endereco.cidade}, ${endereco.estado}, Brasil`,
    `${endereco.cep}, Brasil`
  ];

  for (const textoBusca of tentativas) {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&q=${encodeURIComponent(textoBusca)}&limit=1&countrycodes=br`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'urbanbook-geocoding-script/1.0'
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      console.log(`Coordenada encontrada usando: ${textoBusca}`);

      return {
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon)
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  return null;
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executar() {
  console.log('Iniciando correção de endereços...');

  const enderecos = await prisma.eNDERECO.findMany({
    where: {
      OR: [
        { LATITUDE: null },
        { LONGITUDE: null }
      ]
    }
  });

  console.log(`Endereços encontrados: ${enderecos.length}`);

  for (const enderecoBanco of enderecos) {
    try {
      console.log('----------------------------');
      console.log(`Corrigindo ID_ENDERECO: ${enderecoBanco.ID_ENDERECO}`);
      console.log(`CEP atual: ${enderecoBanco.CEP}`);

      const enderecoCep = await buscarEnderecoPorCep(enderecoBanco.CEP);

      if (!enderecoCep) {
        console.log('CEP inválido ou não encontrado. Pulando...');
        continue;
      }

      console.log('Endereço pelo CEP:', enderecoCep);

      const coordenadas = await buscarLatitudeLongitude(enderecoCep);

      if (!coordenadas) {
        console.log('Não encontrou latitude/longitude. Atualizando apenas endereço...');

        await prisma.eNDERECO.update({
          where: {
            ID_ENDERECO: enderecoBanco.ID_ENDERECO
          },
          data: {
            RUA: enderecoCep.rua,
            BAIRRO: enderecoCep.bairro,
            CIDADE: enderecoCep.cidade,
            ESTADO: enderecoCep.estado,
            CEP: enderecoCep.cep
          }
        });

        continue;
      }

      await prisma.eNDERECO.update({
        where: {
          ID_ENDERECO: enderecoBanco.ID_ENDERECO
        },
        data: {
          RUA: enderecoCep.rua,
          BAIRRO: enderecoCep.bairro,
          CIDADE: enderecoCep.cidade,
          ESTADO: enderecoCep.estado,
          CEP: enderecoCep.cep,
          LATITUDE: coordenadas.latitude,
          LONGITUDE: coordenadas.longitude
        }
      });

      console.log('Atualizado com sucesso!');
      console.log(coordenadas);

      await esperar(1200);
    } catch (error) {
      console.log('Erro ao corrigir endereço:', error.message);
    }
  }

  console.log('Processo finalizado.');
}

executar()
  .catch((error) => {
    console.error('Erro geral:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });