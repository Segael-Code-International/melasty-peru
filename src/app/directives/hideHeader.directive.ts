import { Directive, ElementRef, HostListener, Renderer2, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appHideHeader]',
  standalone: true
})
export class HideHeaderDirective {
  private lastScrollPosition = 0;
  private readonly SCROLL_THRESHOLD = 10;
  private isVisible = true;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.renderer.setStyle(this.el.nativeElement, 'transition', 'opacity 0.5s ease-in-out');
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser) return;

    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollPosition < this.SCROLL_THRESHOLD) {
      this.showHeader();
      return;
    }

    if (currentScrollPosition > this.lastScrollPosition) {
      this.hideHeader();
    } else {
      this.showHeader();
    }

    this.lastScrollPosition = currentScrollPosition;
  }

  private hideHeader() {
    if (this.isVisible && this.isBrowser) {
      this.renderer.setProperty(this.el.nativeElement, 'hidden', true);
      this.isVisible = false;
    }
  }

  private showHeader() {
    if (!this.isVisible && this.isBrowser) {
      this.renderer.removeAttribute(this.el.nativeElement, 'hidden');
      this.isVisible = true;
    }
  }
}