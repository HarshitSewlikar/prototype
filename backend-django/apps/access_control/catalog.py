"""Registered permission catalog.

A ``Permission`` row in MySQL is only *effective* if its ``code`` appears in
this catalog. This prevents creating new capabilities by inserting rows.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PermissionDefinition:
    code: str
    resource: str
    action: str
    description: str


REGISTERED_PERMISSIONS: tuple[PermissionDefinition, ...] = (
    PermissionDefinition("users.read", "users", "read", "View users"),
    PermissionDefinition("users.create", "users", "create", "Create users"),
    PermissionDefinition("users.update", "users", "update", "Update users"),
    PermissionDefinition(
        "users.deactivate", "users", "deactivate", "Deactivate users"
    ),
    PermissionDefinition("roles.read", "roles", "read", "View roles"),
    PermissionDefinition("roles.manage", "roles", "manage", "Create/update roles"),
    PermissionDefinition("roles.assign", "roles", "assign", "Assign roles to users"),
    PermissionDefinition(
        "permissions.read", "permissions", "read", "View permission definitions"
    ),
    PermissionDefinition(
        "permissions.manage",
        "permissions",
        "manage",
        "Create/update permission definitions",
    ),
    PermissionDefinition(
        "permissions.assign",
        "permissions",
        "assign",
        "Assign permissions to roles / user overrides",
    ),
    PermissionDefinition("menus.read", "menus", "read", "View menus"),
    PermissionDefinition("menus.manage", "menus", "manage", "Create/update menus"),
    PermissionDefinition(
        "menus.assign", "menus", "assign", "Assign menus to roles"
    ),
    PermissionDefinition("todos.read", "todos", "read", "View to-dos in scope"),
    PermissionDefinition("todos.create", "todos", "create", "Create to-dos"),
    PermissionDefinition("todos.update", "todos", "update", "Update to-dos"),
    PermissionDefinition("todos.delete", "todos", "delete", "Delete to-dos"),
    PermissionDefinition("todos.assign", "todos", "assign", "Assign to-dos"),
    PermissionDefinition(
        "todos.manage",
        "todos",
        "manage",
        "See and manage all to-dos regardless of ownership",
    ),
    PermissionDefinition("audit.read", "audit", "read", "View audit logs"),
    PermissionDefinition("audit.export", "audit", "export", "Export audit logs"),
    PermissionDefinition(
        "market.read", "market", "read", "Access market/finance data"
    ),
    PermissionDefinition(
        "modules.read", "modules", "read", "View feature module configuration"
    ),
    PermissionDefinition(
        "modules.manage",
        "modules",
        "manage",
        "Enable or disable feature modules",
    ),
)

REGISTERED_CODES: frozenset = frozenset(
    definition.code for definition in REGISTERED_PERMISSIONS
)


def is_registered(code: str) -> bool:
    return code in REGISTERED_CODES


@dataclass(frozen=True)
class ModuleDefinition:
    """A switchable application feature module.

    Modules are code-registered (like permissions). A ``ModuleSetting`` row is
    inert unless its ``code`` appears here, so configuration cannot invent new
    capabilities. ``menu_codes`` maps the module to the navigation entries it
    owns, so disabling a module removes those menus.
    """

    code: str
    name: str
    description: str
    menu_codes: tuple[str, ...]


REGISTERED_MODULES: tuple[ModuleDefinition, ...] = (
    ModuleDefinition(
        "market",
        "Market Dashboard",
        "Stock trends, sector performance and market movers analytics.",
        ("dashboard",),
    ),
    ModuleDefinition(
        "todos",
        "To-do Management",
        "Task tracking with lifecycle states and assignment.",
        ("todos",),
    ),
    ModuleDefinition(
        "users",
        "User Management",
        "Application user administration.",
        ("users",),
    ),
    ModuleDefinition(
        "roles_permissions",
        "Roles & Permissions",
        "Role and permission configuration.",
        ("roles", "permissions"),
    ),
    ModuleDefinition(
        "audit",
        "Audit Logs",
        "Security and change audit trail.",
        ("audit",),
    ),
)

REGISTERED_MODULE_CODES: frozenset = frozenset(
    definition.code for definition in REGISTERED_MODULES
)

# Menu code -> owning module code (menus absent here are core/always-on).
MODULE_BY_MENU_CODE: dict[str, str] = {
    menu_code: definition.code
    for definition in REGISTERED_MODULES
    for menu_code in definition.menu_codes
}


def is_registered_module(code: str) -> bool:
    return code in REGISTERED_MODULE_CODES


def module_for_menu_code(menu_code: str) -> str | None:
    return MODULE_BY_MENU_CODE.get(menu_code)


# System roles seeded by the ``seed_rbac`` management command.
SYSTEM_ROLE_DEFINITIONS: tuple[dict, ...] = (
    {
        "code": "administrator",
        "name": "Administrator",
        "description": "Full administrative access to all application capabilities.",
        "permissions": sorted(REGISTERED_CODES),
    },
    {
        "code": "auditor",
        "name": "Auditor",
        "description": "Read-only access to audit records and finance data.",
        "permissions": [
            "audit.read",
            "audit.export",
            "users.read",
            "roles.read",
            "permissions.read",
            "menus.read",
            "market.read",
            "modules.read",
        ],
    },
    {
        "code": "standard_user",
        "name": "Standard user",
        "description": "Can manage their own to-dos and view market data.",
        "permissions": [
            "todos.read",
            "todos.create",
            "todos.update",
            "todos.delete",
            "todos.assign",
            "market.read",
        ],
    },
)
