import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'logLevelClass', standalone: true })
export class LogLevelClassPipe implements PipeTransform {
  transform(level: string): string {
    switch (level) {
      case 'info':
        return 'list-group-item-success';
      case 'warning':
        return 'list-group-item-warning';
      case 'error':
        return 'list-group-item-danger';
      default:
        return '';
    }
  }
}