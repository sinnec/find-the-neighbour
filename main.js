// Shuffles an array
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * i)
		const temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
	return array
}

// Returns a flag emoji from a 2-letter country code
function country2emoji2(country_code) {
	const OFFSET = 127397;
	const codeArray = Array.from(country_code.toUpperCase());
	return String.fromCodePoint(...codeArray.map((c) => c.charCodeAt() + OFFSET));
}

var allNeighbours = new Array();
var shuffledCountries;
var countryIndex = 0;
var score = 0;
var roundCount = 1;
var wrongCount = 0;
var correctCount = 0;
var neighbourCount;
var progressBar;
var progressValue;

class Country {
	constructor(name, flag, code3) {
		this.name = name;
		this.flag = flag;
		this.code3 = code3;
	}
}

class PlayingCountry extends Country {
	constructor(name, flag, code3, neighbours) {
		super(name, flag, code3);
		this.neighbours = neighbours;
	}
}

class Neighbour extends Country {
	constructor(name, flag, code3, isReal) {
		super(name, flag, code3);
		this.isReal = isReal;
	}
}

function createGame () {
	shuffledCountries = shuffleArray(countryObjects);
	var selectedCountry = shuffledCountries[countryIndex];
	var countryCode3 = selectedCountry.code3;
	var flag = country2emoji2(selectedCountry.code);
	var countryName = selectedCountry.name;
	progressValue = 0;
	progressBar.value = progressValue;
	

	var url = "https://restcountries.eu/rest/v2/alpha/";
	fetch(url+countryCode3)
	.then((reply) => {
		if (reply.status === 200) {
			return reply.json();
		}
		else {
			throw new Error(reply.Status);
		}
	})
	.then((reply) => {
		if (reply['borders'].length > 0) {
			var borders = reply['borders'];
			var myCountry = new PlayingCountry(countryName, flag, countryCode3, borders);
			document.querySelector('#my-country-flag').innerHTML = myCountry.flag;
			document.querySelector('#my-country-name').innerHTML = myCountry.name;
			findNeighbours(myCountry, borders, shuffledCountries);
		}
		else {
			countryIndex++;
			createGame();
		}
	})
}

function findNeighbours(myCountry, borderList, shuffledList) {
	var neighbourArray = new Array();
	var neighbourFlag;
	var neightbourCode2;
	var neighbourName;
	var country;
	progressBar.max= borderList.length;
	myCountry.neighbours.forEach(neighbour => {
		country = countryObjects.find( ({ code3 }) => code3 === neighbour );
		neighbourFlag = country2emoji2(country.code);
		neighbourName = country.name;
		neighbourArray.push(new Neighbour(neighbourName, neighbourFlag, country.code3, 'yes'));
	});
	var falseNeighbourArray = new Array();
	var added=1;
	var randomIndex;
	neighbourCount = borderList.length;
	while (added <= neighbourCount * 2) {
		randomIndex = Math.floor(Math.random() * Math.floor(shuffledList.length));
		selectedCountry = shuffledList[randomIndex];
		countryCode3 = selectedCountry.code3;
		if (borderList.includes(countryCode3) || myCountry.code3 === countryCode3) {
			continue;
		}
		flag = country2emoji2(selectedCountry.code);
		countryName = selectedCountry.name;
		borderList.push(countryCode3);
		falseNeighbourArray.push(new Neighbour(countryName, flag, countryCode3, 'no'));
		added++;
	}
	allNeighbours = neighbourArray.concat(falseNeighbourArray);
	var shuffledAllNeighbours = shuffleArray(allNeighbours);
	drawCountries(shuffledAllNeighbours);
}

function drawCountries(shuffledList) {
	var neighbourPanel = document.getElementById("neighbours-panel");
	shuffledList.forEach(item => {
		let child = document.createElement('div');
		if (item.isReal === 'yes')
			child.setAttribute("class", "neighbour neighbour-is-valid");
		else
			child.setAttribute("class", "neighbour neighbour-is-invalid");
		child.setAttribute("id", item.code3);
		child.innerHTML = `<div class="neighbour-flag">${item.flag}</div>
		<div class="neighbour-name">${item.name}</div>`;
		neighbourPanel.appendChild(child);
	});
}

function clickHandler(e) {
	if (!e.target.className.includes("was-clicked") && !e.target.parentNode.className.includes("was-clicked")) {
		var targetCountry;
		if (e.target.className.includes("neighbour-is-valid") || e.target.parentNode.className.includes("neighbour-is-valid")) {
			if (e.target.parentNode.className.includes("neighbour-is-valid"))
				targetCountry = document.getElementById(e.target.parentNode.id);
			else
				targetCountry = document.getElementById(e.target.id);
			targetCountry.setAttribute("class", "neighbour neighbour-is-valid was-clicked");
			score += 5;
			correctCount++;
			progressValue++;
			progressBar.value = progressValue;
		}
		else if (e.target.className.includes("neighbour-is-invalid") || e.target.parentNode.className.includes("neighbour-is-invalid")) {
			if (e.target.parentNode.className.includes("neighbour-is-invalid"))
				targetCountry = document.getElementById(e.target.parentNode.id);
			else
				targetCountry = document.getElementById(e.target.id);
			targetCountry.setAttribute("class", "neighbour neighbour-is-invalid was-clicked");
			score -= 3;
			wrongCount++;
		}
		document.getElementById('score-number').textContent = score;
		if (wrongCount === neighbourCount || correctCount === neighbourCount) {
			var roundEndEl = document.querySelector("#next-round-panel");
			if (countryIndex == shuffledCountries.length - 1) {
				roundEndEl.textContent = "Game Over!\nNo more countries to show!";
				roundEndEl.style.color = "cyan";
			}
			else if (wrongCount === neighbourCount) {
				roundEndEl.textContent = "Sorry, you lost!";
				roundEndEl.style.color = "red";
				document.querySelector("#btn-next-round").disabled = false;
			}
			else {
				roundEndEl.textContent = "Congratulations! You found all the neighbours";
				roundEndEl.style.color = "lime";
				document.querySelector("#btn-next-round").disabled = false;
			}
			roundEndEl.style.display = "flex";				
		}
	}
}

function clearNeighboursPanel() {
	var neighbourPanel = document.getElementById("neighbours-panel");
	while (neighbourPanel.lastChild.id !== "next-round-panel")
		neighbourPanel.removeChild(neighbourPanel.lastChild);
	document.getElementById("next-round-panel").style.display = "none";
	return;
}

document.querySelector("#btn-next-round").disabled = true;
document.getElementById('score-number').textContent = score;
document.getElementById('round-number').textContent = roundCount;
progressBar = document.getElementById('progress');
createGame();

//event listener to new game button
document.querySelector("#btn-new-game").addEventListener("click", () => {
	var newGameConfirm = confirm("Are you sure you want to start over?\nYour current score will be lost!");
	if (newGameConfirm) {
		clearNeighboursPanel();
		document.querySelector('#my-country-flag').innerHTML = '';
		document.querySelector('#my-country-name').innerHTML = '';
		document.querySelector("#btn-next-round").disabled = true;
		score = 0;
		roundCount = 1;
		wrongCount = 0;
		correctCount = 0;
		countryIndex = 0;
		document.getElementById('score-number').textContent = score;
		document.getElementById('round-number').textContent = roundCount;
		createGame();
	}
})

//event listener to next round button
document.querySelector("#btn-next-round").addEventListener("click", () => {
	clearNeighboursPanel();
	document.querySelector('#my-country-flag').innerHTML = '';
	document.querySelector('#my-country-name').innerHTML = '';
	wrongCount = 0;
	correctCount = 0;
	roundCount++;
	countryIndex++;
	document.getElementById('round-number').textContent = roundCount;
	document.querySelector("#btn-next-round").disabled = true;
	createGame();
})

document.querySelector("#neighbours-panel").addEventListener("click", clickHandler);