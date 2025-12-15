// game/dice/diceManager.js
export function tirarDado(numDados = 1) {
    const resultados = [];
    let total = 0;
    
    for (let i = 0; i < numDados; i++) {
        const dado = Math.floor(Math.random() * 6) + 1;
        resultados.push(dado);
        total += dado;
    }
    
    return {
        resultados: resultados,
        total: total,
        numDados: numDados
    };
}

export function formatearResultadoDado(resultado, jugadorNombre) {
    if (resultado.numDados === 1) {
        return ` ${jugadorNombre} ha sacado un ${resultado.total}`;
    } else {
        return ` ${jugadorNombre} ha sacado ${resultado.resultados.join(' + ')} = ${resultado.total}`;
    }
}