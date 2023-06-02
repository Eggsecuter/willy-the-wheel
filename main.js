const restaurants = []

inputElement = document.querySelector('input');
inputElement.onkeydown = event => {
    if (event.key == 'Enter' && inputElement.value) {
        restaurants.push(inputElement.value);
        inputElement.value = '';
        draw();
    }
}

const restaurantsElement = document.querySelector('ui-restaurants');
const wheelElement = document.querySelector('ui-wheel-segments');
const winnerElement = document.createElement('ui-winner');

function draw() {
    restaurantsElement.innerText = null;
    wheelElement.innerText = null;

    for (const [index, restaurant] of restaurants.entries()) {
        const restaurantElement = document.createElement('ui-item');
        
        restaurantElement.innerText = restaurant;
        restaurantElement.style.setProperty('--color', `hsl(${360 / restaurants.length * index + 30}deg, 100%, 50%)`)
        
        restaurantsElement.appendChild(restaurantElement);
    }
    
    gradients = [];
    sectionDegree = 360 / restaurants.length;
    
    for (let index = 0; index < restaurants.length; index++) {
        gradients.push(`hsl(${360 / restaurants.length * index + 30}deg, 100%, 50%) ${sectionDegree * index}deg ${sectionDegree * (index + 1)}deg`);
    }
    
    wheelElement.style.setProperty('background', `conic-gradient(${gradients.join(', ')})`);
}

draw();

let mouseDownData = null;
let wheelRotation = 0;

wheelElement.onmousedown = event => {
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

                    winnerElement.innerText = restaurants[sectionIndex];
                    document.body.prepend(winnerElement);
                }
            }

            requestAnimationFrame(next);
        }

        mouseDownData = null;
    }
}
