import mongoose, { Schema } from 'mongoose';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import YAML from 'yaml';

const pythonTuple = {
  tag: "tag:yaml.org,2002:python/tuple",
  resolve: (seq) => seq,
  stringify: (item) => item.value
};
const DEFAULTS = {
  healthy_area: {
    h: [0.1568627450980392, 1],
    s: [0.19607843137254902, 1],
    v: [0, 1]
  },
  leaf_area: {
    h: [0, 1],
    s: [0.196078431372549, 1],
    v: [0.1568627450980392, 1]
  },
  lesion_area: {
    h: [0, 0.1607843137254902],
    s: [0.14901960784313725, 1],
    v: [0.43529411764705883, 1]
  },
  lesion_centre: {
    h: [0, 0.1607843137254902],
    s: [0.14901960784313725, 1],
    v: [0.43529411764705883, 1]
  },
  scale_card: {
    h: [0.61, 1],
    s: [0.17, 1],
    v: [0.25, 0.75]
  }
};
function generateConfigYaml(config) {
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
    - ${config.scale_card.v[1]}`;
}
function getConfigPath(uuid) {
  return join(process.cwd(), "uploads", uuid, "config.yaml");
}
async function parseConfigFile(pathToFile) {
  const data = await readFile(pathToFile, "utf8");
  return YAML.parse(data, { customTags: [pythonTuple] });
}
async function readConfig(uuid) {
  return parseConfigFile(getConfigPath(uuid));
}
async function writeConfig(uuid, configData) {
  const yamlStr = generateConfigYaml(configData);
  const writePath = getConfigPath(uuid);
  await writeFile(writePath, yamlStr, "utf8");
}

const submissionSchema = new Schema({
  uuid: {
    required: true,
    type: String
  },
  previewFile: {
    type: Schema.Types.ObjectId,
    ref: "File",
    required: false
  },
  preLoading: {
    default: false,
    type: Boolean
  },
  preLoaded: {
    default: false,
    type: Boolean
  },
  processingPID: {
    type: String
  },
  processingAll: {
    default: false,
    type: Boolean
  },
  processedAll: {
    default: false,
    type: Boolean
  },
  scaleCM: {
    type: Number,
    default: 0
  },
  hasScaleCard: {
    default: false,
    type: Boolean
  },
  leafAreaPID: {
    type: String
  },
  healthyAreaPID: {
    type: String
  },
  lesionAreaPID: {
    type: String
  },
  scaleCardPID: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});
submissionSchema.virtual("files", {
  ref: "File",
  localField: "_id",
  foreignField: "submission",
  justOne: false
});
submissionSchema.pre("save", async function(next) {
  if (this.isNew) {
    try {
      await writeConfig(this.uuid, DEFAULTS);
      next();
    } catch (err) {
      console.log("Failed to write config:", err);
      next(err);
    }
  } else {
    next();
  }
});
submissionSchema.methods.updateConfig = async function(newConfig) {
  await writeConfig(this.uuid, newConfig);
};
const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

export { Submission as S, parseConfigFile as p, readConfig as r };
//# sourceMappingURL=Submission.mjs.map
