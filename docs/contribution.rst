Contribution
============

CI
--
Our CI is based on github actions and located 
`here <https://github.com/open-needs/open-needs-ide/actions>`__.


The CI tests / builds the following elements:

* Documentation
* VS Code extension


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


Debugging extension
~~~~~~~~~~~~~~~~~~~
In VS Code use the launch configuration "Launch Extension", which builds the extension and loads an 
addtional VS Code instance (the so called **Extension Host**) with the loaded extension.


The developed extension does **not** show up in the Extension tab on the Extension Host!
It gets activated by opening a **rst** file or by running the command ``Load Open-Needs IDE`` (Strg + Shift + p).
Open the Output log with the name **Open-Needs IDE** to see most important log messages.

On your original VS Code instance you can set breakpoints and take a look into the Output window, on which 
all log messages show up, which are created via ``console.log()`` in the code.


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