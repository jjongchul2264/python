/**
 * Theme Manager - 테마 색상 관리 시스템
 *
 * 사용법:
 * - ThemeManager.setTheme('blue') : 미리 정의된 테마 적용
 * - ThemeManager.setPointColor('#ff8c00') : 포인트 색상만 변경
 * - ThemeManager.getThemes() : 사용 가능한 테마 목록 반환
 */

const ThemeManager = (function() {
    // 미리 정의된 테마
    const themes = {
        orange: {
            name: '오렌지 (기본)',
            point: '#ff8c00',
            pointHover: '#e67e00',
            pointLight: '#fff3e6',
            pointGradientEnd: '#ffa940'
        },
        blue: {
            name: '블루',
            point: '#2196F3',
            pointHover: '#1976D2',
            pointLight: '#e3f2fd',
            pointGradientEnd: '#64B5F6'
        },
        green: {
            name: '그린',
            point: '#4CAF50',
            pointHover: '#388E3C',
            pointLight: '#e8f5e9',
            pointGradientEnd: '#81C784'
        },
        purple: {
            name: '퍼플',
            point: '#9C27B0',
            pointHover: '#7B1FA2',
            pointLight: '#f3e5f5',
            pointGradientEnd: '#BA68C8'
        },
        teal: {
            name: '틸',
            point: '#009688',
            pointHover: '#00796B',
            pointLight: '#e0f2f1',
            pointGradientEnd: '#4DB6AC'
        },
        red: {
            name: '레드',
            point: '#F44336',
            pointHover: '#D32F2F',
            pointLight: '#ffebee',
            pointGradientEnd: '#EF5350'
        },
        indigo: {
            name: '인디고',
            point: '#3F51B5',
            pointHover: '#303F9F',
            pointLight: '#e8eaf6',
            pointGradientEnd: '#7986CB'
        },
        pink: {
            name: '핑크',
            point: '#E91E63',
            pointHover: '#C2185B',
            pointLight: '#fce4ec',
            pointGradientEnd: '#F06292'
        }
    };

    // 현재 테마 저장
    let currentTheme = 'orange';

    /**
     * RGB 문자열로 변환 (rgba 사용을 위해)
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '255, 140, 0';
    }

    /**
     * CSS 변수 설정
     */
    function setCSSVariable(name, value) {
        document.documentElement.style.setProperty(name, value);
    }

    /**
     * 테마 적용
     * @param {string} themeName - 테마 이름 (orange, blue, green, etc.)
     */
    function setTheme(themeName) {
        const theme = themes[themeName];
        if (!theme) {
            console.warn(`Theme "${themeName}" not found. Using default.`);
            return setTheme('orange');
        }

        currentTheme = themeName;

        // CSS 변수 업데이트
        setCSSVariable('--color-point', theme.point);
        setCSSVariable('--color-point-hover', theme.pointHover);
        setCSSVariable('--color-point-light', theme.pointLight);
        setCSSVariable('--color-point-gradient-start', theme.point);
        setCSSVariable('--color-point-gradient-end', theme.pointGradientEnd);
        setCSSVariable('--color-point-rgb', hexToRgb(theme.point));

        // localStorage에 저장
        try {
            localStorage.setItem('app-theme', themeName);
        } catch (e) {
            console.warn('Could not save theme to localStorage:', e);
        }

        // 테마 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: themeName, colors: theme }
        }));

        return theme;
    }

    /**
     * 포인트 색상만 직접 설정 (커스텀 색상)
     * @param {string} color - 16진수 색상 코드 (#ff8c00)
     */
    function setPointColor(color) {
        // 색상 밝기 조절 함수
        function adjustBrightness(hex, percent) {
            const num = parseInt(hex.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = Math.max(Math.min((num >> 16) + amt, 255), 0);
            const G = Math.max(Math.min((num >> 8 & 0x00FF) + amt, 255), 0);
            const B = Math.max(Math.min((num & 0x0000FF) + amt, 255), 0);
            return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
        }

        const pointHover = adjustBrightness(color, -15);
        const pointLight = adjustBrightness(color, 80);
        const pointGradientEnd = adjustBrightness(color, 20);

        setCSSVariable('--color-point', color);
        setCSSVariable('--color-point-hover', pointHover);
        setCSSVariable('--color-point-light', pointLight);
        setCSSVariable('--color-point-gradient-start', color);
        setCSSVariable('--color-point-gradient-end', pointGradientEnd);
        setCSSVariable('--color-point-rgb', hexToRgb(color));

        currentTheme = 'custom';

        // localStorage에 커스텀 색상 저장
        try {
            localStorage.setItem('app-theme', 'custom');
            localStorage.setItem('app-custom-color', color);
        } catch (e) {
            console.warn('Could not save custom color to localStorage:', e);
        }

        // 테마 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: 'custom', color: color }
        }));
    }

    /**
     * 저장된 테마 불러오기
     */
    function loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('app-theme');
            if (savedTheme === 'custom') {
                const customColor = localStorage.getItem('app-custom-color');
                if (customColor) {
                    setPointColor(customColor);
                    return;
                }
            }
            if (savedTheme && themes[savedTheme]) {
                setTheme(savedTheme);
            }
        } catch (e) {
            console.warn('Could not load saved theme:', e);
        }
    }

    /**
     * 사용 가능한 테마 목록 반환
     */
    function getThemes() {
        return Object.keys(themes).map(key => ({
            id: key,
            name: themes[key].name,
            color: themes[key].point
        }));
    }

    /**
     * 현재 테마 반환
     */
    function getCurrentTheme() {
        return currentTheme;
    }

    /**
     * 테마 선택 UI 생성 (선택적)
     * @param {string} containerId - UI를 삽입할 컨테이너 ID
     */
    function createThemeSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const themeList = getThemes();

        const html = `
            <div class="theme-selector">
                <label>테마 선택:</label>
                <div class="theme-options">
                    ${themeList.map(theme => `
                        <button class="theme-btn ${theme.id === currentTheme ? 'active' : ''}"
                                data-theme="${theme.id}"
                                style="background-color: ${theme.color}"
                                title="${theme.name}">
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // 이벤트 리스너 추가
        container.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const themeName = this.dataset.theme;
                setTheme(themeName);

                // 활성화 상태 업데이트
                container.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // 페이지 로드 시 저장된 테마 적용
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSavedTheme);
    } else {
        loadSavedTheme();
    }

    // Public API
    return {
        setTheme,
        setPointColor,
        getThemes,
        getCurrentTheme,
        createThemeSelector,
        loadSavedTheme
    };
})();

// CSS for theme selector (optional - can be added to a CSS file)
const themeSelectorStyles = `
<style>
.theme-selector {
    display: flex;
    align-items: center;
    gap: 10px;
}

.theme-selector label {
    font-size: 13px;
    color: var(--color-text-secondary);
}

.theme-options {
    display: flex;
    gap: 6px;
}

.theme-btn {
    width: 24px;
    height: 24px;
    border: 2px solid transparent;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
}

.theme-btn:hover {
    transform: scale(1.1);
}

.theme-btn.active {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px white inset;
}
</style>
`;

// Inject styles if not already present
if (!document.getElementById('theme-selector-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'theme-selector-styles';
    styleEl.innerHTML = themeSelectorStyles;
    document.head.appendChild(styleEl.querySelector('style'));
}
