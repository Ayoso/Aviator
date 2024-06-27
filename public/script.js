const webAppUrl = 'https://aviator-icony.vercel.app'; // Основной URL вашего задеплоенного WebApp
const oldObject = { a: 1 };
const newObject = Object.assign({}, oldObject); // Новый метод
const coefficientsContainer = document.getElementById('coefficientsContainer');
const timeContainer = document.getElementById('timeContainer');
const chanceContainer = document.getElementById('chanceContainer');
const loaderBar = document.querySelector('.loader-bar');
const getSignalButton = document.getElementById('getSignalButton');
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
                loaderBar.classList.remove('loading');
                airplane.classList.remove('flying');
                void loaderBar.offsetWidth;
                void airplane.offsetWidth;
                loaderBar.classList.add('loading');
                airplane.classList.add('flying');
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
            loaderBar.classList.remove('loading');
            void loaderBar.offsetWidth;
            loaderBar.classList.add('loading');
            fetchCoefficients();
        }
    });
}
