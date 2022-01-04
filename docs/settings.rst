Extension Settings
==================

This extension contributes the following settings:

:needls.docsRoot: Root directory of the reST sources (where sphinx `conf.py` and `index.rst` reside). This is an absolute path!

:needls.buildPath: Path to the build directory of sphinx. Inside this build directory the file `needs/needs.json` is
                     expected. This file is created using using the
                     `sphinx-needs builder <https://sphinxcontrib-needs.readthedocs.io/en/latest/builders.html>`__

Known Issues and Limitations
----------------------------

* restructured text files defining needs must have `.rst` file extension
* the extension loads and parses a `needs.json`. Only one `needs.json` file is supported per vscode workspace.
* the dependency on needls (its version) is currently hard-coded in `src/extension.ts`
