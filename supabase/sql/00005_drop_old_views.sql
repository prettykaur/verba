-- ===========================================
-- Script: 00005_drop_old_views.sql
-- Author: Pretty Kaur
-- Date: 2025-10-16
-- Purpose: Cleanup deprecated or conflicting SQL views.
--           - Drops v_search_results and related outdated views
--           - Prepares for the new hybrid slug and display upgrades
-- ===========================================

drop view if exists v_search_results_pretty cascade;
drop view if exists v_search_results cascade;
