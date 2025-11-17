exports.up = function(knex) {
  return knex.schema.createTable('test_results', function(table) {
    table.increments('id').primary();
    table.string('suite_name').notNullable();
    table.integer('total').notNullable();
    table.integer('passed').notNullable();
    table.integer('failed').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('test_results');
};
