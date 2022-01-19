# --------------------------------------------------------------------------
# Licensed under the MIT license.
# See License.txt in the project root for further license information.
# --------------------------------------------------------------------------

from setuptools import find_packages, setup

from .needls.version import VERSION

setup(
    name="needls",
    version=VERSION,
    url="",
    author="Daniel Woste",
    author_email="daniel.woste@useblocks.com",
    description="Sphinx-neeeds JSON RPC server implementing Microsoft Language Server Protocol",
    packages=find_packages(),
    install_requires=["pygls==0.9.1"],
)
