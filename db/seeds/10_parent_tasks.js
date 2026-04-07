/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * Parent IDs: 1=Homer, 2=Marge
 */
exports.seed = async function(knex) {
  const now = new Date()
  const h = (hours) => new Date(now - hours * 3600000).toISOString()

  await knex('parent_tasks').insert([
    { // 1 — working
      household_id: 1,
      created_by: 1,
      title: 'Build screen door',
      status: 'working',
      started_by: 1,
      sort_order: 10,
      created_at: h(72),
      updated_at: h(5)
    },{ // 2 — active
      household_id: 1,
      created_by: 2,
      title: 'Replace air filters',
      status: 'active',
      sort_order: 20,
      created_at: h(48),
      updated_at: h(48)
    },{ // 3 — active
      household_id: 1,
      created_by: 1,
      title: 'Organize garage',
      status: 'active',
      sort_order: 30,
      created_at: h(24),
      updated_at: h(24)
    },{ // 4 — archived recently
      household_id: 1,
      created_by: 2,
      title: 'Fix leaky faucet',
      status: 'archived',
      sort_order: 40,
      archived_at: h(12),
      created_at: h(96),
      updated_at: h(12)
    },{ // 5 — archived 2 days ago
      household_id: 1,
      created_by: 1,
      title: 'Mow the lawn',
      status: 'archived',
      sort_order: 50,
      archived_at: h(48),
      created_at: h(120),
      updated_at: h(48)
    }
  ])

  await knex('parent_task_notes').insert([
    { parent_task_id: 1, created_by: 1, content: 'Picked up materials from hardware store', created_at: h(24) },
    { parent_task_id: 1, created_by: 2, content: 'Hinges are in the garage on the shelf', created_at: h(12) },
    { parent_task_id: 4, created_by: 2, content: 'Done — replaced the washer and O-ring', created_at: h(12) }
  ])
}
