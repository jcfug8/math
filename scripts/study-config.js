// StudyConfig component
export const StudyConfig = {
  props: ['session'],
  template: `
    <div class="config-panel">
      <h2 style="margin-bottom: 20px; color: #333;">Configure Study Session</h2>
      
      <div class="config-section">
        <div class="config-option-inline">
          <div class="config-option">
            <label>Number of Problems</label>
            <select v-model="localSession.problemCount">
              <option value="10">10 problems</option>
              <option value="20">20 problems</option>
              <option value="50">50 problems</option>
              <option value="100">100 problems</option>
              <option value="all">All problems</option>
            </select>
          </div>
          <div class="config-option">
            <label>Question Format</label>
            <select v-model="localSession.format">
              <option value="fill-in-blank">Fill in the Blank</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
        <div class="config-option-inline">
          <div class="config-option">
            <label>Display Format</label>
            <select v-model="localSession.displayFormat">
              <option value="side-by-side">Side by Side</option>
              <option value="stacked">Stacked</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div class="config-option" style="margin-top: 15px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" v-model="localSession.allowNegative" style="width: auto; margin: 0;" />
              <span>Allow negative answers</span>
            </label>
          </div>
        </div>
        <div class="config-option-inline">
          <div class="config-option" style="margin-top: 15px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" v-model="localSession.allowDecimalAnswers" style="width: auto; margin: 0;" />
              <span>Allow decimal answers (division)</span>
            </label>
          </div>
          <div v-if="localSession.allowDecimalAnswers" class="config-option" style="margin-top: 15px;">
            <label>Decimal Precision</label>
            <select v-model.number="localSession.decimalPrecision">
              <option :value="0">0 decimal places</option>
              <option :value="1">1 decimal place</option>
              <option :value="2">2 decimal places</option>
              <option :value="3">3 decimal places</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="config-section">
        <h3>Study Sets</h3>
        <div class="operation-grid">
          <button 
            v-for="op in operations" 
            :key="op.symbol"
            @click="addStudySet(op.value)"
            class="operation-button"
          >
            {{ op.symbol }}
          </button>
        </div>
        <div v-for="(set, index) in localSession.studySets" :key="index" class="study-set">
          <div class="study-set-header">
            <h4>Study Set {{ index + 1 }}</h4>
            <button @click="removeStudySet(index)" class="remove-set-button">Remove</button>
          </div>
          <div class="config-option-inline">
            <div class="config-option">
              <label>Operation</label>
              <select v-model="set.operation">
                <option value="+">Addition (+)</option>
                <option value="-">Subtraction (-)</option>
                <option value="*">Multiplication (×)</option>
                <option value="/">Division (÷)</option>
              </select>
            </div>
            <div class="config-option">
              <label>Number of Numbers</label>
              <select v-model.number="set.numberCount" @change="updateNumberRanges(set)">
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
                <option :value="5">5</option>
              </select>
            </div>
          </div>
          <div class="number-ranges-grid">
            <div v-for="(range, numIndex) in set.numberRanges" :key="numIndex" class="number-range-group">
              <h5 style="margin: 10px 0 5px; color: #666; font-size: 0.9rem;">Number {{ numIndex + 1 }}</h5>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="config-option" style="margin-bottom: 0;">
                  <label>Min</label>
                  <input v-model.number="range.min" type="number" />
                </div>
                <div class="config-option" style="margin-bottom: 0;">
                  <label>Max</label>
                  <input v-model.number="range.max" type="number" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="button-group" style="margin-top: 20px;">
        <button @click="saveAndStart" class="nav-button" style="background: #42b983;">
          Start Study
        </button>
      </div>
    </div>
  `,
  data() {
    // Initialize study sets with numberRanges if they don't have them
    const studySets = this.session.studySets ? [...this.session.studySets] : [];
    studySets.forEach(set => {
      if (!set.numberRanges) {
        // Convert old format (minValue/maxValue) to new format (numberRanges)
        const min = set.minValue !== undefined ? set.minValue : 0;
        const max = set.maxValue !== undefined ? set.maxValue : 10;
        const count = set.numberCount || 2;
        set.numberRanges = Array(count).fill(null).map(() => ({ min, max }));
        // Remove old properties
        delete set.minValue;
        delete set.maxValue;
      } else {
        // Ensure numberRanges matches numberCount
        const count = set.numberCount || set.numberRanges.length;
        while (set.numberRanges.length < count) {
          const lastRange = set.numberRanges.length > 0 
            ? set.numberRanges[set.numberRanges.length - 1]
            : { min: 0, max: 10 };
          set.numberRanges.push({ min: lastRange.min, max: lastRange.max });
        }
        while (set.numberRanges.length > count) {
          set.numberRanges.pop();
        }
      }
    });
    
    return {
      localSession: {
        problemCount: this.session.problemCount || 'all',
        format: this.session.format || 'fill-in-blank',
        displayFormat: this.session.displayFormat || 'side-by-side',
        allowNegative: this.session.allowNegative || false,
        allowDecimalAnswers: this.session.allowDecimalAnswers || false,
        decimalPrecision: this.session.decimalPrecision !== undefined ? this.session.decimalPrecision : 2,
        studySets: studySets
      },
      operations: [
        { symbol: '+', value: '+' },
        { symbol: '−', value: '-' },
        { symbol: '×', value: '*' },
        { symbol: '÷', value: '/' }
      ]
    };
  },
  methods: {
    addStudySet(operation) {
      this.localSession.studySets.push({
        operation: operation,
        numberCount: 2,
        numberRanges: [
          { min: 0, max: 10 },
          { min: 0, max: 10 }
        ]
      });
    },
    updateNumberRanges(set) {
      // Ensure numberRanges array matches numberCount
      if (!set.numberRanges) {
        set.numberRanges = [];
      }
      
      // Add or remove ranges to match numberCount
      while (set.numberRanges.length < set.numberCount) {
        const lastRange = set.numberRanges.length > 0 
          ? set.numberRanges[set.numberRanges.length - 1]
          : { min: 0, max: 10 };
        set.numberRanges.push({ min: lastRange.min, max: lastRange.max });
      }
      
      while (set.numberRanges.length > set.numberCount) {
        set.numberRanges.pop();
      }
    },
    removeStudySet(index) {
      this.localSession.studySets.splice(index, 1);
    },
    saveAndStart() {
      if (this.localSession.studySets.length === 0) {
        alert('Please add at least one study set!');
        return;
      }
      this.$emit('start-study', { ...this.localSession });
    }
  }
};

