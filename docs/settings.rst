Extension Settings
==================

This extension contributes the following settings:

:needls.docsRoot: Root directory of the reST sources (where sphinx `conf.py` and `index.rst` reside). This is an absolute path!

:needls.buildPath: Path to the build directory of sphinx. Inside this build directory the file `needs/needs.json` is
                     expected. This file is created using using the
                     `sphinx-needs builder <https://sphinxcontrib-needs.readthedocs.io/en/latest/builders.html>`__

:needls.pythonPath: Python path used to install `Open-Needs-IDE:needls`. Default system python path `/usr/bin/python` will be used if this setting is not configured.

Supported variables
-------------------
**Open-Needs IDE** supports the usage of template variables, which get replaced during runtime.

Example: ``${workspaceFolder}/docs/_build``

The following variables are supported:

:workspaceFolder: root folder of the currently opened workspace (since 0.0.14)

settings.json
-------------
Inside a ``.vscode/settings.json`` file a configuration can look like::

    {
      "needls.docsRoot": "${workspaceFolder}/docs"
      "needls.buildPath": "${workspaceFolder}/docs/_build/need",
      "needls.pythonPath": "${workspaceFolder}/.venv/bin/python",
    }

Settings menu
-------------
The configuration can also be done in the "settings menu" of VS Code (``Strg + ","``).

.. image:: /images/vscode_settings.png
   :align: center 


Known Issues and Limitations
----------------------------

* restructured text files defining needs must have `.rst` file extension
* the extension loads and parses a `needs.json`. Only one `needs.json` file is supported per vscode workspace.

