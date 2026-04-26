const geocodingService = require('../services/geocoding.service');

exports.buscarLocalizacao = async (req, res) => {
  try {
    const { endereco } = req.query;

    if (!endereco) {
      return res.status(400).json({
        message: 'Endereço é obrigatório'
      });
    }

    const coordenadas = await geocodingService.buscarCoordenadasPorTexto(endereco);

    if (!coordenadas.latitude || !coordenadas.longitude) {
      return res.status(404).json({
        message: 'Localização não encontrada'
      });
    }

    return res.status(200).json(coordenadas);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar localização',
      error: error.message
    });
  }
};