class CurrencyConverter {
    constructor() {
        this.rates = {};
        this.currencies = {};
        this.lastUpdate = null;
        this.nextUpdate = null;
        this.baseCurrency = 'USD';
        this.API_KEY = '50f90a2dd535653f37cf1a08'; // Ваш API ключ
        
        this.initElements();
        this.initEventListeners();
        this.loadCurrencies();
        this.loadRates();
    }

    initElements() {
        this.elements = {
            amount: document.getElementById('amount'),
            from: document.getElementById('from'),
            to: document.getElementById('to'),
            resultAmount: document.querySelector('.result-amount'),
            resultCurrency: document.querySelector('.result-currency'),
            convertBtn: document.getElementById('convertBtn'),
            swapBtn: document.getElementById('swapBtn'),
            lastUpdate: document.getElementById('lastUpdate'),
            rateInfo: document.getElementById('rateInfo'),
            loader: document.getElementById('loader'),
            errorMessage: document.getElementById('errorMessage'),
            apiUpdateDate: document.getElementById('apiUpdateDate'),
            nextUpdateTime: document.getElementById('nextUpdateTime'),
            currencyGrid: document.getElementById('currencyGrid'),
            totalCurrencies: document.getElementById('totalCurrencies')
        };
    }

    initEventListeners() {
        this.elements.convertBtn.addEventListener('click', () => this.convert());
        this.elements.swapBtn.addEventListener('click', () => this.swapCurrencies());
        
        // Автоматическая конвертация при изменении
        this.elements.amount.addEventListener('input', () => this.convert());
        this.elements.from.addEventListener('change', () => this.convert());
        this.elements.to.addEventListener('change', () => this.convert());
        
        // Обновление курсов каждые 2 часа
        setInterval(() => this.loadRates(), 2 * 60 * 60 * 1000);
        
        // Клик по валюте в списке
        document.addEventListener('click', (e) => {
            const currencyItem = e.target.closest('.currency-item');
            if (currencyItem) {
                const currencyCode = currencyItem.dataset.code;
                const type = e.target.closest('.currency-selector') === this.elements.from.parentElement ? 'from' : 'to';
                this.selectCurrency(currencyCode, type);
            }
        });
    }

    async loadCurrencies() {
        // Создаем список популярных валют с флагами
        const popularCurrencies = [
            { code: "USD", name: "Доллар США", flag: "🇺🇸" },
            { code: "EUR", name: "Евро", flag: "🇪🇺" },
            { code: "GBP", name: "Фунт стерлингов", flag: "🇬🇧" },
            { code: "JPY", name: "Японская йена", flag: "🇯🇵" },
            { code: "CNY", name: "Китайский юань", flag: "🇨🇳" },
            { code: "RUB", name: "Российский рубль", flag: "🇷🇺" },
            { code: "KZT", name: "Казахстанский тенге", flag: "🇰🇿" },
            { code: "KGS", name: "Киргизский сом", flag: "🇰🇬" },
            { code: "UZS", name: "Узбекский сум", flag: "🇺🇿" },
            { code: "TRY", name: "Турецкая лира", flag: "🇹🇷" },
            { code: "CAD", name: "Канадский доллар", flag: "🇨🇦" },
            { code: "AUD", name: "Австралийский доллар", flag: "🇦🇺" },
            { code: "CHF", name: "Швейцарский франк", flag: "🇨🇭" },
            { code: "INR", name: "Индийская рупия", flag: "🇮🇳" },
            { code: "BRL", name: "Бразильский реал", flag: "🇧🇷" },
            { code: "MXN", name: "Мексиканское песо", flag: "🇲🇽" },
            { code: "KRW", name: "Южнокорейская вона", flag: "🇰🇷" },
            { code: "SGD", name: "Сингапурский доллар", flag: "🇸🇬" },
            { code: "HKD", name: "Гонконгский доллар", flag: "🇭🇰" },
            { code: "NOK", name: "Норвежская крона", flag: "🇳🇴" },
            { code: "SEK", name: "Шведская крона", flag: "🇸🇪" },
            { code: "DKK", name: "Датская крона", flag: "🇩🇰" },
            { code: "PLN", name: "Польский злотый", flag: "🇵🇱" },
            { code: "THB", name: "Тайский бат", flag: "🇹🇭" },
            { code: "AED", name: "Дирхам ОАЭ", flag: "🇦🇪" },
            { code: "SAR", name: "Саудовский риял", flag: "🇸🇦" },
            { code: "MYR", name: "Малайзийский ринггит", flag: "🇲🇾" },
            { code: "IDR", name: "Индонезийская рупия", flag: "🇮🇩" },
            { code: "PHP", name: "Филиппинское песо", flag: "🇵🇭" },
            { code: "VND", name: "Вьетнамский донг", flag: "🇻🇳" },
            { code: "AZN", name: "Азербайджанский манат", flag: "🇦🇿" },
            { code: "AMD", name: "Армянский драм", flag: "🇦🇲" },
            { code: "GEL", name: "Грузинский лари", flag: "🇬🇪" },
            { code: "MDL", name: "Молдавский лей", flag: "🇲🇩" },
            { code: "TJS", name: "Таджикский сомони", flag: "🇹🇯" },
            { code: "TMT", name: "Туркменский манат", flag: "🇹🇲" },
            { code: "UAH", name: "Украинская гривна", flag: "🇺🇦" },
            { code: "BYN", name: "Белорусский рубль", flag: "🇧🇾" }
        ];
        
        // Преобразуем в объект
        this.currencies = {};
        popularCurrencies.forEach(currency => {
            this.currencies[currency.code] = {
                name: currency.name,
                flag: currency.flag
            };
        });
        
        this.populateCurrencyDropdowns();
        this.displayAvailableCurrencies();
    }

    populateCurrencyDropdowns() {
        const fromSelect = this.elements.from;
        const toSelect = this.elements.to;
        
        // Очищаем select'ы
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        // Заполняем select'ы валютой
        Object.entries(this.currencies).forEach(([code, data]) => {
            const option1 = new Option(`${code} - ${data.name} ${data.flag}`, code);
            const option2 = new Option(`${code} - ${data.name} ${data.flag}`, code);
            
            if (code === 'USD') option1.selected = true;
            if (code === 'KGS') option2.selected = true;
            
            fromSelect.add(option1);
            toSelect.add(option2);
        });
    }

    displayAvailableCurrencies() {
        const grid = this.elements.currencyGrid;
        grid.innerHTML = '';
        
        Object.entries(this.currencies).forEach(([code, data]) => {
            const item = document.createElement('div');
            item.className = 'currency-item';
            item.dataset.code = code;
            item.innerHTML = `
                <div class="currency-flag">${data.flag}</div>
                <div>
                    <div class="currency-code">${code}</div>
                    <div class="currency-name">${data.name}</div>
                </div>
            `;
            grid.appendChild(item);
        });
        
        this.elements.totalCurrencies.textContent = Object.keys(this.currencies).length;
    }

    selectCurrency(code, type) {
        if (type === 'from') {
            this.elements.from.value = code;
        } else {
            this.elements.to.value = code;
        }
        this.convert();
        
        // Подсветка выбранной валюты
        document.querySelectorAll('.currency-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`.currency-item[data-code="${code}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            setTimeout(() => selectedItem.classList.remove('selected'), 2000);
        }
    }

    async loadRates() {
        try {
            this.showLoader();
            this.hideError();
            
            // Используем ExchangeRate-API с вашим ключом
            const response = await fetch(
                `https://v6.exchangerate-api.com/v6/${this.API_KEY}/latest/USD`
            );
            
            if (!response.ok) {
                throw new Error(`Ошибка API: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.result === 'error') {
                throw new Error(data['error-type']);
            }
            
            this.rates = data.conversion_rates;
            this.lastUpdate = new Date(data.time_last_update_utc);
            this.nextUpdate = new Date(data.time_next_update_utc);
            
            this.updateDisplay();
            this.showSuccess('Курсы успешно обновлены!');
            
        } catch (error) {
            console.error('Ошибка загрузки курсов:', error);
            
            let errorMessage = 'Не удалось загрузить актуальные курсы. ';
            
            if (error.message.includes('404')) {
                errorMessage += 'Проверьте API ключ. ';
            } else if (error.message.includes('quota')) {
                errorMessage += 'Превышен лимит запросов (1500/месяц). ';
            } else if (error.message.includes('inactive')) {
                errorMessage += 'API ключ неактивен. ';
            } else {
                errorMessage += 'Проверьте интернет-соединение. ';
            }
            
            errorMessage += 'Используются резервные курсы.';
            
            this.showError(errorMessage);
            this.useFallbackRates();
        } finally {
            this.hideLoader();
        }
    }

    useFallbackRates() {
        console.warn('Используются резервные курсы');
        
        // Резервные курсы из вашего ответа API
        this.rates = {
            "USD": 1,
            "KGS": 87.3374,
            "EUR": 0.8519,
            "GBP": 0.7478,
            "JPY": 155.8139,
            "CNY": 7.0674,
            "RUB": 79.8896,
            "KZT": 520.6882,
            "UZS": 12104.0517,
            "TRY": 42.6945,
            "CAD": 1.3764,
            "AUD": 1.5026,
            "CHF": 0.7956,
            "INR": 90.5658,
            "BRL": 5.4025,
            "MXN": 18.0311,
            "KRW": 1475.5262,
            "SGD": 1.2915,
            "HKD": 7.7844,
            "NOK": 10.1249,
            "SEK": 9.2736,
            "DKK": 6.3567,
            "PLN": 3.5983,
            "THB": 31.5663,
            "AED": 3.6725,
            "SAR": 3.75,
            "MYR": 4.1016,
            "IDR": 16641.5936,
            "PHP": 59.0916,
            "VND": 26213.8366
        };
        
        this.lastUpdate = new Date();
        this.nextUpdate = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 часа
        this.updateDisplay();
    }

    convert() {
        const amount = parseFloat(this.elements.amount.value);
        const fromCurrency = this.elements.from.value;
        const toCurrency = this.elements.to.value;
        
        if (!amount || amount <= 0 || isNaN(amount)) {
            this.updateResult(0, toCurrency);
            this.updateRateInfo(0, fromCurrency, toCurrency);
            return;
        }
        
        if (!this.rates[fromCurrency]) {
            this.showError(
                `Курс для "${fromCurrency}" временно недоступен. ` +
                `Попробуйте выбрать другую валюту.`
            );
            return;
        }
        
        if (!this.rates[toCurrency]) {
            this.showError(
                `Курс для "${toCurrency}" временно недоступен. ` +
                `Попробуйте выбрать другую валюту.`
            );
            return;
        }
        
        if (fromCurrency === toCurrency) {
            this.updateResult(amount, toCurrency);
            this.elements.rateInfo.innerHTML = `
                <div><strong>Это одна и та же валюта</strong></div>
                <div>1 ${fromCurrency} = 1 ${toCurrency}</div>
            `;
            return;
        }
        
        // Конвертация через USD
        const amountInUSD = amount / this.rates[fromCurrency];
        const result = amountInUSD * this.rates[toCurrency];
        
        this.updateResult(result, toCurrency);
        this.updateRateInfo(amount, fromCurrency, toCurrency);
    }

    updateResult(amount, currency) {
        // Форматируем число с разделителями тысяч
        const formattedAmount = new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
        
        this.elements.resultAmount.textContent = formattedAmount;
        this.elements.resultCurrency.textContent = currency;
    }

    updateRateInfo(amount, fromCurrency, toCurrency) {
        if (!amount || amount <= 0) {
            this.elements.rateInfo.innerHTML = '<div>Введите сумму для конвертации</div>';
            return;
        }
        
        const rate = this.rates[toCurrency] / this.rates[fromCurrency];
        const inverseRate = 1 / rate;
        
        this.elements.rateInfo.innerHTML = `
            <div><strong>1 ${fromCurrency}</strong> = <strong>${rate.toFixed(4)} ${toCurrency}</strong></div>
            <div><strong>1 ${toCurrency}</strong> = <strong>${inverseRate.toFixed(4)} ${fromCurrency}</strong></div>
            <div style="margin-top: 8px; font-size: 13px; color: #666;">
                ${amount} ${fromCurrency} = ${(amount * rate).toFixed(2)} ${toCurrency}
            </div>
        `;
    }

    swapCurrencies() {
        const temp = this.elements.from.value;
        this.elements.from.value = this.elements.to.value;
        this.elements.to.value = temp;
        this.convert();
    }

    updateDisplay() {
        this.updateLastUpdateDisplay();
        this.convert();
    }

    updateLastUpdateDisplay() {
        if (!this.lastUpdate) return;
        
        const dateOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const dateString = this.lastUpdate.toLocaleDateString('ru-RU', dateOptions);
        const timeString = this.nextUpdate ? 
            this.nextUpdate.toLocaleTimeString('ru-RU', timeOptions) : 'загрузка...';
        
        this.elements.lastUpdate.textContent = `Обновлено: ${dateString}`;
        this.elements.apiUpdateDate.textContent = dateString;
        this.elements.nextUpdateTime.textContent = timeString;
    }

    showLoader() {
        this.elements.loader.style.display = 'flex';
    }

    hideLoader() {
        this.elements.loader.style.display = 'none';
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        this.elements.errorMessage.style.background = '#ffeaea';
        this.elements.errorMessage.style.color = '#e74c3c';
        
        setTimeout(() => this.hideError(), 5000);
    }

    showSuccess(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        this.elements.errorMessage.style.background = '#e8f7ef';
        this.elements.errorMessage.style.color = '#27ae60';
        
        setTimeout(() => this.hideError(), 3000);
    }

    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const converter = new CurrencyConverter();
    
    // Фокус на поле ввода
    document.getElementById('amount').select();
});