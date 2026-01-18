document.addEventListener('DOMContentLoaded', function () {
    const currentUser = localStorage.getItem('rootweb_logged_in') === 'true' ?
        JSON.parse(localStorage.getItem('rootweb_user') || '{}') : null;

    const modelItems = document.querySelectorAll('.model-item');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const exportChatBtn = document.getElementById('export-chat-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const attachFileBtn = document.getElementById('attach-file-btn');
    const fileInput = document.getElementById('file-input');
    const chatMessages = document.getElementById('chat-messages');
    const currentModelName = document.getElementById('current-model-name');

    let currentModel = 'serenity';
    let chatHistory = [];
    let isGenerating = false;
    let currentRequestAbortController = null;

    const models = {
        serenity: {
            name: 'Serenity',
            icon: 'fa-robot',
            description: 'Локальная нейросеть',
            endpoint: '/api/ai/serenity'
        },
        openai: {
            name: 'OpenAI',
            icon: 'fab fa-openai',
            description: 'GPT-4, GPT-3.5',
            endpoint: '/api/ai/openai'
        },
        deepseek: {
            name: 'DeepSeek',
            icon: 'fa-code',
            description: 'Код-ассистент',
            endpoint: '/api/ai/deepseek'
        },
        anthropic: {
            name: 'Anthropic',
            icon: 'fa-user-shield',
            description: 'Claude AI',
            endpoint: '/api/ai/anthropic'
        },
        yandex: {
            name: 'Yandex',
            icon: 'fab fa-yandex',
            description: 'YandexGPT',
            endpoint: '/api/ai/yandex'
        },
        google: {
            name: 'Google',
            icon: 'fab fa-google',
            description: 'Gemini Pro',
            endpoint: '/api/ai/google'
        }
    };

    function initInterface() {
        updateUserInterface();
        setupEventListeners();
        checkAuth();
    }

    function updateUserInterface() {
        const authButtons = document.getElementById('auth-buttons');
        const profileContainer = document.getElementById('profile-container');

        if (currentUser) {
            authButtons.style.display = 'none';
            profileContainer.style.display = 'block';

            const avatarSmall = document.getElementById('profile-avatar-small');
            const profileName = document.getElementById('profile-name');

            if (currentUser.avatar_base64 && avatarSmall) {
                avatarSmall.src = currentUser.avatar_base64;
            }

            if (profileName) {
                profileName.textContent = currentUser.username || 'Пользователь';
            }
        } else {
            authButtons.style.display = 'flex';
            profileContainer.style.display = 'none';
        }
    }

    function checkAuth() {
        if (!currentUser) {
            showNotification('Для использования AI необходимо войти в систему', 'warning');
        }
    }

    function setupEventListeners() {
        modelItems.forEach(item => {
            item.addEventListener('click', function () {
                const model = this.getAttribute('data-model');
                selectModel(model);
            });
        });

        sendMessageBtn.addEventListener('click', sendMessage);

        chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        chatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        clearChatBtn.addEventListener('click', clearChat);
        newChatBtn.addEventListener('click', newChat);
        exportChatBtn.addEventListener('click', exportChat);
        settingsBtn.addEventListener('click', showSettings);
        attachFileBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', handleFileUpload);

        setupNavigation();
    }

    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                window.location.href = href;
            });
        });

        const logo = document.getElementById('main-logo');
        if (logo) {
            logo.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = '/';
            });
        }
    }

    function selectModel(model) {
        if (!models[model]) return;

        modelItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-model') === model) {
                item.classList.add('active');
            }
        });

        currentModel = model;
        currentModelName.textContent = models[model].name;

        const modelIcon = document.querySelector('.current-model-icon i');
        if (modelIcon) {
            modelIcon.className = models[model].icon;
        }

        showNotification(`Модель изменена на ${models[model].name}`, 'info');
    }

    async function sendMessage() {
        const message = chatInput.value.trim();

        if (!message) return;

        if (!currentUser) {
            showNotification('Для использования AI необходимо войти в систему', 'error');
            return;
        }

        if (isGenerating) {
            showNotification('Подождите, модель генерирует ответ...', 'warning');
            return;
        }

        addMessageToChat('user', message);

        chatInput.value = '';
        chatInput.style.height = 'auto';

        chatHistory.push({ role: 'user', content: message });

        const loadingId = showLoadingIndicator();

        isGenerating = true;
        currentRequestAbortController = new AbortController();

        try {
            const response = await callAIAPI(message, currentRequestAbortController.signal);

            removeLoadingIndicator(loadingId);

            addMessageToChat('assistant', response);

            chatHistory.push({ role: 'assistant', content: response });

        } catch (error) {
            removeLoadingIndicator(loadingId);

            if (error.name === 'AbortError') {
                showNotification('Запрос отменен', 'info');
            } else {
                showNotification(`Ошибка: ${error.message}`, 'error');
                addMessageToChat('assistant', 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.');
            }
        } finally {
            isGenerating = false;
            currentRequestAbortController = null;
        }
    }

    async function callAIAPI(message, signal) {
        const modelConfig = models[currentModel];

        const response = await fetch(modelConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: currentModel,
                message: message,
                history: chatHistory.slice(-10),
                user_id: currentUser.user_id
            }),
            signal: signal
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Неизвестная ошибка');
        }

        return data.response;
    }

    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';

        const avatarIcon = document.createElement('i');
        avatarIcon.className = role === 'user' ? 'fas fa-user' : models[currentModel].icon;
        avatarDiv.appendChild(avatarIcon);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';

        const formattedContent = formatMessageContent(content);
        textDiv.innerHTML = formattedContent;

        applyCodeStyles(textDiv);

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(timeDiv);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessageContent(content) {
        let formatted = content;

        formatted = formatted.replace(/<pre><code class="(\w+)">/g, '<pre><code class="language-$1">');

        formatted = formatted.replace(/<code>/g, '<code class="inline-code">');

        formatted = formatted.replace(/\n/g, '<br>');

        formatted = formatted.replace(/^• /gm, '• ');

        return formatted;
    }

    function applyCodeStyles(element) {
        const codeBlocks = element.querySelectorAll('pre code');
        codeBlocks.forEach(codeBlock => {
            const language = codeBlock.className.replace('language-', '') || 'text';
            const languageLabel = document.createElement('div');
            languageLabel.className = 'code-language';
            languageLabel.textContent = language;
            codeBlock.parentNode.insertBefore(languageLabel, codeBlock);

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn';
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.title = 'Копировать код';
            copyButton.addEventListener('click', function () {
                const codeText = codeBlock.textContent;
                navigator.clipboard.writeText(codeText).then(() => {
                    showNotification('Код скопирован в буфер обмена', 'success');
                });
            });
            codeBlock.parentNode.insertBefore(copyButton, codeBlock.nextSibling);
        });

        const inlineCodes = element.querySelectorAll('.inline-code');
        inlineCodes.forEach(inlineCode => {
            inlineCode.style.fontFamily = "'Courier New', monospace";
            inlineCode.style.background = 'rgba(157, 78, 221, 0.1)';
            inlineCode.style.padding = '2px 6px';
            inlineCode.style.borderRadius = '4px';
            inlineCode.style.color = '#9d4edd';
        });
    }

    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-message';
        loadingDiv.id = 'loading-indicator';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';

        const avatarIcon = document.createElement('i');
        avatarIcon.className = models[currentModel].icon;
        avatarDiv.appendChild(avatarIcon);

        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'loading-dots';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            dotsDiv.appendChild(dot);
        }

        loadingDiv.appendChild(avatarDiv);
        loadingDiv.appendChild(dotsDiv);

        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return 'loading-indicator';
    }

    function removeLoadingIndicator(id) {
        const loadingElement = document.getElementById(id);
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    function clearChat() {
        if (chatMessages.children.length <= 1) return;

        Swal.fire({
            title: 'Очистить чат?',
            text: 'Все сообщения будут удалены',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9d4edd',
            cancelButtonColor: '#6c7d8c',
            confirmButtonText: 'Да, очистить',
            cancelButtonText: 'Отмена'
        }).then((result) => {
            if (result.isConfirmed) {
                if (isGenerating && currentRequestAbortController) {
                    currentRequestAbortController.abort();
                }

                while (chatMessages.children.length > 1) {
                    chatMessages.removeChild(chatMessages.lastChild);
                }

                chatHistory = [];

                showNotification('Чат очищен', 'success');
            }
        });
    }

    function newChat() {
        clearChat();
    }

    function exportChat() {
        if (chatHistory.length === 0) {
            showNotification('Нет сообщений для экспорта', 'warning');
            return;
        }

        let chatText = `Чат с AI ${models[currentModel].name}\n`;
        chatText += `Дата: ${new Date().toLocaleString('ru-RU')}\n`;
        chatText += `Пользователь: ${currentUser?.username || 'Неизвестно'}\n`;
        chatText += '='.repeat(50) + '\n\n';

        chatHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Вы' : 'AI';
            const time = new Date().toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            chatText += `${role} [${time}]:\n`;

            const cleanContent = msg.content
                .replace(/<[^>]*>/g, '')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
            chatText += cleanContent + '\n\n';
        });

        const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_${currentModel}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Чат экспортирован', 'success');
    }

    function showSettings() {
        Swal.fire({
            title: 'Настройки AI',
            html: `
                <div style="text-align: left;">
                    <h4 style="color: #9d4edd; margin-bottom: 15px;">Настройки моделей</h4>
                    <p><strong>Текущая модель:</strong> ${models[currentModel].name}</p>
                    <p><strong>Пользователь:</strong> ${currentUser?.username || 'Не авторизован'}</p>
                    <p><strong>ID:</strong> ${currentUser?.user_id || 'Неизвестно'}</p>
                    <hr style="border-color: #3a1e5c; margin: 15px 0;">
                    <p style="color: #c8b6ff; font-size: 14px;">
                        AI модели доступны только зарегистрированным пользователям.
                        Все запросы логируются для безопасности.
                    </p>
                </div>
            `,
            confirmButtonColor: '#9d4edd',
            confirmButtonText: 'Закрыть'
        });
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.txt')) {
            showNotification('Разрешены только TXT файлы', 'error');
            return;
        }

        if (file.size > 1024 * 1024) {
            showNotification('Файл слишком большой (макс. 1MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            chatInput.value = content + '\n\n' + (chatInput.value || '');
            chatInput.style.height = 'auto';
            chatInput.style.height = (chatInput.scrollHeight) + 'px';
            showNotification('Файл загружен', 'success');
        };
        reader.readAsText(file);

        event.target.value = '';
    }

    function showNotification(message, type = 'info') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    initInterface();
});