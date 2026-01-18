let currentSearchType = 'auto';
let currentResults = null;
let currentPage = 0;
let totalPages = 1;
let currentQuery = "";

document.addEventListener('DOMContentLoaded', function () {
    checkAuthAndInitialize();

    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

function checkAuthAndInitialize() {
    const isLoggedIn = localStorage.getItem('rootweb_logged_in') === 'true';

    if (!isLoggedIn) {
        showAuthRequired();
        disableChat();
        return;
    }

    initializeOSINT();
    enableChat();
}

function showAuthRequired() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';

    const authMessage = document.createElement('div');
    authMessage.className = 'welcome-message';
    authMessage.innerHTML = `
        <div class="message-avatar" style="background: linear-gradient(90deg, #f44336 0%, #d32f2f 100%);">
            <i class="fas fa-lock"></i>
        </div>
        <div class="message-content" style="background: rgba(244, 67, 54, 0.1); border-color: rgba(244, 67, 54, 0.3);">
            <div class="message-sender" style="color: #f44336;">Требуется авторизация</div>
            <div class="message-text">
                <b>Для использования OSINT поиска необходимо войти в систему.</b><br><br>
                Пожалуйста, авторизуйтесь или зарегистрируйтесь, чтобы получить доступ к инструментам.
            </div>
            <div class="message-time">Только что</div>
        </div>
    `;

    chatContainer.appendChild(authMessage);
}

function disableChat() {
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    chatInput.disabled = true;
    chatInput.placeholder = "Требуется авторизация";
    chatSendBtn.disabled = true;
    chatSendBtn.style.opacity = '0.5';

    const typeBlocks = document.querySelectorAll('.search-type-block');
    typeBlocks.forEach(block => {
        block.style.opacity = '0.5';
        block.style.cursor = 'not-allowed';
        block.onclick = null;
    });
}

function enableChat() {
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    chatInput.disabled = false;
    chatInput.placeholder = "Введите запрос для поиска...";
    chatSendBtn.disabled = false;
    chatSendBtn.style.opacity = '1';

    const typeBlocks = document.querySelectorAll('.search-type-block');
    typeBlocks.forEach(block => {
        block.style.opacity = '1';
        block.style.cursor = 'pointer';
    });
}

function initializeOSINT() {
    console.log('OSINT модуль инициализирован для авторизованного пользователя');

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });

    setSearchType('auto');
}

function setSearchType(type) {
    if (!isUserAuthenticated()) return;

    const blocks = document.querySelectorAll('.search-type-block');
    blocks.forEach(block => block.classList.remove('active'));

    const currentBlock = document.getElementById(`type-${type}`);
    if (currentBlock) {
        currentBlock.classList.add('active');
    }

    currentSearchType = type;

    const chatInput = document.getElementById('chat-input');

    switch (type) {
        case 'auto':
            chatInput.placeholder = "Введите любой запрос (телефон, email, ФИО, IP...)";
            break;
        case 'phone':
            chatInput.placeholder = "Введите номер телефона (например: +79991234567)";
            break;
        case 'email':
            chatInput.placeholder = "Введите email адрес (например: user@example.com)";
            break;
        case 'name':
            chatInput.placeholder = "Введите ФИО (например: Иванов Иван Иванович)";
            break;
        case 'ip':
            chatInput.placeholder = "Введите IP адрес (например: 192.168.1.1)";
            break;
        case 'car':
            chatInput.placeholder = "Введите номер авто (например: А123БВ777)";
            break;
        case 'inn':
            chatInput.placeholder = "Введите ИНН (12 цифр для физ.лица, 10 для юр.лица)";
            break;
    }

    chatInput.focus();
}

function isUserAuthenticated() {
    return localStorage.getItem('rootweb_logged_in') === 'true';
}

function sendMessage() {
    if (!isUserAuthenticated()) {
        showAuthRequired();
        disableChat();
        return;
    }

    const chatInput = document.getElementById('chat-input');
    const query = chatInput.value.trim();

    if (!query) {
        showError('Введите запрос для поиска');
        return;
    }

    addUserMessage(query);
    chatInput.value = '';

    currentQuery = query;

    const searchType = detectSearchType(query);
    performSearch(query, searchType);
}

function detectSearchType(query) {
    if (currentSearchType !== 'auto') {
        return currentSearchType;
    }

    if (query.includes('@') && query.includes('.')) {
        return 'email';
    }

    const cleanQuery = query.replace(/[+\-()\s]/g, '');
    if (/^\d+$/.test(cleanQuery) && cleanQuery.length >= 10 && cleanQuery.length <= 15) {
        return 'phone';
    }

    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(query)) {
        return 'ip';
    }

    if (/^\d{12}$/.test(query) || /^\d{10}$/.test(query)) {
        return 'inn';
    }

    if (/^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+(\s[А-ЯЁ][а-яё]+)?$/.test(query) ||
        /^[A-Z][a-z]+\s[A-Z][a-z]+(\s[A-Z][a-z]+)?$/.test(query)) {
        return 'name';
    }

    if (/^[А-Я]\d{3}[А-Я]{2}\d{2,3}$/.test(query.toUpperCase())) {
        return 'car';
    }

    return 'text';
}

function performSearch(query, searchType) {
    if (!isUserAuthenticated()) {
        showAuthRequired();
        return;
    }

    showLoading('Выполняю поиск...');

    const userData = JSON.parse(localStorage.getItem('rootweb_user') || '{}');
    const userId = userData.user_id || '';

    fetch('/api/osint-search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            type: searchType,
            user_id: userId,
            limit: 100
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentResults = data.results;
                currentPage = data.current_page || 0;
                totalPages = data.total_pages || 1;

                if (data.formatted_results) {
                    showFormattedResults(data.formatted_results, searchType);
                    updatePagination();
                } else {
                    showNoResults(query, searchType);
                    hidePagination();
                }
            } else {
                if (data.error && data.error.includes('авторизации')) {
                    showAuthRequired();
                    disableChat();
                } else {
                    showError(data.error || 'Ошибка при выполнении поиска');
                }
                hidePagination();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Ошибка соединения с сервером');
            hidePagination();
        });
}

function showLoading(message) {
    const chatContainer = document.getElementById('chat-container');

    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-sender">OSINT Assistant</div>
            <div class="message-text" style="display: flex; align-items: center;">
                <div class="loading-spinner"></div>
                ${escapeHtml(message)}
            </div>
            <div class="message-time">Только что</div>
        </div>
    `;

    chatContainer.appendChild(loadingMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addUserMessage(message) {
    const chatContainer = document.getElementById('chat-container');

    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <div class="message-sender">Вы</div>
            <div class="message-text">${escapeHtml(message)}</div>
            <div class="message-time">Только что</div>
        </div>
    `;

    chatContainer.appendChild(userMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showFormattedResults(formattedResults, searchType = "") {
    const chatContainer = document.getElementById('chat-container');

    const loadingMessages = chatContainer.querySelectorAll('.loading-message');
    loadingMessages.forEach(msg => msg.remove());

    const resultMessage = document.createElement('div');
    resultMessage.className = 'result-message';

    let typeInfo = "";
    if (searchType) {
        const typeNames = {
            'phone': 'телефон',
            'email': 'email',
            'name': 'ФИО',
            'ip': 'IP адрес',
            'car': 'автомобиль',
            'inn': 'ИНН',
            'text': 'текст'
        };
        typeInfo = `<div class="page-info">Тип поиска: ${typeNames[searchType] || searchType}</div>`;
    }

    resultMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-database"></i>
        </div>
        <div class="message-content">
            <div class="message-sender">Результаты поиска</div>
            <div class="message-text">${formattedResults}${typeInfo}</div>
            <div class="message-time">Только что</div>
        </div>
    `;

    chatContainer.appendChild(resultMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showNoResults(query, searchType) {
    const chatContainer = document.getElementById('chat-container');

    const loadingMessages = chatContainer.querySelectorAll('.loading-message');
    loadingMessages.forEach(msg => msg.remove());

    const noResultsMessage = document.createElement('div');
    noResultsMessage.className = 'result-message';
    noResultsMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-search"></i>
        </div>
        <div class="message-content">
            <div class="message-sender">Результаты поиска</div>
            <div class="message-text">
                <b>По запросу "${escapeHtml(query)}" ничего не найдено.</b><br>
                Попробуйте изменить запрос или выбрать другой тип поиска.
            </div>
            <div class="message-time">Только что</div>
        </div>
    `;

    chatContainer.appendChild(noResultsMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showError(message) {
    const chatContainer = document.getElementById('chat-container');

    const loadingMessages = chatContainer.querySelectorAll('.loading-message');
    loadingMessages.forEach(msg => msg.remove());

    const errorMessage = document.createElement('div');
    errorMessage.className = 'result-message';
    errorMessage.innerHTML = `
        <div class="message-avatar" style="background: linear-gradient(90deg, #f44336 0%, #d32f2f 100%);">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="message-content" style="background: rgba(244, 67, 54, 0.1); border-color: rgba(244, 67, 54, 0.3);">
            <div class="message-sender" style="color: #f44336;">Ошибка</div>
            <div class="message-text">${escapeHtml(message)}</div>
            <div class="message-time">Только что</div>
        </div>
    `;

    chatContainer.appendChild(errorMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('page-info');

    if (totalPages > 1) {
        pagination.style.display = 'flex';
        pageInfo.textContent = `База данных ${currentPage + 1} из ${totalPages}`;

        const prevBtn = pagination.querySelector('.pagination-btn:first-child');
        const nextBtn = pagination.querySelector('.pagination-btn:last-child');

        if (currentPage === 0) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.5';
        } else {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
        }

        if (currentPage === totalPages - 1) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
        } else {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }
    } else {
        hidePagination();
    }
}

function hidePagination() {
    const pagination = document.getElementById('pagination');
    pagination.style.display = 'none';
}

function nextPage() {
    if (!isUserAuthenticated()) {
        showAuthRequired();
        return;
    }

    if (currentPage < totalPages - 1 && currentResults) {
        currentPage++;

        const searchType = detectSearchType(currentQuery);
        const userData = JSON.parse(localStorage.getItem('rootweb_user') || '{}');
        const userId = userData.user_id || '';

        fetch('/api/osint-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: currentQuery,
                type: searchType,
                page: currentPage,
                results: currentResults,
                user_id: userId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const chatContainer = document.getElementById('chat-container');
                    const lastResult = chatContainer.querySelector('.result-message:last-child');
                    if (lastResult) {
                        lastResult.remove();
                    }

                    showFormattedResults(data.formatted_results, searchType);
                    updatePagination();
                } else {
                    showError(data.error || 'Ошибка при переключении страницы');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Ошибка соединения с сервером');
            });
    }
}

function prevPage() {
    if (!isUserAuthenticated()) {
        showAuthRequired();
        return;
    }

    if (currentPage > 0 && currentResults) {
        currentPage--;

        const searchType = detectSearchType(currentQuery);
        const userData = JSON.parse(localStorage.getItem('rootweb_user') || '{}');
        const userId = userData.user_id || '';

        fetch('/api/osint-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: currentQuery,
                type: searchType,
                page: currentPage,
                results: currentResults,
                user_id: userId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const chatContainer = document.getElementById('chat-container');
                    const lastResult = chatContainer.querySelector('.result-message:last-child');
                    if (lastResult) {
                        lastResult.remove();
                    }

                    showFormattedResults(data.formatted_results, searchType);
                    updatePagination();
                } else {
                    showError(data.error || 'Ошибка при переключении страницы');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Ошибка соединения с сервером');
            });
    }
}

function clearChat() {
    if (!isUserAuthenticated()) {
        showAuthRequired();
        return;
    }

    const chatContainer = document.getElementById('chat-container');
    const welcomeMessage = chatContainer.querySelector('.welcome-message');

    chatContainer.innerHTML = '';
    if (welcomeMessage) {
        chatContainer.appendChild(welcomeMessage.cloneNode(true));
    }

    hidePagination();
    currentResults = null;
    currentPage = 0;
    totalPages = 1;
    currentQuery = "";

    Swal.fire({
        icon: 'success',
        title: 'Чат очищен',
        text: 'Все сообщения удалены',
        confirmButtonColor: '#9d4edd'
    });
}

function navigateToSection(section) {
    const sections = {
        'osint': '/osint/web.html',
        'tool': '/tool/web.html',
        'forum': '/forum/web.html',
        'market': '/market/web.html',
        'pentest': '/pentest/web.html',
        'rootgo': '/rootgo/web.html',
        'ai': '/AI/web.html',
        'software': '/software/web.html'
    };

    if (sections[section]) {
        window.location.href = sections[section];
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}