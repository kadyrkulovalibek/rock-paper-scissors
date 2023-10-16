const readlineSync = require("readline-sync");
const rand = require('csprng');
const crypto = require("crypto");
const allMovesarray = process.argv.slice(2);

class Table {
    displayArrayAsTable(ruleArray, moves) {
        const formattedTable = moves.map((move, i) => {
            const resultRow = {};
            resultRow["PC\\User"] = move.value;
    
            for (let j = 0; j < moves.length; j++) {
                resultRow[moves[j].value] = ruleArray[i][j];
            }
    
            return resultRow;
        });
        
        console.table(formattedTable);
    }
}

class Game {
    constructor(data) {
        this.options = data.map((value, index) => {
            return { option: index + 1, value: value };
        });
        this.rules = this.gameRules();
    }

    gameRules() {
        const numShapes = this.options.length;
        const rules = new Array(numShapes);
    
        for (let i = 0; i < numShapes; i++) {
            rules[i] = new Array(numShapes);
            for (let j = 0; j < numShapes; j++) {
                const result = this.defineWinner(i + 1, j + 1, numShapes);
                rules[i][j] = result;
            }
        }
    
        return rules;
    }    

    defineWinner(userChoice, computerChoice, shapesCount){
        let halfLength = shapesCount / 2;
        let diff = (computerChoice - userChoice + shapesCount) % shapesCount;

        if (diff == 0)
        {
            return("Draw");
        }
        else if (diff <= halfLength)
        {
            return("Lose");
        }
        else
        {
            return("Win");
        }
    }
}

class HMAC {
    constructor() {
        this.key = rand(256,16);
    }
    generateHMAC(text) {
        return crypto.createHmac('sha256', this.key).update(text).digest('hex');
    }
}

class Main {
    isDataWrong(data) {
        if (!(data.length % 2 !== 0 && data.length > 1))
            return true;
        for (let i in data)
            if (i != data.lastIndexOf(data[i]))
                return true;
        return false;
    }

    showMenu(shapes) {
        shapes.forEach(shape => {
            console.log(`${shape.option} - ${shape.value}`);
        });
        console.log("0 - Exit\n? - help");
    }

    askQuestion(query) {
        return readlineSync.question(query).replace(/ + /g,' ').trim().split(" ");
    }

    checkArgs() {
        let data = [];
        for (let i = 2; i < process.argv.length; i++)
            data[i-2] = process.argv[i];
        while (this.isDataWrong(data)) {
            console.log("Invalid input. The number of parameters should be odd and without duplicates. Example: Rock Paper Scissors.")
            data = this.askQuestion("Please, enter data again:\n");
        }
        return data;
    }

    isKeyValid(userMove, options) {
        if (userMove == '0') {
            console.log("Bye!");
        } else if (userMove != "?" && !(userMove >= '0' && userMove <= options)) {
            console.log(`The move is invalid. Enter a number from 1 to ${allMovesarray.length} to make a move, 0 to exit, or ? for help.`);
            return false;
        }
        return true;
    }

    startGame() {
        let data = this.checkArgs();
        let game = new Game(data);
        let table = new Table();
        let hash = new HMAC();        
        let userMove;

        while (userMove != 0) {
            let computerMove = Math.floor((Math.random()*game.options.length)+1);            

            console.log("HMAC: " + hash.generateHMAC(game.options[computerMove-1].value));
            this.showMenu(game.options);
            userMove = this.askQuestion("Enter your move: ");
            
            if (this.isKeyValid(userMove,game.options.length)){
                if (userMove == "?")
                    table.displayArrayAsTable(game.rules, game.options);
                else if (userMove != 0) {
                    console.log(`Your move: ${game.options[userMove-1].value}`);
                    console.log(`Computer move: ${game.options[computerMove-1].value}`);
                    console.log(game.rules[userMove-1][computerMove-1]);
                    console.log(`HMAC key: ${hash.key}`);
                    console.log("\nNEXT GAME");
                }
            }
        }
    } 
}

let main = new Main();
main.startGame();