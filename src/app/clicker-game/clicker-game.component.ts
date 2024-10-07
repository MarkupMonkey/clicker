import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';

@Component({
  selector: 'app-clicker-game',
  templateUrl: './clicker-game.component.html',
  styleUrls: ['./clicker-game.component.scss']
})
export class ClickerGameComponent implements OnInit {
  score$ = this.gameService.score$;
  level$ = this.gameService.level$;
  upgradeMultiplier$ = this.gameService.upgradeMultiplier$;
  autoClickerLevel$ = this.gameService.autoClickerLevel$;
  timeLeft$ = this.gameService.timeLeft$;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.startAutoIncrement();
    this.gameService.startLevelTimer();
  }

  onScoreClick() {
    this.gameService.incrementScore();
  }

  onNextLevelClick() {
    this.gameService.nextLevel();
  }

  onBuyUpgradeClick() {
    this.gameService.buyUpgrade(1); // Aumenta il moltiplicatore di 1
  }

  onBuyAutoClickerClick() {
    this.gameService.buyAutoClicker(); // Acquista un livello di auto-clicker
  }
}
