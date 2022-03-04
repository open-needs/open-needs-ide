Installation
============

Prerequisites
-------------

To run this extension setup a
`sphinx documentation project <https://www.sphinx-doc.org/en/master/usage/quickstart.html>`__
that is using the `sphinx-needs extension <https://sphinxcontrib-needs.readthedocs.io/en/latest/installation.html>`__.

Also `build the needs.json file <https://sphinxcontrib-needs.readthedocs.io/en/latest/builders.html>`__.


Installation of the extension
-----------------------------

#. Open your Sphinx documenation project into your 
   `vscode workspace <https://code.visualstudio.com/docs/editor/workspaces#_how-do-i-open-a-vs-code-workspace>`__.

#. Install the ``Open-Needs IDE`` extension from the official VS Code marketplace (extension tab on the left side fo the IDE).

#. Open the ``Settings`` page  ``[Ctrl + ,]`` and search for ``open-needs``:

   #. Update the **Build Path**. E.g. ``/home/my-user/my-project/docs/_build/need``.
   #. Update the **Docs Root**. E.g. ``/home/my-user/my-project/docs``
   #. Update the **pythonPath**. E.g. ``/home/my-user/my-project/.venv/bin/python``. Default system python path is ``/usr/bin/python``.
      Note, under Windows the default python path for a virtual environment is ``${workspaceFolder}/.venv/Scripts``. 


#. Open a reStructuredText file (`*.rst`) in workspace to trigger the activation of the extension.

#. The first time you run the extension it will ask for permission to install the Python package **needls**. Click ``Yes`` to trigger the installation.

*Alternatively* you can install **needls** manually:

1) `Activate your Python virtual environment <https://docs.python.org/3/library/venv.html#creating-virtual-environments>`__

2) Install the python package::

    python -m pip install pip --upgrade
    python -m pip install git+https://github.com/open-needs/open-needs-ide
