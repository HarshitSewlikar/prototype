"""Database-backed feature module enablement.

Feature enablement is application-wide and independent of RBAC: a module can be
enabled globally while still being unavailable to a user who lacks the required
permission. Modules are code-registered in
:mod:`access_control.catalog`; a ``ModuleSetting`` row for an unregistered code
is ignored. A registered module with no row yet is treated as enabled.
"""

from __future__ import annotations

from .catalog import (
    REGISTERED_MODULES,
    is_registered_module,
    module_for_menu_code,
)
from .models import ModuleSetting

__all__ = [
    "enabled_module_codes",
    "is_module_enabled",
    "module_for_menu_code",
    "module_settings_snapshot",
]


def _stored_states() -> dict[str, bool]:
    return dict(ModuleSetting.objects.values_list("code", "is_enabled"))


def enabled_module_codes() -> set[str]:
    """Return the set of currently enabled registered module codes."""
    stored = _stored_states()
    return {
        definition.code
        for definition in REGISTERED_MODULES
        if stored.get(definition.code, True)
    }


def is_module_enabled(code: str) -> bool:
    """Whether the given registered module is enabled (unknown codes: False)."""
    if not is_registered_module(code):
        return False
    stored = _stored_states()
    return stored.get(code, True)


def module_settings_snapshot() -> list[dict]:
    """Ordered list of every registered module and its enabled state."""
    stored = _stored_states()
    return [
        {
            "code": definition.code,
            "name": definition.name,
            "description": definition.description,
            "is_enabled": stored.get(definition.code, True),
        }
        for definition in REGISTERED_MODULES
    ]
