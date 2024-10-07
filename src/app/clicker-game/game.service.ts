import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subject, timer } from 'rxjs';
import { map, takeUntil, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private score = new BehaviorSubject<number>(0);
  private level = new BehaviorSubject<number>(1);
  private upgradeMultiplier = new BehaviorSubject<number>(1);
  private autoClickerLevel = new BehaviorSubject<number>(0);
  private stopGame$ = new Subject<void>();
  private levelTimer$ = new Subject<void>();

  score$ = this.score.asObservable();
  level$ = this.level.asObservable();
  upgradeMultiplier$ = this.upgradeMultiplier.asObservable();
  autoClickerLevel$ = this.autoClickerLevel.asObservable();

  constructor() {}

  incrementScore() {
    const currentMultiplier = this.upgradeMultiplier.getValue();
    this.score.next(this.score.getValue() + 1 * currentMultiplier);
  }

  nextLevel() {
    if (this.score.getValue() >= this.getScoreRequirement()) {
      this.level.next(this.level.getValue() + 1);
      this.increaseDifficulty();
      this.startLevelTimer();
    }
  }

  buyUpgrade(multiplier: number) {
    if (this.score.getValue() >= this.getUpgradeCost()) {
      this.score.next(this.score.getValue() - this.getUpgradeCost());
      this.upgradeMultiplier.next(this.upgradeMultiplier.getValue() + multiplier);
    }
  }

  buyAutoClicker() {
    if (this.score.getValue() >= this.getAutoClickerCost()) {
      this.score.next(this.score.getValue() - this.getAutoClickerCost());
      const currentLevel = this.autoClickerLevel.getValue();
      this.autoClickerLevel.next(currentLevel + 1);
      this.startAutoIncrement();
    }
  }

  startAutoIncrement() {
    const intervalTime = 1000 / (1 + this.autoClickerLevel.getValue());
    interval(intervalTime)
      .pipe(
        takeUntil(this.stopGame$),
        map(() => this.incrementScore())
      )
      .subscribe();
  }

  startLevelTimer() {
    this.levelTimer$.next();
    timer(30000) // 30 secondi per completare il livello
      .pipe(takeUntil(this.levelTimer$))
      .subscribe(() => {
        this.stopGame();
        alert('Tempo scaduto! Riprova il livello.');
      });
  }

  stopGame() {
    this.stopGame$.next();
  }

  private increaseDifficulty() {
    // Aumenta la difficoltà riducendo l'intervallo o aumentando requisiti per il livello
    const newLevel = this.level.getValue();
    if (newLevel % 5 === 0) {
      this.buyUpgrade(1); // Aumenta il moltiplicatore ogni 5 livelli
    }
  }

  private getScoreRequirement(): number {
    return this.level.getValue() * 10; // Punteggio richiesto per avanzare di livello
  }

  private getUpgradeCost(): number {
    return this.upgradeMultiplier.getValue() * 20; // Costo per acquistare un potenziamento
  }

  private getAutoClickerCost(): number {
    return (this.autoClickerLevel.getValue() + 1) * 50; // Costo per acquistare un auto-clicker
  }
}
