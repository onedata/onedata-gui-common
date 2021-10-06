const pending = 'Pending';
const scheduled = 'Scheduled';
const preparing = 'Preparing';
const enqueued = 'Enqueued';
const active = 'Active';
const aborting = 'Aborting';
const interrupted = 'Interrupted';
const cancelled = 'Cancelled';
const skipped = 'Skipped';
const finished = 'Finished';
const failed = 'Failed';
const unknown = 'Unknown';

export default {
  task: {
    pending,
    active,
    aborting,
    cancelled,
    skipped,
    finished,
    failed,
    unknown,
  },
  lane: {
    pending,
    scheduled,
    preparing,
    enqueued,
    active,
    aborting,
    interrupted,
    cancelled,
    skipped,
    finished,
    failed,
    unknown,
  },
  workflow: {
    scheduled,
    preparing,
    enqueued,
    active,
    aborting,
    cancelled,
    skipped,
    finished,
    failed,
    unknown,
  },
};
