-- ===========================================
-- Script: 00031_add_clue_slug_md5_uniqueness.sql
-- Author: Pretty Kaur
-- Date: 2026-01-13
-- Purpose:
--   - Defines the true canonical identity of a clue using content hashing.
-- ===========================================

create unique index if not exists clue_slug_md5_key
on clue (slug_md5);
