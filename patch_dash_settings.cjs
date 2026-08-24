const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add import
content = content.replace("import AgendaView from './admin/AgendaView';", "import AgendaView from './admin/AgendaView';\nimport SettingsView from './admin/SettingsView';");

// Add route in the render switch
const renderSettings = `
      {currentTab === 'settings' && (
        <SettingsView />
      )}
`;

content = content.replace(/      \{currentTab === 'agenda' && \(\n        <AgendaView \/>\n      \)\}/, "      {currentTab === 'agenda' && (\n        <AgendaView />\n      )}\n" + renderSettings);

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
