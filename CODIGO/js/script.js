var gameSize = 7;
var totalGameSquares = (gameSize - 1)*(gameSize - 1);
var gameData = generateGameData(gameSize);
var currentStreak = 0;
var lastClicked = null;
var score = {me: 0, com: 0};
var doneScores = [];
var doneScoresIds = {};

function generateGameData(size) {
	var gameData = [];
	var posX = 10;
	var posY = 10;
	var count = 1;

	for (let i = 1; i <= size; i++) {
		for(let j = 1; j <= size; j++) {

			let dotId = i + '-' + j;

			gameData[dotId] = {
				posX: posX,
				posY: posY
			}

			posX += 50;
		}

		posX = 10;
		posY += 50;
	}

	return gameData;
}

function computerChoice(data) {
	var scoreOptions = [];
	var bestPath = {};
	var bestPath = {one: [], two: [], three: [], four: []}

	for (let i in gameData) {
		scoreOptions = getAllDotScoreOptions(i);

		if (scoreOptions.one.length > 0) {
			connsList.push(scoreOptions.one[0][0]);
			redrawBoard();
			setScores(i, 'com');
			computerChoice();
			return;
		}

		if (scoreOptions.four.length > 0) {
			bestPath.four.push(scoreOptions.four);
			continue;
		}

		if (scoreOptions.three.length > 0) {
			bestPath.three.push(scoreOptions.three);
			continue;
		}

		if (scoreOptions.two.length > 0) {
			bestPath.two.push(scoreOptions.two);
			continue;
		}
	}

	var choice = getRandomPath(bestPath);

	connsList.push(choice);

	redrawBoard();
	return;
}

/**
 * Seleciona um caminho aleatório, baseado na regra da melhor escolha
 * @param bestPath {Object} objeto contendo todos os pontos disponíveis separados em número de caminhos faltanten
 * Ex > obj = {
 *	/* Contém um array de caminhos de todos os scores possíveis onde faltam 4 caminhos para fechar a partir de um ponto
 *	four: array(
 *		/* Array com os 4 pontos necessários para fechar um score que tem relação com o ponto que foi analisado
 *		array(
 *			0: "1-1/1-2"
 *			1: "1-2/2-2"
 *			2: "2-1/2-2"
 *			3: "1-1/2-1"
 *		),
 *		array(...),
 *		array(...)
 * 	),
 * }
 */
function getRandomPath(bestPath)
{
	var quadrant = 0;
	var conn = 0;
	var size = 0;
	var number = 0;

	if (bestPath.four.length > 0) {
		size = bestPath.four.length - 1;
		number = Math.round(Math.random()*size);
		quadrant = Math.round(Math.random()*(bestPath.four[number].length - 1));
		conn = Math.round(Math.random()*(bestPath.four[number][quadrant].length - 1));

		return bestPath.four[number][quadrant][conn];
	}

	if (bestPath.three.length > 0) {
		size = bestPath.three.length - 1;
		number = Math.round(Math.random()*size);
		quadrant = Math.round(Math.random()*(bestPath.three[number].length -1));
		conn = Math.round(Math.random()*(bestPath.three[number][quadrant].length - 1));

		return bestPath.three[number][quadrant][conn];
	}

	if (bestPath.two.length > 0) {
		size = bestPath.two.length - 1;
		number = Math.round(Math.random()*size);
		quadrant = Math.round(Math.random()*(bestPath.two[number].length -1));
		conn = Math.round(Math.random()*(bestPath.two[number][quadrant].length - 1));

		return bestPath.two[number][quadrant][conn];
	}
}

function getAllDotScoreOptions(dotId) {
	var idArr = dotId.split('-');
	var line = parseInt(idArr[0]);
	var col = parseInt(idArr[1]);
	var connCount = 0;
	var {upperRightQuadrantPathArr, upperLeftQuadrantPathArr, lowerRightQuadrantPathArr, lowerLeftQuadrantPathArr} = getDotPositionsArr(line, col);

	var scorePaths = [upperRightQuadrantPathArr, upperLeftQuadrantPathArr, lowerRightQuadrantPathArr, lowerLeftQuadrantPathArr];
	var falsePaths = {one: [], two: [], three: [], four: []}

	for (var i in scorePaths) {
		let connCount = 0;
		let tempFalsePaths = [];

		if (scorePaths[i] == null) {
			continue;
		}

		let quadPathStatus = getQuadrantPathStatus(scorePaths[i]);

		if (quadPathStatus.completed) {
			continue;
		} 
		else {
			delete quadPathStatus.completed;
		}

		for (var c in quadPathStatus) {

			if (!quadPathStatus[c]) {
				tempFalsePaths.push(c);
			}
		}

		if (tempFalsePaths.length == 1) {
			falsePaths.one.push(tempFalsePaths);
		}

		if (tempFalsePaths.length == 2) {
			falsePaths.two.push(tempFalsePaths);
		}

		if (tempFalsePaths.length == 3) {
			falsePaths.three.push(tempFalsePaths);
		}

		if (tempFalsePaths.length == 4) {
			falsePaths.four.push(tempFalsePaths);
		}
	}

	return falsePaths;
}

/**
 * Renderiza o 'tabuleiro'
 * @param {Object} data objeto contendo todos os ponto que serão mostrados no jogo
 */
function renderGameBoard(data)
{
	for (var i in data ) {
		let dotId = i;
		let line = parseInt(i.split('-')[0]);
		let column = parseInt(i.split('-')[1]);

		renderDot(data[i].posX, data[i].posY, dotId);
	}

	document.getElementById('board-frame').style.height = data[i].posX;

	for (let c in connsList) {
		if (connsList[c]) {
			let dotsId = connsList[c].split('/');
			let originDot = dotsId[0].split('-').map((n) => parseInt(n));
			let destinyDot = dotsId[1].split('-').map((n) => parseInt(n));

			if (originDot[0] == destinyDot[0] && originDot[1] > destinyDot[1]) {
				direction = 'left';
			}

			if (originDot[0] == destinyDot[0] && originDot[1] < destinyDot[1]) {
				direction = 'right';
			}

			if (originDot[0] > destinyDot[0] && originDot[1] == destinyDot[1]) {
				direction = 'top';
			}

			if (originDot[0] < destinyDot[0] && originDot[1] == destinyDot[1]) {
				direction = 'bottom';
			}

			renderConnection(data[dotsId[0]].posX, data[dotsId[0]].posY, direction);
		}
	}

	var w = document.getElementById('container');
	w.style.width = gameSize * 50 + 'px';
	w.style.height = gameSize * 50 + 'px';
	console.log(w)
}

/**
 * Renderiza um ponto na tela
 * @param {Int} posX posição no eixo x do ponto
 * @param {Int} posY posição no eixo y do ponto
 * @param {String} dotId id do elemento html (posição do ponto na matriz do jogo ex: linha 1 na coluna 2 = '1-2');
 */
function renderDot(posX, posY, dotId)
{
	var dot = document.createElement('div');

	dot.style = `left:${posX}px; top:${posY}px; cursor:pointer;position:absolute; width:15px; height:15px; background-color:#2f3640; border-radius:60%`;
	dot.id = dotId;

	dot.onclick = (e) => {handleDotClick(e)};

	document.getElementById('board-frame').appendChild(dot);

	if (doneScoresIds[dotId] !== undefined) {
		renderScores(posX, posY, dotId, doneScoresIds[dotId])
	}
}

/**
 * Renderiza na tela uma conexão entre pontos
 * @param {Int} posX posição no eixo x do ponto de origem da conexão
 * @param {Int} posY posição no eixo y do ponto de origem da conexão
 * @param {String} direction direção da conexao (top, bottom, right, left)
 */
function renderConnection(posX, posY, direction)
{
	var conn = document.createElement('div');
	var style;

	var height = '5px';
	var width = '5px';

	if (direction == 'right') {
		width = '50px';
		posY += 5;
	}

	if (direction == 'left') {
		width = '50px';
		posX -= 50;
		posY += 5;
	}

	if (direction == 'bottom') {
		height = '50px';
		posX += 5;
	}

	if (direction == 'top') {
		height = '50px';
		posY -= 50;
		posX += 5;
	}

	conn.style = `z-index: -1;left: ${posX}px; top: ${posY}px; position: absolute;width: ${width}; height: ${height}; background-color:#353b48;`;

	document.getElementById('board-frame').appendChild(conn);
}

/**
 * Renderiza na tela os quadrados coloridos referente a pontuação de um jogador
 * @param {Int} posX posição no eixo x do ponto de origem da conexão
 * @param {Int} posY posição no eixo y do ponto de origem da conexão
 * @param {String} dotId id do ponto superior esquerdo referente ao score que foi fechado
 * @param {String} player 'com' ou 'me'
 */
function renderScores(posX, posY, dotId, player)
{
	//var color = player == 'com' ? 'red' : 'blue';
  var color = player == 'com' ? '#e74c3c' : '#2ecc71';

	var square = document.createElement('div');

	square.style = `left:${posX+7}px; top:${posY+7}px;position:absolute; width:50px; height:50px; background-color:${color};z-index:-1`;
	square.id = 'score-'+dotId;

	document.getElementById('board-frame').appendChild(square);

}

function handleDotClick(e){
	var currentFilledSquares = 0;

	if (lastClicked == null) {
		lastClicked = e.target;
		return;
	}

	var id = e.target.id;
	var path = id.split('-');
	var lastClikedId = lastClicked.id;

	if (setConnection(id, lastClikedId)) {
		lastClicked = null;
		scored = setScores(id, 'me');
		redrawBoard();

		currentFilledSquares = score.me + score.com;

		if (!scored) {
			currentStreak = 0;
			if(currentFilledSquares != totalGameSquares){
				document.getElementById('game-result').innerHTML = '';
			}
			computerChoice();
		}
		else{
			currentStreak += 1;
			if (currentStreak > 1 && currentFilledSquares != totalGameSquares){
				document.getElementById('game-result').innerHTML = 'STREAK!!! +' + currentStreak;
			}
		}
	} 
	else {
		lastClicked = e.target;
	}
}

function getQuadrantPathStatus(quadrantPathArr) {
	var result = [];

	result[quadrantPathArr[0]] = connsList.indexOf(quadrantPathArr[0]) > -1;
	result[quadrantPathArr[1]] = connsList.indexOf(quadrantPathArr[1]) > -1;
	result[quadrantPathArr[2]] = connsList.indexOf(quadrantPathArr[2]) > -1;
	result[quadrantPathArr[3]] = connsList.indexOf(quadrantPathArr[3]) > -1;

	if (
		result[quadrantPathArr[0]] &&
		result[quadrantPathArr[1]] &&
		result[quadrantPathArr[2]] &&
		result[quadrantPathArr[3]]
	) {
		result['completed'] = true;
	} 
	else {
		result['completed'] = false;
	}

	return result;
}

/**
 * A partir de um ponto clicado na tela, verifica se fechou algum dos possíveis quadrados para aquele ponto
 * Faz a verificação dos caminhos sempre do menor ponto para o maior ponto, nunca o contrario
 * @param id {String} id do ponto clicado
 */
function setScores(id, player) {
	var idArr = id.split('-');
	var line = parseInt(idArr[0]);
	var col = parseInt(idArr[1]);
	var scores = getDotPositionsArr(line, col);
	var tempScore = 0;
	var currentFilledSquares = 0;

	if (
		scores.upperRightQuadrantPathArr != null &&
		getQuadrantPathStatus(scores.upperRightQuadrantPathArr).completed &&
		checkScoreIsAvailable(scores.upperRightQuadrantPathArr, player)
	) {tempScore += 1;}

	if (
		scores.upperLeftQuadrantPathArr != null &&
		getQuadrantPathStatus(scores.upperLeftQuadrantPathArr).completed &&
		checkScoreIsAvailable(scores.upperLeftQuadrantPathArr, player)
	) {tempScore += 1;}

	if (
		scores.lowerRightQuadrantPathArr != null &&
		getQuadrantPathStatus(scores.lowerRightQuadrantPathArr).completed &&
		checkScoreIsAvailable(scores.lowerRightQuadrantPathArr, player)
	) {tempScore += 1;}

	if (
		scores.lowerLeftQuadrantPathArr != null &&
		getQuadrantPathStatus(scores.lowerLeftQuadrantPathArr).completed &&
		checkScoreIsAvailable(scores.lowerLeftQuadrantPathArr, player)
	) {tempScore += 1;}

	score[player] += tempScore;

	document.getElementById('playerScore').innerHTML = score.me;
	document.getElementById('computerScore').innerHTML = score.com;

	currentFilledSquares = score.me + score.com;

	if(currentFilledSquares == totalGameSquares){
		if(score.me > score.com){
			document.getElementById('game-result').innerHTML = 'YOU WIN!';
		}
		else if (score.me < score.com) {
			document.getElementById('game-result').innerHTML = 'COMPUTER WINS!';
		}
		else{
			document.getElementById('game-result').innerHTML = 'DRAW!';
		}
	}

	if (tempScore > 0) {
		return true;
  }

	return false;
}

function getDotPositionsArr(line, col)
{
	var obj = {};

	obj.nextLine = line + 1;
	obj.nextColumn = col + 1;
	obj.prevLine = line - 1;
	obj.prevColumn = col - 1;

	obj.originDot = line + '-' + col;
	obj.rightDot = line + '-' + obj.nextColumn;
	obj.leftDot = line + '-' + obj.prevColumn;
	obj.upperDot = obj.prevLine + '-' + col;
	obj.lowerDot = obj.nextLine + '-' + col;
	obj.upperRightDot = obj.prevLine + '-' + obj.nextColumn;
	obj.upperLeftDot = obj.prevLine + '-' + obj.prevColumn;
	obj.lowerRightDot = obj.nextLine +'-'+ obj.nextColumn;
	obj.lowerLeftDot = obj.nextLine + '-'+ obj.prevColumn;

	obj.originToRight = obj.originDot +'/'+ obj.rightDot
	obj.originToLower = obj.originDot +'/'+ obj.lowerDot;

	obj.upperToOrigin = obj.upperDot +'/'+ obj.originDot;
	obj.upperRightToRight = obj.upperRightDot +'/'+ obj.rightDot;
	obj.upperToUpperRight = obj.upperDot +'/'+ obj.upperRightDot;
	obj.upperLeftToLeft = obj.upperLeftDot +'/'+ obj.leftDot;
	obj.upperLeftToUpper = obj.upperLeftDot +'/'+ obj.upperDot;

	obj.leftToOrigin = obj.leftDot +'/'+ obj.originDot;
	obj.leftToLowerLeft = obj.leftDot +'/'+ obj.lowerLeftDot;

	obj.rightToLowerRight = obj.rightDot +'/'+ obj.lowerRightDot;

	obj.lowerLeftToLower = obj.lowerLeftDot +'/'+ obj.lowerDot;
	obj.lowerToLowerRight = obj.lowerDot +'/'+ obj.lowerRightDot;

	obj.upperRightQuadrantPathArr = [
		obj.originToRight,
		obj.upperRightToRight,
		obj.upperToUpperRight,
		obj.upperToOrigin
	];

	obj.upperLeftQuadrantPathArr = [
		obj.leftToOrigin,
		obj.upperLeftToLeft,
		obj.upperLeftToUpper,
		obj.upperToOrigin
	];

	obj.lowerRightQuadrantPathArr = [
		obj.originToRight,
		obj.rightToLowerRight,
		obj.lowerToLowerRight,
		obj.originToLower
	];

	obj.lowerLeftQuadrantPathArr = [
		obj.leftToOrigin,
		obj.leftToLowerLeft,
		obj.lowerLeftToLower,
		obj.originToLower
	];

	if (obj.nextLine > gameSize) {
		obj.lowerDot = null;
		obj.lowerRightDot = null;
		obj.lowerLeftDot = null;
	}

	if (obj.prevLine < 1) {
		obj.upperDot = null;
		obj.upperRightDot = null;
		obj.upperLeftDot = null;
	}

	if (obj.nextColumn > gameSize) {
		obj.rightDot = null;
		obj.upperRightDot = null;
		obj.lowerRightDot = null;
	}

	if (obj.prevColumn < 1) {
		obj.leftDot = null;
		obj.upperLeftDot = null;
		obj.lowerLeftDot = null;
	}

	if (obj.originDot == null || obj.rightDot == null) {
		obj.originToRight = null;
	}

	if (obj.originDot == null || obj.lowerDot == null) {
		obj.originToLower = null;
	}

	if (obj.upperDot == null || obj.originDot == null) {
		obj.upperToOrigin = null;
	}

	if (obj.upperRightDot == null || obj.rightDot == null) {
		obj.upperRightToRight = null;
	}

	if (obj.upperDot == null || obj.upperRightDot == null) {
		obj.upperToUpperRight = null;
	}

	if (obj.upperLeftDot == null || obj.leftDot == null) {
		obj.upperLeftToLeft = null;
	}

	if (obj.upperLeftDot == null || obj.upperDot == null) {
		obj.upperLeftToUpper = null;
	}

	if (obj.leftDot == null || obj.originDot == null) {
		obj.leftToOrigin = null;
	}

	if (obj.leftDot == null || obj.lowerLeftDot == null) {
		obj.leftToLowerLeft = null;
	}

	if (obj.rightDot == null || obj.lowerRightDot == null) {
		obj.rightToLowerRight = null;
	}

	if (obj.lowerLeftDot == null || obj.lowerDot == null) {
		obj.lowerLeftToLower = null;
	}

	if (obj.lowerDot == null || obj.lowerRightDot == null) {
		obj.lowerToLowerRight = null;
	}

	if (obj.leftToOrigin == null || obj.upperLeftToLeft == null || obj.upperLeftToUpper == null || obj.upperToOrigin == null) {
		obj.upperLeftQuadrantPathArr = null;
	}

	if (obj.originToRight == null || obj.upperRightToRight == null || obj.upperToUpperRight == null || obj.upperToOrigin == null) {
		obj.upperRightQuadrantPathArr = null;
	}

	if (obj.originToRight == null || obj.rightToLowerRight == null || obj.lowerToLowerRight == null || obj.originToLower == null) {
		obj.lowerRightQuadrantPathArr = null;
	}

	if (obj.leftToOrigin == null || obj.leftToLowerLeft == null || obj.lowerLeftToLower == null || obj.originToLower == null) {
		obj.lowerLeftQuadrantPathArr = null;
	}

	return obj;
}

function checkScoreIsAvailable(score, player)
{
	var scoreStr = score.join('/');
	var initialDotId = getLowerDotFromPathArr(score);

	scoreStr = scoreStr.split('/');
	scoreStr.sort();
	scoreStr = scoreStr.join(',');

	if (doneScores.indexOf(scoreStr) > -1) {
		return false;
	}

	doneScores.push(scoreStr);
	doneScoresIds[initialDotId] = player;

	return true;
}

function getLowerDotFromPathArr(pathArr) {
	var lowerLine = 0;
	var lowerCol = 0;

	for (let i in pathArr) {
		let dotId = pathArr[i].split('/')[0];

		line = parseInt(dotId.split('-')[0]);
		col = parseInt(dotId.split('-')[1]);

		if (lowerLine == 0) {
			lowerLine = line;
		} 
		else if (line < lowerLine) {
			lowerLine = line;
		}

		if (lowerCol == 0) {
			lowerCol = col;
		} 
		else if (col < lowerCol) {
			lowerCol = col;
		}
	}

	return lowerLine + '-' + lowerCol;
}

var connsList = [];

/**
 * Marca no objeto javascript a conexão que foi clicada
 * @param id {String} id do ponto clicado
 * @param id {String} id do ponto que foi clicado anteriormente
 */
function setConnection(id, lastClickedId)
{
	var path = id + '/' + lastClickedId;
	var reversePath = lastClickedId + '/' + id;

	var connPath;
	var to;

	var arr = id.split('-');
	var lastArr = lastClickedId.split('-');
	var line = parseInt(arr[0]);
	var col = parseInt(arr[1]);
	var lastLine = parseInt(lastArr[0]);
	var lastCol = parseInt(lastArr[1]);

	if (line > lastLine || (line == lastLine && col > lastCol)) {
		connPath = lastClickedId + '/' + id;
	} 
	else {
		connPath = id + '/' + lastClickedId;
	}

	if (connsList.indexOf(connPath) == -1 && checkConnectionIsAllowed(id, lastClickedId)) {
		connsList.push(connPath);

		return true;
	} 
	else {
		printLog('Jogada não permitida');
		return false;
	}
}

function checkConnectionIsAllowed(id, lastClickedId)
{
	var pos = id.split('-');
	var lastPos = lastClickedId.split('-');

	var line = parseInt(pos[0]);
	var col = parseInt(pos[1]);
	var lastLine = parseInt(lastPos[0]);
	var lastCol = parseInt(lastPos[1]);

	if (line == lastLine && col == lastCol) {
		return false;
	}

	if (line == lastLine) {
		if (col == (lastCol - 1)) return true;
		if (col == (lastCol + 1)) return true;

		return false;
	}

	if (col == lastCol) {
		if (line == (lastLine - 1)) return true;
		if (line == (lastLine + 1)) return true;

		return false;
	}

	return false;
}

function redrawBoard()
{
	document.getElementById('board-frame').innerHTML = '';

	renderGameBoard(gameData);
}

function printLog(msg) {
	console.log(msg);
}

renderGameBoard(gameData);
