/*---------------------------------------------------------------------------------------------
 *  Licensed under the MIT license.
 *  See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import * as path from 'path';
import * as os from 'os';
import {
	workspace,
	extensions,
	commands,
	Uri,
	ExtensionContext,
	window,
	OutputChannel,
	ConfigurationChangeEvent
} from 'vscode';

import {
	Executable,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions
} from 'vscode-languageclient/node';

import { exec, ExecException } from 'child_process';

let client: LanguageClient;

async function getPythonPath(resource: Uri = null): Promise<string> {
	try {
		const extension = extensions.getExtension('ms-python.python');
		if (!extension) {
			return 'python';
		}
		const usingNewInterpreterStorage = extension.packageJSON?.featureFlags?.usingNewInterpreterStorage;
		if (usingNewInterpreterStorage) {
			if (!extension.isActive) {
				await extension.activate();
			}
			const pythonPath = extension.exports.settings.getExecutionDetails(resource).execCommand[0];
			return pythonPath;
		} else {
			return workspace.getConfiguration('python', resource).get<string>('pythonPath');
		}
	} catch (error) {
		return 'python';
	}
}

function exec_py(pythonPath: string, outChannel: OutputChannel, ...args: string[]): Promise<string> {
	const cmd = [pythonPath, ...args];
	return new Promise<string>((resolve, reject) => {
		outChannel.appendLine(`Running cmd: ${pythonPath} ${cmd.join(' ')}`);
		exec(
		cmd.join(' '),
		(error: ExecException | null, stdout: string, stderr: string) => {
			if (error) {
				const errorMessage: string = [
					error.name,
					error.message,
					error.stack,
					'',
					stderr.toString()
				].join('\n');
				outChannel.appendLine(errorMessage);
				reject(errorMessage);
			} else {
				outChannel.appendLine('Successful exec');
				resolve(stdout.toString());
			}
		}
		);
	});
}

async function checkForNeedls(pythonPath: string, outChannel: OutputChannel): Promise<boolean> {
    try {
		var version = await exec_py(
			pythonPath,
			outChannel,
			'-c',
			'"import needls; print(needls.__version__)"'
		);
		version = version.trim();
		if (version !== '0.0.8') {
			throw 'Needls found but wrong version!';
		}
		return true;
	} catch (e) {
		const install = await window.showInformationMessage(
				'Needls not found. Do you want to install from GitHub now?',
				'Yes',
				'No'
			).then( (item) => {
			if ( item === 'Yes' ) {
				return true;
			} else {
				return false;
			}
		});
		if (install === true) {
			try {
				let pip = 'pip3';
				if ( pythonPath !== 'python') {
					pip = [path.dirname(pythonPath), "pip3"].join(path.sep);
				}
				await exec_py(
					pythonPath,
					outChannel,
					'-m',
					'pip',
					'install',
					'pip',
					'--upgrade'
				);
				await exec_py(
					pythonPath,
					outChannel,
					'-m',
					'pip',
					'uninstall',
					'"git+https://github.com/open-needs/open-needs-ide"',
					'-y'
				);
				await exec_py(
					pythonPath,
					outChannel,
					'-m',
					'pip',
					'install',
					'"git+https://github.com/open-needs/open-needs-ide"',
					'--upgrade'
				);
				window.showInformationMessage("Needls successfully installed.");
				return true;
			} catch {
				return false;
			}
		} else {
			return false;
		}
	}
}

async function read_settings(outChannel: OutputChannel) {
	const docs_root = workspace.getConfiguration('needls').get('docsRoot');
	const build_path = workspace.getConfiguration('needls').get('buildPath');
	commands.executeCommand('needls.update_settings', docs_root, build_path);
}

async function make_needs(pythonPath: string, outChannel: OutputChannel) {
	// only build if auto build setting is switched on
	const auto_build = workspace.getConfiguration('needls').get('autoBuild');
	if (auto_build === false) {
		return;
	}
	let source_dir = workspace.getConfiguration('needls').get('docsRoot').toString();
	let build_dir = workspace.getConfiguration('needls').get('buildPath').toString();

	if (source_dir) {
		// run sphinx build: python -m sphinx.cmd.build source_dir build_dir
		await exec_py(
			pythonPath,
			outChannel,
			'-m',
			'sphinx.cmd.build',
			'-M needs',
			source_dir,
			build_dir
		);
	}
}

export async function activate(context: ExtensionContext) {

	//Create output channel for logging
	let outChannel = window.createOutputChannel("sphinx-needs extension");

	const cwd = path.join(__dirname, "..", "..");
	outChannel.appendLine("CWD: " + cwd);

	let resource = window.activeTextEditor?.document.uri;
	const pythonPath = await getPythonPath(resource);
	outChannel.appendLine("Python path: " + pythonPath);

	const needls_installed = await checkForNeedls(pythonPath, outChannel);
	if ( !needls_installed ) {
		window.showErrorMessage("Python module needls not found! Needs extension can't start.");
		return;
	}

	// listen for changes of settings
	workspace.onDidChangeConfiguration( (event) => {
		read_settings(outChannel);
	});

	// listen for save event of rst files
	workspace.onDidSaveTextDocument( (event) => {
		outChannel.appendLine("Saved text doc of type: " + event.languageId);
		if (event.languageId === 'restructuredtext') {
			make_needs(pythonPath, outChannel).then( () => {
				read_settings(outChannel); // trigger re-load needs.json in needls
			});
		}
	});

	let serverOptions: ServerOptions = {
		run: {
			command: pythonPath,
			args: ["-m", "needls"],
			options: { cwd: cwd }
		} as Executable,
		debug: {
			command: pythonPath,
			args: ["-m", "needls"],
			options: { cwd: cwd }
		} as Executable
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [
			{ scheme: "file", language: "restructuredtext" },
			{ scheme: "untitled", language: "restructuredtext" },
		],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	if (pythonPath) {
		// Create the language client and start the client.
		client = new LanguageClient(
			'sphinx-needs-ls',
			'Sphinx-Needs Language Server',
			serverOptions,
			clientOptions
		);

		// Start the client. This will also launch the server
		client.start();

		// set doc root and needs.json file
		client.onReady().then(async () => {
			await read_settings(outChannel);
		})
	} else {
		window.showErrorMessage("Python not found! Can't activate extension.");
		outChannel.appendLine("Python not found! Can't activate extension.");
	}
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
