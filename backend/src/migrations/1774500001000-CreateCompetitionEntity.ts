import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompetitionEntity1774500001000 implements MigrationInterface {
  name = 'CreateCompetitionEntity1774500001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."competitions_visibility_enum" AS ENUM('public', 'private')
    `);

    await queryRunner.query(`
      CREATE TABLE "competitions" (
        "id"                  uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "title"               character varying NOT NULL,
        "description"         text              NOT NULL,
        "start_time"          TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_time"            TIMESTAMP WITH TIME ZONE NOT NULL,
        "prize_pool_stroops"  bigint            NOT NULL DEFAULT 0,
        "max_participants"    integer,
        "visibility"          "public"."competitions_visibility_enum" NOT NULL DEFAULT 'public',
        "invite_code"         character varying,
        "creator_id"          uuid,
        "created_at"          TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_at"          TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_competitions_invite_code" UNIQUE ("invite_code"),
        CONSTRAINT "PK_competitions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_competitions_visibility" ON "competitions" ("visibility")
    `);

    await queryRunner.query(`
      ALTER TABLE "competitions"
        ADD CONSTRAINT "FK_competitions_creator"
        FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "competitions" DROP CONSTRAINT "FK_competitions_creator"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_competitions_visibility"`);
    await queryRunner.query(`DROP TABLE "competitions"`);
    await queryRunner.query(
      `DROP TYPE "public"."competitions_visibility_enum"`,
    );
  }
}
