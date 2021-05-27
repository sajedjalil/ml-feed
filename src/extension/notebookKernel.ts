import { DEBUG_MODE, NAME, MIME_TYPE } from '../common/common';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Method } from '../common/httpConstants';
import { RequestParser } from '../common/request';
import { ResponseParser, ResponseRendererElements } from '../common/response';
import { updateCache } from '../common/cache';
const axios = require('axios').default;
var stringify = require('json-stringify-safe');

export class NotebookKernel {
    readonly id = 'rest-book-kernel';
    readonly label = 'REST Book Kernel';
    readonly supportedLanguages = ['rest-book'];

    private readonly _controller: vscode.NotebookController;
    private readonly _renderMessaging: vscode.NotebookRendererMessaging;
	private _executionOrder = 0;

	constructor() {
        this._controller = vscode.notebook.createNotebookController('rest-book-kernel', 
                                                                    'rest-book', 
                                                                    'REST Book');

		this._controller.supportedLanguages = ['rest-book'];
		this._controller.hasExecutionOrder = true;
		this._controller.description = 'A notebook for making REST calls.';
		this._controller.executeHandler = this._executeAll.bind(this);

        this._renderMessaging = vscode.notebook.createRendererMessaging('rest-book');
        this._renderMessaging.onDidReceiveMessage(this._handleMessage.bind(this));
	}

	dispose(): void {
		this._controller.dispose();
	}

    private _executeAll(cells: vscode.NotebookCell[], _notebook: vscode.NotebookDocument, _controller: vscode.NotebookController): void {
		for (let cell of cells) {
			this._doExecution(cell);
		}
	}

    private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
        const execution = this._controller.createNotebookCellExecutionTask(cell);
        execution.executionOrder = ++this._executionOrder;
		execution.start({ startTime: Date.now() });

        const startTime = Date.now();

        const logger = (d: any, r: any, requestParser: RequestParser) => {
            const metadata: vscode.NotebookCellExecutionSummary = {
                startTime: startTime,
                endTime: Date.now()
            };

            try {
                const response = new ResponseParser(d, r, requestParser);
                updateCache(requestParser, response);

                execution.replaceOutput([new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.json(response.renderer(), MIME_TYPE),
                    vscode.NotebookCellOutputItem.json(response.json()),
                    vscode.NotebookCellOutputItem.text(response.html(), 'text/html')
                ], metadata)]);

                execution.end({ success: true, endTime: Date.now() });
            } catch (e) {
                execution.replaceOutput([
                    new vscode.NotebookCellOutput([
                        vscode.NotebookCellOutputItem.error({ 
                            name: e instanceof Error && e.name || 'error', 
                            message: e instanceof Error && e.message || stringify(e, undefined, 4)})
                    ])
                ]);
                execution.end({ success: false, endTime: Date.now() });
            }
        };

        let req;
        let parser;
        
        try {
            parser = new RequestParser(cell.document.getText());
            req = parser.getRequest();
        } catch (err) {
            execution.replaceOutput([
                new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.error({ 
                        name: err instanceof Error && err.name || 'error', 
                        message: err instanceof Error && err.message || stringify(err, undefined, 4)})
                ])
            ]);
            execution.end({ success: false });
            return;
        }

        try {
            const cancelTokenAxios = axios.CancelToken.source();

            let options = {...req};
            options['cancelToken'] = cancelTokenAxios.token;

            execution.token.onCancellationRequested(_ => cancelTokenAxios.cancel());

            let response = await axios(options);

            logger(response, req, parser);
        } catch (exception) {
            logger(exception, req, parser);
        }
        
    }
    
    private async _handleMessage(event: vscode.NotebookRendererMessage<any>) {
        switch(event.message.command) {
            case 'save-response': 
                this._saveDataToFile(event.message.data);
                return;
            default: break;
        }
    }

    private async _saveDataToFile(data: ResponseRendererElements) {
        const workSpaceDir = path.dirname(vscode.window.activeTextEditor?.document.uri.fsPath ?? '');
        if (!workSpaceDir) { return; }
    
        let name;
        const url = data.request?.responseUrl;
        if(url) {
            let name = url;
            name = name.replace(/^[A-Za-z0-9]+\./g, '');
            name = name.replace(/\.[A-Za-z0-9]+$/g, '');
            name = name.replace(/\./g, '-');
        } else {
            name = 'unknown-url';
        }

        let date = new Date().toDateString().replace(/\s/g, '-');
        
        const defaultPath = vscode.Uri.file(path.join(workSpaceDir, `response-${name}-${date}.json`));
        const location = await vscode.window.showSaveDialog({ defaultUri: defaultPath });
        if(!location) { return; }
    
        fs.writeFile(location?.fsPath, stringify(data, null, 4), { flag: 'w' }, (e) => {
            vscode.window.showInformationMessage(e?.message || `Saved response to ${location}`);
        });
    };
}