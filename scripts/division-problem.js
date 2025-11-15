// DivisionProblem component
export const DivisionProblem = {
  props: ['numbers', 'displayFormat'],
  template: `
    <div>
      <!-- Side by side display -->
      <div v-if="displayFormat === 'side-by-side'" class="problem-display">
        {{ expression }} = ?
      </div>
      
      <!-- Stacked display for 2 numbers -->
      <div v-if="displayFormat === 'stacked' && numbers && numbers.length === 2" class="stacked-problem stacked-division">
        <div class="division-container">
          <div class="division-divisor">{{ numbers[1] }}</div>
          <div class="division-bracket-wrapper">
            <div class="division-bracket-horizontal"></div>
            <div class="division-bracket-vertical"></div>
            <div class="division-dividend">{{ numbers[0] }}</div>
          </div>
          <div class="division-equals">= ?</div>
        </div>
      </div>
      
      <!-- Stacked display for more than 2 numbers (fallback to side-by-side) -->
      <div v-if="displayFormat === 'stacked' && numbers && numbers.length > 2" class="problem-display">
        {{ expression }} = ?
      </div>
    </div>
  `,
  computed: {
    expression() {
      if (!this.numbers || this.numbers.length === 0) return '';
      const divisors = this.numbers.slice(1);
      return `${this.numbers[0]} ÷ ${divisors.join(' ÷ ')}`;
    }
  }
};

