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

#. download from vsix file 
   `the nightly build <https://github.com/open-needs/open-needs-ide/releases/tag/nightly>`__

#. `install the extension in vscode <https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix>`__::

        code --install-extension open-needs-ide-X.Y.Z.vsix

   *Alternatively* you can right-click the vsix file from within vscode and select `install extension`.

#. Open the ``Settings`` page  ``[Ctrl + ,]`` and search for ``open-needs``:

   #. Update the **Build Path**. E.g. ``/home/my-user/my-project/docs/_build/need``.
   #. Update the **Docs Root**. E.g. ``/home/my-user/my-project/docs``

#. Open your Sphinx documenation project into your 
   `vscode workspace <https://code.visualstudio.com/docs/editor/workspaces#_how-do-i-open-a-vs-code-workspace>`__.

#. Open a reStructuredText file (`*.rst`) in workspace to trigger the activation of the extension.

#. The first time you run the extension it will ask for permission to install the Python package **needls**. Click ``Yes`` to trigger the installation.
