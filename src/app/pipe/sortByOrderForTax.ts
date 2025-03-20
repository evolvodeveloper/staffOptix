import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'sortBySortOrder '
})
export class sortBySortOrderPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    // sortBySortOrder = (a: any, b: any): number => {
    //     console.log('Sorting:', a, b);
    //     return a.value.sortOrder - b.value.sortOrder;
    // };
    transform(value: { key: string; value: any }[]): { key: string; value: any }[] {
        if (!value || !Array.isArray(value)) {
            return value; // If not an array, return the original value
        }
        return value.sort((a, b) => a.value.sortOrder - b.value.sortOrder);
    }
}