import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KNOWLEDGE_BASE, KnowledgeEntry } from './knowledge-base';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  userQuestion = '';
  messages: { from: 'user' | 'bot', text: string }[] = [];
  history: string[] = [];
  isBotTyping = false;

  knowledgeBase = KNOWLEDGE_BASE;

  ngOnInit(): void {
    const savedMessages = localStorage.getItem('chatbot_messages');
    const savedHistory = localStorage.getItem('chatbot_history');
    if (savedMessages) this.messages = JSON.parse(savedMessages);
    if (savedHistory) this.history = JSON.parse(savedHistory);
  }

  onAskQuestion() {
    const question = this.userQuestion.trim();
    if (!question) return;

    this.ask(question);
    this.userQuestion = '';
  }

  ask(question: string) {
    this.messages.push({ from: 'user', text: question });
    if (!this.history.includes(question)) this.history.push(question);

    this.isBotTyping = true;

    setTimeout(() => {
      const questionLC = question.toLowerCase();
      let maxHits = 0;
      let candidates: KnowledgeEntry[] = [];

      for (const entry of this.knowledgeBase) {
        const hits = entry.keywords.filter(k => questionLC.includes(k.toLowerCase())).length;
        if (hits > 0) {
          if (hits > maxHits) {
            maxHits = hits;
            candidates = [entry];
          } else if (hits === maxHits) {
            candidates.push(entry);
          }
        }
      }

      const response = candidates.length > 0
        ? candidates.map(e => `[${e.category}] ${e.response}`).join('\n\n---\n\n')
        : "❌ I don't have a precise answer. Try using another keyword (e.g., plugin, port, crash).";

      this.messages.push({ from: 'bot', text: response });
      this.isBotTyping = false;
      this.saveToLocalStorage();
    }, 500);
  }

  replayFromHistory(q: string) {
    this.ask(q);
  }

  saveToLocalStorage() {
    localStorage.setItem('chatbot_messages', JSON.stringify(this.messages));
    localStorage.setItem('chatbot_history', JSON.stringify(this.history));
  }

  clearChat() {
    this.messages = [];
    this.history = [];
    this.isBotTyping = false;
    localStorage.removeItem('chatbot_messages');
    localStorage.removeItem('chatbot_history');
  }
}
