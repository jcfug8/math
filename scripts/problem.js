// ProblemDisplay component
import { AdditionProblem } from './addition-problem.js';
import { SubtractionProblem } from './subtraction-problem.js';
import { MultiplicationProblem } from './multiplication-problem.js';
import { DivisionProblem } from './division-problem.js';

export const ProblemDisplay = {
  components: {
    AdditionProblem,
    SubtractionProblem,
    MultiplicationProblem,
    DivisionProblem
  },
  props: ['problem', 'format', 'displayFormat', 'decimalPrecision'],
  template: `
    <div v-if="problem">
      <!-- Addition -->
      <AdditionProblem 
        v-if="problem.operation === '+'"
        :numbers="problem.numbers"
        :displayFormat="displayFormat"
      />
      
      <!-- Subtraction -->
      <SubtractionProblem 
        v-if="problem.operation === '-'"
        :numbers="problem.numbers"
        :displayFormat="displayFormat"
      />
      
      <!-- Multiplication -->
      <MultiplicationProblem 
        v-if="problem.operation === '*'"
        :numbers="problem.numbers"
        :displayFormat="displayFormat"
      />
      
      <!-- Division -->
      <DivisionProblem 
        v-if="problem.operation === '/'"
        :numbers="problem.numbers"
        :displayFormat="displayFormat"
      />
      
      <!-- Fallback for unknown operations -->
      <div v-if="problem.operation !== '+' && problem.operation !== '-' && problem.operation !== '*' && problem.operation !== '/'" class="problem-display">
        {{ problem.expression }} = ?
      </div>
      
      <div v-if="format === 'fill-in-blank'">
        <input
          v-model="userAnswer"
          @keyup.enter="submitAnswer"
          class="answer-input"
          type="number"
          step="0.01"
          placeholder="Answer"
          ref="answerInput"
        />
        <div style="margin-top: 15px;">
          <button @click="submitAnswer" class="nav-button submit-button" style="max-width: 200px;">
            Submit Answer
          </button>
        </div>
      </div>
      
      <div v-if="format === 'multiple-choice'" class="multiple-choice-options">
        <button
          v-for="(option, index) in shuffledOptions"
          :key="index"
          @click="selectAnswer(option)"
          :class="['multiple-choice-option', { 
            'correct': selectedAnswer === option && option === problem.answer,
            'incorrect': selectedAnswer === option && option !== problem.answer
          }]"
          :disabled="selectedAnswer !== null"
        >
          {{ option }}
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      userAnswer: '',
      selectedAnswer: null,
      shuffledOptions: []
    };
  },
  watch: {
    problem() {
      // Reset when problem changes
      this.userAnswer = '';
      this.selectedAnswer = null;
      this.shuffleOptions();
      // Focus input if fill-in-blank
      if (this.$refs.answerInput && this.format === 'fill-in-blank') {
        this.$nextTick(() => {
          this.$refs.answerInput.focus();
        });
      }
    }
  },
  mounted() {
    this.shuffleOptions();
    if (this.$refs.answerInput && this.format === 'fill-in-blank') {
      this.$nextTick(() => {
        this.$refs.answerInput.focus();
      });
    }
  },
  methods: {
    shuffleOptions() {
      if (this.problem && this.format === 'multiple-choice') {
        const options = [this.problem.answer, ...this.problem.wrongAnswers];
        // Shuffle array
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        this.shuffledOptions = options;
      }
    },
    submitAnswer() {
      if (this.format === 'fill-in-blank') {
        const answer = parseFloat(this.userAnswer);
        if (isNaN(answer)) {
          return;
        }
        // Use precision-based tolerance: half of the smallest unit
        const precision = this.decimalPrecision !== undefined ? this.decimalPrecision : 2;
        const tolerance = Math.pow(10, -(precision + 1)) / 2;
        const isCorrect = Math.abs(answer - this.problem.answer) < tolerance;
        this.$emit('answer-submitted', isCorrect);
      }
    },
    selectAnswer(option) {
      if (this.selectedAnswer !== null) return;
      
      this.selectedAnswer = option;
      // Use precision-based tolerance: half of the smallest unit
      const precision = this.decimalPrecision !== undefined ? this.decimalPrecision : 2;
      const tolerance = Math.pow(10, -(precision + 1)) / 2;
      const isCorrect = Math.abs(option - this.problem.answer) < tolerance;
      
      setTimeout(() => {
        this.$emit('answer-submitted', isCorrect);
      }, 500);
    }
  }
};

