const DICE_SIDES = 6;
const TOTAL_ROUNDS = 5;

const BLOCKS = {
    RETA: "RETA",
    CURVA: "CURVA",
    CONFRONTO: "CONFRONTO",
};

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
    return Math.floor(Math.random() * DICE_SIDES) + 1;
}

function getRandomBlock() {
    const random = Math.random();

    if (random < 1 / 3) return BLOCKS.RETA;
    if (random < 2 / 3) return BLOCKS.CURVA;
    return BLOCKS.CONFRONTO;
}

function logRollResult(characterName, block, diceResult, attribute) {
    console.log(`${characterName} rolou o dado 🎲 de ${block} ${diceResult} + ${attribute} = ${diceResult + attribute}`);
}

// RETA e CURVA compartilham a mesma regra: dado + atributo, maior soma marca ponto.
function resolveSkillCheck(character1, character2, block, attributeKey) {
    const diceResult1 = rollDice();
    const diceResult2 = rollDice();

    const total1 = character1[attributeKey] + diceResult1;
    const total2 = character2[attributeKey] + diceResult2;

    logRollResult(character1.NOME, block, diceResult1, character1[attributeKey]);
    logRollResult(character2.NOME, block, diceResult2, character2[attributeKey]);

    if (total1 > total2) {
        console.log(`${character1.NOME} marcou um ponto!`);
        character1.PONTOS++;
    } else if (total2 > total1) {
        console.log(`${character2.NOME} marcou um ponto!`);
        character2.PONTOS++;
    }
}

// CONFRONTO tem regra própria: quem perde o confronto perde 1 ponto (nunca abaixo de 0).
function resolvePowerClash(character1, character2) {
    const diceResult1 = rollDice();
    const diceResult2 = rollDice();

    const powerResult1 = character1.PODER + diceResult1;
    const powerResult2 = character2.PODER + diceResult2;

    console.log(`${character1.NOME} confrontou ${character2.NOME}! 🥊`);

    logRollResult(character1.NOME, BLOCKS.CONFRONTO, diceResult1, character1.PODER);
    logRollResult(character2.NOME, BLOCKS.CONFRONTO, diceResult2, character2.PODER);

    if (powerResult1 === powerResult2) {
        console.log("Empate no confronto! Ninguém perde pontos.");
        return;
    }

    const winner = powerResult1 > powerResult2 ? character1 : character2;
    const loser = powerResult1 > powerResult2 ? character2 : character1;

    if (loser.PONTOS > 0) {
        console.log(`${winner.NOME} venceu o confronto! ${loser.NOME} perde 1 ponto 🐢.`);
        loser.PONTOS--;
    } else {
        console.log(`${winner.NOME} venceu o confronto! ${loser.NOME} já está com 0 pontos, ninguém perde pontos.`);
    }
}

function playRaceEngine(character1, character2) {
    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
        console.log(`\n🏁 Rodada ${round}`);

        const block = getRandomBlock();
        console.log(`Bloco: ${block}`);

        if (block === BLOCKS.RETA) {
            resolveSkillCheck(character1, character2, block, "VELOCIDADE");
        }

        if (block === BLOCKS.CURVA) {
            resolveSkillCheck(character1, character2, block, "MANOBRABILIDADE");
        }

        if (block === BLOCKS.CONFRONTO) {
            resolvePowerClash(character1, character2);
        }

        console.log("_____________________________");
    }
}

function declareWinner(character1, character2) {
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

(function main() {
    console.log(
        `🏁🚦 Corrida entre ${player1.NOME} e ${player2.NOME} começando...`);

    playRaceEngine(player1, player2);
    declareWinner(player1, player2);
})();
