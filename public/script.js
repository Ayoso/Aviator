const webAppUrl = 'https://aviator-kttwu0148-ayosos-projects.vercel.app/'; // Основной URL вашего задеплоенного WebApp3

const coefficientsContainer = document.getElementById('coefficientsContainer');
const timeContainer = document.getElementById('timeContainer');
const chanceContainer = document.getElementById('chanceContainer');
const loaderBar = document.querySelector('.loader-bar');
const getSignalButton = document.getElementById('getSignalButton');
const goToGameButton = document.getElementById('goToGameButton');
const airplane = document.querySelector('.airplane'); // Добавлено для анимации самолета

let loadingFinished = true; // Устанавливаем начальное значение в true

function updateData(coefficients) {
    if (coefficients) {
        const coefficient1 = parseFloat(coefficients.coefficient1).toFixed(2);
        const coefficient2 = parseFloat(coefficients.coefficient2).toFixed(2);

        coefficientsContainer.innerHTML = `
            <div class="coefficient">${coefficient1}X</div>
            <div class="coefficient">- ${coefficient2}X</div>
        `;

        const currentTime = new Date();
        const endTime = new Date(currentTime.getTime() + 25000);
        const currentTimeString = currentTime.toLocaleTimeString();
        const endTimeString = endTime.toLocaleTimeString();
        const chance = `${Math.floor(Math.random() * 21) + 70}%`;

        timeContainer.textContent = `Time: ${currentTimeString} - ${endTimeString}`;
        chanceContainer.textContent = `Chance: ${chance}`;
    }
}

function fetchCoefficients() {
    console.log('Запрос коэффициентов...');
    fetch(`${webAppUrl}/get-coefficients`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Коэффициенты получены:', data);
            setTimeout(() => {
                updateData(data);
                loaderBar.style.animation = 'none';
                loaderBar.style.width = '0';
                airplane.style.animation = 'none';
                void airplane.offsetWidth;
                airplane.style.animation = 'airplaneFly 10s linear infinite';
                loadingFinished = true;
            }, 10000);
        })
        .catch(error => {
            console.error('Ошибка при получении коэффициентов:', error);
            loadingFinished = true;
        });
}

if (getSignalButton) {
    getSignalButton.addEventListener('click', () => {
        console.log('Кнопка GET SIGNAL нажата');
        if (loadingFinished) {
            loadingFinished = false;
            loaderBar.style.animation = 'none';
            void loaderBar.offsetWidth;
            loaderBar.style.animation = 'loadAnimation 10s linear';
            fetchCoefficients();
        }
    });
}

if (goToGameButton) {
    goToGameButton.addEventListener('click', () => {
        window.location.href = 'https://example.com/game';
    });
}
