import os
import shutil
import subprocess

import pip

from jinja2 import Template
from pathlib import Path


class ProjectEnv:
    def __init__(self, name: str, reuse: bool = False) -> None:
        """
        Setups a fresh project env with python venv, vscode setting and more.

        :name: Name of the env, which gets created under /test-envs
        :reuse: If True, no existing env folder will be recreated

        """
        self.name = name
        self.reuse = reuse
        self.fresh_installation = True

        self.test_envs_path = os.path.join(os.path.dirname(__file__))
        self.basics_path = os.path.join(self.test_envs_path, "_basics")

        self.temp_env_path = os.path.join(self.test_envs_path, "..\\temp-envs")

        self.env_path = os.path.join(self.temp_env_path, name)

    def setup(self):
        """Steers the execution of the needed tasks for project env setup"""

        self.create_folders()
        if self.fresh_installation:
            self.install_python_env()
            self.parse_templates()
        print(f"Project {self.name} ready to use")

    def create_folders(self) -> None:
        if os.path.exists(self.env_path) and self.reuse:
            print(f"Reusing existing env: {self.name}")
            self.fresh_installation = False
            return

        if os.path.exists(self.env_path) and not self.reuse:
            print(f"Path exists. Cleaning it: {self.env_path}")
            shutil.rmtree(self.env_path)

        shutil.copytree(self.basics_path, self.env_path)
        print("env project dir and basic data created")

    def install_python_env(self):
        os.chdir(self.env_path)

        venv_command = ["python", "-m", "venv", ".venv"]
        subprocess.call(venv_command)
        print("python venv installed")

        dep_command = [".venv\\bin\\pip", "install", "-r", "py-requirements.txt"]
        subprocess.call(dep_command)
        print("python dependecies installed")

    def parse_templates(self):
        """
        Inject dyncamic values into files like ".vscode/settings.json".
        Needed to set machine specific paths.
        """
        os.chdir(self.env_path)

        docs_folder = os.path.join(self.env_path, "docs")
        build_folder = os.path.join(self.env_path, "docs", "_build")

        templates = {
            ".vscode\\settings.json": {
                "build_path": "${workspaceFolder}\\docs\\_build",
                "docs_root": "${workspaceFolder}\\docs",
                "pythonPath": "",
            }
        }

        for path, values in templates.items():
            file_path = os.path.join(self.env_path, path)
            self._render_and_replace(file_path, values)

    def _render_and_replace(self, file_path, values):
        """
        Opens a file as templates, renders it and replace the complete
        file with the rendered data.
        """
        with open(file_path) as file_:
            template = Template(file_.read())

        rendered = template.render(**values)

        with open(file_path, "w") as file_:
            file_.write(rendered)


def start():
    project1 = ProjectEnv("project_no_needls", reuse=True)
    project1.setup()

    project2 = ProjectEnv("project_dummy_needls_test", reuse=True)
    project2.setup()


if "main" in __name__:
    start()
