import { Directive, HostListener, Input } from '@angular/core';
import { RXCore } from 'src/rxcore';

@Directive({
  selector: '[linkTemplate]'
})
export class LinkDragDropDirective {
  @Input() linkTemplate: any;
  private svgBase64: string;

  private svgTemplate = `
    <svg height="200px" width="200px" version="1.1" id="Layer_1"
      xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 280.067 280.067" xml:space="preserve" fill="#000000">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <path style="fill:#4d4947;" d="M149.823,257.142c-31.398,30.698-81.882,30.576-113.105-0.429
            c-31.214-30.987-31.337-81.129-0.42-112.308l-0.026-0.018L149.841,31.615l14.203-14.098
            c23.522-23.356,61.65-23.356,85.172,0 s23.522,61.221,0,84.586l-125.19,123.02l-0.044-0.035
            c-15.428,14.771-40.018,14.666-55.262-0.394 c-15.244-15.069-15.34-39.361-0.394-54.588l-0.044-0.053
            l13.94-13.756l69.701-68.843l13.931,13.774l-83.632,82.599
            c-7.701,7.596-7.701,19.926,0,27.53s20.188,7.604,27.88,0L235.02,87.987l-0.035-0.026
            l0.473-0.403 c15.682-15.568,15.682-40.823,0-56.39s-41.094-15.568-56.776,0l-0.42,0.473
            l-0.026-0.018l-14.194,14.089L50.466,158.485
            c-23.522,23.356-23.522,61.221,0,84.577s61.659,23.356,85.163,0l99.375-98.675l14.194-14.089l14.194,14.089
            l-14.194,14.098 l-99.357,98.675C149.841,257.159,149.823,257.142,149.823,257.142z"></path>
          <text x="10" y="20" style="visibility: hidden;">Content</text>
        </g>
      </g>
    </svg>
  `;

  constructor() {}

  private updateSvgString(textContent: string): void {
    this.svgTemplate = `
      <svg height="200px" width="200px" version="1.1" id="Layer_1"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 280.067 280.067" xml:space="preserve" fill="#000000">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <g>
            <path style="fill:#4d4947;" d="M149.823,257.142c-31.398,30.698-81.882,30.576-113.105-0.429
              c-31.214-30.987-31.337-81.129-0.42-112.308l-0.026-0.018L149.841,31.615l14.203-14.098
              c23.522-23.356,61.65-23.356,85.172,0 s23.522,61.221,0,84.586l-125.19,123.02l-0.044-0.035
              c-15.428,14.771-40.018,14.666-55.262-0.394 c-15.244-15.069-15.34-39.361-0.394-54.588l-0.044-0.053
              l13.94-13.756l69.701-68.843l13.931,13.774l-83.632,82.599
              c-7.701,7.596-7.701,19.926,0,27.53s20.188,7.604,27.88,0L235.02,87.987l-0.035-0.026
              l0.473-0.403 c15.682-15.568,15.682-40.823,0-56.39s-41.094-15.568-56.776,0l-0.42,0.473
              l-0.026-0.018l-14.194,14.089L50.466,158.485
              c-23.522,23.356-23.522,61.221,0,84.577s61.659,23.356,85.163,0l99.375-98.675l14.194-14.089l14.194,14.089
              l-14.194,14.098 l-99.357,98.675C149.841,257.159,149.823,257.142,149.823,257.142z"></path>
            <text x="10" y="20" style="visibility: hidden;">${textContent}</text>
          </g>
        </g>
      </svg>
    `;
    this.svgBase64 = btoa(this.svgTemplate);
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) return;

    const svgData = this.linkTemplate.src.split(',')[1];
    const svgString = atob(svgData);
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const textElement = svgDoc.querySelector('text');
    let textContent = 'Content';
    if (textElement) {
      textContent = textElement.textContent || 'Content';
      console.log('Text Content:', textContent);
    }

    // Update the SVG string with the text content
    this.updateSvgString(textContent);

    // Deep copy the template object to avoid modifying the original
    const updatedlinkTemplate = JSON.parse(JSON.stringify(this.linkTemplate));
    updatedlinkTemplate.src = `data:image/svg+xml;base64,${this.svgBase64}`;
    updatedlinkTemplate.height = 20;
    updatedlinkTemplate.width = 20;
    updatedlinkTemplate.text = textContent;

    RXCore.markupLink(true);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData('Text', JSON.stringify(updatedlinkTemplate));
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    RXCore.markupLink(false);
  }
}
