exports.buscarCoordenadas = async ({ rua, num, bairro, cidade, estado, cep }) => {
  const endereco = `${rua}, ${num || ''}, ${bairro}, ${cidade}, ${estado}, ${cep}, Brasil`;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'UrbanBook/1.0'
    }
  });

  const data = await response.json();

  if (!data || data.length === 0) {
    return {
      latitude: null,
      longitude: null
    };
  }

  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon)
  };
};
exports.buscarCoordenadasPorTexto = async (texto) => {
  const endereco = `${texto}, Brasil`;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'UrbanBook/1.0'
    }
  });

  const data = await response.json();

  if (!data || data.length === 0) {
    return {
      latitude: null,
      longitude: null,
      endereco: null
    };
  }

  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
    endereco: data[0].display_name
  };
};