# Open-Needs IDE

# sphinx-needs-ext

Support for writing sphinx-needs extended sphinx documentation:
https://sphinxcontrib-needs.readthedocs.io/en/latest/index.html

## Features

* auto-generated need IDs

  ![:id: completion](docs/need_id_generation_demo.gif)

  Usage:
    * type `:` in the line directly below a need directive like `.. req::` and select `:id:` in the IntelliSense interface.
    * Alternatively type `..` and choose to auto-complete the directive in the IntelliSense interface.

  **Note:**
    * If needls can't detect the type of the need it will just output `ID`.
    * The ID is calculated using a hash function of the current user, doc URI, line number and the need prefix (e.g.).
      To lower the risk of ID conflicts further a pseudo-randomization is part of the ID generation.

* code completion for `:need:` sphinx-needs role:

  ![:need: completion](docs/need_role_demo.gif)

  Usage:
    * after `:need:` role or `:links:` option type `->` which triggers the auto-completion of needs
    * select a need type from the IntelliSense dialog (use arrow keys)
    * type `>` again to trigger the doc completion (file in which needs are specified)
    * type `/` to complete the doc path, continue until the doc path is completed to a `*.rst` file
    * type `>` to trigger completion of a specfic need by ID, expand the completion item info to see the content of the selected need

* go to definition for need IDs:

  ![go to definition](docs/need_goto_definition_demo.gif)

  Usage:
    * move cursor to a need ID and hit `F12`
    * alternatively right click on a need ID and choose "Go to Definition" from the context menu

* need information on mouse hover:

  ![hover](docs/need_hover_demo.gif)
  
  Usage:
    * move the mouse cursor over any need ID

## Installation

### Prerequisites

To run this extension setup a [sphinx documentation project](https://www.sphinx-doc.org/en/master/usage/quickstart.html) 
that is using the [sphinx-needs extension](https://sphinxcontrib-needs.readthedocs.io/en/latest/installation.html).

Also [build the needs.json file](https://sphinxcontrib-needs.readthedocs.io/en/latest/builders.html).

The extension needs a Python package (**needls**) in order to operate.
The first time the extension is executed it will try to install **needls** automatically into the [active python environment](https://code.visualstudio.com/docs/python/environments#_select-and-activate-an-environment).

*Alternatively* you can install **needls** manually:

1) [Activate your Python virtual environment](https://docs.python.org/3/library/venv.html#creating-virtual-environments)

2) Install the python package:
    ```
    python -m pip install pip --upgrade
    python -m pip install git+https://github.com/open-needs/open-needs-ide
    ```

### Installation of the extension

1) download from vsix file [from releases](https://github.com/open-needs/open-needs-ide/releases)

2) [install the extension in vscode](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix):
    ```
    code --install-extension sphinx-needs-ext-X.Y.Z.vsix
    ```

    *Alternatively* you can right-click the vsix file from within vscode and select `install extension`.


3) [Open your spinx documenation project into your vscode workspace](https://code.visualstudio.com/docs/editor/workspaces#_how-do-i-open-a-vs-code-workspace).

4) Open a reStructuredText file (`*.rst`) in workspace to trigger the activation of the extension.

5) The first time you run the extension it will ask for permission to install the Python package **needls**. Click ``Yes`` to trigger the installation.

**Note:** The extension is trying to get your sphinx configuration from your vscode workspace. If you face troubles with this, try to set the settings manually as explained below.

## Extension Settings

This extension contributes the following settings:

* `needls.docsRoot`: Root directory of the reST sources (where sphinx `conf.py` and `index.rst` reside). This is an absolute path!
* `needls.buildPath`: Path to the build directory of sphinx. Inside this build directory the file `needs/needs.json` is expected. This file is created using using the [sphinx-needs builder](https://sphinxcontrib-needs.readthedocs.io/en/latest/builders.html)

## Known Issues and Limitations

* restructured text files defining needs must have `.rst` file extension
* the extension loads and parses a `needs.json`. Only one `needs.json` file is supported per vscode workspace.
* the dependency on needls (its version) is currently hard-coded in `src/extension.ts`

## Developing the extension

VSCode API: https://code.visualstudio.com/api/references/vscode-api 

### Build vsix file

```
vsce package --baseContentUrl https://github.com/open-needs/open-needs-idext --baseImagesUrl https://github.com/open-needs/open-needs-ide
 ```

### Set logging level of language server

Add to `settings.json`:

```
"sphinx-needs-ls.trace.server": "verbose"
```
