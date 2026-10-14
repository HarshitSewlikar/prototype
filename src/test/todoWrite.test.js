import { describe, expect, it } from 'vitest'

import { buildTodoSave } from '../features/todos/todoWrite'

const form = (assigneeId, due_at = '') => ({
  title: 'Review positions',
  description: 'Check exposure',
  priority: 'high',
  due_at,
  assigneeId,
})

describe('todo assignment payload', () => {
  it('sends a numeric user id when creating an assigned to-do', () => {
    const plan = buildTodoSave(form('12'), null, { isEdit: false, canAssign: true })
    expect(plan.assigneeId).toBe(12)
    expect(plan.fields).not.toHaveProperty('assignee')
    expect(JSON.stringify(plan)).not.toContain('alice')
  })

  it('omits assignment when a new to-do is left unassigned', () => {
    const plan = buildTodoSave(form(''), null, { isEdit: false, canAssign: true })
    expect(plan.assigneeId).toBeUndefined()
  })

  it('keeps the existing assignee out of an edit that does not change it', () => {
    const plan = buildTodoSave(form('7'), 7, { isEdit: true, canAssign: true })
    expect(plan.assigneeId).toBeUndefined()
    expect(plan.fields.title).toBe('Review positions')
  })

  it('clears an existing assignee with null', () => {
    const plan = buildTodoSave(form(''), 7, { isEdit: true, canAssign: true })
    expect(plan.assigneeId).toBeNull()
  })

  it('replaces an existing assignee with the newly selected id', () => {
    const plan = buildTodoSave(form('9'), 7, { isEdit: true, canAssign: true })
    expect(plan.assigneeId).toBe(9)
  })

  it('does not assign when the user lacks assign permission', () => {
    const plan = buildTodoSave(form('9'), 7, { isEdit: true, canAssign: false })
    expect(plan.assigneeId).toBeUndefined()
  })

  it('serializes a due date and leaves it empty when unset', () => {
    const due = '2026-01-02T15:30'
    const withDue = buildTodoSave(form('', due), null, { isEdit: false, canAssign: true })
    expect(withDue.fields.due_at).toBe(new Date(due).toISOString())
    const withoutDue = buildTodoSave(form(''), null, { isEdit: false, canAssign: true })
    expect(withoutDue.fields.due_at).toBeNull()
  })
})
