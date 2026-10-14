from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def todo_payload():
    return {"title": "Write report", "description": "Q3 report", "priority": "high"}


@pytest.mark.django_db
def test_user_sees_only_own_and_assigned_todos(api, seeded, make_user, todo_payload):
    alice = make_user("alice", roles=("standard_user",))
    bob = make_user("bob", roles=("standard_user",))

    api.force_authenticate(user=alice)
    created = api.post("/api/v1/todos/", todo_payload, format="json")
    assert created.status_code == 201
    todo_id = created.json()["id"]

    # bob sees nothing yet
    api.force_authenticate(user=bob)
    assert api.get("/api/v1/todos/").json()["count"] == 0

    # assign to bob, then bob sees it
    api.force_authenticate(user=alice)
    assign = api.post(
        f"/api/v1/todos/{todo_id}/assign/", {"assignee": bob.pk}, format="json"
    )
    assert assign.status_code == 200
    api.force_authenticate(user=bob)
    assert api.get("/api/v1/todos/").json()["count"] == 1


@pytest.mark.django_db
def test_assignment_to_inactive_user_rejected(api, seeded, make_user, todo_payload):
    alice = make_user("alice2", roles=("standard_user",))
    inactive = make_user("ghost", roles=(), is_active=False)
    api.force_authenticate(user=alice)
    todo_id = api.post("/api/v1/todos/", todo_payload, format="json").json()["id"]
    response = api.post(
        f"/api/v1/todos/{todo_id}/assign/", {"assignee": inactive.pk}, format="json"
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_invalid_status_transition_rejected(api, seeded, make_user, todo_payload):
    alice = make_user("alice3", roles=("standard_user",))
    api.force_authenticate(user=alice)
    todo_id = api.post("/api/v1/todos/", todo_payload, format="json").json()["id"]
    # open -> completed is not allowed directly
    response = api.post(
        f"/api/v1/todos/{todo_id}/status/", {"status": "completed"}, format="json"
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_valid_status_transition_succeeds(api, seeded, make_user, todo_payload):
    from audit.models import AuditLog

    alice = make_user("alice4", roles=("standard_user",))
    api.force_authenticate(user=alice)
    todo_id = api.post("/api/v1/todos/", todo_payload, format="json").json()["id"]
    before = AuditLog.objects.count()
    response = api.post(
        f"/api/v1/todos/{todo_id}/status/", {"status": "in_progress"}, format="json"
    )
    assert response.status_code == 200
    assert AuditLog.objects.count() == before + 1


@pytest.mark.django_db
def test_create_with_assignee_id_persists(api, seeded, make_user, todo_payload):
    from todos.models import Todo

    alice = make_user("assigner", roles=("standard_user",))
    bob = make_user("assignee", roles=("standard_user",))
    api.force_authenticate(user=alice)
    created = api.post(
        "/api/v1/todos/", {**todo_payload, "assignee": bob.pk}, format="json"
    )
    assert created.status_code == 201
    assert created.json()["assignee"] == bob.pk
    assert Todo.objects.get(pk=created.json()["id"]).assignee_id == bob.pk


@pytest.mark.django_db
def test_username_assignee_is_rejected_and_does_not_change_the_row(
    api, seeded, make_user, todo_payload
):
    from todos.models import Todo

    alice = make_user("editor", roles=("standard_user",))
    bob = make_user("bobname", roles=("standard_user",))
    api.force_authenticate(user=alice)
    created = api.post(
        "/api/v1/todos/", {**todo_payload, "assignee": bob.pk}, format="json"
    )
    todo_id = created.json()["id"]
    response = api.patch(
        f"/api/v1/todos/{todo_id}/",
        {"title": "Should not save", "assignee": bob.username},
        format="json",
    )
    assert response.status_code == 400
    todo = Todo.objects.get(pk=todo_id)
    assert todo.title == "Write report"
    assert todo.assignee_id == bob.pk


@pytest.mark.django_db
def test_patch_without_assignee_keeps_existing_assignment(
    api, seeded, make_user, todo_payload
):
    from todos.models import Todo

    alice = make_user("keeper", roles=("standard_user",))
    bob = make_user("kept", roles=("standard_user",))
    api.force_authenticate(user=alice)
    todo_id = api.post(
        "/api/v1/todos/", {**todo_payload, "assignee": bob.pk}, format="json"
    ).json()["id"]
    response = api.patch(
        f"/api/v1/todos/{todo_id}/",
        {"title": "Updated title", "description": "Updated body"},
        format="json",
    )
    assert response.status_code == 200
    todo = Todo.objects.get(pk=todo_id)
    assert todo.title == "Updated title"
    assert todo.assignee_id == bob.pk


@pytest.mark.django_db
def test_reassign_and_clear_existing_assignment(api, seeded, make_user, todo_payload):
    from todos.models import Todo

    alice = make_user("owner", roles=("standard_user",))
    bob = make_user("first", roles=("standard_user",))
    carol = make_user("second", roles=("standard_user",))
    api.force_authenticate(user=alice)
    todo_id = api.post("/api/v1/todos/", todo_payload, format="json").json()["id"]

    first = api.post(
        f"/api/v1/todos/{todo_id}/assign/", {"assignee": bob.pk}, format="json"
    )
    assert first.status_code == 200
    assert first.json()["assignee"] == bob.pk

    second = api.post(
        f"/api/v1/todos/{todo_id}/assign/", {"assignee": carol.pk}, format="json"
    )
    assert second.status_code == 200
    assert Todo.objects.get(pk=todo_id).assignee_id == carol.pk

    cleared = api.post(
        f"/api/v1/todos/{todo_id}/assign/", {"assignee": None}, format="json"
    )
    assert cleared.status_code == 200
    assert Todo.objects.get(pk=todo_id).assignee_id is None


@pytest.mark.django_db
def test_assign_unknown_user_rejected(api, seeded, make_user, todo_payload):
    from todos.models import Todo

    alice = make_user("picker", roles=("standard_user",))
    api.force_authenticate(user=alice)
    todo_id = api.post("/api/v1/todos/", todo_payload, format="json").json()["id"]
    response = api.post(
        f"/api/v1/todos/{todo_id}/assign/", {"assignee": 999999}, format="json"
    )
    assert response.status_code == 400
    assert Todo.objects.get(pk=todo_id).assignee_id is None


@pytest.mark.django_db
def test_assignees_lists_only_active_users(api, seeded, make_user):
    alice = make_user("lister", roles=("standard_user",))
    active = make_user("visible", roles=("standard_user",))
    inactive = make_user("hidden", roles=(), is_active=False)
    api.force_authenticate(user=alice)
    response = api.get("/api/v1/todos/assignees/")
    assert response.status_code == 200
    ids = {row["id"] for row in response.json()["results"]}
    assert active.pk in ids
    assert inactive.pk not in ids
    assert all(set(row) == {"id", "username", "name"} for row in response.json()["results"])


@pytest.mark.django_db
def test_assignees_requires_assign_permission(api, seeded, make_user):
    outsider = make_user("outsider", roles=())
    api.force_authenticate(user=outsider)
    assert api.get("/api/v1/todos/assignees/").status_code == 403


@pytest.mark.django_db
def test_failed_mutation_creates_no_success_audit(api, seeded, make_user, todo_payload):
    from audit.models import AuditLog

    alice = make_user("alice5", roles=("standard_user",))
    api.force_authenticate(user=alice)
    todo_id = api.post("/api/v1/todos/", todo_payload, format="json").json()["id"]
    before = AuditLog.objects.count()
    response = api.post(
        f"/api/v1/todos/{todo_id}/status/", {"status": "completed"}, format="json"
    )
    assert response.status_code == 400
    assert AuditLog.objects.count() == before
