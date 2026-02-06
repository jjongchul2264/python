// 전역 변수
let selectedMenuId = null;
let selectedSubmenuId = null;
let editType = null; // 'menu' or 'submenu'

// FontAwesome 아이콘 목록
const iconList = [
    'fas fa-home', 'fas fa-cogs', 'fas fa-file-alt', 'fas fa-user', 'fas fa-users',
    'fas fa-school', 'fas fa-folder', 'fas fa-folder-open', 'fas fa-chart-bar',
    'fas fa-chart-line', 'fas fa-chart-pie', 'fas fa-calendar', 'fas fa-clock',
    'fas fa-bell', 'fas fa-envelope', 'fas fa-comment', 'fas fa-comments',
    'fas fa-search', 'fas fa-cog', 'fas fa-wrench', 'fas fa-tools',
    'fas fa-database', 'fas fa-server', 'fas fa-cloud', 'fas fa-lock',
    'fas fa-key', 'fas fa-shield-alt', 'fas fa-clipboard', 'fas fa-clipboard-list',
    'fas fa-tasks', 'fas fa-check', 'fas fa-times', 'fas fa-plus', 'fas fa-minus',
    'fas fa-edit', 'fas fa-trash', 'fas fa-save', 'fas fa-download', 'fas fa-upload',
    'fas fa-print', 'fas fa-share', 'fas fa-link', 'fas fa-paperclip',
    'fas fa-book', 'fas fa-bookmark', 'fas fa-graduation-cap', 'fas fa-certificate',
    'fas fa-trophy', 'fas fa-star', 'fas fa-heart', 'fas fa-thumbs-up',
    'fas fa-building', 'fas fa-industry', 'fas fa-briefcase', 'fas fa-dollar-sign',
    'fas fa-credit-card', 'fas fa-shopping-cart', 'fas fa-truck', 'fas fa-box',
    'fas fa-map-marker-alt', 'fas fa-globe', 'fas fa-phone', 'fas fa-mobile-alt'
];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadMenuList();
    initIconPickers();

    // 편집 폼 제출 이벤트
    document.getElementById('edit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem();
    });

    // 기본 날짜 설정 (최근 30일)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    document.getElementById('stats-end-date').value = today.toISOString().split('T')[0];
    document.getElementById('stats-start-date').value = thirtyDaysAgo.toISOString().split('T')[0];
});

// 아이콘 피커 초기화
function initIconPickers() {
    const pickers = ['icon-picker', 'new-icon-picker'];
    pickers.forEach(pickerId => {
        const picker = document.getElementById(pickerId);
        if (picker) {
            picker.innerHTML = iconList.map(icon =>
                `<div class="icon-item" data-icon="${icon}" onclick="selectIcon('${icon}', '${pickerId}')">
                    <i class="${icon}"></i>
                </div>`
            ).join('');
        }
    });
}

// 아이콘 피커 토글
function toggleIconPicker(type = 'edit') {
    const pickerId = type === 'new' ? 'new-icon-picker' : 'icon-picker';
    const picker = document.getElementById(pickerId);
    picker.style.display = picker.style.display === 'grid' ? 'none' : 'grid';
}

// 아이콘 선택
function selectIcon(icon, pickerId) {
    const isNew = pickerId === 'new-icon-picker';
    const previewId = isNew ? 'new-icon-preview' : 'edit-icon-preview';
    const textId = isNew ? 'new-icon-text' : 'edit-icon-text';
    const inputId = isNew ? 'new-menu-icon' : 'edit-icon';

    document.getElementById(previewId).className = icon;
    document.getElementById(textId).textContent = icon;
    document.getElementById(inputId).value = icon;
    document.getElementById(pickerId).style.display = 'none';
}

// 메뉴 목록 로드
async function loadMenuList() {
    try {
        const response = await fetch('/menu/api/menu/list');
        const result = await response.json();

        if (result.success) {
            renderMenuList(result.data);
        } else {
            alert('메뉴 목록을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 메뉴 목록 렌더링
function renderMenuList(menus) {
    const list = document.getElementById('menu-list');
    list.innerHTML = menus.map(menu => `
        <li class="menu-item ${selectedMenuId === menu.menu_id ? 'selected' : ''}"
            data-id="${menu.menu_id}"
            draggable="true"
            ondragstart="dragStart(event, 'menu')"
            ondragover="dragOver(event)"
            ondrop="drop(event, 'menu')"
            onclick="selectMenu(${menu.menu_id})">
            <div class="item-content">
                <i class="${menu.menu_icon || 'fas fa-folder'}"></i>
                <span class="item-name">${menu.menu_name}</span>
            </div>
            <div class="item-status ${menu.is_active ? 'active' : 'inactive'}">
                ${menu.is_active ? '활성' : '비활성'}
            </div>
        </li>
    `).join('');
}

// 메뉴 선택
async function selectMenu(menuId) {
    selectedMenuId = menuId;
    selectedSubmenuId = null;

    // 메뉴 항목 선택 상태 업데이트
    document.querySelectorAll('#menu-list .menu-item').forEach(item => {
        item.classList.toggle('selected', parseInt(item.dataset.id) === menuId);
    });

    // 서브메뉴 로드
    await loadSubmenuList(menuId);

    // 편집 패널에 메뉴 정보 표시
    await showMenuEdit(menuId);

    // 서브메뉴 추가 버튼 활성화
    document.getElementById('add-submenu-btn').disabled = false;
}

// 서브메뉴 목록 로드
async function loadSubmenuList(menuId) {
    try {
        const response = await fetch(`/menu/api/submenu/list/${menuId}`);
        const result = await response.json();

        if (result.success) {
            renderSubmenuList(result.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 서브메뉴 목록 렌더링
function renderSubmenuList(submenus) {
    const list = document.getElementById('submenu-list');
    const noSelected = document.getElementById('no-menu-selected');

    if (submenus.length === 0) {
        list.style.display = 'none';
        list.innerHTML = '';
        noSelected.innerHTML = '<i class="fas fa-inbox"></i><p>서브메뉴가 없습니다</p>';
        noSelected.style.display = 'flex';
    } else {
        noSelected.style.display = 'none';
        list.style.display = 'block';
        list.innerHTML = submenus.map(sub => `
            <li class="menu-item ${selectedSubmenuId === sub.submenu_id ? 'selected' : ''}"
                data-id="${sub.submenu_id}"
                draggable="true"
                ondragstart="dragStart(event, 'submenu')"
                ondragover="dragOver(event)"
                ondrop="drop(event, 'submenu')"
                onclick="selectSubmenu(${sub.submenu_id}, event)">
                <div class="item-content">
                    <span class="item-name">${sub.submenu_name}</span>
                    <span class="item-url">${sub.submenu_url}</span>
                </div>
                <div class="item-status ${sub.is_active ? 'active' : 'inactive'}">
                    ${sub.is_active ? '활성' : '비활성'}
                </div>
            </li>
        `).join('');
    }
}

// 서브메뉴 선택
async function selectSubmenu(submenuId, event) {
    event.stopPropagation();
    selectedSubmenuId = submenuId;

    // 서브메뉴 항목 선택 상태 업데이트
    document.querySelectorAll('#submenu-list .menu-item').forEach(item => {
        item.classList.toggle('selected', parseInt(item.dataset.id) === submenuId);
    });

    // 편집 패널에 서브메뉴 정보 표시
    await showSubmenuEdit(submenuId);
}

// 메뉴 편집 표시
async function showMenuEdit(menuId) {
    try {
        const response = await fetch('/menu/api/menu/list');
        const result = await response.json();

        if (result.success) {
            const menu = result.data.find(m => m.menu_id === menuId);
            if (menu) {
                editType = 'menu';
                document.getElementById('edit-panel-title').textContent = '메뉴 편집';
                document.getElementById('no-item-selected').style.display = 'none';
                document.getElementById('edit-form').style.display = 'block';
                document.getElementById('auth-section').style.display = 'none';

                document.getElementById('edit-type').value = 'menu';
                document.getElementById('edit-id').value = menu.menu_id;
                document.getElementById('edit-name').value = menu.menu_name;
                document.getElementById('edit-icon').value = menu.menu_icon || 'fas fa-folder';
                document.getElementById('edit-icon-preview').className = menu.menu_icon || 'fas fa-folder';
                document.getElementById('edit-icon-text').textContent = menu.menu_icon || 'fas fa-folder';
                document.getElementById('edit-active').checked = menu.is_active;

                document.getElementById('edit-icon-group').style.display = 'block';
                document.getElementById('edit-url-group').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 서브메뉴 편집 표시
async function showSubmenuEdit(submenuId) {
    try {
        const response = await fetch(`/menu/api/submenu/list/${selectedMenuId}`);
        const result = await response.json();

        if (result.success) {
            const submenu = result.data.find(s => s.submenu_id === submenuId);
            if (submenu) {
                editType = 'submenu';
                document.getElementById('edit-panel-title').textContent = '서브메뉴 편집';
                document.getElementById('no-item-selected').style.display = 'none';
                document.getElementById('edit-form').style.display = 'block';
                document.getElementById('auth-section').style.display = 'block';

                document.getElementById('edit-type').value = 'submenu';
                document.getElementById('edit-id').value = submenu.submenu_id;
                document.getElementById('edit-name').value = submenu.submenu_name;
                document.getElementById('edit-url').value = submenu.submenu_url;
                document.getElementById('edit-active').checked = submenu.is_active;

                document.getElementById('edit-icon-group').style.display = 'none';
                document.getElementById('edit-url-group').style.display = 'block';

                // 권한 목록 로드
                loadAuthList(submenuId);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 항목 저장
async function saveItem() {
    const type = document.getElementById('edit-type').value;
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const isActive = document.getElementById('edit-active').checked;

    let url, data;

    if (type === 'menu') {
        url = `/menu/api/menu/update/${id}`;
        data = {
            menu_name: name,
            menu_icon: document.getElementById('edit-icon').value,
            is_active: isActive
        };
    } else {
        url = `/menu/api/submenu/update/${id}`;
        data = {
            submenu_name: name,
            submenu_url: document.getElementById('edit-url').value,
            is_active: isActive
        };
    }

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            alert('저장되었습니다.');
            if (type === 'menu') {
                loadMenuList();
            } else {
                loadSubmenuList(selectedMenuId);
            }
        } else {
            alert('저장에 실패했습니다: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 항목 삭제
async function deleteItem() {
    const type = document.getElementById('edit-type').value;
    const id = document.getElementById('edit-id').value;

    if (!confirm('정말 삭제하시겠습니까?')) return;

    const url = type === 'menu'
        ? `/menu/api/menu/delete/${id}`
        : `/menu/api/submenu/delete/${id}`;

    try {
        const response = await fetch(url, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            alert('삭제되었습니다.');
            document.getElementById('edit-form').style.display = 'none';
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('no-item-selected').style.display = 'flex';

            if (type === 'menu') {
                selectedMenuId = null;
                loadMenuList();
                document.getElementById('submenu-list').style.display = 'none';
                document.getElementById('no-menu-selected').style.display = 'flex';
                document.getElementById('add-submenu-btn').disabled = true;
            } else {
                selectedSubmenuId = null;
                loadSubmenuList(selectedMenuId);
            }
        } else {
            alert('삭제에 실패했습니다: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 드래그 앤 드롭
let draggedItem = null;
let dragType = null;

function dragStart(event, type) {
    draggedItem = event.target.closest('.menu-item');
    dragType = type;
    event.dataTransfer.effectAllowed = 'move';
    draggedItem.classList.add('dragging');
}

function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const target = event.target.closest('.menu-item');
    if (target && target !== draggedItem) {
        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (event.clientY < midY) {
            target.parentNode.insertBefore(draggedItem, target);
        } else {
            target.parentNode.insertBefore(draggedItem, target.nextSibling);
        }
    }
}

async function drop(event, type) {
    event.preventDefault();
    draggedItem.classList.remove('dragging');

    if (type !== dragType) return;

    const list = type === 'menu'
        ? document.getElementById('menu-list')
        : document.getElementById('submenu-list');

    const items = Array.from(list.querySelectorAll('.menu-item'));
    const orders = items.map((item, index) => ({
        [type === 'menu' ? 'menu_id' : 'submenu_id']: parseInt(item.dataset.id),
        order: index + 1
    }));

    const url = type === 'menu' ? '/menu/api/menu/order' : '/menu/api/submenu/order';

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders })
        });
        const result = await response.json();

        if (!result.success) {
            alert('순서 변경에 실패했습니다.');
            if (type === 'menu') {
                loadMenuList();
            } else {
                loadSubmenuList(selectedMenuId);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }

    draggedItem = null;
    dragType = null;
}

// 모달 관련
function openAddMenuModal() {
    document.getElementById('new-menu-name').value = '';
    document.getElementById('new-menu-icon').value = 'fas fa-folder';
    document.getElementById('new-icon-preview').className = 'fas fa-folder';
    document.getElementById('new-icon-text').textContent = 'fas fa-folder';
    document.getElementById('add-menu-modal').style.display = 'flex';
}

function openAddSubmenuModal() {
    if (!selectedMenuId) {
        alert('먼저 메인 메뉴를 선택하세요.');
        return;
    }
    document.getElementById('new-submenu-name').value = '';
    document.getElementById('new-submenu-url').value = '';
    document.getElementById('add-submenu-modal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 메뉴 추가
async function addMenu() {
    const name = document.getElementById('new-menu-name').value;
    const icon = document.getElementById('new-menu-icon').value;

    if (!name) {
        alert('메뉴명을 입력하세요.');
        return;
    }

    try {
        const response = await fetch('/menu/api/menu/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                menu_name: name,
                menu_icon: icon,
                menu_order: 999
            })
        });
        const result = await response.json();

        if (result.success) {
            closeModal('add-menu-modal');
            loadMenuList();
            alert('메뉴가 추가되었습니다.');
        } else {
            alert('메뉴 추가에 실패했습니다: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 서브메뉴 추가
async function addSubmenu() {
    const name = document.getElementById('new-submenu-name').value;
    const url = document.getElementById('new-submenu-url').value;

    if (!name || !url) {
        alert('서브메뉴명과 URL을 입력하세요.');
        return;
    }

    try {
        const response = await fetch('/menu/api/submenu/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                menu_id: selectedMenuId,
                submenu_name: name,
                submenu_url: url,
                submenu_order: 999
            })
        });
        const result = await response.json();

        if (result.success) {
            closeModal('add-submenu-modal');
            loadSubmenuList(selectedMenuId);
            alert('서브메뉴가 추가되었습니다.');
        } else {
            alert('서브메뉴 추가에 실패했습니다: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 권한 관리
async function loadAuthList(submenuId) {
    try {
        const response = await fetch(`/menu/api/menu/auth/${selectedMenuId}?submenu_id=${submenuId}`);
        const result = await response.json();

        if (result.success) {
            const list = document.getElementById('auth-list');
            if (result.data.length === 0) {
                list.innerHTML = '<li class="empty">권한이 설정되지 않았습니다 (관리자만 접근 가능)</li>';
            } else {
                list.innerHTML = result.data.map(auth => `
                    <li class="auth-item">
                        <span class="auth-type-badge ${auth.auth_type.toLowerCase()}">${auth.auth_type === 'USER' ? '사용자' : '부서'}</span>
                        <span class="auth-value">${auth.auth_value} / ${auth.emp_name} / ${auth.emp_rank} / ${auth.dept_name}</span>
                        <button class="btn btn-sm btn-danger" onclick="deleteAuth(${auth.auth_id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </li>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function searchAuth() {
    const type = document.getElementById('auth-type').value;
    const keyword = document.getElementById('auth-search').value;

    if (!keyword) return;

    const url = type === 'USER'
        ? `/menu/api/search/users?keyword=${encodeURIComponent(keyword)}`
        : `/menu/api/search/depts?keyword=${encodeURIComponent(keyword)}`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            const container = document.getElementById('auth-search-results');
            if (result.data.length === 0) {
                container.innerHTML = '<div class="no-results">검색 결과가 없습니다</div>';
            } else {
                container.innerHTML = result.data.map(item => {
                    if (type === 'USER') {
                        return `<div class="search-result-item" onclick="addAuth('USER', '${item.emp_code}')">
                            <span class="name">${item.emp_name} / ${item.emp_id}</span>
                            <span class="detail">${item.emp_code} / ${item.dept_name}</span>
                        </div>`;
                    } else {
                        return `<div class="search-result-item" onclick="addAuth('DEPT', '${item.dept_code}')">
                            <span class="name">${item.dept_name}</span>
                            <span class="detail">${item.dept_code}</span>
                        </div>`;
                    }
                }).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function addAuth(type, value) {
    try {
        const response = await fetch('/menu/api/menu/auth/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                menu_id: selectedMenuId,
                submenu_id: selectedSubmenuId,
                auth_type: type,
                auth_value: value,
                can_view: true
            })
        });
        const result = await response.json();

        if (result.success) {
            document.getElementById('auth-search-results').innerHTML = '';
            document.getElementById('auth-search').value = '';
            loadAuthList(selectedSubmenuId);
        } else {
            alert('권한 추가에 실패했습니다: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteAuth(authId) {
    if (!confirm('이 권한을 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/menu/api/menu/auth/delete/${authId}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (result.success) {
            loadAuthList(selectedSubmenuId);
        } else {
            alert('권한 삭제에 실패했습니다: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 통계
function showStatsPanel() {
    document.getElementById('stats-modal').style.display = 'flex';
    loadStats();
}

async function loadStats() {
    const startDate = document.getElementById('stats-start-date').value;
    const endDate = document.getElementById('stats-end-date').value;

    try {
        let url = '/menu/api/menu/stats?';
        if (startDate) url += `start_date=${startDate}&`;
        if (endDate) url += `end_date=${endDate}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            renderStatsTable(result.data.stats);
            renderStatsChart(result.data.trend);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderStatsTable(stats) {
    const tbody = document.getElementById('stats-table-body');
    if (stats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">데이터가 없습니다</td></tr>';
    } else {
        tbody.innerHTML = stats.map(row => `
            <tr>
                <td>${row.menu_name || '-'}</td>
                <td>${row.submenu_name || '-'}</td>
                <td>${row.access_count}</td>
                <td>${row.unique_users}</td>
            </tr>
        `).join('');
    }
}

function renderStatsChart(trend) {
    const container = document.getElementById('stats-chart');
    if (trend.length === 0) {
        container.innerHTML = '<div class="empty">데이터가 없습니다</div>';
        return;
    }

    const maxCount = Math.max(...trend.map(t => t.count));
    container.innerHTML = `
        <div class="chart-bars">
            ${trend.map(t => `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${(t.count / maxCount) * 100}%">
                        <span class="chart-value">${t.count}</span>
                    </div>
                    <span class="chart-label">${t.date.substring(5)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
    // 아이콘 피커 외부 클릭 시 닫기
    if (!event.target.closest('.icon-selector')) {
        document.querySelectorAll('.icon-picker').forEach(p => p.style.display = 'none');
    }
}