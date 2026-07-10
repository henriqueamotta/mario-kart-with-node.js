const readline = require("node:readline");

const DICE_SIDES = 6;
const TOTAL_ROUNDS = 5;

const BLOCKS = {
    RETA: "RETA",
    CURVA: "CURVA",
    CONFRONTO: "CONFRONTO",
};

const CHARACTERS = [
    { NOME: "Mario", ICONE: "🔴", VELOCIDADE: 4, MANOBRABILIDADE: 3, PODER: 3 },
    { NOME: "Luigi", ICONE: "🟢", VELOCIDADE: 3, MANOBRABILIDADE: 4, PODER: 4 },
    { NOME: "Peach", ICONE: "🍑", VELOCIDADE: 3, MANOBRABILIDADE: 4, PODER: 2 },
    { NOME: "Toad", ICONE: "🍄", VELOCIDADE: 5, MANOBRABILIDADE: 3, PODER: 1 },
    { NOME: "Yoshi", ICONE: "🦖", VELOCIDADE: 2, MANOBRABILIDADE: 4, PODER: 3 },
    { NOME: "Bowser", ICONE: "🐢", VELOCIDADE: 5, MANOBRABILIDADE: 2, PODER: 5 },
    { NOME: "Donkey Kong", ICONE: "🦍", VELOCIDADE: 2, MANOBRABILIDADE: 2, PODER: 5 },
];

// Cria uma cópia do personagem com PONTOS zerado, evitando compartilhar estado entre corridas.
function createRacer(characterTemplate) {
    return { ...characterTemplate, PONTOS: 0 };
}

function formatCharacterName(character) {
    return `${character.ICONE} ${character.NOME}`;
}

// rl.question() perde linhas quando o stdin chega em lote (ex: pipe/non-TTY),
// porque o listener "line" só é anexado depois que o evento já disparou.
// Uma fila de linhas persistente evita essa perda.
function createPrompter(rl) {
    const queue = [];
    let pendingResolve = null;

    rl.on("line", (line) => {
        if (pendingResolve) {
            pendingResolve(line);
            pendingResolve = null;
        } else {
            queue.push(line);
        }
    });

    return function ask(question) {
        process.stdout.write(question);
        if (queue.length > 0) return Promise.resolve(queue.shift());
        return new Promise((resolve) => {
            pendingResolve = resolve;
        });
    };
}

async function promptGameMode(ask) {
    while (true) {
        const answer = (await ask(
            "\nEscolha o modo de jogo:\n1 - 1x1 (dois jogadores)\n2 - 1xCPU (contra o computador)\n> "
        )).trim();

        if (answer === "1") return "1x1";
        if (answer === "2") return "1xCPU";

        console.log("Opção inválida. Digite 1 ou 2.");
    }
}

function listAvailableCharacters(availableCharacters) {
    availableCharacters.forEach((character, index) => {
        console.log(
            `${index + 1} - ${formatCharacterName(character)} (VELOCIDADE: ${character.VELOCIDADE}, MANOBRABILIDADE: ${character.MANOBRABILIDADE}, PODER: ${character.PODER})`
        );
    });
}

async function promptCharacterChoice(ask, playerLabel, availableCharacters) {
    console.log(`\nPersonagens disponíveis para ${playerLabel}:`);
    listAvailableCharacters(availableCharacters);

    while (true) {
        const answer = (await ask("Escolha o número do personagem: ")).trim();
        const index = Number(answer) - 1;

        if (Number.isInteger(index) && index >= 0 && index < availableCharacters.length) {
            return availableCharacters[index];
        }

        console.log("Opção inválida. Tente novamente.");
    }
}

function pickRandomCharacter(availableCharacters) {
    const index = Math.floor(Math.random() * availableCharacters.length);
    return availableCharacters[index];
}

// CPU não toma decisões estratégicas: apenas sorteia o personagem entre os restantes.
async function selectRacers(ask) {
    const gameMode = await promptGameMode(ask);
    const availableCharacters = [...CHARACTERS];

    const character1Template = await promptCharacterChoice(ask, "Jogador 1", availableCharacters);
    availableCharacters.splice(availableCharacters.indexOf(character1Template), 1);

    let character2Template;
    if (gameMode === "1x1") {
        character2Template = await promptCharacterChoice(ask, "Jogador 2", availableCharacters);
    } else {
        character2Template = pickRandomCharacter(availableCharacters);
        console.log(`\nCPU escolheu ${formatCharacterName(character2Template)}!`);
    }

    return {
        player1: createRacer(character1Template),
        player2: createRacer(character2Template),
    };
}

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

    logRollResult(formatCharacterName(character1), block, diceResult1, character1[attributeKey]);
    logRollResult(formatCharacterName(character2), block, diceResult2, character2[attributeKey]);

    if (total1 > total2) {
        console.log(`${formatCharacterName(character1)} marcou um ponto!`);
        character1.PONTOS++;
    } else if (total2 > total1) {
        console.log(`${formatCharacterName(character2)} marcou um ponto!`);
        character2.PONTOS++;
    }
}

// CONFRONTO tem regra própria: quem perde o confronto perde 1 ponto (nunca abaixo de 0).
function resolvePowerClash(character1, character2) {
    const diceResult1 = rollDice();
    const diceResult2 = rollDice();

    const powerResult1 = character1.PODER + diceResult1;
    const powerResult2 = character2.PODER + diceResult2;

    console.log(`${formatCharacterName(character1)} confrontou ${formatCharacterName(character2)}! 🥊`);

    logRollResult(formatCharacterName(character1), BLOCKS.CONFRONTO, diceResult1, character1.PODER);
    logRollResult(formatCharacterName(character2), BLOCKS.CONFRONTO, diceResult2, character2.PODER);

    if (powerResult1 === powerResult2) {
        console.log("Empate no confronto! Ninguém perde pontos.");
        return;
    }

    const winner = powerResult1 > powerResult2 ? character1 : character2;
    const loser = powerResult1 > powerResult2 ? character2 : character1;

    if (loser.PONTOS > 0) {
        console.log(`${formatCharacterName(winner)} venceu o confronto! ${formatCharacterName(loser)} perde 1 ponto ⚠️.`);
        loser.PONTOS--;
    } else {
        console.log(`${formatCharacterName(winner)} venceu o confronto! ${formatCharacterName(loser)} já está com 0 pontos, ninguém perde pontos.`);
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
    console.log(`${formatCharacterName(character1)}: ${character1.PONTOS} ponto(s)`);
    console.log(`${formatCharacterName(character2)}: ${character2.PONTOS} ponto(s)`);

    if (character1.PONTOS > character2.PONTOS) {
        console.log(`\n🎉 ${formatCharacterName(character1)} venceu a corrida! 🏆`);
    } else if (character2.PONTOS > character1.PONTOS) {
        console.log(`\n🎉 ${formatCharacterName(character2)} venceu a corrida! 🏆`);
    } else {
        console.log(`\n🤝 A corrida terminou empatada!`);
    }
}

(async function main() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = createPrompter(rl);

    console.log("🏁🚦 Bem-vindo ao Mario Kart!");

    const { player1, player2 } = await selectRacers(ask);
    rl.close();

    console.log(
        `\n🏁🚦 Corrida entre ${formatCharacterName(player1)} e ${formatCharacterName(player2)} começando...`);

    playRaceEngine(player1, player2);
    declareWinner(player1, player2);
})();
