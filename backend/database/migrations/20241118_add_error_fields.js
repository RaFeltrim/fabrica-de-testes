exports.up = function(knex) {
  return knex.schema.table('test_results', function(table) {
    table.string('error_type');
    table.text('error_message');
  });
};

exports.down = function(knex) {
  return knex.schema.table('test_results', function(table) {
    table.dropColumn('error_type');
    table.dropColumn('error_message');
  });
};