import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { get } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Service | url action runner', function () {
  setupTest();

  it('has empty actionRunners map on init', function () {
    const service = this.owner.lookup('service:url-action-runner');
    expect(get(service, 'actionRunners')).to.be.empty;
  });

  it('allows to register and obtain registered action runner', function () {
    const service = this.owner.lookup('service:url-action-runner');
    const runner = () => {};

    service.registerActionRunner('myAction', runner);

    expect(service.getActionRunner('myAction')).to.equal(runner);
  });

  it('allows to register and then deregister action runner', function () {
    const service = this.owner.lookup('service:url-action-runner');
    const runner = () => {};

    service.registerActionRunner('myAction', runner);
    service.deregisterActionRunner('myAction');

    expect(service.getActionRunner('myAction')).to.be.undefined;
  });

  it('remembers only the last registered runner for specific action', function () {
    const service = this.owner.lookup('service:url-action-runner');
    const runner1 = () => {};
    const runner2 = () => {};

    service.registerActionRunner('myAction', runner1);
    service.registerActionRunner('myAction', runner2);

    expect(service.getActionRunner('myAction')).to.equal(runner2);
  });

  it('runs an action according to passed Transition object', function () {
    const service = this.owner.lookup('service:url-action-runner');
    const transition = {
      to: {
        queryParams: {
          action_name: 'myAction',
        },
      },
    };
    const runner = sinon.stub().resolves('someResult');

    service.registerActionRunner('myAction', runner);

    return service.runFromTransition(transition)
      .then(result => {
        expect(result).to.equal('someResult');
        expect(runner).to.be.calledOnce.and.to.be.calledWith(transition.to.queryParams);
      });
  });

  [
    'randomName',
    '',
    null,
  ].forEach(actionName => {
    it(
      `runs an "empty" action according to Transition object, when no runner was found for given action name ${JSON.stringify(actionName)}`,
      function () {
        const service = this.owner.lookup('service:url-action-runner');
        const transition = {
          to: {
            queryParams: {
              action_name: actionName,
            },
          },
        };
        const runner = sinon.stub().resolves('someResult');

        service.registerActionRunner('myAction', runner);

        return service.runFromTransition(transition)
          .then(result => {
            expect(result).to.be.undefined;
            expect(runner).to.not.be.called;
          });
      }
    );
  });
});
