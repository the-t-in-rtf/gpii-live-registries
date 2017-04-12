# The GPII Live Registries

This repository houses the fine-grained configuration data that powers [the GPII](http://gpii.net/).  The configuration
data in this package describes:

1. Solutions that are available to address people's needs and preferences.
2. The context in which each solution is available.
3. How to tell if the solution is installed and running.
4. How to launch each solution.
5. The particular settings each solution supports.
6. How to configure each solution's settings.
7. How each setting relates to a general need or preference.

The GPII Live Registries package is not intended for end users to contribute to.  Its core is a series of
[JSON](http://json.org/) text files that are digested, filtered, and used directly within the GPII.  These files
follow [a precise format](./docs/options-files.md) and must be carefully tested to ensure that:

 1. The GPII itself continues to function when the settings are used.
 2. The described solutions and settings can actually be controlled by the GPII.

Contributors are expected to understand:

1. How to collect settings information about solutions (for example, by looking through the Windows Registry).
2. How to represent information about solutions and settings in [our supported JSON format](./docs/options-files.md).
3. How to test their work both manually, and [with automated tests](./docs/running-tests.md).
4. How to submit information for review via a development workflow (and how to respond to review feedback).

In most cases, contributors will be developers or other highly technical staff (for example, QA engineers or power AT
users).  For more details about the requirements and the process of contributing, see the
["Getting Started"](./docs/getting-started.md) page.

# End user contributions

There are other key systems that end users are encouraged to contribute to.  The
[Unified Listing](http://ul.gpii.net) contains descriptive information about solutions and the needs and preferences
they address.

The [Preference Terms Dictionary](http://terms.gpii.net/)
provides a kind of thesaurus to help in understanding how a given need or preference can be expressed in many
different contexts.

Both of these systems are open for anyone to contribute, and require much less technical knowledge.  Anyone who has
used AT and who is comfortable describing it in text entered into a web form is welcome to contribute.

The process of reviewing changes to the Live Solutions Registry also involves checking solutions data against the
Unified Listing and settings data against the Preference Terms Dictionary to ensure that:

1. We are consistent in talking about the same solution or setting across all systems.
2. Descriptive human-readable information is available regarding each solution and setting used within the GPII.