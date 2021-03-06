Changelog
=========

0.0.19
------

**released**: under development


0.0.18
------

**released**: 27.04.2022

* Bugfix: Fixed needls features to latest pygls API and fixed type validation. :issue:`62`


0.0.17
------

**released**: 26.04.2022

* Bugfix: Adapted needls features to latest pygls API change. :issue:`59`
* Improvement: Improved confPath setting and check.


0.0.16
------

**released**: 25.04.2022

* Bugfix: Fixed system python version compatiable. :issue:`42`
* Bugfix: Fixed pythonPath from user input saved correctly in workspace setting. :issue:`45`
* Bugfix: Fixed needs.json location not in sync between extension and needls and create needs.json if not exsits after extension activation. :issue:`37`
* Improvement: Improved needls logging and exception handling. :issue:`23`
* Bugfix: Fixed empty line trigger completion issue for vs code default shortcut trigger suggest: ctrl + space. :issue:`22`
* Improvement: Support more latest pygls version and drop old version support. :issue:`53`
* Improvement: Support custom configuration file like conf.py in workspace setting. :issue:`56`

0.0.15
------

**released**: 23.02.2022

* Improvement: Supporting ``pythonPath`` config in settings of Open-Needs IDE. Default is system python path. :issue:`38`
* Bugfix: Mutliple little changes


0.0.14
------

**released**: 28.01.2022


* Improvement: Supporting ``${workspaceFolder}`` in settings of Open-Needs IDE. :issue:`17`
* Bugfix: Using ``-b needs`` for ``sphinx-build``, which uses the correct doctree folder. :issue:`21`
* Bugfix: Correct print of executed Python commands. :issue:`19`


0.0.13
------

**released**: 24.01.2022

* Improvement: The VS Cod eextension donwloads needed ``open-needs-ls`` release from PyPi.