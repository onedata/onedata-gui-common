const pending = 'Pending';
const resuming = 'Resuming';
const scheduled = 'Scheduled';
const preparing = 'Preparing';
const enqueued = 'Enqueued';
const active = 'Active';
const stopping = 'Stopping';
const interrupted = 'Interrupted';
const paused = 'Paused';
const cancelled = 'Cancelled';
const skipped = 'Skipped';
const finished = 'Finished';
const failed = 'Failed';
const crashed = 'Crashed';
const unknown = 'Unknown';

export default {
  task: {
    pending,
    active,
    stopping,
    interrupted,
    paused,
    cancelled,
    skipped,
    finished,
    failed,
    unknown,
  },
  lane: {
    pending,
    resuming,
    scheduled,
    preparing,
    enqueued,
    active,
    stopping,
    interrupted,
    paused,
    cancelled,
    skipped,
    finished,
    failed,
    crashed,
    unknown,
  },
  workflow: {
    scheduled,
    resuming,
    active,
    stopping,
    interrupted,
    paused,
    cancelled,
    finished,
    failed,
    crashed,
    unknown,
  },
  phase: {
    waiting: 'Waiting',
    ongoing: 'Ongoing',
    ended: 'Ended',
    suspended: 'Suspended',
  },
};
