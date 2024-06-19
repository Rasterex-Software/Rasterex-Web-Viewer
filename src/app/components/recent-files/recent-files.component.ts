import { Component, OnInit } from "@angular/core";
import { RecentFilesService } from "./recent-files.service";

@Component({
    selector: 'rx-recent-files',
    templateUrl: './recent-files.component.html',
    styleUrls: ['./recent-files.component.scss']
})
export class RecentFilesComponent implements OnInit {
     recentFiles = [];

    constructor(private recentFilesService: RecentFilesService) {}

    ngOnInit() {
        this.recentFiles = this.recentFilesService.getRecentFiles();
    }
}