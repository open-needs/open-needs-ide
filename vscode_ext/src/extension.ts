/*---------------------------------------------------------------------------------------------
 *  Licensed under the MIT license.
 *  See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import * as path from 'path';
import * as fs from 'fs';

import {
	workspace,
	extensions,
	commands,
	Uri,
	ExtensionContext,
	window,
	OutputChannel,
} from 'vscode';

import {
	Executable,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions
} from 'vscode-languageclient/node';


import { exec, ExecException } from 'child_process';

let client: LanguageClient;

async function getPythonPath(resource: Uri = null, outChannel: OutputChannel): Promise<string> {
	const extension = extensions.getExtension('ms-python.python');
	let pythonPath
	if (extension) {
		const usingNewInterpreterStorage = extension.packageJSON?.featureFlags?.usingNewInterpreterStorage;
		if (usingNewInterpreterStorage) {
			if (!extension.isActive) {
				await extension.activate();
			}
			pythonPath = extension.exports.settings.getExecutionDetails(resource).execCommand[0];
		} else {
			pythonPath = workspace.getConfiguration('python', resource).get<string>('pythonPath');
		}
	}else {
		pythonPath = exec_py('python', outChannel, '-c', 'import sys; print(sys.executable)')
	}

	return pythonPath

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

async function installNeedls(pythonPath: string, outChannel: OutputChannel, version: string): Promise<boolean> {
	const install = await window.showInformationMessage(
			`Install needls==${version} from PyPI?`,
			'Yes',
			'No'
		).then( (item) => {
		if ( item === 'Yes' ) {
			return true;
		} else {
			return false
		}
	});
	if (install === true) {
		try {
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
				'open-needs-ls',
				'-y'
			);
			await exec_py(
				pythonPath,
				outChannel,
				'-m',
				'pip',
				'install',
				`open-needs-ls==${version}`
			);
			window.showInformationMessage("Needls successfully installed.");
			return true;
		} catch (e){
			console.log(e)
			window.showInformationMessage(`Needls could not be installed ${e}`);
		}
	}
	return false
}

async function checkForNeedls(pythonPath: string, outChannel: OutputChannel, ext_version: string): Promise<boolean> {
    try {
		let needls_version = await exec_py(
			pythonPath,
			outChannel,
			'-c',
			'"from needls.version import __version__; print(__version__)"'
		);
		needls_version = needls_version.trim();
		if (ext_version != needls_version) {
			window.showWarningMessage(`Needls found but wrong version: ${needls_version}\nVersion needed: ${ext_version}. 
			Needls should be reinstalled`);
			return false;
		}
		return true;
	} catch (e) {
		console.warn(e)
		outChannel.appendLine(e);
		window.showWarningMessage(`Error during detecting needls. Needls should be reinstalled.`);
		return false
	}
}

async function read_settings(_outChannel: OutputChannel) {
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
	
	const source_dir = workspace.getConfiguration('needls').get('docsRoot').toString();
	const build_dir = workspace.getConfiguration('needls').get('buildPath').toString();

	if (source_dir) {
		// run sphinx build: python -m sphinx.cmd.build source_dir build_dir
		await exec_py(
			pythonPath,
			outChannel,
			'-m',
			'sphinx.cmd.build',
			'-b needs',
			source_dir,
			build_dir
		);
	}
}

export async function activate(context: ExtensionContext): Promise<void> {

	console.log('Activating Open-Needs IDE')

	// Get current version of extension
	const extensionPath = path.join(context.extensionPath, "package.json");
    const packageFile = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
	const ext_version = packageFile.version;
	console.log(`Extension version: ${ext_version}`)
        
	
	const disposable = commands.registerCommand('open-needs-ide.load', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const manual_welcome = 'Manual loaded open-needs-ide'
		console.log(manual_welcome)
		window.showInformationMessage(manual_welcome);
	});
	context.subscriptions.push(disposable);
	
	//Create output channel for logging
	const outChannel = window.createOutputChannel("Open-Needs IDE");

	const cwd = path.join(__dirname, "..", "..");
	outChannel.appendLine("CWD: " + cwd);

	const resource = window.activeTextEditor?.document.uri;
	const pythonPath = await getPythonPath(resource, outChannel);
	outChannel.appendLine("Python path: " + pythonPath);

	// Check for needls
	let needls_installed = await checkForNeedls(pythonPath, outChannel, ext_version);
	if ( !needls_installed ) {
		needls_installed = await installNeedls(pythonPath, outChannel, ext_version);
	}

	if ( !needls_installed ) {
		window.showErrorMessage("Python module needls not found! Needs extension can't start.");
	}

	// listen for changes of settings
	workspace.onDidChangeConfiguration( (_event) => {
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

	const serverOptions: ServerOptions = {
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
	const clientOptions: LanguageClientOptions = {
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
			'open-needs-ls',
			'Open-Needs LS',
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
