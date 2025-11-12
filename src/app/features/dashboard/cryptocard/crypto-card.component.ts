import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Crypto } from '../../../core/models/crypto.model';
import { NumberSignPipe } from '../../../shared/pipes/number-sign.pipe';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule, NumberSignPipe],
  templateUrl: './crypto-card.component.html',
  styleUrls: ['./crypto-card.component.scss'],
})
export class CryptoCardComponent {
  @Input() crypto!: Crypto;
}
