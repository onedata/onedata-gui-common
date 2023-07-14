import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { lookupService } from '../../helpers/stub-service';
import {
  normalizeEntriesPage,
  normalizeEntry,
  EntrySource,
  defaultEntrySource,
  normalizeEntrySource,
  EntrySeverity,
  defaultEntrySeverity,
  normalizeEntrySeverity,
  translateEntrySeverity,
} from 'onedata-gui-common/utils/audit-log';

const sampleNormalizeContent = (content) => Number(content);

describe('Unit | Utility | audit-log', function () {
  setupTest();

  describe('normalizeEntriesPage', function () {
    it('returns normalized non-last page when page is valid', function () {
      expect(normalizeEntriesPage({
        logEntries: [{
          index: 'abc',
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: '123',
        }, {
          index: 'def',
          timestamp: 456,
          source: 'user',
          severity: 'error',
          content: '456',
        }],
        isLast: false,
      }, sampleNormalizeContent)).to.deep.equal({
        logEntries: [{
          index: 'abc',
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: 123,
        }, {
          index: 'def',
          timestamp: 456,
          source: 'user',
          severity: 'error',
          // normalization is not performed for user logs
          content: '456',
        }],
        isLast: false,
      });
    });

    it('returns normalized last page when page is valid', function () {
      expect(normalizeEntriesPage({
        logEntries: [{
          index: 'abc',
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: '123',
        }],
        isLast: true,
      }, sampleNormalizeContent)).to.deep.equal({
        logEntries: [{
          index: 'abc',
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: 123,
        }],
        isLast: true,
      });
    });

    it('returns normalized page when page is partially invalid', function () {
      expect(normalizeEntriesPage({
        logEntries: [{
          index: 'abc',
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: '123',
        }, {
          index: 'def',
          // no timestamp - error
          source: 'user',
          severity: 'error',
          content: '456',
        }],
        isLast: false,
      }, sampleNormalizeContent)).to.deep.equal({
        logEntries: [{
          index: 'abc',
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: 123,
        }],
        isLast: false,
      });
    });

    it('returns empty page when page is completely invalid', function () {
      expect(normalizeEntriesPage({
        logEntries: [{
          // no index - error
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: '123',
        }, {
          index: 'def',
          // no timestamp - error
          source: 'user',
          severity: 'error',
          content: '456',
        }],
        isLast: false,
      }, sampleNormalizeContent)).to.deep.equal({
        logEntries: [],
        isLast: true,
      });
    });

    it('returns normalized last page when "isLast" is not present', function () {
      expect(normalizeEntriesPage({
        logEntries: [{
          index: 'abc',
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: '123',
        }],
      }, sampleNormalizeContent)).to.deep.equal({
        logEntries: [{
          index: 'abc',
          timestamp: 123,
          source: 'system',
          severity: 'warning',
          content: 123,
        }],
        isLast: true,
      });
    });

    it('returns empty last page when "logEntries" is not present', function () {
      expect(normalizeEntriesPage({
        isLast: false,
      }, sampleNormalizeContent)).to.deep.equal({
        logEntries: [],
        isLast: true,
      });
    });

    it('returns empty last page when page is empty', function () {
      expect(normalizeEntriesPage(null, sampleNormalizeContent)).to.deep.equal({
        logEntries: [],
        isLast: true,
      });
    });
  });

  describe('normalizeEntry', function () {
    it('returns normalized entry when entry is valid', function () {
      const entry = {
        index: 'abc',
        timestamp: 123,
        source: 'system',
        severity: 'warning',
        content: '123',
      };

      expect(normalizeEntry(entry, sampleNormalizeContent)).to.deep.equal({
        index: 'abc',
        timestamp: 123,
        source: 'system',
        severity: 'warning',
        content: 123,
      });
    });

    it('returns normalized entry when entry lacks of source and severity', function () {
      const entry = {
        index: 'abc',
        timestamp: 123,
        content: '123',
      };

      expect(normalizeEntry(entry, sampleNormalizeContent)).to.deep.equal({
        index: 'abc',
        timestamp: 123,
        source: defaultEntrySource,
        severity: defaultEntrySeverity,
        content: 123,
      });
    });

    it('returns null when entry lacks of index', function () {
      const entry = {
        timestamp: 123,
        source: 'system',
        severity: 'warning',
        content: '123',
      };

      expect(normalizeEntry(entry, sampleNormalizeContent)).to.be.null;
    });

    it('returns null when entry lacks of timestamp', function () {
      const entry = {
        index: 'abc',
        source: 'system',
        severity: 'warning',
        content: '123',
      };

      expect(normalizeEntry(entry, sampleNormalizeContent)).to.be.null;
    });

    it('returns null when entry is empty', function () {
      expect(normalizeEntry(null, sampleNormalizeContent)).to.be.null;
    });
  });

  describe('normalizeEntrySource', function () {
    it('returns the same source when source is valid', function () {
      Object.values(EntrySource).forEach((source) =>
        expect(normalizeEntrySource(source)).to.equal(source)
      );
    });

    it('returns the same source when source is the default one', function () {
      expect(normalizeEntrySource(defaultEntrySource))
        .to.equal(defaultEntrySource);
    });

    it('returns the default source when source is empty', function () {
      expect(normalizeEntrySource(undefined)).to.equal(defaultEntrySource);
    });

    it('returns the default source when source is invalid', function () {
      expect(normalizeEntrySource('abcd')).to.equal(defaultEntrySource);
    });
  });

  describe('normalizeEntrySeverity', function () {
    it('returns the same severity when severity is valid', function () {
      Object.values(EntrySeverity).forEach((severity) =>
        expect(normalizeEntrySeverity(severity)).to.equal(severity)
      );
    });

    it('returns the same severity when severity is the default one', function () {
      expect(normalizeEntrySeverity(defaultEntrySeverity))
        .to.equal(defaultEntrySeverity);
    });

    it('returns the default severity when severity is empty', function () {
      expect(normalizeEntrySeverity(undefined)).to.equal(defaultEntrySeverity);
    });

    it('returns the default severity when severity is invalid', function () {
      expect(normalizeEntrySeverity('abcd')).to.equal(defaultEntrySeverity);
    });
  });

  describe('translateEntrySeverity', function () {
    itTranslatesSeverity(EntrySeverity.Debug, 'Debug');
    itTranslatesSeverity(EntrySeverity.Info, 'Info');
    itTranslatesSeverity(EntrySeverity.Notice, 'Notice');
    itTranslatesSeverity(EntrySeverity.Warning, 'Warning');
    itTranslatesSeverity(EntrySeverity.Error, 'Error');
    itTranslatesSeverity(EntrySeverity.Critical, 'Critical');
    itTranslatesSeverity(EntrySeverity.Alert, 'Alert');
    itTranslatesSeverity(EntrySeverity.Emergency, 'Emergency');
  });
});

function itTranslatesSeverity(severity, translatedSeverity) {
  it(`translates severity "${severity}" as "${translatedSeverity}"`, function () {
    const result = translateEntrySeverity(lookupService(this, 'i18n'), severity);
    expect(String(result)).to.equal(translatedSeverity);
  });
}
