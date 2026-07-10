const readline = require("node:readline");

const { COUNTDOWN_STEPS, COUNTDOWN_STEP_MS } = require("./data");
const {
    createPrompter,
    formatCharacterName,
    selectRacers,
    promptRoundCount,
    printRaceHistory,
    declareWinner,
} = require("./cli");
const { sleep, playRaceEngine } = require("./engine");

(async function main() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = createPrompter(rl);

    console.log("🏁🚦 Bem-vindo ao Mario Kart!");

    const { player1, player2 } = await selectRacers(ask);
    const totalRounds = await promptRoundCount(ask);
    rl.close();

    console.log(
        `\n🏁🚦 Corrida entre ${formatCharacterName(player1)} e ${formatCharacterName(player2)} começando... (${totalRounds} rodadas)`);

    for (const step of COUNTDOWN_STEPS) {
        console.log(step);
        await sleep(COUNTDOWN_STEP_MS);
    }

    const history = await playRaceEngine(player1, player2, totalRounds);
    printRaceHistory(history);
    declareWinner(player1, player2);
})();
