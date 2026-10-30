'''
Revision ID: 20231030_add_constraints
Revises: 
Create Date: 2026-10-30 07:48:00.000000
'''

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20231030_add_constraints'
 down_revision = None
 branch_labels = None
 depends_on = None

def upgrade():
    # Add verification_rationale column to claims (nullable Text)
    op.add_column('claims', sa.Column('verification_rationale', sa.Text(), nullable=True))
    # Create unique index on sources (investigation_id, provider, url)
    op.create_unique_constraint('uq_source_investigation_provider_url', 'sources', ['investigation_id', 'provider', 'url'])

def downgrade():
    # Drop unique constraint
    op.drop_constraint('uq_source_investigation_provider_url', 'sources', type_='unique')
    # Drop verification_rationale column
    op.drop_column('claims', 'verification_rationale')
