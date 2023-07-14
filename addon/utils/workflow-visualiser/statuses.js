/**
 * Exports values and functions related to workflow execution status.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {
 * 'pending' |
 * 'resuming' |
 * 'active' |
 * 'stopping' |
 * 'interrupted' |
 * 'paused' |
 * 'cancelled' |
 * 'skipped' |
 * 'finished' |
 * 'failed' |
 * 'unscheduled' |
 * 'unknown'
 * } AtmTaskExecutionStatus
 * Status `unscheduled` does not exist in backend API and is only to mark tasks
 * which won't be created due to workflow stop.
 */

export const taskEndedStatuses = [
  'cancelled',
  'skipped',
  'finished',
  'failed',
];
export const taskSuspendedStatuses = [
  'paused',
  'interrupted',
];
const taskUnknownStatus = 'unknown';
export const taskStatuses = [
  'pending',
  'resuming',
  'active',
  'stopping',
  'unscheduled',
  ...taskSuspendedStatuses,
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

/**
 * @typedef {
 * 'pending' |
 * 'resuming' |
 * 'scheduled' |
 * 'preparing' |
 * 'enqueued' |
 * 'active' |
 * 'stopping' |
 * 'interrupted' |
 * 'paused' |
 * 'cancelled' |
 * 'skipped' |
 * 'finished' |
 * 'failed' |
 * 'crashed' |
 * 'unscheduled' |
 * 'unknown'
 * } AtmLaneExecutionStatus
 * Status `unscheduled` does not exist in backend API and is only to mark lanes
 * which won't be created due to workflow stop.
 */

export const laneEndedStatuses = [
  'cancelled',
  'skipped',
  'finished',
  'failed',
  'crashed',
];
export const laneSuspendedStatuses = [
  'paused',
  'interrupted',
];
const laneUnknownStatus = 'unknown';
export const laneStatuses = [
  'pending',
  'resuming',
  'scheduled',
  'preparing',
  'enqueued',
  'active',
  'stopping',
  'unscheduled',
  ...laneSuspendedStatuses,
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

/**
 * @typedef {
 * 'scheduled' |
 * 'resuming' |
 * 'active' |
 * 'stopping' |
 * 'interrupted' |
 * 'paused' |
 * 'cancelled' |
 * 'finished' |
 * 'failed' |
 * 'crashed' |
 * 'unknown'
 * } AtmWorkflowExecutionStatus
 */

export const workflowEndedStatuses = [
  'cancelled',
  'finished',
  'failed',
  'crashed',
];
export const workflowSuspendedStatuses = [
  'paused',
  'interrupted',
];
const workflowUnknownStatus = 'unknown';
export const workflowStatuses = [
  'scheduled',
  'resuming',
  'active',
  'stopping',
  ...workflowSuspendedStatuses,
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

/**
 * @typedef {'waiting'|'ongoing'|'ended'|'suspended'} AtmWorkflowExecutionPhase
 */

/**
 * @type {Object<string, AtmWorkflowExecutionPhase>}
 */
export const AtmWorkflowExecutionPhase = Object.freeze({
  Waiting: 'waiting',
  Ongoing: 'ongoing',
  Ended: 'ended',
  Suspended: 'suspended',
});

/**
 * @type {Array<AtmWorkflowExecutionPhase>}
 */
export const atmWorkflowExecutionPhases = Object.freeze([
  AtmWorkflowExecutionPhase.Waiting,
  AtmWorkflowExecutionPhase.Ongoing,
  AtmWorkflowExecutionPhase.Ended,
  AtmWorkflowExecutionPhase.Suspended,
]);

/**
 * @param {Ember.Service} i18n
 * @param {AtmWorkflowExecutionPhase} phase
 * @returns {SafeString}
 */
export function translateAtmWorkflowExecutionPhase(i18n, phase) {
  return i18n.t(`utils.workflowVisualiser.statuses.phase.${phase}`);
}
