oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g rise-api
$ rise COMMAND
running command...
$ rise (--version)
rise-api/0.0.0 darwin-x64 node-v14.15.1
$ rise --help [COMMAND]
USAGE
  $ rise COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`rise hello PERSON`](#rise-hello-person)
* [`rise hello world`](#rise-hello-world)
* [`rise help [COMMAND]`](#rise-help-command)
* [`rise plugins`](#rise-plugins)
* [`rise plugins:inspect PLUGIN...`](#rise-pluginsinspect-plugin)
* [`rise plugins:install PLUGIN...`](#rise-pluginsinstall-plugin)
* [`rise plugins:link PLUGIN`](#rise-pluginslink-plugin)
* [`rise plugins:uninstall PLUGIN...`](#rise-pluginsuninstall-plugin)
* [`rise plugins update`](#rise-plugins-update)

## `rise hello PERSON`

Say hello

```
USAGE
  $ rise hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/dodgeblaster/hello-world/blob/v0.0.0/dist/commands/hello/index.ts)_

## `rise hello world`

Say hello world

```
USAGE
  $ rise hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `rise help [COMMAND]`

Display help for rise.

```
USAGE
  $ rise help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for rise.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `rise plugins`

List installed plugins.

```
USAGE
  $ rise plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ rise plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `rise plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ rise plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ rise plugins:inspect myplugin
```

## `rise plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ rise plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ rise plugins add

EXAMPLES
  $ rise plugins:install myplugin 

  $ rise plugins:install https://github.com/someuser/someplugin

  $ rise plugins:install someuser/someplugin
```

## `rise plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ rise plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ rise plugins:link myplugin
```

## `rise plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ rise plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rise plugins unlink
  $ rise plugins remove
```

## `rise plugins update`

Update installed plugins.

```
USAGE
  $ rise plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
