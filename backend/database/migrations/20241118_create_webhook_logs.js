exports.up = function(knex) {
  return knex.schema.createTable('webhook_logs', function(table) {
    table.increments('id').primary();
    table.string('source').notNullable(); // github, jenkins, gitlab, generic
    table.string('event_type'); // workflow_run, pipeline, build, etc.
    table.text('payload'); // JSON payload
    table.string('status').defaultTo('success'); // success, failed, error
    table.text('error_message');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Add indexes for common queries
    table.index('source');
    table.index('status');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('webhook_logs');
};
