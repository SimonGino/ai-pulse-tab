import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getOrgCardSectionContainerClassName,
  getOrgCardSectionContentMarginTop,
} from '../components/provider-card-layout.ts';

test('org card sections use one spacing mechanism between sections', () => {
  assert.equal(getOrgCardSectionContainerClassName(), 'flex flex-col');
  assert.equal(getOrgCardSectionContentMarginTop(0), 0);
  assert.equal(getOrgCardSectionContentMarginTop(1), '12px');
});
