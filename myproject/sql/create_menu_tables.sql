-- =============================================
-- 사이드바 메뉴 관리 시스템 테이블 생성 스크립트
-- Database: master (or your target database)
-- =============================================

-- 1. TB_MENU (메인 메뉴)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_MENU]') AND type in (N'U'))
BEGIN
    CREATE TABLE TB_MENU (
        menu_id INT IDENTITY(1,1) PRIMARY KEY,
        menu_name NVARCHAR(50) NOT NULL,
        menu_icon NVARCHAR(50),           -- FontAwesome 아이콘 클래스
        menu_order INT DEFAULT 0,
        is_active BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    PRINT 'TB_MENU 테이블 생성 완료';
END
GO

-- 2. TB_SUBMENU (서브 메뉴)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_SUBMENU]') AND type in (N'U'))
BEGIN
    CREATE TABLE TB_SUBMENU (
        submenu_id INT IDENTITY(1,1) PRIMARY KEY,
        menu_id INT FOREIGN KEY REFERENCES TB_MENU(menu_id) ON DELETE CASCADE,
        submenu_name NVARCHAR(50) NOT NULL,
        submenu_url NVARCHAR(200),
        submenu_order INT DEFAULT 0,
        is_active BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    PRINT 'TB_SUBMENU 테이블 생성 완료';
END
GO

-- 3. TB_MENU_AUTH (메뉴 권한)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_MENU_AUTH]') AND type in (N'U'))
BEGIN
    CREATE TABLE TB_MENU_AUTH (
        auth_id INT IDENTITY(1,1) PRIMARY KEY,
        menu_id INT,
        submenu_id INT,
        auth_type NVARCHAR(10),           -- 'USER' 또는 'DEPT'
        auth_value NVARCHAR(50),          -- EmpCode 또는 DeptCode
        can_view BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (menu_id) REFERENCES TB_MENU(menu_id) ON DELETE NO ACTION,
        FOREIGN KEY (submenu_id) REFERENCES TB_SUBMENU(submenu_id) ON DELETE NO ACTION
    );
    PRINT 'TB_MENU_AUTH 테이블 생성 완료';
END
GO

-- 4. TB_MENU_LOG (메뉴 사용 통계)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_MENU_LOG]') AND type in (N'U'))
BEGIN
    CREATE TABLE TB_MENU_LOG (
        log_id INT IDENTITY(1,1) PRIMARY KEY,
        menu_id INT,
        submenu_id INT,
        emp_code NVARCHAR(20),
        access_time DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (menu_id) REFERENCES TB_MENU(menu_id) ON DELETE NO ACTION,
        FOREIGN KEY (submenu_id) REFERENCES TB_SUBMENU(submenu_id) ON DELETE NO ACTION
    );
    PRINT 'TB_MENU_LOG 테이블 생성 완료';
END
GO

-- =============================================
-- 인덱스 생성
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TB_SUBMENU_menu_id')
BEGIN
    CREATE INDEX IX_TB_SUBMENU_menu_id ON TB_SUBMENU(menu_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TB_MENU_AUTH_menu_id')
BEGIN
    CREATE INDEX IX_TB_MENU_AUTH_menu_id ON TB_MENU_AUTH(menu_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TB_MENU_AUTH_auth_value')
BEGIN
    CREATE INDEX IX_TB_MENU_AUTH_auth_value ON TB_MENU_AUTH(auth_type, auth_value);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TB_MENU_LOG_access_time')
BEGIN
    CREATE INDEX IX_TB_MENU_LOG_access_time ON TB_MENU_LOG(access_time);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TB_MENU_LOG_emp_code')
BEGIN
    CREATE INDEX IX_TB_MENU_LOG_emp_code ON TB_MENU_LOG(emp_code);
END
GO

-- =============================================
-- 초기 데이터 삽입 (기존 하드코딩된 메뉴 마이그레이션)
-- =============================================

-- 메인 메뉴 데이터
SET IDENTITY_INSERT TB_MENU ON;

INSERT INTO TB_MENU (menu_id, menu_name, menu_icon, menu_order, is_active)
SELECT 1, N'설정', 'fas fa-cogs', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_MENU WHERE menu_id = 1);

INSERT INTO TB_MENU (menu_id, menu_name, menu_icon, menu_order, is_active)
SELECT 2, N'기초정보', 'fas fa-file-alt', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_MENU WHERE menu_id = 2);

INSERT INTO TB_MENU (menu_id, menu_name, menu_icon, menu_order, is_active)
SELECT 3, N'연봉근로계약서', 'fas fa-solid fa-user', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_MENU WHERE menu_id = 3);

INSERT INTO TB_MENU (menu_id, menu_name, menu_icon, menu_order, is_active)
SELECT 4, N'임직원교육', 'fas fa-school', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_MENU WHERE menu_id = 4);

SET IDENTITY_INSERT TB_MENU OFF;
GO

-- 서브 메뉴 데이터
SET IDENTITY_INSERT TB_SUBMENU ON;

-- 설정 서브메뉴
INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 1, 1, N'서브메뉴 1-1', '/dashboard', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 1);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 2, 1, N'서브메뉴 1-2', '/webstatus', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 2);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 3, 1, N'서브메뉴 1-3', '/serverstatus', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 3);

-- 기초정보 서브메뉴
INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 4, 2, N'서브메뉴 2-1', '/menu2', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 4);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 5, 2, N'서브메뉴 2-2', '/webstatus', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 5);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 6, 2, N'서브메뉴 2-3', '/serverstatus', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 6);

-- 연봉근로계약서 서브메뉴
INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 7, 3, N'연봉근로계약서(신규)', '/contract_new', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 7);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 8, 3, N'연봉근로계약서(갱신)', '/contract_manage', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 8);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 9, 3, N'연봉근로계약서 서명', '/contract_sign', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 9);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 10, 3, N'연봉근로계약서 현황 조회', '/contract_query', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 10);

-- 임직원교육 서브메뉴
INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 11, 4, N'교육자료 업로드', '/docs/education_manage', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 11);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 12, 4, N'교육 수강', '/docs/viewer_page', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 12);

INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 13, 4, N'수강 현황 조회', '/docs/education_report', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 13);

-- 메뉴관리 메뉴 추가 (설정 하위)
INSERT INTO TB_SUBMENU (submenu_id, menu_id, submenu_name, submenu_url, submenu_order, is_active)
SELECT 14, 1, N'메뉴 관리', '/menu/manage', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM TB_SUBMENU WHERE submenu_id = 14);

SET IDENTITY_INSERT TB_SUBMENU OFF;
GO

PRINT '초기 데이터 삽입 완료';
GO
