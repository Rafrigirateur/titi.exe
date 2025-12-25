import 'dotenv/config';

export const tiana = {
    mood: 100,
    health: 100,
    maxMood: 100,
    maxHealth: 100,

    incrMood(ratio) {
        if (this.mood + ratio < 0) {
            if (this.health + this.mood + ratio < 0) {
                this.health = 0;
            } else {
                this.health += this.mood + ratio;
            }
            this.mood = 0;
            return;
        }
        if (this.mood + ratio > this.maxMood) {
            this.mood = this.maxMood;
            return;
        }
        this.mood += ratio;
    },
    subMood(ratio) {
        this.incrMood(-ratio);
    },
    incrHealth(ratio) {
        if (this.health + ratio < 0) {
            if (this.mood + this.health + ratio < 0) {
                this.mood = 0;
            } else {
                this.mood += this.health + ratio;
            }
            this.health = 0;
            return;
        }
        if (this.health + ratio > this.maxHealth) {
            this.health = this.maxHealth;
            return;
        }
        this.health += ratio;
    },
    subHealth(ratio) {
        this.incrHealth(-ratio);
    },
    getMood() {
        return this.mood;
    },
    getHealth() {
        return this.health;
    },
    motivation() { // Renvoie vrai ou faux, plus de chances de vrai si l'humeur est haute
        return Math.floor(Math.random() * this.maxMood) < this.getMood();
    },
    emojiMood() {
        if (this.health <= this.mood){
            if (this.health >= this.maxHealth * 0.8) return '😁';
            if (this.health >= this.maxHealth * 0.6) return '🥴';
            if (this.health >= this.maxHealth * 0.4) return '🫩';
            if (this.health >= this.maxHealth * 0.2) return '🤒';
            return '🤕';
        } else {
            if (this.mood >= this.maxMood * 0.8) return '😁';
            if (this.mood >= this.maxMood * 0.65) return '😌';
            if (this.mood >= this.maxMood * 0.5) return '😕';
            if (this.mood >= this.maxMood * 0.35) return '😣';
            if (this.mood >= this.maxMood * 0.20) return '😓';
            return '😓';
        }
    }
};
