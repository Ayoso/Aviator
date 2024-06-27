const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN || '7291288644:AAGtKXABZ57GOj1Jxq1WelMZuAitlSN8At4';
const webAppUrl = 'https://aviator-icony.vercel.app'; // URL вашего WebApp
const activationPassword = '555'; // Ваш пароль активации

const bot = new TelegramBot(token, { polling: true });
const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
    origin: ['https://aviator-icony.vercel.app'], // добавьте здесь все необходимые домены
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let currentCoefficients = generateRandomCoefficients();

const userLanguage = {};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    if (text === '/start') {
        userLanguage[chatId] = null; // сбросить язык
        await bot.sendMessage(chatId, 'Dilni tanlang:', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Oʻzbekcha' }, { text: 'Türkçe' }]
                ],
                one_time_keyboard: true
            }
        });
    } else if (!userLanguage[chatId]) {
        if (text.includes('oʻzbek') || text.includes('uzbek')) {
            userLanguage[chatId] = 'uzbek';
            await bot.sendMessage(chatId, 'Endi siz signal olishingiz mumkin', {
                reply_markup: {
                    remove_keyboard: true
                }
            });
            await promptForActivation(chatId);
        } else if (text.includes('türkçe')) {
            userLanguage[chatId] = 'turkish';
            await bot.sendMessage(chatId, 'Aktivasyon tamamlandı! Artık sinyal alabilirsiniz', {
                reply_markup: {
                    remove_keyboard: true
                }
            });
            await promptForActivation(chatId);
        } else {
            await bot.sendMessage(chatId, 'Dilni tanlagan tilni tanlang: Oʻzbekcha yoki Türkçe');
        }
    } else if (text === activationPassword) {
        const lang = userLanguage[chatId];
        const activationMessage = lang === 'uzbek' ? 'Endi siz signal olishingiz mumkin' : 'Aktivasyon tamamlandı! Artık sinyal alabilirsiniz';



        await bot.sendMessage(chatId, 'Davom etish uchun "SIGNAL QABUL QILISh" tugmasini bosing. / Devam etmek için "SİNYALİ AL" düğmesine tıklayın.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'SİNYAL AL / SIGNAL OLISH', web_app: { url: webAppUrl } }]
                ]
            }
        });
    } else {
        const lang = userLanguage[chatId];
        const errorMessage = lang === 'uzbek' ? 'Yanlış şifre. Lütfen tekrar deneyin.' : 'Yanlış şifre. Lütfen tekrar deneyin.';

        await bot.sendMessage(chatId, errorMessage);
    }
});

async function promptForActivation(chatId) {
    await bot.sendMessage(chatId, 'Faollashtirish parolingizni kiriting: / Aktivasyon şifrenizi girin', {
        reply_markup: {
            force_reply: true
        }
    });
}

app.post('/web-data', async (req, res) => {
    const { queryId } = req.body;

    try {
        currentCoefficients = generateRandomCoefficients();

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Коэффициенты обновлены',
            input_message_content: {
                message_text: `${currentCoefficients[0]}X - ${currentCoefficients[1]}X`
            }
        });

        return res.status(200).json({});
    } catch (e) {
        console.error('Ошибка при обновлении коэффициентов:', e);
        return res.status(500).json({ error: 'Ошибка при обновлении коэффициентов' });
    }
});

function generateRandomCoefficients() {
    const coefficient1 = (Math.random() * 5 + 1).toFixed(2);
    const coefficient2 = (Math.random() * 5 + 1).toFixed(2);
    return [coefficient1, coefficient2];
}

app.get('/get-coefficients', (req, res) => {
    try {
        currentCoefficients = generateRandomCoefficients();
        console.log('Отправка коэффициентов:', currentCoefficients);
        res.json({
            coefficient1: parseFloat(currentCoefficients[0]),
            coefficient2: parseFloat(currentCoefficients[1])
        });
    } catch (error) {
        console.error('Ошибка при генерации коэффициентов:', error);
        res.status(500).json({ error: 'Ошибка при генерации коэффициентов' });
    }
});

app.post('/get-coefficients', (req, res) => {
    try {
        currentCoefficients = generateRandomCoefficients();
        console.log('Отправка коэффициентов:', currentCoefficients);
        res.json({
            coefficient1: parseFloat(currentCoefficients[0]),
            coefficient2: parseFloat(currentCoefficients[1])
        });
    } catch (error) {
        console.error('Ошибка при генерации коэффициентов:', error);
        res.status(500).json({ error: 'Ошибка при генерации коэффициентов' });
    }
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error(`Не удалось запустить сервер на порту ${PORT}: ${err.message}`);
});

module.exports = app;
