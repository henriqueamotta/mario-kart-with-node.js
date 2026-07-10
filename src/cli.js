const { CHARACTERS, ROUND_OPTIONS } = require("./data");

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

function formatCharacterName(character) {
    return `${character.ICONE} ${character.NOME}`;
}

// Cria uma cópia do personagem com PONTOS zerado, evitando compartilhar estado entre corridas.
function createRacer(characterTemplate) {
    return { ...characterTemplate, PONTOS: 0 };
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

async function promptRoundCount(ask) {
    const optionsLabel = ROUND_OPTIONS.join("/");

    while (true) {
        const answer = (await ask(`\nQuantas rodadas? (${optionsLabel}): `)).trim();
        const roundCount = Number(answer);

        if (ROUND_OPTIONS.includes(roundCount)) {
            return roundCount;
        }

        console.log(`Opção inválida. Escolha entre ${optionsLabel}.`);
    }
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

function printScoreboard(character1, character2) {
    const bar1 = "▓".repeat(character1.PONTOS) || "·";
    const bar2 = "▓".repeat(character2.PONTOS) || "·";
    console.log(
        `Placar: ${formatCharacterName(character1)} ${bar1} (${character1.PONTOS})  |  ${formatCharacterName(character2)} ${bar2} (${character2.PONTOS})`
    );
}

// Renderizador de tabela próprio: console.table sempre acrescenta uma coluna
// "(index)" e envolve valores em aspas simples, sem opção de desligar isso.
function renderTable(rows) {
    const columns = Object.keys(rows[0]);
    const widths = columns.map((column) =>
        Math.max(column.length, ...rows.map((row) => String(row[column]).length))
    );

    const renderRow = (cells) =>
        `│ ${cells.map((cell, i) => String(cell).padEnd(widths[i])).join(" │ ")} │`;

    const renderSeparator = (left, mid, right) =>
        left + widths.map((width) => "─".repeat(width + 2)).join(mid) + right;

    const lines = [renderSeparator("┌", "┬", "┐"), renderRow(columns), renderSeparator("├", "┼", "┤")];
    rows.forEach((row) => lines.push(renderRow(columns.map((column) => row[column]))));
    lines.push(renderSeparator("└", "┴", "┘"));

    return lines.join("\n");
}

function printRaceHistory(history) {
    console.log("\n📋 Histórico da corrida:");
    console.log(renderTable(history));
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

module.exports = {
    createPrompter,
    formatCharacterName,
    selectRacers,
    promptRoundCount,
    printScoreboard,
    printRaceHistory,
    declareWinner,
};
