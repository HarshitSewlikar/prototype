"""Feature-module enablement: persistence, enforcement and isolation from RBAC.

Covers the reviewer checklist:
1. disabling a module removes its menu from navigation
2. its protected API endpoints reject access while disabled
3. existing records remain in the database
4. re-enabling restores navigation and access
5. an unauthorized user cannot change settings
6. settings persist (they are read back from the database, not the client)
"""

from __future__ import annotations

import pytest

from access_control.models import ModuleSetting
from todos.models import Todo


def _set_module(api, code, enabled):
    return api.put(f"/api/v1/modules/{code}/", {"is_enabled": enabled}, format="json")


def _menu_codes(api):
    response = api.get("/api/v1/auth/me/access/")
    assert response.status_code == 200

    codes = []

    def walk(items):
        for item in items:
            codes.append(item["code"])
            walk(item.get("children", []))

    walk(response.json()["menus"])
    return codes


@pytest.mark.django_db
def test_module_list_returns_registered_modules(api, seeded, admin_user):
    api.force_authenticate(user=admin_user)
    response = api.get("/api/v1/modules/")
    assert response.status_code == 200
    codes = {m["code"] for m in response.json()["modules"]}
    assert codes == {"market", "todos", "users", "roles_permissions", "audit"}
    assert all(m["is_enabled"] for m in response.json()["modules"])


@pytest.mark.django_db
def test_disable_todo_hides_menu_and_blocks_api(api, seeded, admin_user, make_user):
    alice = make_user("alice", roles=("standard_user",))

    # Alice can create and see a todo while the module is enabled.
    api.force_authenticate(user=alice)
    created = api.post("/api/v1/todos/", {"title": "Keep me"}, format="json")
    assert created.status_code == 201
    todo_id = created.json()["id"]
    assert api.get("/api/v1/todos/").status_code == 200

    # Admin disables the todos module.
    api.force_authenticate(user=admin_user)
    assert _set_module(api, "todos", False).status_code == 200
    assert "todos" not in _menu_codes(api)

    # API is refused even for the protected administrator (module-wide switch).
    assert api.get("/api/v1/todos/").status_code == 403

    # Existing data is untouched in the database.
    assert Todo.objects.filter(pk=todo_id).exists()

    # Re-enable: menu and access return, with the original record intact.
    assert _set_module(api, "todos", True).status_code == 200
    assert "todos" in _menu_codes(api)
    api.force_authenticate(user=alice)
    listing = api.get("/api/v1/todos/")
    assert listing.status_code == 200
    assert any(row["id"] == todo_id for row in listing.json()["results"])


@pytest.mark.django_db
def test_disabled_market_module_blocks_market_endpoints(api, seeded, admin_user):
    api.force_authenticate(user=admin_user)
    assert api.get("/api/v1/market/sector-performance/").status_code == 200

    assert _set_module(api, "market", False).status_code == 200
    assert api.get("/api/v1/market/sector-performance/").status_code == 403
    assert api.get("/api/v1/market/movers/").status_code == 403


@pytest.mark.django_db
def test_unknown_module_code_rejected(api, seeded, admin_user):
    api.force_authenticate(user=admin_user)
    response = _set_module(api, "not_a_module", False)
    assert response.status_code == 400
    assert not ModuleSetting.objects.filter(code="not_a_module").exists()


@pytest.mark.django_db
def test_unauthorized_user_cannot_read_or_change_modules(api, seeded, make_user):
    alice = make_user("alice2", roles=("standard_user",))
    api.force_authenticate(user=alice)

    assert api.get("/api/v1/modules/").status_code == 403
    assert _set_module(api, "todos", False).status_code == 403
    # Nothing was written.
    assert ModuleSetting.objects.get(code="todos").is_enabled is True


@pytest.mark.django_db
def test_auditor_can_read_but_not_change_modules(api, seeded, make_user):
    auditor = make_user("aud", roles=("auditor",))
    api.force_authenticate(user=auditor)
    assert api.get("/api/v1/modules/").status_code == 200
    assert _set_module(api, "audit", False).status_code == 403


@pytest.mark.django_db
def test_modules_menu_is_core_and_visible(api, seeded, admin_user):
    api.force_authenticate(user=admin_user)
    assert "modules" in _menu_codes(api)


@pytest.mark.django_db
def test_disabling_roles_permissions_hides_both_menus_and_blocks_api(
    api, seeded, admin_user
):
    api.force_authenticate(user=admin_user)
    assert api.get("/api/v1/roles/").status_code == 200
    assert api.get("/api/v1/permissions/").status_code == 200

    assert _set_module(api, "roles_permissions", False).status_code == 200

    codes = _menu_codes(api)
    assert "roles" not in codes
    assert "permissions" not in codes
    # The core administration menus remain available.
    assert "modules" in codes
    assert "menus" in codes

    assert api.get("/api/v1/roles/").status_code == 403
    assert api.get("/api/v1/permissions/").status_code == 403

    assert _set_module(api, "roles_permissions", True).status_code == 200
    assert api.get("/api/v1/roles/").status_code == 200


@pytest.mark.django_db
def test_setting_persists_in_database(api, seeded, admin_user):
    api.force_authenticate(user=admin_user)
    assert _set_module(api, "audit", False).status_code == 200

    # Re-read through a brand-new client/session: value comes from MySQL.
    from rest_framework.test import APIClient

    fresh = APIClient()
    fresh.force_authenticate(user=admin_user)
    listing = fresh.get("/api/v1/modules/")
    audit = next(m for m in listing.json()["modules"] if m["code"] == "audit")
    assert audit["is_enabled"] is False
    assert ModuleSetting.objects.get(code="audit").is_enabled is False
