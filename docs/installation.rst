Installation
============

Prerequisites
-------------

To run this extension setup a
`sphinx documentation project <https://www.sphinx-doc.org/en/master/usage/quickstart.html>`__
that is using the `sphinx-needs extension <https://sphinxcontrib-needs.readthedocs.io/en/latest/installation.html>`__.

Also `build the needs.json file <https://sphinxcontrib-needs.readthedocs.io/en/latest/builders.html>`__.

The extension needs a Python package (**needls**) in order to operate.
The first time the extension is executed it will try to install **needls** automatically into the
`active python environment <https://code.visualstudio.com/docs/python/environments#_select-and-activate-an-environment>`__.

*Alternatively* you can install **needls** manually:

1) `Activate your Python virtual environment <https://docs.python.org/3/library/venv.html#creating-virtual-environments>`__

2) Install the python package::

    python -m pip install pip --upgrade
    python -m pip install git+https://github.com/open-needs/open-needs-ide


Installation of the extension
-----------------------------

1) download from vsix file `from releases <https://github.com/open-needs/open-needs-ide/releases>`__

2) `install the extension in vscode <https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix>`__::

        code --install-extension sphinx-needs-ext-X.Y.Z.vsix

   *Alternatively* you can right-click the vsix file from within vscode and select `install extension`.


3) `Open your spinx documenation project into your vscode workspace <https://code.visualstudio.com/docs/editor/workspaces#_how-do-i-open-a-vs-code-workspace>`__.

4) Open a reStructuredText file (`*.rst`) in workspace to trigger the activation of the extension.

5) The first time you run the extension it will ask for permission to install the Python package **needls**. Click ``Yes`` to trigger the installation.

**Note:** The extension is trying to get your sphinx configuration from your vscode workspace. If you face troubles with this, try to set the settings manually as explained below.
