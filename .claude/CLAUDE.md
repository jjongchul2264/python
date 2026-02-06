# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Intellics Portal** - Enterprise HR/Admin Portal for Intel Korea
- Framework: Flask 3.1.2 (Python)
- Database: Microsoft SQL Server (pymssql)
- Frontend: Jinja2 templates, Bootstrap 5, vanilla JavaScript

## Build & Run Commands

```bash
# Start the server (from C:\venvs\myproject)
python app.py
# Server runs at http://0.0.0.0:8888

# Run tests
pytest myproject

# JavaScript linting and formatting
npm run lint          # Check ESLint issues
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format with Prettier
npm run format:check  # Check Prettier formatting
```

## Architecture

### App Factory Pattern
- Entry point: `myproject/app.py`
- Factory function: `myproject/pybo/__init__.py` (`create_app()`)
- All routes organized via Flask Blueprints in `pybo/views/`

### Blueprint Modules (13 total)
| Blueprint | URL Prefix | Purpose |
|-----------|-----------|---------|
| loginPage | `/` | Authentication |
| main | `/` | Dashboard |
| documents_viewer | `/docs` | Education document management |
| contract | `/` | Salary contract management |
| menu_manage | `/menu` | Admin menu API |
| user_manage | `/user` | Admin user API |
| webserver, macaddress, outhistory, polist, salary_deduction, salary_deduction_ps, comm_vacation_apply_ps | - | Feature-specific modules |

### Key Directories
- `pybo/views/` - Route handlers (blueprints)
- `pybo/templates/` - Jinja2 HTML templates
- `pybo/static/css/` - Stylesheets (common.css, layout.css, variables.css for shared styles)
- `pybo/static/js/` - JavaScript files
- `pybo/uploads/` - User file uploads
- `utils/` - Utility modules (PDF/PPT conversion)
- `sql/` - Database initialization scripts

### Database
- Connection: SQL Server at 192.168.0.72:1433
- Direct pymssql connections (not ORM)
- Key tables: TB_MENU, TB_SUBMENU, TB_MENU_AUTH, TB_USER_ADMIN, ITCS_EDUCATION

## Coding Guidelines

### Python
- Use Blueprints for route organization
- App factory pattern in `__init__.py`
- File naming: snake_case
- Password hashing: SHA-512

### JavaScript
- ESLint + Prettier enforced
- Print width: 120 chars, tab width: 4
- Semicolons required, single quotes
- Prefix unused vars with `_`

### HTML/CSS
- File naming: kebab-case
- Use CSS variables from `variables.css`
- Shared layouts in `layout.css`, `common.css`

### Workflow
- Restart server after Python changes (no auto-reload in production)
- Run `pytest` after modifications
- Debug mode must be `False` in production
