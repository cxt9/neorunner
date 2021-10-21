# neorunner

Running cypher queries - from vs code!

## Features

Using this extension you can run cypher queries simply by selecting the query and clicking the shortcut (currently `alt+Shift+\` but you can change this in your settings).

![alt text](https://github.com/cxt9/neorunner/blob/main/resources/neorunner-screenshot-1.png?raw=true)

You can query a local server or a remote server, with or without enabled authentication. Server configuration can be found under vs code settings.

## Requirements

A running neo4j server you can access via the regular default ports.

## Extension Settings

This extension contributes the following settings:

- `neorunner.server`: url of the neo4j server - neo4j://{neorunner.server}
- `neorunner.user`: login user. (leave blank if authentication = false)
- `neorunner.password`: login password. (leave blank if authentication = false)

## Known Issues

## Release Notes

### 1.0.0

Initial release of basic functionality: server configuration and ability to run queries.

### 1.0.1

Coming soon!
