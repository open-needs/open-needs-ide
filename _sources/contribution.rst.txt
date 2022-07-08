Contribution
============

CI
--
Our CI is based on github actions and located 
`here <https://github.com/open-needs/open-needs-ide/actions>`__.


The CI tests / builds the following elements:

* Documentation (build, deploy)
* VS Code extension (lint, test, build, release)
* Needls (lint, test)


VS Code extension
-----------------
The VS code extension is located under ``/vscode_ext/``.

You should also use Visual Studio Code for the complete extension development.

The repository contains a ``.vscode`` folder, which provides some useful configurations for certain jobs.

Environment preparation
~~~~~~~~~~~~~~~~~~~~~~~

Install the following packages::

    npm install -g vsce
    npm install -g typescript

Inside the folder ``/vscode_ext`` execute::

    npm install


Debugging extension
~~~~~~~~~~~~~~~~~~~
In VS Code use the launch configuration "Launch Extension", which builds the extension and loads an 
addtional VS Code instance (the so called **Extension Host**) with the loaded extension.


The developed extension does **not** show up in the Extension tab on the Extension Host!
It gets activated by opening a **rst** file or by running the command ``Load Open-Needs IDE`` (Strg + Shift + p).
Open the Output log with the name **Open-Needs IDE** to see most important log messages.

On your original VS Code instance you can set breakpoints and take a look into the Output window, on which 
all log messages show up, which are created via ``console.log()`` in the code.

Temporary Env setup for testing
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
During testing the extension, it is helpful to have a clean, prepared, temporary test environment.
These temporary envs can be found under ``/temp-envs`` and get created and loaded automatically.
As they get generated on the fly, they are not part of the repo. So you will see them after your first debugging session was started.

The source/templates for these envs are stored under ``/test-envs``, and these files are part of the repo.

The script ``/test-envs/setup_envs.py`` cares about the creation and configuration of **temporary envs** under ``/temp-envs``.

The folder ``/temp-envs``, or selected env-folder inside it, can be deleted to force a recreation.

Please don't mix ``test-envs`` and ``temp-envs`` and perfomr deletions only on ``temp-envs``.




Test extentsion
~~~~~~~~~~~~~~~
Run ``npm run test`` to run linter and other tests.

To run the linter tests only, execute ``npm run lint``.



Buid extension
~~~~~~~~~~~~~~
::

    vsce package --baseContentUrl https://github.com/open-needs/open-needs-ide --baseImagesUrl https://github.com/open-needs/open-needs-ide


Publishing extension
~~~~~~~~~~~~~~~~~~~~
Publishing the VS code extension is done automatically by CI, when a new tag
gets created.

Locations are:

* https://open-vsx.org (not yet)
* ttps://marketplace.visualstudio.com

For manual publishing, please follow the instructions on
`this VS Code help page <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token>`__.

Set logging level of language server
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Add to ``settings.json``::

    "sphinx-needs-ls.trace.server": "verbose"


Problem handling
~~~~~~~~~~~~~~~~

| **Error**: ``Cannot find module 'vscode'.`` or any other module.
| **Solution**: Execute ``npm install`` to trigger postinstall scripts.