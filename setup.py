# --------------------------------------------------------------------------
# Licensed under the MIT license.
# See License.txt in the project root for further license information.
# --------------------------------------------------------------------------

from setuptools import find_packages, setup

from distutils.util import convert_path

main_ns = {}
ver_path = convert_path("needls/version.py")
with open(ver_path) as ver_file:
    exec(ver_file.read(), main_ns)

setup(
    name="open-needs-ls",
    # Don't forget package.json, changelog and needls.version
    version=main_ns["__version__"],
    url="https://open-needs.org",
    author="Daniel Woste",
    author_email="daniel.woste@useblocks.com",
    description="Open-Neeeds JSON RPC server implementing Microsoft Language Server Protocol",
    packages=find_packages(),
    install_requires=["pygls==0.9.1"],
)
