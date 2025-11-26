import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

createApp({
  template: `
    <div class="home">
      <h1>Math</h1>
      <div class="stories-grid">
        <a 
          v-for="session in studySessions" 
          :key="session.title" 
          :href="getSessionUrl(session)"
          class="story-card"
        >
          <div class="session-icon">{{ session.icon }}</div>
          <h2>{{ session.title }}</h2>
          <p class="session-description">{{ session.description }}</p>
        </a>
      </div>
    </div>
  `,
  data() {
    return {
      studySessions: [
        {
          title: 'Custom Study Session',
          description: 'Create your own custom study session',
          icon: '⚙️',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: []
        },
        {
          title: 'Multiplication 0-10',
          description: 'Practice multiplication with numbers 0-10',
          icon: '×',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '*',
            problemCount: 20,
            numberRanges: [
              { min: 0, max: 10 },
              { min: 0, max: 10 }
            ]
          }]
        },
        {
          title: 'Addition 0-5',
          description: 'Practice addition with numbers 0-5',
          icon: '+',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '+',
            problemCount: 20,
            numberRanges: [
              { min: 0, max: 5 },
              { min: 0, max: 5 }
            ]
          }]
        },
        {
          title: 'Addition 0-10',
          description: 'Practice addition with numbers 0-10',
          icon: '+',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '+',
            problemCount: 20,
            numberRanges: [
              { min: 0, max: 10 },
              { min: 0, max: 10 }
            ]
          }]
        },
        {
          title: 'Addition 1000-9999',
          description: 'Practice addition with numbers 1000-9999',
          icon: '+',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '+',
            problemCount: 20,
            numberRanges: [
              { min: 1000, max: 9999 },
              { min: 1000, max: 9999 }
            ]
          }]
        },
        {
          title: 'Subtraction 0-10',
          description: 'Practice subtraction with numbers 0-10',
          icon: '−',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '-',
            problemCount: 20,
            allowNegative: false,
            numberRanges: [
              { min: 0, max: 10 },
              { min: 0, max: 10 }
            ]
          }]
        },
        {
          title: 'Division 0-10',
          description: 'Practice division with numbers 0-10',
          icon: '÷',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '/',
            problemCount: 20,
            allowDecimalAnswers: false,
            decimalPrecision: 2,
            numberRanges: [
              { min: 0, max: 10 },
              { min: 0, max: 10 }
            ]
          }]
        },
        {
          title: 'Mixed Operations 0-20',
          description: 'Practice all operations with numbers 0-20',
          icon: '🔢',
          format: 'both',
          displayFormat: 'both',
          problemSets: [
            {
              operation: '+',
              problemCount: 50,
              numberRanges: [
                { min: 0, max: 20 },
                { min: 0, max: 20 }
              ]
            },
            {
              operation: '-',
              problemCount: 50,
              allowNegative: false,
              numberRanges: [
                { min: 0, max: 20 },
                { min: 0, max: 20 }
              ]
            },
            {
              operation: '*',
              problemCount: 50,
              numberRanges: [
                { min: 0, max: 20 },
                { min: 0, max: 20 }
              ]
            },
            {
              operation: '/',
              problemCount: 50,
              allowDecimalAnswers: false,
              decimalPrecision: 2,
              numberRanges: [
                { min: 0, max: 20 },
                { min: 0, max: 20 }
              ]
            }
          ]
        },
        {
          title: 'Advanced Multiplication',
          description: 'Practice multiplication with larger numbers',
          icon: '🚀',
          format: 'fill-in-blank',
          displayFormat: 'stacked',
          problemSets: [{
            operation: '*',
            problemCount: 20,
            numberRanges: [
              { min: 10, max: 99 },
              { min: 2, max: 12 }
            ]
          }]
        }
      ]
    };
  },
  methods: {
    getSessionUrl(session) {
      const params = new URLSearchParams();
      params.set('format', session.format || 'fill-in-blank');
      params.set('displayFormat', session.displayFormat || 'side-by-side');
      // Ensure each problem set has problemCount before stringifying
      const problemSets = (session.problemSets || []).map(set => ({
        ...set,
        problemCount: set.problemCount || 20
      }));
      params.set('problemSets', JSON.stringify(problemSets));
      
      return `study-config.html?${params.toString()}`;
    }
  }
}).mount('#app');
