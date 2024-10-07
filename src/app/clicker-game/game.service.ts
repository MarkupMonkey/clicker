import { Injectable, inject } from '@angular/core';
import {ReplaySubject, interval, timer, Subject, BehaviorSubject} from 'rxjs';
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
  private timeLeftSubject = new BehaviorSubject<number>(0);

  score$ = this.score.asObservable();
  level$ = this.level.asObservable();
  upgradeMultiplier$ = this.upgradeMultiplier.asObservable();
  autoClickerLevel$ = this.autoClickerLevel.asObservable();
  timeLeft$ = this.timeLeftSubject.asObservable(); // Nuova proprietà per il timer


  getScoreValue(): number {
    return this.score.value ?? 0;
  }

  getLevelValue(): number {
    return this.level.value ?? 1;
  }

  getUpgradeMultiplierValue(): number {
    return this.upgradeMultiplier.value ?? 1;
  }

  getAutoClickerLevelValue(): number {
    return this.autoClickerLevel.value ?? 0;
  }

  incrementScore() {
    const currentMultiplier = this.getUpgradeMultiplierValue();
    this.score.next(this.getScoreValue() + 1 * currentMultiplier);
  }

  nextLevel() {
    if ((this.score.getValue() ?? 0) >= this.getScoreRequirement()) {
      this.level.next(this.getLevelValue() + 1);
      this.increaseDifficulty();
      this.startLevelTimer();
    }
  }

  buyUpgrade(multiplier: number) {
    if ((this.score.getValue() ?? 0) >= this.getUpgradeCost()) {
      this.score.next((this.score.getValue() ?? 0) - this.getUpgradeCost());
      this.upgradeMultiplier.next(this.getUpgradeMultiplierValue() + multiplier);
    }
  }

  buyAutoClicker() {
    if ((this.score.getValue() ?? 0) >= this.getAutoClickerCost()) {
      this.score.next(this.getScoreValue() - this.getAutoClickerCost());
      const currentLevel = this.getAutoClickerLevelValue();
      this.autoClickerLevel.next(this.getAutoClickerLevelValue() + 1);
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
    this.timeLeftSubject.next(60);
    timer(0, 1000) // Timer che aggiorna ogni secondo
      .pipe(takeUntil(this.stopGame$))
      .subscribe(() => {
        let timeLeft = this.timeLeftSubject.getValue();
        if (timeLeft > 0) {
          timeLeft--;
          this.timeLeftSubject.next(timeLeft); // Aggiungere visualizzazione del timer in UI
        } else {
          this.stopGame();
          alert('Tempo scaduto! Riprova il livello.');
        }
      });
  }

  startRandomEvents() {
    interval(15000) // Ogni 15 secondi si verifica un evento casuale
      .pipe(takeUntil(this.stopGame$))
      .subscribe(() => {
        this.triggerRandomEvent();
      });
  }

  triggerRandomEvent() {
    const eventType = Math.random();
    if (eventType < 0.5) {
      // Penalità
      const penalty = Math.floor(this.getScoreValue() * 0.1);
      this.score.next(this.getScoreValue() - penalty);
      alert(`Penalità! Hai perso ${penalty} punti.`);
    } else {
      // Bonus
      const bonus = Math.floor(this.getScoreValue() * 0.2);
      this.score.next(this.getScoreValue() + bonus);
      alert(`Bonus! Hai guadagnato ${bonus} punti.`);
    }
  }

  stopGame() {
    this.stopGame$.next();
  }

  private increaseDifficulty() {
    const newLevel = this.getLevelValue();
    if (newLevel % 5 === 0) {
      this.buyUpgrade(1); // Aumenta il moltiplicatore ogni 5 livelli
    }
  }

  private getScoreRequirement(): number {
    return this.getLevelValue() * 20; // Punteggio richiesto per avanzare di livello
  }

  private getUpgradeCost(): number {
    return this.getUpgradeMultiplierValue() * 30; // Costo per acquistare un potenziamento
  }

  private getAutoClickerCost(): number {
    return (this.getAutoClickerLevelValue() + 1) * 50; // Costo per acquistare un auto-clicker
  }
}
