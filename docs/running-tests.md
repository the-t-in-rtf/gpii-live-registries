# Running Tests

To run the tests in this package, you will first need to install the [software prerequisites](./software-prerequisites.md).

# Running the tests in Vagrant

The tests in this package are intended to be run on a machine which has the GPII autopersonalisation system installed
and configured.  The preferred way to do this is to run the tests in a standard VM container.

To launch the virtual machine:

1. Navigate to the working directory in which you have checked out this repository.
2. Run the command `vagrant up` to create the virtual machine.

Assuming the above completes successfully, you can run the tests in the VM using the command `vagrant ci test`.

## Running the tests locally

If your machine is running the autopersonalisation system, you can run the tests in this package using the command
`npm test`.

Please note, testing changes locally is not sufficient to prepare for a pull request.  Your work will
ultimately be tested in our Continous Integration environment using the Vagrant plugin mentioned above.  You will save
your reviewer time by testing with Vagrant at least once before submitting your pull request.

# So, what do the tests, you know, *test*?

The tests in this package will verify that:

# All [options files](./options-files) are valid.
# The GPII will start and stop and operate as expected with the updated data.