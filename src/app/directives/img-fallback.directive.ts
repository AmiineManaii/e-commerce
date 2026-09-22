import { Directive, HostListener, Input } from '@angular/core';
import { GAME_PLACEHOLDER } from '../services/game.service';

/**
 * Usage: <img [src]="..." appImgFallback>
 * Si l'image (URL externe ou assets) échoue -> placeholder local, sans boucle infinie.
 */
@Directive({
  selector: 'img[appImgFallback]',
  standalone: true
})
export class ImgFallbackDirective {
  @Input() fallback: string = GAME_PLACEHOLDER;
  private alreadyFailed = false;

  @HostListener('error', ['$event'])
  onError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img || this.alreadyFailed) return;
    if (img.src.endsWith(this.fallback)) {
      this.alreadyFailed = true;
      return;
    }
    this.alreadyFailed = true;
    img.src = this.fallback;
  }
}
