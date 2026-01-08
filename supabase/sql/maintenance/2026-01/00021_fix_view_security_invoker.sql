-- ===========================================
-- Script: 00021_fix_view_security_invoker.sql
-- Author: Pretty Kaur
-- Date: 2026-01-06
-- Purpose:
--   - Explicitly mark views as SECURITY INVOKER
--   - Satisfy Supabase Security Advisor
--   - No ownership changes (safe)
-- ===========================================

alter view public.v_search_results
  set (security_invoker = true);

alter view public.v_search_results_pretty
  set (security_invoker = true);

alter view public.v_word_usage
  set (security_invoker = true);
