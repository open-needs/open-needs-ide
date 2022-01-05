.. image:: /_static/open-needs-ide-logo.png
   :align: center
   :class: index-logo

User Manual
===========

Support for writing sphinx-needs extended sphinx documentation:
https://sphinxcontrib-needs.readthedocs.io/en/latest/index.html

Features
--------

auto-generated need IDs
~~~~~~~~~~~~~~~~~~~~~~~
Usage:

* type `:` in the line directly below a need directive like `.. req::` and select `:id:` in the IntelliSense interface.
* Alternatively type `..` and choose to auto-complete the directive in the IntelliSense interface.

.. hint::

   * If needls can't detect the type of the need it will just output `ID`.
   * The ID is calculated using a hash function of the current user, doc URI, line number and the need prefix (e.g.).
     To lower the risk of ID conflicts further a pseudo-randomization is part of the ID generation.

code completion
~~~~~~~~~~~~~~~
Usage:

* after `:need:` role or `:links:` option type `->` which triggers the auto-completion of needs
* select a need type from the IntelliSense dialog (use arrow keys)
* type `>` again to trigger the doc completion (file in which needs are specified)
* type `/` to complete the doc path, continue until the doc path is completed to a `*.rst` file
* type `>` to trigger completion of a specfic need by ID, expand the completion item info to see the content of the selected need

go to definition for need IDs
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Usage:

* move cursor to a need ID and hit `F12`
* alternatively right click on a need ID and choose "Go to Definition" from the context menu

need information on mouse hover
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Usage:

* move the mouse cursor over any need ID


.. toctree::
   :maxdepth: 2
   :caption: Contents:

   installation
   settings
   contribution
