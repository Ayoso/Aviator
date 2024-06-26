const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN || '7291288644:AAGtKXABZ57GOj1Jxq1WelMZuAitlSN8At4';
const webAppUrl = 'https://aviator-miwke6qdy-ayosos-projects.vercel.app';
const activationPassword = '555';

const bot = new TelegramBot(token, { polling: true });
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: ['https://aviator-miwke6qdy-ayosos-projects.vercel.app', ' https://aviator-miwke6qdy-ayosos-projects.vercel.app '], // Добавьте все необходимые домены
    methods: ['GET', 'POST'], // Разрешите необходимые методы
    allowedHeaders: ['Content-Type', 'Authorization'] // Разрешите необходимые заголовки
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let currentCoefficients = generateRandomCoefficients();

const userLanguage = {};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Dilni tanlang:', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Oʻzbekcha' }, { text: 'Türkçe' }]
                ],
                one_time_keyboard: true
            }
        });

        bot.once('message', async (msg) => {
            const chosenLanguage = msg.text.toLowerCase();

            if (chosenLanguage.includes('oʻzbek')) {
                userLanguage[chatId] = 'uzbek';
                await bot.sendMessage(chatId, 'Endi siz signal olishingiz mumkin', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            } else if (chosenLanguage.includes('türkçe')) {
                userLanguage[chatId] = 'turkish';
                await bot.sendMessage(chatId, 'Aktivasyon tamamlandı! Artık sinyal alabilirsiniz', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            } else {
                await bot.sendMessage(chatId, 'Dilni tanlagan tilni tanlang: Oʻzbekcha yoki Türkçe');
            }

            await bot.sendMessage(chatId, 'faollashtirish parolingizni kiriting: / aktivasyon şifrenizi girin', {
                reply_markup: {
                    force_reply: true
                }
            });
        });
    } else if (text === activationPassword) {
        const lang = userLanguage[chatId] || 'uzbek';
        const activationMessage = lang === 'uzbek' ? 'Aktivasyon tamamlandı! Artık sinyal alabilirsiniz' : 'Aktivasyon tamamlandı! Artık sinyal alabilirsiniz';

        await bot.sendMessage(chatId, activationMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'SİNYAL AL / SIGNAL OLISH', web_app: { url: webAppUrl } }]
                ]
            }
        });
    } else {
        const lang = userLanguage[chatId] || 'uzbek';
        const errorMessage = lang === 'uzbek' ? 'Yanlış şifre. Lütfen tekrar deneyin.' : 'Yanlış şifre. Lütfen tekrar deneyin.';

        await bot.sendMessage(chatId, errorMessage);
    }
});

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
    let coefficient2 = (Math.random() * 5 + 1).toFixed(2);
    let coefficient1 = (Math.random() * (coefficient2 / 2.5) + 1.1).toFixed(2);

    // Ensure coefficient2 is at least 2.5 times coefficient1
    coefficient2 = Math.max(coefficient2, (coefficient1 * 2.5)).toFixed(2);

    return [coefficient1, coefficient2];
}

app.get('/get-coefficients', (req, res) => {
    try {
        currentCoefficients = generateRandomCoefficients();
        res.json({
            coefficient1: parseFloat(currentCoefficients[0]),
            coefficient2: parseFloat(currentCoefficients[1])
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при генерации коэффициентов' });
    }
});

app.post('/get-coefficients', (req, res) => {
    try {
        currentCoefficients = generateRandomCoefficients();
        res.json({
            coefficient1: parseFloat(currentCoefficients[0]),
            coefficient2: parseFloat(currentCoefficients[1])
        });
    } catch (error) {
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
