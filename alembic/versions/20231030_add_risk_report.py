'''
Revision ID: 20231030_add_risk_report
Revises: 20231030_add_constraints
Create Date: 2026-10-30 08:00:00.000000
'''

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20231030_add_risk_report'
 down_revision = '20231030_add_constraints'
 branch_labels = None
 depends_on = None

def upgrade():
    # Add nullable text column to store JSON risk report
    op.add_column('investigations', sa.Column('risk_report', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('investigations', 'risk_report')
