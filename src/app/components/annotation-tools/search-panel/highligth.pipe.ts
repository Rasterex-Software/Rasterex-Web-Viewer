import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'highlight',
    pure: true,
})
export class HighlightPipe implements PipeTransform {
    private cache: Map<string, string> = new Map<string, string>();
    transform(value: string, searchText: string, caseSensitive: boolean): string {
        if(!searchText || ! value) { return value; }

        const cacheKey = `${value}#${searchText}`;
        if (this.cache.has(cacheKey)) {
            return value;
        }

        const flags = caseSensitive ? 'g' : 'gi';
        const re = new RegExp(searchText,  flags);
        const highlightedValue = value.replace(re, `<span style="background-color:yellow">$&</span>`);
        this.cache.set(cacheKey, highlightedValue);
        return highlightedValue;
    }
}