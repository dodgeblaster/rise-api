type ModuleSectionType = 'api' | 'events' | 'connect'
type ModuleSection = Record<string, any[]>
type Module = Record<ModuleSectionType, ModuleSection>

interface FileDetails {
    name: string
    path: string
}

interface ParsedModule {
    name: string
    definition: Module
}

type RiseDefinition = Record<string, Module>

/**
 *  Get Modules
 */
function getModuleNames(): FileDetails[] {
    const fs = require('fs')
    const p = process.cwd() + '/modules'
    const modules = fs.readdirSync(p)
    return modules.map((name: string) => ({
        name,
        path: `${p}/${name}`
    }))
}

function getModules(): FileDetails[] {
    const outputFolder = process.cwd() + '/'
    let outputFilesArray: any[] = []

    // Root
    outputFilesArray.push({
        name: 'root',
        path: outputFolder + 'rise.js'
    })

    // Modules
    try {
        const modules = getModuleNames()
        modules.forEach((module: any) => {
            outputFilesArray.push({
                name: module.name,
                path: module.path
            })
        })
    } catch (e) {
        // dont do anything for now
    }

    return outputFilesArray
}

/**
 * Parse EventSource Events
 */
function parseModules(
    outputFilesArray: FileDetails[],
    stage: string
): ParsedModule[] {
    function parseModulesEventSourceKeywords(module: Module, stage: string) {
        Object.keys(module.events).forEach((k) => {
            const actions = module.events[k]
            let newActions = actions.map((x: any) => {
                if (x.type === 'event-source') {
                    return {
                        ...x,
                        source: x.source.replace('{@stage}', stage),
                        event: x.event.replace('{@stage}', stage)
                    }
                } else {
                    return x
                }
            })

            module.events[k] = newActions
        })
        return module
    }

    return outputFilesArray.map((outputFile: FileDetails) => {
        let module: Module = require(outputFile.path)
        if (module.events) {
            module = parseModulesEventSourceKeywords(module, stage)
        }

        return {
            name: outputFile.name,
            definition: module
        }
    })
}

/**
 * Make RiseDefinition
 */
function convertParsedModulesIntoSingleDefintion(m: ParsedModule[]) {
    return m.reduce((acc: RiseDefinition, x: ParsedModule) => {
        acc[x.name] = x.definition
        return acc
    }, {})
}

export const getRiseDefinition = (stage: string): RiseDefinition => {
    const outputFilesArray: FileDetails[] = getModules()
    const parsedModules: ParsedModule[] = parseModules(outputFilesArray, stage)
    const riseDefinition: RiseDefinition =
        convertParsedModulesIntoSingleDefintion(parsedModules)

    return riseDefinition
}
