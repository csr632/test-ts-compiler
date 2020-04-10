import { createFilter, extractAssignedNames } from '@rollup/pluginutils'
import type { Plugin } from 'rollup'
import * as rollup from 'rollup'
import * as assert from 'assert'

declare let var1: Plugin

createFilter('xxx', 'yyy')

(rollup)

assert.equal(true, true)

extractAssignedNames(1 as any)