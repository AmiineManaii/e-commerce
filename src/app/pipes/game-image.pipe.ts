import { Pipe, PipeTransform } from '@angular/core';
import { resolveGameImage } from '../services/game.service';

/**
 * Usage: [src]="game.coverImage | gameImage"
 * - http(s) : gardée telle quelle
 * - /assets/... ou assets/... : normalisée (sans le '.' parasite)
 * - vide / undefined : placeholder local
 */
@Pipe({
  name: 'gameImage',
  standalone: true
})
export class GameImagePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return resolveGameImage(value);
  }
}
