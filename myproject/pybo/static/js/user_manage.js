// 전역 변수
let selectedEmpCode = null;
let currentPage = 1;
let currentLogPage = 1;
let menuData = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadDeptList();
    loadUserList();
    loadMenuData();

    // 엔터 키로 검색
    document.getElementById('search-keyword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
});

// 부서 목록 로드
async function loadDeptList() {
    try {
        const response = await fetch('/user/api/depts');
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('dept-filter');
            result.data.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.dept_code;
                option.textContent = dept.dept_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 메뉴 데이터 로드 (권한 추가용)
async function loadMenuData() {
    try {
        const response = await fetch('/user/api/menus');
        const result = await response.json();

        if (result.success) {
            menuData = result.data;
            const select = document.getElementById('auth-menu-select');
            select.innerHTML = '<option value="">메뉴를 선택하세요</option>';
            result.data.forEach(menu => {
                const option = document.createElement('option');
                option.value = menu.menu_id;
                option.textContent = menu.menu_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 서브메뉴 로드
function loadSubmenus() {
    const menuId = document.getElementById('auth-menu-select').value;
    const container = document.getElementById('submenu-checkboxes');

    if (!menuId) {
        container.innerHTML = '<p class="hint">메뉴를 먼저 선택하세요</p>';
        return;
    }

    const menu = menuData.find(m => m.menu_id == menuId);
    if (!menu || !menu.submenus || menu.submenus.length === 0) {
        container.innerHTML = '<p class="hint">서브메뉴가 없습니다</p>';
        return;
    }

    container.innerHTML = menu.submenus.map(sub => `
        <label class="checkbox-item">
            <input type="checkbox" value="${sub.submenu_id}" data-menu-id="${menuId}">
            <span>${sub.submenu_name}</span>
            <small>${sub.submenu_url}</small>
        </label>
    `).join('');
}

// 사용자 목록 로드
async function loadUserList(page = 1) {
    try {
        currentPage = page;
        const keyword = document.getElementById('search-keyword').value;
        const deptCode = document.getElementById('dept-filter').value;

        let url = `/user/api/list?page=${page}&page_size=20`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        if (deptCode) url += `&dept_code=${encodeURIComponent(deptCode)}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            renderUserList(result.data);
            renderPagination(result.total_pages, result.page);
            document.getElementById('user-count').textContent = `${result.total}명`;
        } else {
            alert('사용자 목록을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 사용자 검색
function searchUsers() {
    loadUserList(1);
}

// 사용자 목록 렌더링
function renderUserList(users) {
    const tbody = document.getElementById('user-table-body');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">검색 결과가 없습니다</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr class="${selectedEmpCode === user.emp_code ? 'selected' : ''}"
            onclick="selectUser('${user.emp_code}')">
            <td>${user.emp_id}</td>
            <td>${user.emp_code}</td>
            <td>${user.emp_name}</td>
            <td>${user.emp_rank}</td>
            <td>${user.dept_name || '-'}</td>
        </tr>
    `).join('');
}

// 페이지네이션 렌더링
function renderPagination(totalPages, currentPage) {
    const container = document.getElementById('pagination');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // 이전 버튼
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}
             onclick="loadUserList(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
             </button>`;

    // 페이지 번호
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
                 onclick="loadUserList(${i})">${i}</button>`;
    }

    // 다음 버튼
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}
             onclick="loadUserList(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
             </button>`;

    container.innerHTML = html;
}

// 사용자 선택
async function selectUser(empCode) {
    selectedEmpCode = empCode;

    // 테이블 행 선택 상태 업데이트
    document.querySelectorAll('#user-table-body tr').forEach(row => {
        row.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // 상세 정보 로드
    await loadUserDetail(empCode);
}

// 사용자 상세 정보 로드
async function loadUserDetail(empCode) {
    try {
        const response = await fetch(`/user/api/detail/${empCode}`);
        const result = await response.json();

        if (result.success) {
            const user = result.data;

            // 기본 정보 표시
            document.getElementById('no-user-selected').style.display = 'none';
            document.getElementById('user-detail').style.display = 'block';

            document.getElementById('detail-name').textContent = user.emp_name || user.emp_id;
            document.getElementById('detail-emp-code').textContent = user.emp_code;
            document.getElementById('detail-dept').textContent = user.dept_name || '-';

            // 관리자 여부 확인
            await checkAdminStatus(empCode);

            // 권한 정보 로드
            await loadUserAuths(empCode);

            // 로그 정보 로드
            await loadUserLogs(empCode, 1);
        } else {
            alert('사용자 정보를 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 사용자 권한 로드
async function loadUserAuths(empCode) {
    try {
        const response = await fetch(`/user/api/auth/list/${empCode}`);
        const result = await response.json();

        if (result.success) {
            // 개인 권한
            const userAuthList = document.getElementById('user-auth-list');
            if (result.data.user_auths.length === 0) {
                userAuthList.innerHTML = '<li class="empty">개인 권한이 없습니다</li>';
            } else {
                userAuthList.innerHTML = result.data.user_auths.map(auth => `
                    <li class="auth-item">
                        <div class="auth-info">
                            <span class="menu-name">${auth.menu_name || '-'}</span>
                            <span class="submenu-name">${auth.submenu_name || '-'}</span>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="removeAuth(${auth.auth_id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </li>
                `).join('');
            }

            // 부서 권한
            const deptAuthList = document.getElementById('dept-auth-list');
            if (result.data.dept_auths.length === 0) {
                deptAuthList.innerHTML = '<li class="empty">부서 권한이 없습니다</li>';
            } else {
                deptAuthList.innerHTML = result.data.dept_auths.map(auth => `
                    <li class="auth-item inherited">
                        <div class="auth-info">
                            <span class="menu-name">${auth.menu_name || '-'}</span>
                            <span class="submenu-name">${auth.submenu_name || '-'}</span>
                        </div>
                        <span class="dept-badge">${auth.dept_code}</span>
                    </li>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 사용자 로그 로드
async function loadUserLogs(empCode, page = 1) {
    try {
        currentLogPage = page;
        const response = await fetch(`/user/api/log/${empCode}?page=${page}&page_size=10`);
        const result = await response.json();

        if (result.success) {
            const tbody = document.getElementById('log-table-body');

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="empty">접근 로그가 없습니다</td></tr>';
            } else {
                tbody.innerHTML = result.data.map(log => `
                    <tr>
                        <td>${log.menu_name || '-'}</td>
                        <td>${log.submenu_name || '-'}</td>
                        <td>${log.access_time}</td>
                    </tr>
                `).join('');
            }

            // 로그 페이지네이션
            renderLogPagination(result.total_pages, result.page);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 로그 페이지네이션 렌더링
function renderLogPagination(totalPages, currentPage) {
    const container = document.getElementById('log-pagination');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}
             onclick="loadUserLogs('${selectedEmpCode}', ${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
             </button>`;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
                 onclick="loadUserLogs('${selectedEmpCode}', ${i})">${i}</button>`;
    }

    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}
             onclick="loadUserLogs('${selectedEmpCode}', ${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
             </button>`;

    container.innerHTML = html;
}

// 탭 전환
function switchTab(tabId) {
    // 탭 버튼 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // 탭 컨텐츠 표시
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

// 권한 추가 모달 열기
function openAddAuthModal() {
    if (!selectedEmpCode) {
        alert('먼저 사용자를 선택하세요.');
        return;
    }
    document.getElementById('auth-menu-select').value = '';
    document.getElementById('submenu-checkboxes').innerHTML = '<p class="hint">메뉴를 먼저 선택하세요</p>';
    document.getElementById('add-auth-modal').style.display = 'flex';
}

// 모달 닫기
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 권한 추가
async function addAuth() {
    const checkboxes = document.querySelectorAll('#submenu-checkboxes input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('서브메뉴를 선택하세요.');
        return;
    }

    try {
        for (const checkbox of checkboxes) {
            await fetch('/user/api/auth/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emp_code: selectedEmpCode,
                    menu_id: checkbox.dataset.menuId,
                    submenu_id: checkbox.value,
                    can_view: true
                })
            });
        }

        closeModal('add-auth-modal');
        loadUserAuths(selectedEmpCode);
        alert('권한이 추가되었습니다.');
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 권한 삭제
async function removeAuth(authId) {
    if (!confirm('이 권한을 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/user/api/auth/remove/${authId}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (result.success) {
            loadUserAuths(selectedEmpCode);
        } else {
            alert('권한 삭제에 실패했습니다: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// 관리자 여부 확인
async function checkAdminStatus(empCode) {
    try {
        const response = await fetch(`/user/api/admin/check/${empCode}`);
        const result = await response.json();
        document.getElementById('admin-checkbox').checked = result.is_admin;
    } catch (error) {
        console.error('Error:', error);
    }
}

// 관리자 토글
async function toggleAdmin() {
    if (!selectedEmpCode) return;
    const isAdmin = document.getElementById('admin-checkbox').checked;
    try {
        const response = await fetch('/user/api/admin/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_code: selectedEmpCode, is_admin: isAdmin })
        });
        const result = await response.json();
        if (!result.success) {
            alert('관리자 설정 실패: ' + result.error);
            document.getElementById('admin-checkbox').checked = !isAdmin;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('admin-checkbox').checked = !isAdmin;
    }
}