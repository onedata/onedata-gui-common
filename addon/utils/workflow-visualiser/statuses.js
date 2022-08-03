/**
 * Exports values and functions related to workflow execution status.
 *
 * @module utils/workflow-visualiser/statuses
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const taskEndedStatuses = [
  'interrupted',
  'cancelled',
  'skipped',
  'finished',
  'failed',
];
const taskUnknownStatus = 'unknown';
export const taskStatuses = [
  'pending',
  'active',
  'aborting',
  ...taskEndedStatuses,
  taskUnknownStatus,
];

export function normalizeTaskStatus(status) {
  return taskStatuses.includes(status) ? status : taskUnknownStatus;
}

export function translateTaskStatus(i18n, status) {
  const normalizedStatus = normalizeTaskStatus(status);
  return i18n.t(`utils.workflowVisualiser.statuses.task.${normalizedStatus}`);
}

export const laneEndedStatuses = [
  'interrupted',
  'cancelled',
  'skipped',
  'finished',
  'failed',
];
const laneUnknownStatus = 'unknown';
export const laneStatuses = [
  'pending',
  'scheduled',
  'preparing',
  'enqueued',
  'active',
  'aborting',
  ...laneEndedStatuses,
  laneUnknownStatus,
];

export function normalizeLaneStatus(status) {
  return laneStatuses.includes(status) ? status : laneUnknownStatus;
}

export function translateLaneStatus(i18n, status) {
  const normalizedStatus = normalizeLaneStatus(status);
  return i18n.t(`utils.workflowVisualiser.statuses.lane.${normalizedStatus}`);
}

export const workflowEndedStatuses = [
  'interrupted',
  'cancelled',
  'skipped',
  'finished',
  'failed',
];
const workflowUnknownStatus = 'unknown';
export const workflowStatuses = [
  'scheduled',
  'preparing',
  'enqueued',
  'active',
  'aborting',
  ...workflowEndedStatuses,
  workflowUnknownStatus,
];

export function normalizeWorkflowStatus(status) {
  return workflowStatuses.includes(status) ? status : workflowUnknownStatus;
}

export function translateWorkflowStatus(i18n, status) {
  const normalizedStatus = normalizeWorkflowStatus(status);
  return i18n.t(`utils.workflowVisualiser.statuses.workflow.${normalizedStatus}`);
}
