import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { StudyConfig } from './study-config.js';

createApp({
  components: {
    StudyConfig
  },
  template: `
    <div class="home">
      <a href="index.html" class="back-link">← Back to Study Sessions</a>
      <h1>Configure Study Session</h1>
      <div class="study-container">
        <StudyConfig 
          :session="session"
          @start-study="startStudy"
        />
      </div>
    </div>
  `,
  data() {
    // Initialize session from query params if available
    const urlParams = new URLSearchParams(window.location.search);
    const problemSetsJson = urlParams.get('problemSets');
    const format = urlParams.get('format');
    const displayFormat = urlParams.get('displayFormat');
    
    let problemSets = [];
    if (problemSetsJson) {
      try {
        problemSets = JSON.parse(problemSetsJson);
        // Ensure each problem set has problemCount
        problemSets.forEach(set => {
          if (set.problemCount === undefined) {
            set.problemCount = 20;
          }
        });
      } catch (error) {
        console.error('Error parsing problem sets from URL:', error);
      }
    }
    
    return {
      session: {
        format: format || 'fill-in-blank',
        displayFormat: displayFormat || 'side-by-side',
        problemSets: problemSets
      }
    };
  },
  methods: {
    startStudy(sessionConfig) {
      // Encode session configuration into query params
      const params = new URLSearchParams();
      params.set('format', sessionConfig.format || 'fill-in-blank');
      params.set('displayFormat', sessionConfig.displayFormat || 'side-by-side');
      params.set('problemSets', JSON.stringify(sessionConfig.problemSets || []));
      
      // Navigate to study page with encoded config
      window.location.href = `study.html?${params.toString()}`;
    }
  }
}).mount('#app');

