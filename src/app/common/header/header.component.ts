import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Ripple } from 'primeng/ripple';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { HideHeaderDirective } from '../../directives/hideHeader.directive';

@Component({
  selector: 'app-header',
  imports: [
    Button,
    Ripple,
    AsyncPipe,
    Card,
    RouterLink,
    RouterLinkActive,
    HideHeaderDirective
  ],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  isDarkTheme$: Observable<boolean>;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }


  toggleTheme() {
    this.themeService.toggleTheme();
  }

}