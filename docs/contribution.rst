Contribution
============

Developing the extension
------------------------

Installation
~~~~~~~~~~~~

Install the following packages::

    npm install -g vsce
    npm install -g typescript



VSCode API: https://code.visualstudio.com/api/references/vscode-api

Build vsix file
~~~~~~~~~~~~~~~
::

    vsce package --baseContentUrl https://github.com/open-needs/open-needs-ide --baseImagesUrl https://github.com/open-needs/open-needs-ide


Set logging level of language server
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Add to ``settings.json``::

    "sphinx-needs-ls.trace.server": "verbose"


Problem handling
~~~~~~~~~~~~~~~~

| **Error**: ``Cannot find module 'vscode'.`` or any other module.
| **Solution**: Execute ``npm install`` to trigger postinstall scripts.