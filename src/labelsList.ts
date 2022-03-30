import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class LablesListProvider implements vscode.TreeDataProvider<Label> {
  constructor() {}
  private _onDidChangeTreeData: vscode.EventEmitter<
    Label | undefined | null | void
  > = new vscode.EventEmitter<Label | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Label | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Label): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Label): Thenable<Label[]> {
    if (element) {
      return Promise.resolve(this.getLabels(element.label));
    } else {
      return Promise.resolve(this.getLabels(""));
    }
  }
  private async getLabels(label: string): Promise<Label[]> {
    const server = vscode.workspace.getConfiguration().get("neorunner.server");
    const user = vscode.workspace.getConfiguration().get("neorunner.user");
    const authtype = vscode.workspace
      .getConfiguration()
      .get("neorunner.authtype");
    const db = vscode.workspace.getConfiguration().get("neorunner.database");
    const password = vscode.workspace
      .getConfiguration()
      .get("neorunner.password");

    const neo4j = require("neo4j-driver");

    const driver =
      authtype == "User / Password"
        ? neo4j.driver("neo4j://" + server, neo4j.auth.basic(user, password), {
            disableLosslessIntegers: true,
          })
        : neo4j.driver("neo4j://" + server, neo4j.auth.basic(), {
            disableLosslessIntegers: true,
          });
    const session = driver.session();
    const result = await session
      .run(
        "MATCH(n) WITH LABELS(n) AS labels , KEYS(n) AS keys UNWIND labels AS label UNWIND (CASE keys when [] then [null] else keys end) AS key RETURN DISTINCT label, COLLECT(DISTINCT key) AS props ORDER BY label",
        {}
      )
      .then((result) => {
        let labels = [];
        for (let i = 0; i < result.records.length; i++) {
          if (label == "") {
            labels.push(
              new Label(
                result.records[i]._fields[0],
                "",
                vscode.TreeItemCollapsibleState.Collapsed
              )
            );
          } else {
            if (result.records[i]._fields[0] == label) {
              for (let j = 0; j < result.records[i]._fields[1].length; j++) {
                labels.push(
                  new Label(
                    result.records[i]._fields[1][j],
                    "",
                    vscode.TreeItemCollapsibleState.None
                  )
                );
              }
            }
          }
        }

        return labels;
      });

    return result;
  }
}
class Label extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }
}
