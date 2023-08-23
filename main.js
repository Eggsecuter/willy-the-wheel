const items = []

inputElement = document.querySelector('input');
inputElement.onkeydown = event => {
	if (event.key == 'Enter' && inputElement.value) {
		items.push(inputElement.value);
		inputElement.value = '';
		draw();
	}
}

const itemsElement = document.querySelector('ui-items');
const wheelElement = document.querySelector('ui-wheel-segments');
const winnerElement = document.createElement('ui-winner');

function draw() {
	itemsElement.innerText = null;
	wheelElement.innerText = null;

	for (const [index, item] of items.entries()) {
		const itemElement = document.createElement('ui-item');
		
		itemElement.innerText = item;
		itemElement.style.setProperty('--color', `hsl(${360 / items.length * index + 30}deg, 100%, 50%)`)
		
		itemsElement.appendChild(itemElement);
	}
	
	gradients = [];
	sectionDegree = 360 / items.length;
	
	for (let index = 0; index < items.length; index++) {
		gradients.push(`hsl(${360 / items.length * index + 30}deg, 100%, 50%) ${sectionDegree * index}deg ${sectionDegree * (index + 1)}deg`);
	}
	
	wheelElement.style.setProperty('background', `conic-gradient(${gradients.join(', ')})`);
}

draw();

let mouseDownData = null;
let wheelRotation = 0;

wheelElement.onmousedown = event => {
	if (items.length < 2) {
		return;
	}

	mouseDownData = {
		x: event.screenX,
		y: event.screenY,
		timestamp: Date.now()
	}
}

document.body.onmouseup = event => {
	if (mouseDownData) {
		distance = Math.hypot(event.screenX - mouseDownData.x, event.screenY - mouseDownData.y);
		deltaTime = Date.now() - mouseDownData.timestamp;
		speed = distance / deltaTime / 100;

		if (speed > 0) {
			if (winnerElement.innerText) {
				document.body.removeChild(winnerElement);
			}

			const start = new Date();

			function next() {
				const deltaTime = +new Date() - +start;
				wheelRotation += speed * deltaTime;
				speed *= 0.99;

				wheelElement.style.transform = `rotate(${wheelRotation}deg)`;

				if (speed > 1e-5) {
					requestAnimationFrame(next);
				}
				else {
					wheelRotation %= 360
					const sectionIndex = Math.floor((360 - wheelRotation) / sectionDegree);

					winnerElement.innerText = items[sectionIndex];
					document.body.prepend(winnerElement);
				}
			}

			requestAnimationFrame(next);
		}

		mouseDownData = null;
	}
}
