import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import YAML from 'yaml'

// Custom tag for Python tuples
const pythonTuple = {
  tag: 'tag:yaml.org,2002:python/tuple',
  resolve: (seq: any) => seq,
  stringify: (item: any) => item.value
}

export const DEFAULTS = {
  healthy_area: {
    h: [0.1568627450980392, 1.0],
    s: [0.19607843137254902, 1.0],
    v: [0.0, 1.0]
  },
  leaf_area: {
    h: [0.0, 1.0],
    s: [0.196078431372549, 1.0],
    v: [0.1568627450980392, 1.0]
  },
  lesion_area: {
    h: [0.0, 0.1607843137254902],
    s: [0.14901960784313725, 1.0],
    v: [0.43529411764705883, 1.0]
  },
  lesion_centre: {
    h: [0.0, 0.1607843137254902],
    s: [0.14901960784313725, 1.0],
    v: [0.43529411764705883, 1.0]
  },
  scale_card: {
    h: [0.61, 1.0],
    s: [0.17, 1.0],
    v: [0.25, 0.75]
  }
}

function generateConfigYaml(config: typeof DEFAULTS): string {
  return `healthy_area:
  h: !!python/tuple
    - ${config.healthy_area.h[0]}
    - ${config.healthy_area.h[1]}
  s: !!python/tuple
    - ${config.healthy_area.s[0]}
    - ${config.healthy_area.s[1]}
  v: !!python/tuple
    - ${config.healthy_area.v[0]}
    - ${config.healthy_area.v[1]}
leaf_area:
  h: !!python/tuple
    - ${config.leaf_area.h[0]}
    - ${config.leaf_area.h[1]}
  s: !!python/tuple
    - ${config.leaf_area.s[0]}
    - ${config.leaf_area.s[1]}
  v: !!python/tuple
    - ${config.leaf_area.v[0]}
    - ${config.leaf_area.v[1]}
lesion_area:
  h: !!python/tuple
    - ${config.lesion_area.h[0]}
    - ${config.lesion_area.h[1]}
  s: !!python/tuple
    - ${config.lesion_area.s[0]}
    - ${config.lesion_area.s[1]}
  v: !!python/tuple
    - ${config.lesion_area.v[0]}
    - ${config.lesion_area.v[1]}
lesion_centre:
  h: !!python/tuple
    - ${DEFAULTS.lesion_centre.h[0]}
    - ${DEFAULTS.lesion_centre.h[1]}
  s: !!python/tuple
    - ${DEFAULTS.lesion_centre.s[0]}
    - ${DEFAULTS.lesion_centre.s[1]}
  v: !!python/tuple
    - ${DEFAULTS.lesion_centre.v[0]}
    - ${DEFAULTS.lesion_centre.v[1]}
scale_card:
  h: !!python/tuple
    - ${config.scale_card.h[0]}
    - ${config.scale_card.h[1]}
  s: !!python/tuple
    - ${config.scale_card.s[0]}
    - ${config.scale_card.s[1]}
  v: !!python/tuple
    - ${config.scale_card.v[0]}
    - ${config.scale_card.v[1]}`
}

export function getConfigPath(uuid: string): string {
  return join(process.cwd(), 'uploads', uuid, 'config.yaml')
}

export async function parseConfigFile(pathToFile: string): Promise<any> {
  const data = await readFile(pathToFile, 'utf8')
  return YAML.parse(data, { customTags: [pythonTuple] })
}

export async function readConfig(uuid: string): Promise<any> {
  return parseConfigFile(getConfigPath(uuid))
}

export async function writeConfig(uuid: string, configData: typeof DEFAULTS): Promise<void> {
  const yamlStr = generateConfigYaml(configData)
  const writePath = getConfigPath(uuid)
  await writeFile(writePath, yamlStr, 'utf8')
}

export default {
  DEFAULTS,
  readConfig,
  writeConfig,
  getConfigPath,
  parseConfigFile
}
