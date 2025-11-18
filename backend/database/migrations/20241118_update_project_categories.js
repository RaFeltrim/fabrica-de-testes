exports.up = function(knex) {
  return knex('test_results')
    .whereNull('project_category')
    .update({
      project_category: knex.raw(`
        CASE 
          WHEN suite_name LIKE '%Banking%' OR suite_name LIKE '%Payment%' OR suite_name LIKE '%Account%' THEN 'Banking'
          WHEN suite_name LIKE '%Credit%' OR suite_name LIKE '%Score%' THEN 'Credit'
          WHEN suite_name LIKE '%Compliance%' OR suite_name LIKE '%Report%' THEN 'Compliance'
          WHEN suite_name LIKE '%Security%' OR suite_name LIKE '%Auth%' THEN 'Security'
          ELSE 'General'
        END
      `)
    });
};

exports.down = function(knex) {
  // We don't need to revert this change as it's just adding meaningful defaults
  return Promise.resolve();
};