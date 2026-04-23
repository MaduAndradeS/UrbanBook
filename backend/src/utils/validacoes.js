function limparNumeros(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function validarCPF(cpf) {
  const valor = limparNumeros(cpf);

  if (valor.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(valor)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(valor[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(valor[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(valor[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(valor[10])) return false;

  return true;
}

// Versão atual do seu projeto: aceita 14 dígitos e valida DV clássico.
// Depois podemos evoluir para regra alfanumérica.
function validarCNPJ(cnpj) {
  const valor = limparNumeros(cnpj);

  if (valor.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(valor)) return false;

  const calcularDigito = (base, pesos) => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++) {
      soma += Number(base[i]) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base12 = valor.slice(0, 12);
  const dig1 = calcularDigito(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (dig1 !== Number(valor[12])) return false;

  const base13 = valor.slice(0, 13);
  const dig2 = calcularDigito(base13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (dig2 !== Number(valor[13])) return false;

  return true;
}

function validarCEP(cep) {
  return limparNumeros(cep).length === 8;
}

function validarTelefone(telefone) {
  const valor = limparNumeros(telefone);
  return valor.length >= 10 && valor.length <= 11;
}

module.exports = {
  limparNumeros,
  validarCPF,
  validarCNPJ,
  validarCEP,
  validarTelefone
};