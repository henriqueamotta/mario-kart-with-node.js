const player1 = {
    NOME: "Mario", 
    VELOCIDADE: 4,
    MANOBRABILIDADE: 3,
    PODER: 3,
    PONTOS: 0,
};

const player2 = {
    NOME: "Luigi", 
    VELOCIDADE: 3,
    MANOBRABILIDADE: 4,
    PODER: 4,
    PONTOS: 0,
};

// Função para simular o lançamento do dado
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

async function getRandomBlock() {
    let random = Math.random();
    let result

    switch (true) {
        case random < 0.33:
            result = "RETA"
            break;
        case random < 0.66:
            result = "CURVA"
            break;
        default:
            result = "CONFRONTO";
    }
    return result;
}


async function logRollResult(characterName, block, diceResult, attribute) {
    console.log(`${characterName} rolou o dado 🎲 de ${block} ${diceResult} + ${attribute} = ${diceResult + attribute}`);
}

async function playRaceEngine(character1, character2) {
    for (let round = 1; round <= 5; round++) {
        console.log(`\n🏁 Rodada ${round}`);
    
        // Sortear bloco
        let block = await getRandomBlock();
        console.log(`Bloco: ${block}`);

        // Jogar os dados
        let diceResult1 = await rollDice();
        let diceResult2 = await rollDice();

        // Teste de habilidade
        let totalTestSkill1 = 0;
        let totalTestSkill2 = 0;

        if (block === "RETA") {
            totalTestSkill1 = character1.VELOCIDADE + diceResult1;
            totalTestSkill2 = character2.VELOCIDADE + diceResult2;

            await logRollResult(character1.NOME, block, diceResult1, character1.VELOCIDADE);
            await logRollResult(character2.NOME, block, diceResult2, character2.VELOCIDADE);
        }

        if (block === "CURVA") {
            totalTestSkill1 = character1.MANOBRABILIDADE + diceResult1;
            totalTestSkill2 = character2.MANOBRABILIDADE + diceResult2;

            await logRollResult(character1.NOME, block, diceResult1, character1.MANOBRABILIDADE);
            await logRollResult(character2.NOME, block, diceResult2, character2.MANOBRABILIDADE);
        }

        if (block === "CONFRONTO") {
            let powerResult1 = character1.PODER + diceResult1;
            let powerResult2 = character2.PODER + diceResult2;

            console.log(`${character1.NOME} confrontou ${character2.NOME}! 🥊`);

            await logRollResult(character1.NOME, block, diceResult1, character1.PODER);
            await logRollResult(character2.NOME, block, diceResult2, character2.PODER);

            if (powerResult1 > powerResult2) {
                if (character2.PONTOS > 0) {
                    console.log(`${character1.NOME} venceu o confronto! ${character2.NOME} perde 1 ponto 🐢.`);
                    character2.PONTOS--;
                }
            }

            if (powerResult2 > powerResult1) {
                if (character1.PONTOS > 0) {
                    console.log(`${character2.NOME} venceu o confronto! ${character1.NOME} perde 1 ponto 🐢.`);
                    character1.PONTOS--;
                }
            }

            if (powerResult1 === powerResult2) {
                console.log("Empate no confronto! Ninguém perde pontos.");
            }
        }

        // Verificando o vencedor da rodada
        if (totalTestSkill1 > totalTestSkill2) {
            console.log(`${character1.NOME} marcou um ponto!`);
            character1.PONTOS++;
        } else if (totalTestSkill2 > totalTestSkill1) {
            console.log(`${character2.NOME} marcou um ponto!`);
            character2.PONTOS++;
        }
        console.log("_____________________________");
    }
}

async function declareWinner(character1, character2) {
    console.log("\n🏆 Resultado final da corrida:");
    console.log(`${character1.NOME}: ${character1.PONTOS} ponto(s)`);
    console.log(`${character2.NOME}: ${character2.PONTOS} ponto(s)`);

    if (character1.PONTOS > character2.PONTOS) {
        console.log(`\n🎉 ${character1.NOME} venceu a corrida! 🏆`);
    } else if (character2.PONTOS > character1.PONTOS) {
        console.log(`\n🎉 ${character2.NOME} venceu a corrida! 🏆`);
    } else {
        console.log(`\n🤝 A corrida terminou empatada!`);
    }
}

(async function main() {
    console.log(
        `🏁🚦 Corrida entre ${player1.NOME} e ${player2.NOME} começando...`);
    
    await playRaceEngine(player1, player2);
    await declareWinner(player1, player2);
})();

