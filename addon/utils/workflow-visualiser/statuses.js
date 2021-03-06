/**
 * Exports values and functions related to workflow execution status.
 *
 * @module utils/workflow-visualiser/statuses
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const taskUnknownStatus = 'unknown';
export const taskStatuses = [
  'pending',
  'active',
  'aborting',
  'cancelled',
  'skipped',
  'finished',
  'failed',
  taskUnknownStatus,
];

export function normalizeTaskStatus(status) {
  return taskStatuses.includes(status) ? status : taskUnknownStatus;
}

export function translateTaskStatus(i18n, status) {
  const normalizedStatus = normalizeTaskStatus(status);
  return i18n.t(`utils.workflowVisualiser.statuses.task.${normalizedStatus}`);
}

const workflowUnknownStatus = 'unknown';
export const workflowStatuses = [
  'scheduled',
  'preparing',
  'enqueued',
  'active',
  'aborting',
  'cancelled',
  'skipped',
  'finished',
  'failed',
  workflowUnknownStatus,
];

export const workflowEndedStatuses = [
  'cancelled',
  'skipped',
  'finished',
  'failed',
];

export function normalizeWorkflowStatus(status) {
  return workflowStatuses.includes(status) ? status : workflowUnknownStatus;
}

export function translateWorkflowStatus(i18n, status) {
  const normalizedStatus = normalizeWorkflowStatus(status);
  return i18n.t(`utils.workflowVisualiser.statuses.workflow.${normalizedStatus}`);
}
