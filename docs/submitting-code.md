# Submitting code

If you find that the existing Fluid functions and the functions provided in this package are not adequate to
representing a solution or setting, you may need to add new functions to this package.

Best practice is to add these under the `src/js` directory in this package, and to use a namespace that corresponds
to the directory containing the options files that use the function.  If we are creating a function that might be used from
any Windows program, we might use the base namespace `gpii.solutions.windows`, and create a function called
`gpii.solutions.windows.myHelpfulFunction`.

We might also make something specific to a particular solutions.  For example, in the
[options files documentation](./submitting-code.md), We talked about creating the file
`data/gpii/solutions/windows/myHelpfulProgram/v20.json`.  If we needed a custom function for version 20 (and
presumably beyond), we can use the `data.gpii.solutions.windows.myHelpfulProgram` namespace, as in the following
example:

```
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.registerNamespace("data.gpii.solutions.windows.myHelpfulProgram");

/**
 * Your function should be properly documented, and not just copy this.
 *
 * @param {Object} that - The component grade itself.
 * @param {String} input1 - A string representing something really important.
 * @param {Array} input2 - An array of strings representing something else really important
 */
data.gpii.solutions.windows.myHelpfulProgram.myHelpfulFunction = function (that, input1, input2) {
    // Actually do something with this when you write your real code.
};

```
Note that the previous example included documentation in [JSDoc format](http://usejsdoc.org/).  Your code is unlikely to
be accepted without at least minimal documentation of this kind.  Note also the trailing space, "use strict", and
trailing semicolons.  We use [a common and agreed-upon set of](https://www.npmjs.com/package/eslint-config-fluid)
[ESLint](http://eslint.org/) rules.  Your code is unlikely to be accepted if it does not pass the lint checks built
into this package.  You can check your work at any time by running `grunt lint` from the root of the repository.

So, now that we have code, we need to choose where to save it.  The filename and path need to be unique, but do not need
to follow the same strict folder structure of settings and solutions.  For example, we might simply save the above to
`src/js/myHelpfulProgram.js`.

Once the new code is saved to a file, make sure that it is required from `src/js/registry.js`.  Once you have done this,
you should be able to refer to your new function from within an [options file](./options-files.md).

# Tests

For a new function to be accepted as part of a pull review, you should assume that it needs to be tested as far as is
reasonably possible.  All of our code is tested for code coverage using [Istanbul](https://github.com/gotwarlost/istanbul),
and anything less than 90% coverage is generally only accepted after careful discussion.  At a minimum, you are
expected to add unit tests, preferably written using
[jqUnit](http://docs.fluidproject.org/infusion/development/jqUnit.html), which is used widely within the GPII community.
These tests should be required from `tests/core.js`, to ensure that they are run on all platforms.

If your function interacts deeply with a particular operating system, you may also need to create platform-specific
tests and require them from the relevant platform, for example, `tests/windows.js`.