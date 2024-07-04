import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'rx-links-library',
  templateUrl: './links-library.component.html',
  styleUrls: ['./links-library.component.scss']
})
export class LinksLibraryComponent implements OnInit {
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  opened: boolean = false;
  link: string = "";
  links: any[] = [];

  ngOnInit(): void {
    this.getLinks();
  }
  isValidLink(): boolean {
    return this.link === '' || this.link.startsWith('http://') || this.link.startsWith('https://');
  }
  
  addLink(event: any) {
    const storedLinks = JSON.parse(localStorage.getItem('AddedLinks') || '[]');
    storedLinks.push(this.link);
    localStorage.setItem('AddedLinks', JSON.stringify(storedLinks));
    this.opened = false;
    this.getLinks();
  }

  
  getLinks() {
    const storedLinks = JSON.parse(localStorage.getItem('AddedLinks') || '[]');
    this.links = storedLinks.map((link, index) => ({
      id: index,
      src: this.createSVGForLink(link),
      height: 40,
      width: 222
    }));

    if (storedLinks.length > 0) {
      console.log('Links retrieved successfully:', this.links);
    } else {
      console.log('No links found in local storage.');
    }
  }

  createSVGForLink(link: string): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="50">
        <rect width="300" height="50" style="fill:none;stroke-width:1;stroke:none" />
        <text x="10" y="25" font-family="Arial" font-size="14" fill="blue">${link}</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }
  deleteLink(index: number): void {
    let links = JSON.parse(localStorage.getItem('AddedLinks') || '[]');
    
    if (index > -1 && index < links.length) {
      links.splice(index, 1);
      localStorage.setItem('AddedLinks', JSON.stringify(links));
      this.getLinks();
    } else {
      console.error('Invalid index for deleting link');
    }
  }

  onPanelClose(): void {
    this.onClose.emit();
  }
}
