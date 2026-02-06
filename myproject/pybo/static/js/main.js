
document.addEventListener("DOMContentLoaded", function () {
    const mainMenu = document.getElementById("main-menu");
    const mainMenuList = document.getElementById("main-menu-list");
    const subMenu = document.getElementById("sub-menu");
    const tabList = document.getElementById("tab-list");
    const contentDiv = document.getElementById("content");

    const icon = document.getElementById("userIcon");
    const dropdown = document.getElementById("userDropdown");
    const tabsContainer = document.querySelector(".tabs-container");
    const tabs = document.querySelectorAll(".tab");
    const container = document.querySelector(".tabs");


    const iframe = document.getElementById("content-iframe");
    const contentArea = document.getElementById("content");
    const tabcontent = document.getElementById("tabcontent");
    const tabCache = {}; // 탭 콘텐츠 캐시

    let draggedTab = null;
    const placeholder = document.createElement("div");
    placeholder.classList.add("tab-placeholder");

    // 메뉴 데이터 저장
    let menuData = [];

    window.addEventListener("load", () => {
        document.body.classList.add("loaded");
        // 페이지 로드 시 메뉴 데이터 로드
        loadMenuData();
        // 테마 버튼 초기화
        initThemeButtons();
        // 메뉴 새로고침 버튼 이벤트
        initMenuRefreshButton();
    });

    // 메뉴 새로고침 버튼 초기화
    function initMenuRefreshButton() {
        const refreshBtn = document.getElementById('menu-refresh-btn');
        if (!refreshBtn) return;

        refreshBtn.style.cursor = 'pointer';
        refreshBtn.addEventListener('click', async function() {
            // 현재 열려있는 메뉴 정보 저장
            const currentMenuId = previousActiveItem ? parseInt(previousActiveItem.dataset.menuId) : null;
            const currentMenuName = previousActiveItem ? previousActiveItem.dataset.menu : null;

            // 메뉴 새로고침
            await loadMenuData();

            // 핀 고정 상태이고 열려있는 메뉴가 있으면 서브메뉴도 새로고침
            if (isPinned && currentMenuId) {
                const menu = menuData.find(m => m.menu_id === currentMenuId);
                if (menu && menu.submenus) {
                    loadSubMenu(currentMenuName, menu.submenus, currentMenuId);
                }
                // 메인메뉴 활성화 상태 복원
                const menuItem = document.querySelector(`.main-menu-item[data-menu-id="${currentMenuId}"]`);
                if (menuItem) {
                    menuItem.classList.add('active');
                    menuItem.style.backgroundColor = 'var(--color-point)';
                    previousActiveItem = menuItem;
                }
            } else {
                // 핀 고정 상태가 아니면 서브메뉴 닫기
                subMenu.style.display = 'none';
                if (previousActiveItem) {
                    previousActiveItem.classList.remove('active');
                    previousActiveItem.style.backgroundColor = '';
                }
                previousActiveItem = null;
            }
        });
    }

    // 테마 버튼 초기화 함수
    function initThemeButtons() {
        const themeButtonsContainer = document.getElementById('themeButtons');
        if (!themeButtonsContainer || typeof ThemeManager === 'undefined') return;

        const themes = ThemeManager.getThemes();
        const currentTheme = ThemeManager.getCurrentTheme();

        themeButtonsContainer.innerHTML = themes.map(theme => `
            <button class="theme-btn ${theme.id === currentTheme ? 'active' : ''}"
                    data-theme="${theme.id}"
                    style="background-color: ${theme.color}"
                    title="${theme.name}">
            </button>
        `).join('');

        // 테마 버튼 클릭 이벤트
        themeButtonsContainer.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // 드롭다운 닫힘 방지
                const themeName = this.dataset.theme;
                ThemeManager.setTheme(themeName);

                // 활성화 상태 업데이트
                themeButtonsContainer.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // 메뉴 데이터 로드 함수
    async function loadMenuData() {
        try {
            const response = await fetch('/menu/api/menu/user');
            const result = await response.json();

            if (result.success) {
                menuData = result.data;
                renderMainMenu(menuData);
            } else {
                console.error('메뉴 로드 실패:', result.error);
                // 실패 시 기본 메뉴 표시
                renderFallbackMenu();
            }
        } catch (error) {
            console.error('메뉴 로드 오류:', error);
            // 오류 시 기본 메뉴 표시
            renderFallbackMenu();
        }
    }

    // 메인 메뉴 렌더링
    function renderMainMenu(menus) {
        mainMenuList.innerHTML = menus.map(menu => `
            <li>
                <a href="#" class="main-menu-item" data-menu-id="${menu.menu_id}" data-menu="${menu.menu_name}">
                    <i class="${menu.menu_icon || 'fas fa-folder'}"></i>
                    <div class="menu-name">${formatMenuName(menu.menu_name)}</div>
                </a>
            </li>
        `).join('');

        // 메뉴 이벤트 리스너 추가
        initMenuEventListeners();
    }

    // 메뉴명 포맷팅 (긴 이름은 줄바꿈)
    function formatMenuName(name) {
        if (name.length > 5) {
            const mid = Math.ceil(name.length / 2);
            return name.substring(0, mid) + '<br>' + name.substring(mid);
        }
        return name;
    }

    // 폴백 메뉴 (DB 연결 실패 시)
    function renderFallbackMenu() {
        const fallbackMenus = [
            { menu_id: 1, menu_name: '설정', menu_icon: 'fas fa-cogs', submenus: [] },
            { menu_id: 2, menu_name: '기초정보', menu_icon: 'fas fa-file-alt', submenus: [] },
            { menu_id: 3, menu_name: '연봉근로계약서', menu_icon: 'fas fa-solid fa-user', submenus: [] },
            { menu_id: 4, menu_name: '임직원교육', menu_icon: 'fas fa-school', submenus: [] }
        ];
        menuData = fallbackMenus;
        renderMainMenu(fallbackMenus);
    }

    // 메뉴 이벤트 리스너 초기화
    function initMenuEventListeners() {
        const mainMenuItems = document.querySelectorAll(".main-menu-item");

        mainMenuItems.forEach(function (menuItem) {
            menuItem.addEventListener("click", function (event) {
                event.preventDefault();
                const menuId = parseInt(this.dataset.menuId);
                const menuName = this.dataset.menu;

                // 메뉴 데이터에서 서브메뉴 찾기
                const menu = menuData.find(m => m.menu_id === menuId);

                if (menu && menu.submenus) {
                    loadSubMenu(menuName, menu.submenus, menuId);
                }

                subMenu.style.display = "block";
                updatePinIcon();
                resizeContent();

                // 이전에 클릭된 메뉴 항목 배경색 원복
                if (previousActiveItem) {
                    previousActiveItem.classList.remove("active");
                    previousActiveItem.classList.remove("shrink-background");
                    previousActiveItem.style.backgroundColor = "";
                }

                // 클릭된 메뉴 항목에 active 클래스 추가
                this.classList.add("active");
                this.classList.add("shrink-background");
                this.style.backgroundColor = "var(--color-point)";

                previousActiveItem = this;
            });

            // 메인메뉴 마우스 오버 시 배경색 설정
            menuItem.addEventListener("mouseenter", function () {
                if (!this.classList.contains("active")) {
                    this.style.backgroundColor = "var(--color-point)";
                }
            });

            // 메인메뉴 마우스 아웃 시 배경색 원복
            menuItem.addEventListener("mouseleave", function () {
                if (!this.classList.contains("active")) {
                    this.style.backgroundColor = "";
                }
            });
        });
    }

    // 탭 드래그 이벤트 (탭 버튼과 콘텐츠 함께 이동)
    function addDragEvents(tabElement, contentElement, tabList, contentContainer) {
        tabElement.addEventListener("dragstart", e => {
            draggedTab = tabElement;
            e.dataTransfer.effectAllowed = "move";
            tabElement.style.opacity = "0.5";

            // ghost 이미지 제거
            e.dataTransfer.setDragImage(document.createElement("div"), 0, 0);
        });

        tabElement.addEventListener("dragend", () => {
            tabElement.style.opacity = "1";
        });

        tabElement.addEventListener("dragover", e => {
            e.preventDefault();

            const rect = tabElement.getBoundingClientRect();
            const offset = e.clientX - rect.left;

            if (offset > rect.width / 2) {
                // 오른쪽 절반 → target 뒤에 placeholder
                tabList.insertBefore(placeholder, tabElement.nextSibling);
            } else {
                // 왼쪽 절반 → target 앞에 placeholder
                tabList.insertBefore(placeholder, tabElement);
            }
        });

        // 리스트 전체에서도 drop 허용
        tabList.addEventListener("dragover", e => {
            e.preventDefault();
        });

        // drop 이벤트를 document 전체에 걸어줌
        document.addEventListener("drop", e => {
            e.preventDefault();

            const tabListRect = tabList.getBoundingClientRect();
            const inside =
          e.clientX >= tabListRect.left &&
          e.clientX <= tabListRect.right &&
          e.clientY >= tabListRect.top &&
          e.clientY <= tabListRect.bottom;

            if (draggedTab) {
                if (inside && placeholder.parentNode === tabList) {
                    // 영역 안 drop → 즉시 삽입
                    insertDraggedTab(tabList, contentContainer, draggedTab, placeholder, contentElement);
                } else {
                    // 영역 밖 drop → 삽입하지 않고 상태 유지
                    // placeholder와 draggedTab 그대로 둠
                }
            }
        });

        // 마우스가 다시 탭리스트 위로 올라왔을 때 삽입 처리
        tabList.addEventListener("mouseenter", () => {
            if (draggedTab && placeholder.parentNode === tabList) {
                insertDraggedTab(tabList, contentContainer, draggedTab, placeholder, contentElement);
            }
        });

        // 삽입 처리 함수
        function insertDraggedTab(tabList, contentContainer, draggedTab, placeholder, contentElement) {
            // 탭 버튼 이동
            tabList.insertBefore(draggedTab, placeholder);

            // 기존 contentElement를 그대로 옮김
            const siblings = Array.from(tabList.children);
            const newIndex = siblings.indexOf(draggedTab);

            if (newIndex >= contentContainer.children.length) {
            // 맨 끝으로 이동하는 경우 → appendChild
                contentContainer.appendChild(contentElement);
            } else {
                const targetContent = contentContainer.children[newIndex];
                contentContainer.insertBefore(contentElement, targetContent);
            }

            activateTab(draggedTab);

            // 애니메이션 효과 (탭 버튼)
            const tabToAnimate = draggedTab;
            if (tabToAnimate && tabToAnimate.classList) {
                tabToAnimate.classList.add("animate-in");
                setTimeout(() => {
                    if (tabToAnimate && tabToAnimate.classList) {
                        tabToAnimate.classList.remove("animate-in");
                    }
                }, 300);
            }

            if (placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }

            draggedTab = null;
        }
    }

    // 아이콘 클릭 시 드롭다운 토글
    icon.addEventListener("click", function () {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    // 사용 시간 표시
    const usageTimeElement = document.getElementById("usageTime");
    const loginTimeText = document.querySelector(".dropdown p:nth-child(3)").innerText.replace("로그인 시간: ", "");
    const loginTime = new Date(loginTimeText);

    setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - loginTime) / 1000); // 초 단위
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        usageTimeElement.textContent = `${minutes}분 ${seconds}초`;
    }, 1000);


    // 화면 다른 곳 클릭 시 드롭다운 닫기
    window.addEventListener("click", function (event) {
        if (!event.target.classList.contains("user-icon")) {
            if (dropdown.style.display === "block") {
                dropdown.style.display = "none";
            }
        }
    });

    // 문서 전체에 클릭 이벤트 위임
    document.addEventListener("click", function (event) {
        if (event.target instanceof Element) {
            // 클릭된 요소가 tabcontent 내부인지 확인
            const tabContent = event.target.closest(".tabcontent");
            if (tabContent) {
                // 팝업 띄우기 (확인용)
                alert("탭 콘텐츠가 클릭되었습니다!");

                // 드롭다운 닫기
                if (dropdown && dropdown.style.display === "block") {
                    dropdown.style.display = "none";
                }
            }
        }
    });

    // 새로고침 직전 스크롤 위치 저장
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("scrollPosition", window.scrollY);
    });

    // 페이지 로드 후 스크롤 위치 복원
    window.addEventListener("load", () => {
        const scrollPosition = localStorage.getItem("scrollPosition");
        if (scrollPosition) {
            window.scrollTo(0, parseInt(scrollPosition));
        }
    });

    let isDirty = true; // 기본적으로 새로고침 시 경고 활성화

    function beforeUnloadHandler(event) {
        if (isDirty) {
            event.preventDefault();
            event.returnValue = ""; // 브라우저 기본 경고창
        }
    }
    window.addEventListener("beforeunload", beforeUnloadHandler);

    document.getElementById("logoutLink").addEventListener("click", function (e) {
        // 일단 beforeunload 제거
        window.removeEventListener("beforeunload", beforeUnloadHandler);

        if (confirm("정말 로그아웃 하시겠습니까?")) {
            // 확인 → 로그아웃 진행
            isDirty = false;
            location.href = "/intellics";
        } else {
            // 취소 → 다시 beforeunload 복원
            window.addEventListener("beforeunload", beforeUnloadHandler);
            e.preventDefault();
        }
    });


    let isPinned = false; // 핀 상태를 저장하는 변수
    let pinIcon, closeIcon;
    const mainMenuWidth = 70; // 메인 메뉴의 가로 길이
    let previousActiveItem = null; // 이전에 클릭된 메뉴 항목을 저장하는 변수

    // 메뉴 접근 로그 기록
    async function logMenuAccess(menuId, submenuId) {
        try {
            await fetch('/menu/api/menu/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    menu_id: menuId,
                    submenu_id: submenuId
                })
            });
        } catch (error) {
            console.error('메뉴 로그 기록 오류:', error);
        }
    }

    // 탭 콘텐츠 로드 및 추가 함수
    function loadAndAddTab(tabName, url, menuId, submenuId) {
        const tabList = document.getElementById("tab-list");
        const contentDiv = document.getElementById("content");

        // 이미 존재하는 탭인지 확인
        const existingTab = document.querySelector(`.tablinks[data-url='${url}']`);
        if (existingTab) {
            activateTab(existingTab);
            return;
        }

        // 중복 콘텐츠가 있는지 확인 (탭은 없지만 콘텐츠만 남아있는 경우)
        const existingContent = document.querySelector(`.tabcontent[data-url='${url}']`);
        if (existingContent) {
            console.warn("중복 콘텐츠 발견, 제거:", url);
            existingContent.remove();
        }

        // 메뉴 접근 로그 기록
        if (menuId && submenuId) {
            logMenuAccess(menuId, submenuId);
        }

        // 새로운 탭 요소 생성
        const newTab = document.createElement("button");
        newTab.classList.add("tablinks");
        newTab.setAttribute("data-url", url);
        newTab.draggable = true;

        // 탭 텍스트와 닫기 아이콘 추가
        const tabText = document.createElement("span");
        tabText.textContent = tabName;
        const closeButton = document.createElement("i");
        closeButton.classList.add("fas", "fa-times", "close-icon");

        tabText.style.marginRight = "20px";
        tabText.style.marginTop = "5px";
        closeButton.style.marginTop = "5px";

        newTab.appendChild(tabText);
        newTab.appendChild(closeButton);
        tabList.appendChild(newTab);

        // 새로운 콘텐츠 요소 생성
        const newContentDiv = document.createElement("div");
        newContentDiv.setAttribute("data-url", url);
        newContentDiv.classList.add("tabcontent");

        // iframe 생성 (데이터 유지: DOM은 그대로, order만 변경)
        const newIframe = document.createElement("iframe");
        newIframe.src = url;
        newIframe.style.width = "100%";
        newIframe.style.flex = "1";
        newIframe.style.minHeight = "0"; // flex 자식이 축소될 수 있도록
        newIframe.style.border = "none";

        newContentDiv.appendChild(newIframe);
        contentDiv.appendChild(newContentDiv);

        // 탭 클릭 이벤트 리스너
        newTab.addEventListener("click", function (event) {
            if (event.target === closeButton) {
                const previousTab = newTab.previousElementSibling;
                const nextTab = newTab.nextElementSibling;

                // 탭 URL 가져오기
                const tabUrl = newTab.getAttribute("data-url");

                // education_manage 탭이 닫힐 때 세션 스토리지 초기화
                try {
                    if (tabUrl === "/docs/education_manage") {
                        sessionStorage.removeItem("education_manage_data");
                        sessionStorage.removeItem("education_manage_query_params");
                        sessionStorage.removeItem("education_manage_selected_edu");
                        // 모든 수료자 데이터도 삭제
                        Object.keys(sessionStorage).forEach(key => {
                            if (key.startsWith("education_manage_data_gran_")) {
                                sessionStorage.removeItem(key);
                            }
                        });
                    }
                } catch (error) {
                    console.error("세션 스토리지 정리 중 오류:", error);
                }

                // URL로 콘텐츠 찾아서 제거 (더 안전한 방법)
                const contentToRemove = document.querySelector(`.tabcontent[data-url='${tabUrl}']`);
                if (contentToRemove) {
                    contentToRemove.remove();
                    console.log("콘텐츠 제거:", tabUrl);
                } else {
                    console.warn("제거할 콘텐츠를 찾을 수 없음:", tabUrl);
                }

                // 탭 버튼 제거
                newTab.remove();

                // 다음 탭 활성화
                if (previousTab) {
                    activateTab(previousTab);
                } else if (nextTab) {
                    activateTab(nextTab);
                } else {
                    console.log("모든 탭이 닫혔습니다.");
                    // 모든 탭이 닫혔을 때 남아있는 콘텐츠 정리
                    const allContents = document.querySelectorAll(".tabcontent");
                    allContents.forEach(content => {
                        content.style.display = "none";
                    });
                }
            } else {
                activateTab(newTab);
            }
        });

        // 드래그 이벤트 연결 (박스 placeholder 표시)
        addDragEvents(newTab, newContentDiv, tabList, contentDiv);

        // 새로운 탭 활성화
        activateTab(newTab);
    }

    // 탭 활성화 함수
    function activateTab(tab) {
        const tablinks = document.getElementsByClassName("tablinks");
        const tabcontents = document.getElementsByClassName("tabcontent");

        // 모든 탭 비활성화
        Array.from(tablinks).forEach(link => link.classList.remove("active"));

        // 모든 콘텐츠 숨기기
        Array.from(tabcontents).forEach(content => {
            content.style.display = "none";
            content.classList.remove("active");
        });

        // 선택된 탭 활성화
        tab.classList.add("active");
        const url = tab.getAttribute("data-url");
        const activeContent = document.querySelector(`.tabcontent[data-url='${url}']`);
        if (activeContent) {
            activeContent.style.display = "flex";
            activeContent.classList.add("active");
        }
    }


    // 서브 메뉴 관련 이벤트 모음
    function loadSubMenu(menuName, submenus, menuId) {
        // 서브메뉴 HTML 생성
        let submenuHtml = '<ul>';
        submenus.forEach(sub => {
            submenuHtml += `<li><a href="#" data-menu-id="${menuId}" data-submenu-id="${sub.submenu_id}" data-url="${sub.submenu_url}">${sub.submenu_name}</a></li>`;
        });
        submenuHtml += '</ul>';

        subMenu.innerHTML = `<div class="submenu-header">
                                <div class="submenu-title" style="text-align: left;">${menuName}</div>
                                <div class="menu-icons">
                                    <i id="pin-icon" class="fas fa-thumbtack unpinned menu-icon"></i>
                                    <i id="close-icon" class="fas fa-times close-icon"></i>
                                </div>
                             </div>` + submenuHtml;

        // 서브메뉴 항목 이벤트 리스너 추가
        subMenu.querySelectorAll("a").forEach(function (subMenuItem) {
            subMenuItem.addEventListener("click", function (event) {
                event.preventDefault();

                const submenuUrl = this.dataset.url;
                const submenuName = this.textContent;
                const menuIdAttr = parseInt(this.dataset.menuId);
                const submenuIdAttr = parseInt(this.dataset.submenuId);

                // 탭 열기 및 로그 기록
                loadAndAddTab(submenuName, submenuUrl, menuIdAttr, submenuIdAttr);

                // 클릭된 서브메뉴 항목에 active 클래스 추가
                subMenu.querySelectorAll("a").forEach(function (item) {
                    item.classList.remove("active");
                    item.style.backgroundColor = ""; // 기존 배경색 제거
                });
                subMenuItem.classList.add("active");
                subMenuItem.style.backgroundColor = "#ff8c00"; // 클릭된 서브메뉴 항목 배경색 설정

                // 메인메뉴 배경색을 shrink-background 클래스로 조정
                if (previousActiveItem) {
                    previousActiveItem.classList.remove("active");
                    previousActiveItem.style.backgroundColor = ""; // 기존 배경색 제거
                }
            });
            // 서브메뉴 항목 마우스 오버 시 배경색 설정
            subMenuItem.addEventListener("mouseenter", function () {
                if (!this.classList.contains("active")) {
                    this.style.backgroundColor = "var(--color-point)";
                }
            });
            // 서브메뉴 항목 마우스 아웃 시 배경색 원복
            subMenuItem.addEventListener("mouseleave", function () {
                if (!this.classList.contains("active")) {
                    this.style.backgroundColor = "";
                }
            });
        });

        pinIcon = document.getElementById("pin-icon");
        closeIcon = document.getElementById("close-icon");

        updatePinIcon(); // 핀 아이콘 상태 초기화

        // 핀 아이콘 클릭
        pinIcon.addEventListener("click", function () {
            isPinned = !isPinned; // 핀 상태 업데이트
            subMenu.classList.toggle("pinned");
            updatePinIcon(); // 핀 아이콘 상태 업데이트
            resizeContent(); // 핀 상태 변경 시 컨텐츠 크기 조정
        });

        // 닫기 아이콘 클릭
        closeIcon.addEventListener("click", function () {
            subMenu.style.display = "none";
            subMenu.classList.remove("pinned"); // 닫기 클릭 시 핀 고정 상태 해제
            isPinned = false; // 핀 상태 초기화
            resizeContent(); // 서브메뉴 닫기 시 컨텐츠 크기 조정

            // 메인메뉴 배경색을 shrink-background 클래스로 조정
            if (previousActiveItem) {
                previousActiveItem.classList.remove("active");
                previousActiveItem.style.backgroundColor = ""; // 기존 배경색 제거
            }
        });

        // 서브메뉴에서 마우스 리브 시 언핀 상태이면 서브메뉴 숨기기
        subMenu.addEventListener("mouseleave", function () {
            console.log("Mouse leave event detected:", event.target);
            if (!isPinned) {
                subMenu.style.display = "none";
                resizeContent(); // 서브메뉴 숨기기 시 컨텐츠 크기 조정

                // 메인메뉴 배경색을 shrink-background 클래스로 조정
                if (previousActiveItem) {
                    previousActiveItem.classList.remove("active");
                    previousActiveItem.style.backgroundColor = ""; // 기존 배경색 제거
                }
            }
        });
    }

    function updatePinIcon() {
        if (isPinned) {
            pinIcon.classList.remove("unpinned");
            pinIcon.classList.add("pinned");
        } else {
            pinIcon.classList.remove("pinned");
            pinIcon.classList.add("unpinned");
        }
    }

    function resizeContent() {
        const mainMenu = document.getElementById("main-menu");
        const subMenu = document.getElementById("sub-menu");
        const tabList = document.getElementById("tab-list");
        const contentDiv = document.getElementById("content");

        mainMenu.style.height = "100vh"; // 메인메뉴 높이를 뷰포트 높이로 설정
        subMenu.style.height = "100vh"; // 서브메뉴 높이를 뷰포트 높이로 설정

        const mainMenuWidth = mainMenu.offsetWidth;
        const subMenuWidth = isPinned ? subMenu.offsetWidth : 0;
        const leftOffset = mainMenuWidth + subMenuWidth;

        contentDiv.style.top = "50px"; // 탭 영역 높이(40px + padding 10px) 오프셋
        contentDiv.style.left = leftOffset + "px";
        contentDiv.style.width = `calc(100% - ${leftOffset}px)`; // 콘텐츠 너비 조정
        contentDiv.style.height = "calc(100vh - 50px)"; // 뷰포트 높이에서 탭 영역 높이 제외

        tabList.style.left = leftOffset + "px";
        tabList.style.width = `calc(100% - ${leftOffset}px)`;
    }


    // content 영역 클릭 시 메인메뉴 배경색 원복
    contentArea.addEventListener("click", function () {
        const mainMenuItems = document.querySelectorAll(".main-menu-item");
        mainMenuItems.forEach(function (item) {
            if (!item.classList.contains("active")) {
                item.style.backgroundColor = ""; // 기존 배경색 제거
                item.classList.remove("shrink-background"); // 배경색 원복
            }
        });
    });
    // 초기 설정
    window.addEventListener("resize", function () {
        resizeContent();
    });
    // 초기 iframe 크기 조정
    resizeContent();
});

// 웹페이지가 닫힐 때 모든 sessionStorage 클리어
window.addEventListener("beforeunload", function () {
    sessionStorage.clear();
});
