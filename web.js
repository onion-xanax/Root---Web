window.bypassDeviceCheck = function () {
    localStorage.setItem('deviceCheckBypassed', 'true');
    const deviceCheck = document.getElementById('device-check');
    if (deviceCheck) {
        deviceCheck.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const deviceCheck = document.getElementById('device-check');
    if (deviceCheck) {
        deviceCheck.style.display = 'none';
    }
    localStorage.setItem('deviceCheckBypassed', 'true');

    const authButtons = document.getElementById('auth-buttons');
    const profileContainer = document.getElementById('profile-container');
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const changePasswordModal = document.getElementById('change-password-modal');
    const profileOverlay = document.getElementById('profile-overlay');

    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const profileBtn = document.getElementById('profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileLogoutBtn = document.getElementById('profile-logout-btn');

    const closeRegisterBtn = document.getElementById('close-register-btn');
    const closeLoginBtn = document.getElementById('close-login-btn');
    const closeEditProfileBtn = document.getElementById('close-edit-profile-btn');
    const closeChangePasswordBtn = document.getElementById('close-change-password-btn');
    const closeProfileBtn = document.getElementById('close-profile-btn');

    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreviewImg = document.getElementById('avatar-preview-img');
    const defaultAvatar = document.querySelector('.default-avatar');

    const usernameInput = document.getElementById('register-username');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const generatedId = document.getElementById('generated-id');

    const nextStep1Btn = document.getElementById('next-step-1');
    const backStep2Btn = document.getElementById('back-step-2');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const verificationEmail = document.getElementById('verification-email');
    const codeDigits = document.querySelectorAll('.code-digit');
    const timerElement = document.getElementById('timer');
    const resendCodeBtn = document.getElementById('resend-code-btn');
    const verificationStatus = document.getElementById('verification-status');
    const progressFill = document.getElementById('progress-fill');
    const loadingText = document.getElementById('loading-text');

    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginSubmitBtn = document.getElementById('login-submit-btn');

    const editAvatarInput = document.getElementById('edit-avatar-input');
    const editAvatarPreviewImg = document.getElementById('edit-avatar-preview-img');
    const editAvatarUploadBtn = document.getElementById('edit-avatar-upload-btn');
    const editUsernameInput = document.getElementById('edit-username');
    const editEmailInput = document.getElementById('edit-email');
    const editBioInput = document.getElementById('edit-bio');
    const editTelegramInput = document.getElementById('edit-telegram');
    const editWebsiteInput = document.getElementById('edit-website');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelEditProfileBtn = document.getElementById('cancel-edit-profile-btn');

    const editProfileMenuBtn = document.getElementById('edit-profile-menu-btn');
    const changePasswordMenuBtn = document.getElementById('change-password-menu-btn');
    const changeAvatarMenuBtn = document.getElementById('change-avatar-menu-btn');

    const openEditProfileBtn = document.getElementById('open-edit-profile-btn');
    const openChangePasswordBtn = document.getElementById('open-change-password-btn');

    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const cancelChangePasswordBtn = document.getElementById('cancel-change-password-btn');

    let userData = {
        avatar: null,
        username: '',
        email: '',
        password: '',
        user_id: '00000001',
        verification_code: '',
        avatar_base64: null,
        bio: '',
        telegram: '',
        website: ''
    };

    let verificationTimer = null;
    let countdown = 60;
    let currentUser = null;

    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function updateUserInterface() {
        const loggedIn = localStorage.getItem('rootweb_logged_in') === 'true';

        if (loggedIn) {
            const user = JSON.parse(localStorage.getItem('rootweb_user') || '{}');
            currentUser = user;

            authButtons.style.display = 'none';
            profileContainer.style.display = 'block';

            const avatarSmall = document.getElementById('profile-avatar-small');
            const profileName = document.getElementById('profile-name');
            const profileAvatar = document.getElementById('profile-avatar');
            const profileUsername = document.getElementById('profile-username');
            const profileEmail = document.getElementById('profile-email');
            const profileId = document.getElementById('profile-id');
            const profileRegDate = document.getElementById('profile-reg-date');
            const profileBio = document.getElementById('profile-bio');
            const profileTelegram = document.getElementById('profile-telegram');
            const profileWebsite = document.getElementById('profile-website');
            const lastLoginTime = document.getElementById('last-login-time');

            if (user.avatar_base64) {
                if (avatarSmall) avatarSmall.src = user.avatar_base64;
                if (profileAvatar) profileAvatar.src = user.avatar_base64;
                if (editAvatarPreviewImg) editAvatarPreviewImg.src = user.avatar_base64;
            }

            if (profileName) profileName.textContent = user.username || 'Пользователь';
            if (profileUsername) profileUsername.textContent = user.username || 'Не указан';
            if (profileEmail) profileEmail.textContent = user.email || 'Не указан';
            if (profileId) profileId.textContent = user.user_id || '00000001';
            if (profileRegDate) profileRegDate.textContent = new Date(user.registration_date).toLocaleDateString('ru-RU');
            if (profileBio) profileBio.textContent = user.bio || 'Не указано';
            if (profileTelegram) profileTelegram.textContent = user.telegram || 'Не указан';
            if (profileWebsite) profileWebsite.textContent = user.website || 'Не указан';
            if (lastLoginTime) lastLoginTime.textContent = new Date(user.last_login).toLocaleString('ru-RU');

            if (editUsernameInput) editUsernameInput.value = user.username || '';
            if (editEmailInput) editEmailInput.value = user.email || '';
            if (editBioInput) editBioInput.value = user.bio || '';
            if (editTelegramInput) editTelegramInput.value = user.telegram || '';
            if (editWebsiteInput) editWebsiteInput.value = user.website || '';
        } else {
            authButtons.style.display = 'flex';
            profileContainer.style.display = 'none';
            currentUser = null;
        }
    }

    function showRegisterModal() {
        userData = {
            avatar: null,
            username: '',
            email: '',
            password: '',
            user_id: '00000001',
            verification_code: generateVerificationCode(),
            avatar_base64: null,
            bio: '',
            telegram: '',
            website: ''
        };

        if (generatedId) generatedId.textContent = userData.user_id;
        if (usernameInput) usernameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';

        if (avatarPreviewImg) avatarPreviewImg.style.display = 'none';
        if (defaultAvatar) defaultAvatar.style.display = 'block';

        document.getElementById('step-1').classList.add('active');
        document.getElementById('step-2').classList.remove('active');
        document.getElementById('step-3').classList.remove('active');

        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === 0);
        });

        if (registerModal) registerModal.style.display = 'flex';
    }

    function hideRegisterModal() {
        if (registerModal) registerModal.style.display = 'none';
        clearInterval(verificationTimer);
        countdown = 60;
    }

    function showLoginModal() {
        if (loginEmailInput) loginEmailInput.value = '';
        if (loginPasswordInput) loginPasswordInput.value = '';
        if (loginModal) loginModal.style.display = 'flex';
    }

    function hideLoginModal() {
        if (loginModal) loginModal.style.display = 'none';
    }

    function showEditProfileModal() {
        if (!currentUser) return;

        if (editUsernameInput) editUsernameInput.value = currentUser.username || '';
        if (editEmailInput) editEmailInput.value = currentUser.email || '';
        if (editBioInput) editBioInput.value = currentUser.bio || '';
        if (editTelegramInput) editTelegramInput.value = currentUser.telegram || '';
        if (editWebsiteInput) editWebsiteInput.value = currentUser.website || '';

        if (currentUser.avatar_base64 && editAvatarPreviewImg) {
            editAvatarPreviewImg.src = currentUser.avatar_base64;
        }

        if (editProfileModal) editProfileModal.style.display = 'flex';
        hideProfileModal();
    }

    function hideEditProfileModal() {
        if (editProfileModal) editProfileModal.style.display = 'none';
    }

    function showChangePasswordModal() {
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';

        if (changePasswordModal) changePasswordModal.style.display = 'flex';
        hideProfileModal();
    }

    function hideChangePasswordModal() {
        if (changePasswordModal) changePasswordModal.style.display = 'none';
    }

    function showProfileModal() {
        updateUserInterface();
        if (profileOverlay) profileOverlay.style.display = 'flex';
    }

    function hideProfileModal() {
        if (profileOverlay) profileOverlay.style.display = 'none';
    }

    function goToStep(stepNumber) {
        document.querySelectorAll('.register-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`step-${stepNumber}`).classList.add('active');

        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === stepNumber - 1);
        });

        if (stepNumber === 2) {
            startVerificationTimer();
            if (verificationEmail) verificationEmail.textContent = userData.email;

            codeDigits.forEach(digit => {
                if (digit) {
                    digit.value = '';
                    digit.addEventListener('input', handleCodeInput);
                    digit.addEventListener('keydown', handleCodeKeydown);
                }
            });

            if (codeDigits[0]) codeDigits[0].focus();
            updateVerifyButton();
        }
    }

    function handleCodeInput(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);

        if (input.value.length === 1 && index < 5) {
            if (codeDigits[index + 1]) codeDigits[index + 1].focus();
        }

        updateVerifyButton();
    }

    function handleCodeKeydown(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);

        if (e.key === 'Backspace' && input.value === '' && index > 0) {
            if (codeDigits[index - 1]) codeDigits[index - 1].focus();
        }

        if (e.key === 'ArrowLeft' && index > 0) {
            if (codeDigits[index - 1]) codeDigits[index - 1].focus();
        }

        if (e.key === 'ArrowRight' && index < 5) {
            if (codeDigits[index + 1]) codeDigits[index + 1].focus();
        }
    }

    function updateVerifyButton() {
        const code = Array.from(codeDigits).map(d => d ? d.value : '').join('');
        const isValid = code.length === 6 && /^\d+$/.test(code);
        if (verifyCodeBtn) verifyCodeBtn.disabled = !isValid;
    }

    function startVerificationTimer() {
        clearInterval(verificationTimer);
        countdown = 60;
        if (timerElement) timerElement.textContent = countdown;
        if (resendCodeBtn) resendCodeBtn.disabled = true;

        verificationTimer = setInterval(() => {
            countdown--;
            if (timerElement) timerElement.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(verificationTimer);
                if (resendCodeBtn) resendCodeBtn.disabled = false;
                if (verificationStatus) {
                    verificationStatus.textContent = 'Время истекло. Запросите новый код.';
                    verificationStatus.style.color = '#ff6b6b';
                }
            }
        }, 1000);
    }

    function validateStep1() {
        const username = usernameInput ? usernameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        let isValid = true;

        if (username.length < 3) {
            const hint = document.getElementById('username-hint');
            if (hint) {
                hint.textContent = 'Никнейм должен содержать минимум 3 символа';
                hint.style.color = '#ff6b6b';
            }
            isValid = false;
        } else if (username.length > 32) {
            const hint = document.getElementById('username-hint');
            if (hint) {
                hint.textContent = 'Никнейм не должен превышать 32 символа';
                hint.style.color = '#ff6b6b';
            }
            isValid = false;
        } else {
            const hint = document.getElementById('username-hint');
            if (hint) hint.textContent = '';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const hint = document.getElementById('email-hint');
            if (hint) {
                hint.textContent = 'Введите корректный email';
                hint.style.color = '#ff6b6b';
            }
            isValid = false;
        } else {
            const hint = document.getElementById('email-hint');
            if (hint) hint.textContent = '';
        }

        if (password.length < 6) {
            const hint = document.getElementById('password-hint');
            if (hint) {
                hint.textContent = 'Пароль должен содержать минимум 6 символов';
                hint.style.color = '#ff6b6b';
            }
            isValid = false;
        } else {
            const hint = document.getElementById('password-hint');
            if (hint) hint.textContent = '';
        }

        if (password !== confirmPassword) {
            const hint = document.getElementById('confirm-password-hint');
            if (hint) {
                hint.textContent = 'Пароли не совпадают';
                hint.style.color = '#ff6b6b';
            }
            isValid = false;
        } else {
            const hint = document.getElementById('confirm-password-hint');
            if (hint) hint.textContent = '';
        }

        return isValid;
    }

    async function sendVerificationCode() {
        if (verificationStatus) {
            verificationStatus.textContent = 'Отправка кода...';
            verificationStatus.style.color = '#ffd700';
        }

        try {
            const response = await fetch('/api/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userData.email,
                    code: userData.verification_code
                })
            });

            const data = await response.json();

            if (verificationStatus) {
                if (data.success) {
                    verificationStatus.textContent = `Код отправлен на ${userData.email}`;
                    verificationStatus.style.color = '#4CAF50';
                    startVerificationTimer();
                } else {
                    verificationStatus.textContent = 'Ошибка отправки кода: ' + data.error;
                    verificationStatus.style.color = '#ff6b6b';
                }
            }
        } catch (error) {
            if (verificationStatus) {
                verificationStatus.textContent = 'Ошибка соединения';
                verificationStatus.style.color = '#ff6b6b';
            }
        }
    }

    async function completeRegistration() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progressFill) progressFill.style.width = `${progress}%`;

            if (progress === 10 && loadingText) loadingText.textContent = 'Проверка данных...';
            if (progress === 30 && loadingText) loadingText.textContent = 'Сохранение в Telegram...';
            if (progress === 60 && loadingText) loadingText.textContent = 'Создание профиля...';
            if (progress === 90 && loadingText) loadingText.textContent = 'Финальная настройка...';

            if (progress >= 100) {
                clearInterval(interval);

                userData.registration_date = new Date().toISOString();
                userData.last_login = new Date().toISOString();

                setTimeout(async () => {
                    try {
                        const response = await fetch('/api/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: userData.username,
                                email: userData.email,
                                password: userData.password,
                                avatar_base64: userData.avatar_base64,
                                user_id: userData.user_id
                            })
                        });

                        const data = await response.json();

                        if (data.success) {
                            localStorage.setItem('rootweb_logged_in', 'true');
                            localStorage.setItem('rootweb_user', JSON.stringify(data.user));

                            updateUserInterface();
                            hideRegisterModal();

                            Swal.fire({
                                icon: 'success',
                                title: 'Регистрация успешна!',
                                text: 'Добро пожаловать в Root Web',
                                confirmButtonColor: '#9d4edd'
                            });
                        } else {
                            if (loadingText) loadingText.textContent = 'Ошибка: ' + (data.error || 'Неизвестная ошибка');
                            setTimeout(() => goToStep(1), 2000);
                        }
                    } catch (error) {
                        if (loadingText) loadingText.textContent = 'Ошибка соединения';
                        setTimeout(() => goToStep(1), 2000);
                    }
                }, 500);
            }
        }, 200);
    }

    async function handleLogin(event) {
        if (event) event.preventDefault();

        const email = loginEmailInput ? loginEmailInput.value.trim() : '';
        const password = loginPasswordInput ? loginPasswordInput.value : '';

        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Введите email и пароль',
                confirmButtonColor: '#9d4edd'
            });
            return;
        }

        if (loginSubmitBtn) loginSubmitBtn.disabled = true;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('rootweb_logged_in', 'true');
                localStorage.setItem('rootweb_user', JSON.stringify(data.user));

                updateUserInterface();
                hideLoginModal();

                Swal.fire({
                    icon: 'success',
                    title: 'Вход выполнен!',
                    text: 'Добро пожаловать обратно',
                    confirmButtonColor: '#9d4edd'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: data.error || 'Неверный email или пароль',
                    confirmButtonColor: '#9d4edd'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Ошибка соединения с сервером',
                confirmButtonColor: '#9d4edd'
            });
        } finally {
            if (loginSubmitBtn) loginSubmitBtn.disabled = false;
        }
    }

    async function updateProfile() {
        if (!currentUser) return;

        const username = editUsernameInput ? editUsernameInput.value.trim() : '';
        const bio = editBioInput ? editBioInput.value.trim() : '';
        const telegram = editTelegramInput ? editTelegramInput.value.trim() : '';
        const website = editWebsiteInput ? editWebsiteInput.value.trim() : '';

        if (!username) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Никнейм не может быть пустым',
                confirmButtonColor: '#9d4edd'
            });
            return;
        }

        try {
            const response = await fetch('/api/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUser.email,
                    username: username,
                    bio: bio,
                    telegram: telegram,
                    website: website,
                    avatar_base64: currentUser.avatar_base64
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('rootweb_user', JSON.stringify(data.user));
                updateUserInterface();
                hideEditProfileModal();

                Swal.fire({
                    icon: 'success',
                    title: 'Успешно',
                    text: 'Профиль обновлен',
                    confirmButtonColor: '#9d4edd'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: data.error || 'Ошибка обновления профиля',
                    confirmButtonColor: '#9d4edd'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Ошибка соединения с сервером',
                confirmButtonColor: '#9d4edd'
            });
        }
    }

    async function changePassword() {
        if (!currentUser) return;

        const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
        const newPassword = newPasswordInput ? newPasswordInput.value : '';
        const confirmNewPassword = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Заполните все поля',
                confirmButtonColor: '#9d4edd'
            });
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Новый пароль должен содержать минимум 6 символов',
                confirmButtonColor: '#9d4edd'
            });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Новые пароли не совпадают',
                confirmButtonColor: '#9d4edd'
            });
            return;
        }

        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUser.email,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                hideChangePasswordModal();

                Swal.fire({
                    icon: 'success',
                    title: 'Успешно',
                    text: 'Пароль изменен',
                    confirmButtonColor: '#9d4edd'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: data.error || 'Ошибка смены пароля',
                    confirmButtonColor: '#9d4edd'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Ошибка соединения с сервером',
                confirmButtonColor: '#9d4edd'
            });
        }
    }

    function logout() {
        localStorage.removeItem('rootweb_logged_in');
        localStorage.removeItem('rootweb_user');
        currentUser = null;
        updateUserInterface();
        hideProfileModal();

        Swal.fire({
            icon: 'info',
            title: 'Выход выполнен',
            text: 'Вы успешно вышли из системы',
            confirmButtonColor: '#9d4edd'
        });
    }

    function handleAvatarUpload(file, isEdit = false) {
        if (!file) return;

        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Разрешены только JPG и PNG файлы',
                confirmButtonColor: '#9d4edd'
            });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Размер файла не должен превышать 2MB',
                confirmButtonColor: '#9d4edd'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64 = e.target.result;

            if (isEdit && currentUser) {
                currentUser.avatar_base64 = base64;
                if (editAvatarPreviewImg) editAvatarPreviewImg.src = base64;
            } else {
                userData.avatar_base64 = base64;
                if (avatarPreviewImg) {
                    avatarPreviewImg.src = base64;
                    avatarPreviewImg.style.display = 'block';
                    if (defaultAvatar) defaultAvatar.style.display = 'none';
                }
            }
        };
        reader.readAsDataURL(file);
    }

    // Навигация между разделами
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                navigateToSection(section);
            });
        });

        const logo = document.getElementById('main-logo');
        if (logo) {
            logo.addEventListener('click', function (e) {
                e.preventDefault();
                navigateToSection('home');
            });
        }
    }

    function navigateToSection(section) {
        const sections = {
            'home': '/',
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

    // Инициализация
    if (avatarUploadBtn) {
        avatarUploadBtn.addEventListener('click', () => {
            if (avatarInput) avatarInput.click();
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            handleAvatarUpload(file, false);
        });
    }

    if (editAvatarUploadBtn) {
        editAvatarUploadBtn.addEventListener('click', () => {
            if (editAvatarInput) editAvatarInput.click();
        });
    }

    if (editAvatarInput) {
        editAvatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            handleAvatarUpload(file, true);
        });
    }

    if (nextStep1Btn) {
        nextStep1Btn.addEventListener('click', () => {
            if (!validateStep1()) return;

            userData.username = usernameInput ? usernameInput.value.trim() : '';
            userData.email = emailInput ? emailInput.value.trim() : '';
            userData.password = passwordInput ? passwordInput.value : '';

            goToStep(2);
            sendVerificationCode();
        });
    }

    if (backStep2Btn) {
        backStep2Btn.addEventListener('click', () => goToStep(1));
    }

    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', async () => {
            const enteredCode = Array.from(codeDigits).map(d => d ? d.value : '').join('');

            if (enteredCode === userData.verification_code) {
                if (verificationStatus) {
                    verificationStatus.textContent = 'Код подтвержден!';
                    verificationStatus.style.color = '#4CAF50';
                }

                goToStep(3);
                completeRegistration();
            } else {
                if (verificationStatus) {
                    verificationStatus.textContent = 'Неверный код. Попробуйте снова.';
                    verificationStatus.style.color = '#ff6b6b';
                }

                codeDigits.forEach(digit => {
                    if (digit) {
                        digit.value = '';
                        digit.style.borderColor = '#ff6b6b';
                        setTimeout(() => {
                            if (digit) digit.style.borderColor = '';
                        }, 1000);
                    }
                });
                if (codeDigits[0]) codeDigits[0].focus();
            }
        });
    }

    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', () => {
            userData.verification_code = generateVerificationCode();
            sendVerificationCode();
            if (resendCodeBtn) resendCodeBtn.disabled = true;
            if (verificationStatus) {
                verificationStatus.textContent = 'Новый код отправлен';
                verificationStatus.style.color = '#ffd700';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', updateProfile);
    }

    if (cancelEditProfileBtn) {
        cancelEditProfileBtn.addEventListener('click', hideEditProfileModal);
    }

    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', changePassword);
    }

    if (cancelChangePasswordBtn) {
        cancelChangePasswordBtn.addEventListener('click', hideChangePasswordModal);
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', showRegisterModal);
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', showProfileModal);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener('click', logout);
    }

    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', hideRegisterModal);
    }

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', hideLoginModal);
    }

    if (closeEditProfileBtn) {
        closeEditProfileBtn.addEventListener('click', hideEditProfileModal);
    }

    if (closeChangePasswordBtn) {
        closeChangePasswordBtn.addEventListener('click', hideChangePasswordModal);
    }

    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', hideProfileModal);
    }

    if (editProfileMenuBtn) {
        editProfileMenuBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showEditProfileModal();
        });
    }

    if (changePasswordMenuBtn) {
        changePasswordMenuBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showChangePasswordModal();
        });
    }

    if (changeAvatarMenuBtn) {
        changeAvatarMenuBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (editAvatarInput) editAvatarInput.click();
        });
    }

    if (openEditProfileBtn) {
        openEditProfileBtn.addEventListener('click', showEditProfileModal);
    }

    if (openChangePasswordBtn) {
        openChangePasswordBtn.addEventListener('click', showChangePasswordModal);
    }

    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) hideRegisterModal();
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) hideLoginModal();
        });
    }

    if (editProfileModal) {
        editProfileModal.addEventListener('click', (e) => {
            if (e.target === editProfileModal) hideEditProfileModal();
        });
    }

    if (changePasswordModal) {
        changePasswordModal.addEventListener('click', (e) => {
            if (e.target === changePasswordModal) hideChangePasswordModal();
        });
    }

    if (profileOverlay) {
        profileOverlay.addEventListener('click', (e) => {
            if (e.target === profileOverlay) hideProfileModal();
        });
    }

    if (codeDigits && codeDigits.length > 0) {
        codeDigits.forEach(digit => {
            if (digit) {
                digit.addEventListener('input', handleCodeInput);
                digit.addEventListener('keydown', handleCodeKeydown);
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (registerModal && registerModal.style.display === 'flex') hideRegisterModal();
            if (loginModal && loginModal.style.display === 'flex') hideLoginModal();
            if (editProfileModal && editProfileModal.style.display === 'flex') hideEditProfileModal();
            if (changePasswordModal && changePasswordModal.style.display === 'flex') hideChangePasswordModal();
            if (profileOverlay && profileOverlay.style.display === 'flex') hideProfileModal();
        }
    });

    updateUserInterface();
    setupNavigation();
});