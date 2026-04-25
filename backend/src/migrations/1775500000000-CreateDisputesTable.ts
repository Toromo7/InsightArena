import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDisputesTable1775500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'disputes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'market_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'disputant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'resolved', 'rejected'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'resolution',
            type: 'enum',
            enum: ['upheld', 'overturned'],
            isNullable: true,
          },
          {
            name: 'admin_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'resolved_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'resolved_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'on_chain_dispute_id',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'on_chain_resolution_tx',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['market_id'],
            referencedTableName: 'markets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['disputant_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['resolved_by_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create indexes for better query performance
    await queryRunner.createIndex(
      'disputes',
      new TableIndex('IDX_disputes_market_id', ['market_id']),
    );

    await queryRunner.createIndex(
      'disputes',
      new TableIndex('IDX_disputes_disputant_id', ['disputant_id']),
    );

    await queryRunner.createIndex(
      'disputes',
      new TableIndex('IDX_disputes_status', ['status']),
    );

    await queryRunner.createIndex(
      'disputes',
      new TableIndex('IDX_disputes_resolved_by_id', ['resolved_by_id']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('disputes');
  }
}
