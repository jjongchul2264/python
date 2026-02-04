
document.addEventListener("DOMContentLoaded", function () {
    const mainMenuItems = document.querySelectorAll(".main-menu-item");
    const mainMenu = document.getElementById("main-menu");
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


    window.addEventListener("load", () => {
        document.body.classList.add("loaded");
    });

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

            // ✅ 기존 contentElement를 그대로 옮김
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
            draggedTab.classList.add("animate-in");
            setTimeout(() => {
                draggedTab.classList.remove("animate-in");
            }, 300);

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
    const loginTimeText = document.querySelector(".dropdown p:nth-child(2)").innerText.replace("로그인 시간: ", "");
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
            location.href = "{{ url_for('loginPage.intellics') }}";
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

    // 메인 메뉴 컨트롤
    mainMenuItems.forEach(function (menuItem) {
        menuItem.addEventListener("click", function (event) {
            event.preventDefault();
            const menuName = this.dataset.menu;
            // 서브 메뉴 HTML 가져오기 및 표시
            const submenuHtml = getSubMenuHtml(menuName);
            loadSubMenu(menuName, submenuHtml);
            subMenu.style.display = "block"; // 메인 메뉴 클릭 시 서브 메뉴 표시
            updatePinIcon(); // 핀 아이콘 상태 업데이트
            resizeContent(); // 서브메뉴 표시 시 컨텐츠 크기 조정

            // 이전에 클릭된 메뉴 항목 배경색 원복 및 shrink-background 클래스 추가
            if (previousActiveItem) {
                previousActiveItem.classList.remove("active");
                previousActiveItem.classList.remove("shrink-background");
                previousActiveItem.style.backgroundColor = "";
            }

            // 클릭된 메뉴 항목에 active 클래스 추가
            this.classList.add("active");
            this.classList.add("shrink-background");
            this.style.backgroundColor = "#ff8c00"; // 클릭된 메뉴 항목 배경색 설정

            // 현재 클릭된 메뉴 항목을 previousActiveItem 변수에 저장
            previousActiveItem = this;
        });


        // 메인메뉴 마우스 오버 시 배경색 설정
        menuItem.addEventListener("mouseenter", function () {
            if (!this.classList.contains("active")) {
                this.style.backgroundColor = "#ff8c00";
            }
        });

        // 메인메뉴 마우스 아웃 시 배경색 원복
        menuItem.addEventListener("mouseleave", function () {
            if (!this.classList.contains("active")) {
                this.style.backgroundColor = "";
            }
        });
    });


    // 탭 콘텐츠 로드 및 추가 함수
    function loadAndAddTab(tabName, url) {
        const tabList = document.getElementById("tab-list");
        const contentDiv = document.getElementById("content");

        // 이미 존재하는 탭인지 확인
        const existingTab = document.querySelector(`.tablinks[data-url='${url}']`);
        if (existingTab) {
            activateTab(existingTab);
            return;
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
        newIframe.style.height = "100%";
        newIframe.style.border = "none";

        newContentDiv.appendChild(newIframe);
        contentDiv.appendChild(newContentDiv);

        // 탭 클릭 이벤트 리스너
        newTab.addEventListener("click", function (event) {
            if (event.target === closeButton) {
                const previousTab = newTab.previousElementSibling;
                const nextTab = newTab.nextElementSibling;

                newTab.remove();
                newContentDiv.remove();

                if (previousTab) {
                    activateTab(previousTab);
                } else if (nextTab) {
                    activateTab(nextTab);
                } else {
                    console.log("모든 탭이 닫혔습니다.");
                }
            } else {
                activateTab(newTab);
            }
        });

        // 드래그 이벤트 연결 (CSS order 기반)
        //addDragEvents(newTab, newContentDiv);
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
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
            tabcontents[i].style.display = "none";
        }

        // 선택된 탭 활성화
        tab.classList.add("active");
        const url = tab.getAttribute("data-url");
        const activeContent = document.querySelector(`.tabcontent[data-url='${url}']`);
        if (activeContent) {
            activeContent.style.display = "block";
        }
    }


    // 서브 메뉴 구성
    function getSubMenuHtml(menuName) {
        let submenuHtml = "";
        if (menuName === "설정") {
            submenuHtml = `
                <ul>
                    <li><a href="#" id="dashboard-link">서브메뉴 1-1</a></li>
                    <li><a href="#" id="webstatus-link">서브메뉴 1-2</a></li>
                    <li><a href="#" id="serverstatus-link">서브메뉴 1-3</a></li>
                </ul>`;
        } else if (menuName === "기초정보") {
            submenuHtml = `
                <ul>
                    <li><a href="#" id="menu2-link">서브메뉴 2-1</a></li>
                    <li><a href="#" id="webstatus-link">서브메뉴 2-2</a></li>
                    <li><a href="#" id="serverstatus-link">서브메뉴 2-3</a></li>
                </ul>`;
        } else if (menuName === "연봉근로계약서") {
            submenuHtml = `
                <ul>
                    <li><a href="#" id="contract-new">연봉근로계약서(신규)</a></li>
                    <li><a href="#" id="contract-manage">연봉근로계약서(갱신)</a></li>
                    <li><a href="#" id="contract-sign">연봉근로계약서 서명</a></li>
                    <li><a href="#" id="contract-query">연봉근로계약서 현황 조회</a></li>
                </ul>`;

        } else if (menuName === "임직원교육") {
            submenuHtml = `
                <ul>
                    <li><a href="#" id="education-manage">교육자료 업로드</a></li>
                    <li><a href="#" id="education-viewer">교육 수강</a></li>
                    <li><a href="#" id="education-report">수강 현황 조회</a></li>
                </ul>`;
        }
        return submenuHtml;
    }

    // 서브 메뉴 관련 이벤트 모음
    function loadSubMenu(menuName, submenuHtml) {
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

                // 서브 메뉴 링크 오픈
                if (subMenuItem.id === "dashboard-link") {
                    loadAndAddTab(subMenuItem.textContent, "/dashboard");
                } else if (subMenuItem.id === "webstatus-link") {
                    loadAndAddTab(subMenuItem.textContent, "/webstatus");
                } else if (subMenuItem.id === "contract-new") {
                    loadAndAddTab(subMenuItem.textContent, "/contract_new"); //연봉근로계약서(신규)
                } else if (subMenuItem.id === "contract-manage") {
                    loadAndAddTab(subMenuItem.textContent, "/contract_manage"); //연봉근로계약서(갱신)
                } else if (subMenuItem.id === "contract-sign") {
                    loadAndAddTab(subMenuItem.textContent, "/contract_sign"); //연봉근로계약서 서명
                } else if (subMenuItem.id === "contract-query") {
                    loadAndAddTab(subMenuItem.textContent, "/contract_query"); //연봉근로계약서 현황 조회
                } else if (subMenuItem.id === "education-manage") {
                    loadAndAddTab(subMenuItem.textContent, "/docs/education_manage"); //교육자료 업로드
                } else if (subMenuItem.id === "education-viewer") {
                    loadAndAddTab(subMenuItem.textContent, "/docs/viewer_page"); //교육 수강
                } else if (subMenuItem.id === "education-report") {
                    loadAndAddTab(subMenuItem.textContent, "/docs/education_report"); //수강 현황 조회
                }
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
                    this.style.backgroundColor = "#ff8c00";
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
                //previousActiveItem.classList.add('shrink-background'); // 배경색 5px로 줄이기
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
                    //previousActiveItem.classList.add('shrink-background'); // 배경색 5px로 줄이기
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

        contentDiv.style.left = leftOffset + "px";
        contentDiv.style.width = `calc(100% - ${leftOffset}px)`; // iframe의 너비 조정
        contentDiv.style.height = "calc(100vh - 50px)"; // iframe의 높이를 뷰포트 높이로 설정

        tabList.style.left = leftOffset + "px";
        tabList.style.width = `calc(100% - ${leftOffset}px)`;
    }


    // content 영역 클릭 시 메인메뉴 배경색 원복
    contentArea.addEventListener("click", function () {
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
