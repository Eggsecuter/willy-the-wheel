class WheelStore {
	static storageKey = 'willy-the-wheel';

	static load() {
		return JSON.parse(localStorage.getItem(WheelStore.storageKey) || '[]');
	}

	static save(title, items) {
		const wheels = WheelStore.load();
		const id = Array(4).fill('').map(segment => Math.random().toString(36).substring(2, 8)).join('-');

		wheels.unshift({id, title, items});

		localStorage.setItem(WheelStore.storageKey, JSON.stringify(wheels));

		WheelStore.render();
	}

	static delete(id) {
		const wheels = WheelStore.load();

		wheels.splice(wheels.findIndex(wheel => wheel.id == id), 1);

		localStorage.setItem(WheelStore.storageKey, JSON.stringify(wheels));

		WheelStore.render();
	}

	static render() {
		if (!storedWheelsElement) {
			return;
		}

		const wheels = WheelStore.load();

		storedWheelsElement.innerText = '';

		for (const wheel of wheels) {
			const wheelElement = document.createElement('ui-stored-wheel');

			const wheelTitleElement = document.createElement('ui-wheel-title');
			wheelTitleElement.innerText = wheel.title;
			wheelElement.appendChild(wheelTitleElement);

			for (const item of wheel.items) {
				const wheelItemElement = document.createElement('ui-wheel-item');
				wheelItemElement.innerText = item;
				wheelElement.appendChild(wheelItemElement);
			}

			const wheelLoadButtonElement = document.createElement('ui-wheel-load-button');
			wheelLoadButtonElement.innerText = 'Load';
			wheelLoadButtonElement.onclick = () => {
				titleElement.innerText = wheel.title;
				items = [...wheel.items];
				
				if (items.length > 0) {
					saveButtonElement.style.display = 'block';
				}
		
				draw();
			}
			wheelElement.appendChild(wheelLoadButtonElement);

			const wheelDeleteButtonElement = document.createElement('ui-wheel-delete-button');
			wheelDeleteButtonElement.innerText = 'Delete';
			wheelDeleteButtonElement.onclick = () => WheelStore.delete(wheel.id);
			wheelElement.appendChild(wheelDeleteButtonElement);

			storedWheelsElement.appendChild(wheelElement);
		}
	}
}

const titleElement = document.querySelector('ui-title');
const saveButtonElement = document.querySelector('ui-save-button');
const itemsElement = document.querySelector('ui-items');
const wheelElement = document.querySelector('ui-wheel-segments');
const winnerElement = document.querySelector('ui-winner');
const inputElement = document.querySelector('input');
const storedWheelsElement = document.querySelector('ui-stored-wheels');

saveButtonElement.style.display = 'none';

saveButtonElement.onclick = () => {
	if (items.length > 0) {
		WheelStore.save(titleElement.innerText, items);
	}
}

titleElement.onfocus = () => {
	const range = document.createRange();
	range.selectNodeContents(titleElement);

	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

let items = [];

inputElement.onkeydown = event => {
	if (event.key == 'Enter' && inputElement.value) {
		items.push(inputElement.value);
		inputElement.value = '';

		if (items.length > 0) {
			saveButtonElement.style.display = 'block';
		}

		draw();
	}
}

WheelStore.render();

//
// draw wheel and drag functionality
//
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
			winnerElement.innerText = '';
			winnerElement.removeAttribute('ui-visible');

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
					winnerElement.setAttribute('ui-visible', '');
				}
			}

			requestAnimationFrame(next);
		}

		mouseDownData = null;
	}
}
