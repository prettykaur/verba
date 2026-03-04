-- ===========================================
-- Script: 00054_clear_enumeration_and_answer_display.sql
-- Author: Pretty Kaur
-- Date: 2026-03-04
-- Purpose:
-- - One-time cleanup after removing enumeration-based display formatting
-- - Clear enumeration + answer_display values so stored rows match the new UI behaviour
-- - NOTE: Do not re-run unless you intend to wipe these columns
-- ===========================================

update clue_occurrence
set
  answer_display = null,
  enumeration = null,
  enumeration_source = 'derived'
where answer_display is not null
   or enumeration is not null;