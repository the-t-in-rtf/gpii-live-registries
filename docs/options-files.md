General background

The `data/gpii` directory in this repository contains a subdirectory for `solutions` and another for `settings`.  Within
each directory is a collection of [JSON](http://json.org/) and [JSON5](http://json5.org/) files.

Each of these files corresponds directly to the options used in defining a Fluid
[component grade](http://docs.fluidproject.org/infusion/development/ComponentGrades.html).

Let's say for example that you want to add information about a new Windows program call "My Helpful Program".
You might create a file like `data/gpii/solutions/gpii.solutions.windows.myHelpfulProgram.json` that looks something
like:

```
{
    gradeNames: ["gpii.solutions.windows"],
    // TODO: Flesh this out with meaningful examples
}
```

Note that we extended `gpii.solutions.windows`, which provides much of the common scaffolding used later in our
grade.  If we were working with a linux program, we might extend `gpii.solutions.linux`.  See below for details on
all of the platform-specific base grades.

When this definition is actually used, the options payload will be used to configure a new grade, based on the filename
and the location of the file in the directory hierarchy.  The net effect as the same as the following Javascript:

```
fluid.defaults("gpii.solutions.windows.myHelpfulProgram", {
    // Options from above example, omitted for brevity.
});
```

# Extending an existing options file

So, in the previous example, we created a new solution and added a `base.json`.  Why use this convention?  Because
we want to be able to "extend" an existing solution, for example, to indicate differences in the next version or in a
different "edition" ("enterprise" vs. "home", for example).  Let's say that version 2.0 of "My Helpful Program" is
released, and that it contains a new setting.  We might create the file
`data/gpii/solutions/windows/myHelpfulProgram/v20.json`, which might look like:

```
{
    gradeNames: ["gpii.solutions.windows.myHelpfulProgram"],
    // TODO: Different options
}
```

Our new `gpii.solutions.windows.myHelpfulProgram.v20` grade supports all of the previous options, but now supports a new
setting.  This mechanism makes it easier to add support for new versions without duplicating any unnecessary options
from previous versions.  Only the information that has changed needs to be entered or overridden.

# Solutions

Describe a solution document

## `gpii.solutions`

## `gpii.solutions.windows`

## `gpii.solutions.linux`

## `gpii.solutions.android`

## `gpii.solutions.web`

# Settings

Describe a setting document

Describe any "base" grades that can be meaningfully extended.

# What if your grade requires custom code?

In some cases, new functionality can be written into a grade in a purely declarative fashion, as demonstrated above.
Those examples use code that's already available in this package.  If you need to use new libraries or your own custom
functions, you will need to add it to the source in this directory, and then reference it declaratively from within
your options file.  See [submitting code](./submitting-code.js) for more information.