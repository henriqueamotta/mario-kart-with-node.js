const { BLOCKS, DICE_SIDES, ROUND_PAUSE_MS, DICE_ANIMATION_FRAMES, DICE_ANIMATION_FRAME_MS } = require("./data");
const { formatCharacterName, printScoreboard } = require("./cli");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Função para simular o lançamento do dado
function rollDice() {
    return Math.floor(Math.random() * DICE_SIDES) + 1;
}

// Pisca valores aleatórios na mesma linha antes de revelar o resultado final,
// simulando o dado girando. O "\r" só sobrescreve a linha em um
// terminal interativo (TTY); em saída redirecionada/pipe isso viraria uma
// sequência de linhas coladas, então nesse caso pulamos direto para o resultado.
// A linha final já sai com a conta completa (dado + atributo = total) para não
// repetir a mesma informação em duas linhas separadas.
async function rollDiceAnimated(characterName, block, attributeValue) {
    if (!process.stdout.isTTY) {
        console.log(`${characterName} rolando o dado 🎲 de ${block}...`);
        await sleep(DICE_ANIMATION_FRAMES * DICE_ANIMATION_FRAME_MS);
        const diceResult = rollDice();
        console.log(`${characterName} rolou o dado 🎲 de ${block}: ${diceResult} + ${attributeValue} = ${diceResult + attributeValue}`);
        return diceResult;
    }

    for (let frame = 0; frame < DICE_ANIMATION_FRAMES; frame++) {
        process.stdout.write(`\r${characterName} rolando o dado 🎲 de ${block}... ${rollDice()}`);
        await sleep(DICE_ANIMATION_FRAME_MS);
    }

    const diceResult = rollDice();
    process.stdout.write(
        `\r${characterName} rolou o dado 🎲 de ${block}: ${diceResult} + ${attributeValue} = ${diceResult + attributeValue}      \n`
    );
    return diceResult;
}

function getRandomBlock() {
    const random = Math.random();

    if (random < 1 / 3) return BLOCKS.RETA;
    if (random < 2 / 3) return BLOCKS.CURVA;
    return BLOCKS.CONFRONTO;
}

// RETA e CURVA compartilham a mesma regra: dado + atributo, maior soma marca ponto.
// Retorna um resumo da rodada para alimentar o histórico final.
async function resolveSkillCheck(character1, character2, block, attributeKey) {
    const diceResult1 = await rollDiceAnimated(formatCharacterName(character1), block, character1[attributeKey]);
    const diceResult2 = await rollDiceAnimated(formatCharacterName(character2), block, character2[attributeKey]);

    const total1 = character1[attributeKey] + diceResult1;
    const total2 = character2[attributeKey] + diceResult2;

    await sleep(ROUND_PAUSE_MS);

    let outcome = "Empate";

    if (total1 > total2) {
        console.log(`${formatCharacterName(character1)} marcou um ponto!`);
        character1.PONTOS++;
        outcome = `${character1.NOME} +1 ponto`;
    } else if (total2 > total1) {
        console.log(`${formatCharacterName(character2)} marcou um ponto!`);
        character2.PONTOS++;
        outcome = `${character2.NOME} +1 ponto`;
    }

    return {
        detail1: `${diceResult1} + ${character1[attributeKey]} = ${total1}`,
        detail2: `${diceResult2} + ${character2[attributeKey]} = ${total2}`,
        outcome,
    };
}

// CONFRONTO tem regra própria: quem perde o confronto perde 1 ponto (nunca abaixo de 0).
// Retorna um resumo da rodada para alimentar o histórico final.
async function resolvePowerClash(character1, character2) {
    console.log(`${formatCharacterName(character1)} confrontou ${formatCharacterName(character2)}! 🥊`);

    const diceResult1 = await rollDiceAnimated(formatCharacterName(character1), BLOCKS.CONFRONTO, character1.PODER);
    const diceResult2 = await rollDiceAnimated(formatCharacterName(character2), BLOCKS.CONFRONTO, character2.PODER);

    const powerResult1 = character1.PODER + diceResult1;
    const powerResult2 = character2.PODER + diceResult2;

    await sleep(ROUND_PAUSE_MS);

    const detail1 = `${diceResult1} + ${character1.PODER} = ${powerResult1}`;
    const detail2 = `${diceResult2} + ${character2.PODER} = ${powerResult2}`;

    if (powerResult1 === powerResult2) {
        console.log("Empate no confronto! Ninguém perde pontos.");
        return { detail1, detail2, outcome: "Empate no confronto" };
    }

    const winner = powerResult1 > powerResult2 ? character1 : character2;
    const loser = powerResult1 > powerResult2 ? character2 : character1;

    if (loser.PONTOS > 0) {
        console.log(`${formatCharacterName(winner)} venceu o confronto! ${formatCharacterName(loser)} perde 1 ponto ⚠️.`);
        loser.PONTOS--;
        return { detail1, detail2, outcome: `${loser.NOME} -1 ponto` };
    }

    console.log(`${formatCharacterName(winner)} venceu o confronto! ${formatCharacterName(loser)} já está com 0 pontos, ninguém perde pontos.`);
    return { detail1, detail2, outcome: `${winner.NOME} venceu (sem pontos a tirar)` };
}

async function playRaceEngine(character1, character2, totalRounds) {
    const history = [];

    for (let round = 1; round <= totalRounds; round++) {
        console.log(`\n🏁 Rodada ${round}`);

        const block = getRandomBlock();
        console.log(`Bloco: ${block}`);
        await sleep(ROUND_PAUSE_MS / 2);

        let result;
        if (block === BLOCKS.RETA) {
            result = await resolveSkillCheck(character1, character2, block, "VELOCIDADE");
        }

        if (block === BLOCKS.CURVA) {
            result = await resolveSkillCheck(character1, character2, block, "MANOBRABILIDADE");
        }

        if (block === BLOCKS.CONFRONTO) {
            result = await resolvePowerClash(character1, character2);
        }

        printScoreboard(character1, character2);
        console.log("_____________________________");

        history.push({
            Rodada: round,
            Bloco: block,
            [`${character1.NOME} ${character1.ICONE}`]: result.detail1,
            [`${character2.NOME} ${character2.ICONE}`]: result.detail2,
            Resultado: result.outcome,
            Placar: `${character1.ICONE} ${character1.PONTOS} x ${character2.PONTOS} ${character2.ICONE}`,
        });
    }

    return history;
}

module.exports = {
    sleep,
    playRaceEngine,
};
