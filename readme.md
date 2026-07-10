<h1>Mario Kart com Node.JS</h1>

  <table>
        <tr>
            <td>
                <img src="./docs/header.gif" alt="Mario Kart" width="200">
            </td>
            <td>
                <b>Objetivo:</b>
                <p>Mario Kart é uma série de jogos de corrida desenvolvida e publicada pela Nintendo. O desafio foi criar uma lógica de um jogo de vídeo game para simular corridas de Mario Kart, levando em consideração as regras e mecânicas abaixo.</p>
            </td>
        </tr>
    </table>

*Este projeto foi desenvolvido com ajuda do Claude Code.*

## Como jogar

O jogo roda direto no terminal, sem instalação de dependências:

```bash
node src/index.js
```

ou, usando o script do `package.json`:

```bash
npm start
```

O jogo então conduz você por um menu interativo:

1. Escolha do modo de jogo: **1x1** (dois jogadores humanos) ou **1xCPU** (você contra o computador, que apenas sorteia seu personagem — sem nenhuma decisão estratégica durante a corrida)
2. Escolha de personagem para cada jogador (o computador nunca repete um personagem já escolhido)
3. Escolha da quantidade de rodadas da corrida: 5, 9 ou 13

## Players

| Personagem       | Velocidade | Manobrabilidade | Poder |
|-------------------|:----------:|:----------------:|:-----:|
| 🔴 Mario          | 4          | 3                | 3     |
| 🟢 Luigi          | 3          | 4                | 4     |
| 🍑 Peach          | 3          | 4                | 2     |
| 🍄 Toad           | 5          | 3                | 1     |
| 🦖 Yoshi          | 2          | 4                | 3     |
| 🐢 Bowser         | 5          | 2                | 5     |
| 🦍 Donkey Kong    | 2          | 2                | 5     |
| 🐚 Koopa Troopa   | 3          | 5                | 2     |

## 🕹️ Regras & mecânicas

**Jogadores:**

Dois personagens disputam a corrida, escolhidos no início da partida via terminal — em 1x1 os dois são escolhidos por pessoas, em 1xCPU o segundo é sorteado automaticamente entre os personagens restantes.

**Pistas:**

- Os personagens correm por uma pista aleatória com 5, 9 ou 13 rodadas (escolhido no início da partida)
- A cada rodada, será sorteado um bloco da pista que pode ser uma reta, curva ou confronto
  - Caso o bloco da pista seja uma **RETA**, o jogador deve jogar um dado de 6 lados e somar o atributo VELOCIDADE, quem vencer ganha um ponto
  - Caso o bloco da pista seja uma **CURVA**, o jogador deve jogar um dado de 6 lados e somar o atributo MANOBRABILIDADE, quem vencer ganha um ponto
  - Caso o bloco da pista seja um **CONFRONTO**, o jogador deve jogar um dado de 6 lados e somar o atributo PODER, quem perder, perde um ponto
  - Nenhum jogador pode ter pontuação negativa (valores abaixo de 0)

**Condição de vitória:**

Ao final, vence quem acumulou mais pontos. Um placar visual acompanha cada rodada, e um histórico completo da corrida é exibido em forma de tabela antes do resultado final.
