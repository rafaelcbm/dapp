import { EventsService } from './../dashboard/eventsService.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './full-layout.component.html',
    styleUrls: ['./full-layout.component.scss']
})
export class FullLayoutComponent implements OnInit {

    public disabled = false;
    public status: { isopen: boolean } = { isopen: false };

    public progressBarVisible = false;

    public toggled(open: boolean): void {
    }

    public toggleDropdown($event: MouseEvent): void {
        $event.preventDefault();
        $event.stopPropagation();
        this.status.isopen = !this.status.isopen;
    }

    constructor(private eventsService: EventsService, private ref: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.eventsService.progressBarSource$
            .subscribe(showProgressBar => {
                this.showProgressBar(showProgressBar)
            });
    }

    showProgressBar(showProgressBar: boolean) {
        this.progressBarVisible = showProgressBar;
        this.ref.detectChanges();
    }
}
