import { GraphQLSchema, isObjectType, isIntrospectionType } from 'graphql';
import * as YAML from 'yamljs';
import { writeFileSync } from 'fs';

import { buildSchemaObjectFromType } from './types';
import { buildPathFromOperation } from './operations';
import { RouteInfo } from '../types';
import { OpenAPI } from './interfaces';

export function OpenAPI({
  schema,
  info,
}: {
  schema: GraphQLSchema;
  info: Record<string, any>;
}) {
  const types = schema.getTypeMap();
  const swagger: any = {
    openapi: '3.0.0',
    info,
    paths: {},
    components: {
      schemas: {},
    },
  };

  for (const typeName in types) {
    const type = types[typeName];

    if (isObjectType(type) && !isIntrospectionType(type)) {
      swagger.components!.schemas![typeName] = buildSchemaObjectFromType(type);
    }
  }

  return {
    addRoute(
      info: RouteInfo,
      config?: {
        basePath?: string;
      }
    ) {
      const basePath = (config && config.basePath) || '';
      const path = basePath + info.path;

      if (!swagger.paths[path]) {
        swagger.paths[path] = {};
      }

      swagger.paths[path][info.method.toLowerCase()] = buildPathFromOperation({
        operation: info.document,
        schema,
      });
    },
    get() {
      return swagger;
    },
    save(filepath: string) {
      const isJSON = /\.json$/i;
      const isYAML = /.ya?ml$/i;

      if (isJSON.test(filepath)) {
        writeOutput(filepath, JSON.stringify(swagger, null, 2));
      } else if (isYAML.test(filepath)) {
        writeOutput(filepath, YAML.stringify(swagger));
      } else {
        throw new Error('We only support JSON and YAML files');
      }
    },
  };
}

function writeOutput(filepath: string, contents: string) {
  writeFileSync(filepath, contents, {
    encoding: 'utf-8',
  });
}
