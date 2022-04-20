import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidationException } from '../exeptions/validation.exeption';
import { MappedError } from '../interfaces/mapped-error';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);
    if (errors.length) {
      const mappedErrors = this.mapError(errors);
      throw new ValidationException('Validation error', mappedErrors);
    }
    return value;
  }

  mapError(errors: ValidationError[]) {
    return errors.reduce<MappedError>((accumulator, item) => {
      const arrayConstrains = Object.values(item.constraints);
      accumulator[item.property] = arrayConstrains;
      return accumulator;
    }, {});
  }
}
