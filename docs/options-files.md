General background

The `data/gpii` directory in this repository contains a subdirectory for `solutions` and another for `settings`.  Within
each directory is a hierarchy of subdirectories that ultimately contain one or more [JSON](http://json.org/) files.

For example, the `solutions` directory is generally divided by platform, then solution, and then by distinct version, as
in `data/gpii/solutions/windows/jaws/base.json` and `data/gpii/solutions/windows/jaws/v17.json`.

Each of these files corresponds directly to the options used in defining a Fluid
[component grade](http://docs.fluidproject.org/infusion/development/ComponentGrades.html).

Let's say for example that you want to add information about a new Windows program call "My Helpful Program".
You might create a new and unique directory, `data/gpii/solutions/windows/myHelpfulProgram`, and create a file
there called `base.json` that looks something like:

```
{
    gradeNames: ["gpii.solutions.windows.base"],
    // TODO: Flesh this out with meaningful examples
}
```

Note that we extended `gpii.solutions.windows.base`, which provides much of the common scaffolding used later in our
grade.  If we were working with a linux program, we might extend `gpii.solutions.linux.base`.  See below for details on
all of the platform-specific base grades.

When this definition is actually used, the options payload will be used to configure a new grade, based on the filename
and the location of the file in the directory hierarchy.  The net effect as the same as the following Javascript:

```
fluid.defaults("gpii.solutions.windows.myHelpfulProgram.base", {
    // Options from above example, omitted for brevity.
});
```

This convention, storing every grade in a single named file ensures that every grade has a completely unique namespace.

# Extending an existing options file

So, in the previous example, we created a new solution and added a `base.json`.  Why use this convention?  Because
we want to be able to "extend" an existing solution, for example, to indicate differences in the next version or in a
different "edition" ("enterprise" vs. "home", for example).  Let's say that version 2.0 of "My Helpful Program" is
released, and that it contains a new setting.  We might create the file
`data/gpii/solutions/windows/myHelpfulProgram/v20.json`, which might look like:

```
{
    gradeNames: ["gpii.solutions.windows.myHelpfulProgram.base"],
    // TODO: Different options
}
```

Our new `gpii.solutions.windows.myHelpfulProgram.v20` grade supports all of the previous options, but now supports a new
setting.  This mechanism makes it easier to add support for new versions without duplicating any unnecessary options
from previous versions.  Only the information that has changed needs to be entered or overridden.

# Solutions

Describe a solution document

## `gpii.solutions.base`

## `gpii.solutions.windows.base`

## `gpii.solutions.linux.base`

## `gpii.solutions.android.base`

## `gpii.solutions.web.base`

# Settings

Describe a setting document

Describe any "base" grades that can be meaningfully extended.

# What if your grade requires custom code?

In some cases, new functionality can be written into a grade in a purely declarative fashion, as demonstrated above.
Those examples use code that's already available in this package.  If you need to use new libraries or your own custom
functions, you will need to add it to the source in this directory, and then reference it declaratively from within
your options file.  See [submitting code](./submitting-code.js) for more information.
