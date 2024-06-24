import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { RecentFilesService } from "./recent-files.service";

@Component({
    selector: 'rx-recent-files',
    templateUrl: './recent-files.component.html',
    styleUrls: ['./recent-files.component.scss']
})
export class RecentFilesComponent implements OnInit {
    @Output('select') onSelect = new EventEmitter();

     recentFiles: any[] = [];

    constructor(private recentFilesService: RecentFilesService) {}

    ngOnInit() {
        this.recentFilesService.getRecentFiles().then(files => {
            this.recentFiles = files
        });
    }

    onSelectFile (item: any) {
        this.onSelect.emit(item)
    }
}