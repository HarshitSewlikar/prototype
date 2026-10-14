// Builds the create/update body and the optional assign call.
// Assignee is always a user id or null. Usernames are never sent.

export const buildTodoSave = (form, originalAssigneeId, { isEdit, canAssign }) => {
  const fields = {
    title: form.title,
    description: form.description,
    priority: form.priority,
    due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
  }

  if (!canAssign) {
    return { fields, assigneeId: undefined }
  }

  const assigneeId = form.assigneeId ? Number(form.assigneeId) : null
  const previous = originalAssigneeId ?? null
  const changed = isEdit ? assigneeId !== previous : assigneeId !== null
  return { fields, assigneeId: changed ? assigneeId : undefined }
}
