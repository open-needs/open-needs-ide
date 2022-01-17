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


Environment preparation
~~~~~~~~~~~~~~~~~~~~~~~

Install the following packages::

    npm install -g vsce
    npm install -g typescript


Buid extension
~~~~~~~~~~~~~~
::

    vsce package --baseContentUrl https://github.com/open-needs/open-needs-ide --baseImagesUrl https://github.com/open-needs/open-needs-ide


Publishing extension
~~~~~~~~~~~~~~~~~~~~
Publishing the VS code extension is done automatically by CI, when a new tag
gets created.

Locations are:

* https://open-vsx.org
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