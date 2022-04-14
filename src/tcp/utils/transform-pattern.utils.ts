import {
  isObject,
  isString,
  isNumber,
} from '@nestjs/common/utils/shared.utils';
import { MsPattern } from '../interfaces/patter.interface';

export function transformPatternToRoute(pattern: MsPattern): string {
  if (isString(pattern) || isNumber(pattern)) {
    return `${pattern}`;
  }
  if (!isObject(pattern)) {
    return pattern;
  }

  const sortedKeys = Object.keys(pattern).sort((a, b) =>
    ('' + a).localeCompare(b),
  );

  // Creates the array of Pattern params from sorted keys and their corresponding values
  const sortedPatternParams = sortedKeys.map((key) => {
    let partialRoute = `"${key}":`;
    partialRoute += isString(pattern[key])
      ? `"${transformPatternToRoute(pattern[key])}"`
      : transformPatternToRoute(pattern[key]);
    return partialRoute;
  });

  const route = sortedPatternParams.join(',');
  return `{${route}}`;
}
