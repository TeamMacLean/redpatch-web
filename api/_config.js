import path from 'path';
import YAML from 'yaml';
import { parseSeq, stringifyString } from 'yaml/util'
import fs from 'fs';

const pythonTuple = {
  tag: 'tag:yaml.org,2002:python/tuple',
  resolve: parseSeq,
  stringify: stringifyString
}
YAML.defaultOptions.customTags = [pythonTuple]

const DEFAULTS = {
  healthy_area: {
    h: [0.1568627450980392, 1.0],
    s: [0.19607843137254902, 1.0],
    v: [0.0, 1.0]
  },
  leaf_area: {
    h: [0.0, 1.0],
    s: [0.1960784313725490, 1.0],
    v: [0.1568627450980392, 1.0]
  },
  lesion_area: {
    h: [0.0, 0.1607843137254902],
    s: [0.14901960784313725, 1.0],
    v: [0.43529411764705883, 1.0]
  },
  scale_card: {
    h: [0.61, 1.0],
    s: [0.17, 1.0],
    v: [0.25, 0.75]
  }
};


const template = function (config) {
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

function getPath(uuid) {
  return path.join(__dirname, '..', 'uploads', uuid, `config.yaml`)
}

function parseFile(pathToFile) {
  return new Promise((good, bad) => {
    fs.readFile(pathToFile, 'utf8', function (err, data) {
      if (err) {
        return bad(err);
      } else {
        return good(YAML.parse(data))
      }
    });

  })
}

function read(uuid) {
  return parseFile(getPath(uuid))
  // return new Promise((good, bad) => {
  //   fs.readFile(getPath(uuid), 'utf8', function (err, data) {
  //     if (err) {
  //       return bad(err);
  //     } else {
  //       return good(YAML.parse(data))
  //     }
  //   });

  // })
}
function write(uuid, configData) {
  return new Promise((good, bad) => {
    let yamlStr = template(configData)
    // let yamlStr = YAML.stringify(template(configData));
    const writePath = getPath(uuid)
    fs.writeFile(writePath, yamlStr, 'utf8', function (err) {
      if (err) {
        return bad(err);
      } else {
        return good()
      }
    });
  })
}

export default { template, read, write, getPath, parseFile, DEFAULTS }