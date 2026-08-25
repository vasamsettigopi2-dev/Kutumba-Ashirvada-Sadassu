const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');

layoutCode = layoutCode.replace(
  "          <div className=\"flex items-center text-[13px] font-medium text-zinc-500 capitalize\">\n            {currentTab}\n          </div>\n        </header>",
  `          <div className="flex items-center text-[13px] font-medium text-zinc-500 capitalize">
            {currentTab}
          </div>
          </div>
        </header>`
);

fs.writeFileSync('src/components/admin/AdminLayout.tsx', layoutCode);
