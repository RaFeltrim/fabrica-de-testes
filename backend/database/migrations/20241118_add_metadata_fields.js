exports.up = function(knex) {
  return knex.schema.table('test_results', function(table) {
    table.string('framework').defaultTo('Unknown');
    table.string('test_type').defaultTo('Functional');
    table.text('error_details');
    table.string('project_category');
  });
};

exports.down = function(knex) {
  return knex.schema.table('test_results', function(table) {
    table.dropColumn('framework');
    table.dropColumn('test_type');
    table.dropColumn('error_details');
    table.dropColumn('project_category');
  });
};
