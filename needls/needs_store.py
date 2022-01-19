# --------------------------------------------------------------------------
# Licensed under the MIT license.
# See License.txt in the project root for further license information.
# --------------------------------------------------------------------------

import importlib.util
import json
import os
import sys

from needls.exceptions import NeedlsConfigException


class NeedsStore:
    """Abstraction of needs database."""

    def __init__(self):
        self.docs_per_type = {}  # key: need type, val: list of doc names (str)
        self.needs_per_doc = {}  # key: docname; val: list of needs
        self.types = []  # list of need types actually defined in needs.json
        self.declared_types = (
            {}
        )  # types declared in conf.py: {'need directive': 'need title'}
        self.needs = {}
        self.needs_initialized = False
        self.docs_root = None

    def is_setup(self) -> bool:
        """Return True if database is ready for use."""

        if not self.needs_initialized:
            return False

        return True

    def set_docs_root(self, docs_root: str) -> None:
        if not os.path.exists(docs_root):
            raise ValueError(f"Docs root directory not found: {docs_root}")
        self.docs_root = docs_root

    def set_declared_types(self) -> None:
        module_name = "conf"
        work_dir = os.getcwd()
        os.chdir(self.docs_root)
        spec = importlib.util.spec_from_file_location(
            module_name, os.path.join(self.docs_root, "conf.py")
        )
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
        need_types = getattr(module, "needs_types", [])
        if not need_types:
            raise NeedlsConfigException("No 'need_types' defined on conf.py")

        self.declared_types = {}
        for item in need_types:
            self.declared_types[item["directive"]] = item["title"]
        os.chdir(work_dir)

    def load_needs(self, json_file: str) -> None:

        self.docs_per_type = {}
        self.needs_per_doc = {}
        self.types = []
        self.needs = {}

        if not os.path.exists(json_file):
            raise ValueError(f"JSON file not found: {json_file}")

        with open(json_file, encoding="utf-8") as file:
            needs_json = json.load(file)

        versions = needs_json["versions"]
        # get the latest version
        version = versions[sorted(versions)[-1]]

        self.needs = version["needs"]

        for need in self.needs.values():
            need_type = need["type"]
            docname = need["docname"] + ".rst"

            if need_type not in self.docs_per_type:
                self.types.append(need_type)
                self.docs_per_type[need_type] = []

            if docname not in self.docs_per_type[need_type]:
                self.docs_per_type[need_type].append(docname)

            if docname not in self.needs_per_doc:
                self.needs_per_doc[docname] = []
            self.needs_per_doc[docname].append(need)

        self.needs_initialized = True
