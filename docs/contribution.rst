Contribution
============

Developing the extension
------------------------

VSCode API: https://code.visualstudio.com/api/references/vscode-api

Build vsix file
~~~~~~~~~~~~~~~
::

    vsce package --baseContentUrl https://github.com/open-needs/open-needs-idext --baseImagesUrl https://github.com/open-needs/open-needs-ide


Set logging level of language server
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Add to ``settings.json``::

    "sphinx-needs-ls.trace.server": "verbose"

