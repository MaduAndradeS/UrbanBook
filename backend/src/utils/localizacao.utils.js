async function buscarEnderecoPorCep(cep) {
  const cepLimpo = String(cep || '').replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    throw new Error('CEP inválido.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  const data = await response.json();

  if (data.erro) {
    throw new Error('CEP não encontrado.');
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
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        textoBusca
      )}&limit=1&countrycodes=br`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'urbanbook-api/1.0'
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon)
      };
    }
  }

  return null;
}

module.exports = {
  buscarEnderecoPorCep,
  buscarLatitudeLongitude
};