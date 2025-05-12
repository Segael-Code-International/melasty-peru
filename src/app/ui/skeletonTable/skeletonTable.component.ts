import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-table',
  imports: [],
  templateUrl: './skeletonTable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonTableComponent { }
