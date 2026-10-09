-- ============================================================================
-- HUY TECHNOLOGY AI GROUP - MASTER PROMPT V2.0
-- AI HR & WORKFORCE LIFECYCLE MANAGEMENT DATABASE SCHEMA
-- Target Engine: Supabase / PostgreSQL 15+
-- ============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    color VARCHAR(32) DEFAULT '#4F46E5',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(64) PRIMARY KEY, -- emp_01 to emp_63
    code VARCHAR(64) NOT NULL, -- L1-CSAO, HR-LEAD, etc.
    display_name VARCHAR(100) NOT NULL, -- Exact 2-word Vietnamese Name
    department_id VARCHAR(64) REFERENCES departments(id),
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 11 lifecycle statuses
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agent Profiles Table
CREATE TABLE IF NOT EXISTS agent_profiles (
    agent_id VARCHAR(64) PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
    persona_gender VARCHAR(16) NOT NULL CHECK (persona_gender IN ('Nam', 'Nữ')),
    age INT DEFAULT 30,
    job_title VARCHAR(255) NOT NULL,
    job_title_short VARCHAR(100) NOT NULL,
    description TEXT,
    personality_traits JSONB DEFAULT '[]'::jsonb,
    workspace_path VARCHAR(255),
    system_model VARCHAR(100) DEFAULT 'gemini-2.5-pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Agent Avatar Assets Table
CREATE TABLE IF NOT EXISTS agent_avatar_assets (
    id VARCHAR(64) PRIMARY KEY,
    agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
    avatar_url VARCHAR(512) NOT NULL,
    avatar_gender VARCHAR(16) NOT NULL CHECK (avatar_gender IN ('Nam', 'Nữ')),
    is_exclusive BOOLEAN DEFAULT TRUE,
    image_hash VARCHAR(128),
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Agent Identity Verifications Table
CREATE TABLE IF NOT EXISTS agent_identity_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
    identity_verified BOOLEAN DEFAULT TRUE,
    avatar_verified BOOLEAN DEFAULT TRUE,
    verified_by VARCHAR(64) DEFAULT 'emp_60', -- Mai Hoa / Admin
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    verification_notes TEXT
);

-- 6. Agent Performance Reviews Table (Hữu Phúc - emp_61)
CREATE TABLE IF NOT EXISTS agent_performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
    evaluator_id VARCHAR(64) DEFAULT 'emp_61',
    quality_score NUMERIC(5,2) NOT NULL, -- Weight 35%
    completion_score NUMERIC(5,2) NOT NULL, -- Weight 20%
    compliance_score NUMERIC(5,2) NOT NULL, -- Weight 20%
    resource_score NUMERIC(5,2) NOT NULL, -- Weight 15%
    speed_score NUMERIC(5,2) NOT NULL, -- Weight 10%
    overall_score NUMERIC(5,2) NOT NULL,
    kpi_band VARCHAR(32) NOT NULL, -- EXCELLENT, GOOD, AVERAGE, UNDERPERFORMING
    review_period VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HR Recruitment Requests Table (Mai Hoa - emp_60)
CREATE TABLE IF NOT EXISTS hr_recruitment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id VARCHAR(64) NOT NULL,
    department_id VARCHAR(64) REFERENCES departments(id),
    target_role VARCHAR(255) NOT NULL,
    justification TEXT NOT NULL,
    priority VARCHAR(32) DEFAULT 'MEDIUM',
    status VARCHAR(32) DEFAULT 'pending_approval',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HR Candidates Table
CREATE TABLE IF NOT EXISTS hr_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruitment_request_id UUID REFERENCES hr_recruitment_requests(id),
    proposed_code VARCHAR(64) NOT NULL,
    proposed_name VARCHAR(100) NOT NULL,
    proposed_gender VARCHAR(16) NOT NULL CHECK (proposed_gender IN ('Nam', 'Nữ')),
    model_family VARCHAR(100) NOT NULL,
    status VARCHAR(32) DEFAULT 'candidate', -- candidate -> screening -> sandbox_testing -> pending_approval
    benchmark_score NUMERIC(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Agent Probation Table
CREATE TABLE IF NOT EXISTS agent_probation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    evaluator_id VARCHAR(64) DEFAULT 'emp_60',
    tasks_assigned INT DEFAULT 0,
    tasks_passed INT DEFAULT 0,
    probation_status VARCHAR(32) DEFAULT 'in_progress', -- in_progress, passed, failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Agent Incidents Table (14 Hard Rules - Thiên Ân emp_57 & Kiều Oanh emp_62)
CREATE TABLE IF NOT EXISTS agent_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
    rule_id VARCHAR(32) NOT NULL, -- HR-RULE-01 to HR-RULE-14
    severity VARCHAR(32) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    action_taken VARCHAR(64) NOT NULL CHECK (action_taken IN ('WARNING', 'IMPROVEMENT_PLAN', 'REVOKE_PERMISSIONS', 'QUARANTINE')),
    description TEXT NOT NULL,
    evidence_hash VARCHAR(128),
    reported_by VARCHAR(64) DEFAULT 'emp_57',
    status VARCHAR(32) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 11. Agent Improvement Plans Table (Hữu Phúc - emp_61)
CREATE TABLE IF NOT EXISTS agent_improvement_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES agent_incidents(id),
    plan_details TEXT NOT NULL,
    target_kpi NUMERIC(5,2) NOT NULL DEFAULT 80.0,
    assigned_mentor_id VARCHAR(64) DEFAULT 'emp_61',
    status VARCHAR(32) DEFAULT 'active', -- active, completed, failed
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Agent Offboarding Requests Table (11 Steps Offboarding)
CREATE TABLE IF NOT EXISTS agent_offboarding_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    requested_by VARCHAR(64) DEFAULT 'emp_60',
    current_step INT DEFAULT 1, -- 1 to 11
    handover_agent_id VARCHAR(64) REFERENCES agents(id),
    tokens_revoked BOOLEAN DEFAULT FALSE,
    archived_snapshot_url VARCHAR(512),
    human_approved BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CANCELLED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 13. Agent Lifecycle Events Table
CREATE TABLE IF NOT EXISTS agent_lifecycle_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
    from_status VARCHAR(32) NOT NULL,
    to_status VARCHAR(32) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    evidence_hash VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. HR Approval Requests Table (Human Gate)
CREATE TABLE IF NOT EXISTS hr_approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_type VARCHAR(64) NOT NULL, -- RECRUITMENT, AVATAR_CHANGE, OFFBOARDING, QUARANTINE_RELEASE
    target_id VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by VARCHAR(100),
    approved_at TIMESTAMPTZ,
    decision_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Audit Logs Table (Gia Linh - emp_63 Immutable Chain of Custody)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_id BIGSERIAL,
    event_type VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    target_entity VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    evidence_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agent_incidents_status ON agent_incidents(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
